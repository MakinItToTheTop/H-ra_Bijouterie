import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") return null;
  return session;
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Non autorisé." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    const reply = typeof body.message === "string" ? body.message.trim() : "";

    if (!id || !reply) {
      return NextResponse.json({ ok: false, message: "Requête invalide." }, { status: 400 });
    }

    const contactRequest = await prisma.contactRequest.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!contactRequest) {
      return NextResponse.json({ ok: false, message: "Demande introuvable." }, { status: 404 });
    }

    const isConnected = Boolean(contactRequest.userId);
    let messageSaved = false;
    let emailSent = false;
    let createdMessage = null;

    if (isConnected && contactRequest.userId) {
      createdMessage = await prisma.message.create({
        data: {
          contactRequestId: contactRequest.id,
          userId: contactRequest.userId,
          senderRole: "admin",
          body: reply,
          readByAdmin: true,
          readByClient: false,
        },
      });
      messageSaved = true;
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: process.env.CONTACT_FROM_EMAIL ?? "Héra Bijouterie <onboarding@resend.dev>",
          to: contactRequest.email,
          subject: `Re : ${contactRequest.subject}`,
          text: [
            `Bonjour ${contactRequest.name},`,
            "",
            reply,
            "",
            isConnected
              ? "Vous pouvez retrouver et poursuivre cet échange depuis votre espace client, rubrique Messagerie."
              : "",
            "",
            "À très vite,",
            "Héra Bijouterie",
          ].filter(Boolean).join("\n"),
        });
        emailSent = true;
      } catch (emailError) {
        console.error("Resend reply email error", emailError);
      }
    }

    await prisma.contactRequest.update({ where: { id }, data: { status: "traité" } });

    return NextResponse.json({ ok: true, messageSaved, emailSent, isConnected, message: createdMessage });
  } catch (error) {
    console.error("Admin reply error", error);
    return NextResponse.json({ ok: false, message: "Échec de l'envoi de la réponse." }, { status: 500 });
  }
}