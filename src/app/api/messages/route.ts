import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "Non autorisé." }, { status: 401 });
  }

  try {
    const threads = await prisma.contactRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    await prisma.message.updateMany({
      where: { userId: session.user.id, senderRole: "admin", readByClient: false },
      data: { readByClient: true },
    });

    return NextResponse.json({ ok: true, threads });
  } catch (error) {
    console.error("Fetch messages error", error);
    return NextResponse.json({ ok: false, threads: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "Non autorisé." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const contactRequestId = typeof body.contactRequestId === "string" ? body.contactRequestId : "";
    const text = typeof body.message === "string" ? body.message.trim() : "";

    if (!contactRequestId || !text) {
      return NextResponse.json({ ok: false, message: "Message vide." }, { status: 400 });
    }

    const thread = await prisma.contactRequest.findFirst({
      where: { id: contactRequestId, userId: session.user.id },
    });

    if (!thread) {
      return NextResponse.json({ ok: false, message: "Fil introuvable." }, { status: 404 });
    }

    if (thread.status === "traité") {                                    // ← AJOUTER ce bloc
      return NextResponse.json(
        { ok: false, message: "Cette conversation est marquée comme traitée et ne peut plus recevoir de message." },
        { status: 403 },
      );
    }

    const created = await prisma.message.create({
      data: { contactRequestId, userId: session.user.id, senderRole: "client", body: text, readByClient: true, readByAdmin: false },
    });

    

    return NextResponse.json({ ok: true, message: created });
  } catch (error) {
    console.error("Send message error", error);
    return NextResponse.json({ ok: false, message: "Échec de l'envoi." }, { status: 500 });
  }
}