import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return null;
  }
  return session;
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Non autorisé." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id } = body as { id?: string };

    if (!id) {
      return NextResponse.json({ ok: false, message: "Requête invalide." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, user: { select: { name: true, email: true } } },
    });

    if (!order) {
      return NextResponse.json({ ok: false, message: "Commande introuvable." }, { status: 404 });
    }

    if (order.shippingMode !== "retrait" || order.status !== "prête à récupérer") {
      return NextResponse.json(
        { ok: false, message: "Cette commande n'est pas prête à récupérer en boutique." },
        { status: 400 }
      );
    }

    const email = order.customerEmail || order.user?.email;
    if (!email) {
      return NextResponse.json(
        { ok: false, message: "Aucune adresse email n'est associée à cette commande." },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json({ ok: false, message: "Envoi d'email non configuré." }, { status: 500 });
    }

    const resend = new Resend(resendApiKey);
    const orderNumber = order.id.slice(-8).toUpperCase();
    const firstName = order.customerFirstName || order.user?.name || "";
    const itemsList = order.items
      .map((item) => `- ${item.quantity}x ${item.name} (${item.price.toFixed(2)} €)`)
      .join("\n");

    await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL ?? "Héra Bijouterie <onboarding@resend.dev>",
      to: email,
      subject: `Votre commande #${orderNumber} est prête à récupérer en boutique`,
      text: [
        `Bonjour ${firstName},`.trim(),
        "",
        `Votre commande #${orderNumber} est prête à être récupérée en boutique.`,
        "",
        itemsList,
        "",
        `Total : ${order.total.toFixed(2)} €`,
        "",
        "Merci de vous munir d'une pièce d'identité correspondant au nom de la commande lors du retrait.",
        "",
        "À très vite,",
        "Héra Bijouterie",
      ].join("\n"),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Pickup notification email error", error);
    return NextResponse.json({ ok: false, message: "L'email n'a pas pu être envoyé." }, { status: 500 });
  }
}