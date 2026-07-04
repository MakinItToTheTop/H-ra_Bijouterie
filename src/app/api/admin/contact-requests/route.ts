import { NextResponse } from "next/server";
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

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Non autorisé." }, { status: 403 });
  }

  try {
    const requests = await prisma.contactRequest.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ ok: true, requests });
  } catch (error) {
    console.error("Fetch contact requests error", error);
    return NextResponse.json({ ok: false, requests: [] }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Non autorisé." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, status } = body as { id?: string; status?: string };

    if (!id || !["nouveau", "traité"].includes(status ?? "")) {
      return NextResponse.json({ ok: false, message: "Requête invalide." }, { status: 400 });
    }

    const updated = await prisma.contactRequest.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ ok: true, request: updated });
  } catch (error) {
    console.error("Update contact request error", error);
    return NextResponse.json({ ok: false, message: "Échec de la mise à jour." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Non autorisé." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ ok: false, message: "Identifiant manquant." }, { status: 400 });
    }

    await prisma.contactRequest.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete contact request error", error);
    return NextResponse.json({ ok: false, message: "Échec de la suppression." }, { status: 500 });
  }
}