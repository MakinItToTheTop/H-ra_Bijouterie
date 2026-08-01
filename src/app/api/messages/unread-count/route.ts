import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, count: 0 }, { status: 401 });
  }

  try {
    const count = await prisma.message.count({
      where: { userId: session.user.id, senderRole: "admin", readByClient: false },
    });
    return NextResponse.json({ ok: true, count });
  } catch (error) {
    console.error("Unread count error", error);
    return NextResponse.json({ ok: false, count: 0 }, { status: 500 });
  }
}