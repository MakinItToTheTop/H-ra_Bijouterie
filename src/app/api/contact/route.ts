import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const DESTINATION_EMAIL = "herabijouterie44@gmail.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const orderNumber = typeof body.orderNumber === "string" ? body.orderNumber.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const subject = typeof body.subject === "string" && body.subject ? body.subject : "Contact";

    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, message: "Merci de renseigner votre nom, votre email et votre message." },
        { status: 400 },
      );
    }

    // 1. Trace en base — garantit qu'on ne perd jamais la demande même si
    // l'envoi d'email échoue (clé manquante, quota, panne Resend...).
    const saved = await prisma.contactRequest.create({
      data: { subject, name, email, phone: phone || null, orderNumber: orderNumber || null, message },
    });

    // 2. Envoi email — best effort. On ne fait pas échouer toute la requête
    // si seul l'email plante, puisque la demande est déjà enregistrée.
    const resendApiKey = process.env.RESEND_API_KEY;
    let emailSent = false;

    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: process.env.CONTACT_FROM_EMAIL ?? "Héra Bijouterie <onboarding@resend.dev>",
          to: DESTINATION_EMAIL,
          replyTo: email,
          subject: `[${subject}] Nouvelle demande de ${name}`,
          text: [
            `Sujet : ${subject}`,
            `Nom : ${name}`,
            `Email : ${email}`,
            phone ? `Téléphone : ${phone}` : null,
            orderNumber ? `N° de commande : ${orderNumber}` : null,
            "",
            message,
          ]
            .filter(Boolean)
            .join("\n"),
        });
        emailSent = true;
      } catch (emailError) {
        console.error("Resend email error", emailError);
      }
    } else {
      console.warn("RESEND_API_KEY manquant : email non envoyé, seule la trace en base est conservée.");
    }

    return NextResponse.json({
      ok: true,
      message: "Votre demande a bien été reçue. Nous vous répondrons rapidement.",
      requestId: saved.id,
      emailSent,
    });
  } catch (error) {
    console.error("Contact request error", error);
    return NextResponse.json(
      { ok: false, message: "Une erreur est survenue, merci de réessayer ou de nous appeler." },
      { status: 500 },
    );
  }
}