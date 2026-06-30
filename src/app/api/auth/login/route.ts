import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: "Identifiants invalides" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ ok: false, message: "Compte introuvable" }, { status: 404 });
    }

    const valid = await compare(parsed.data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ ok: false, message: "Mot de passe incorrect" }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, message: "Erreur serveur" }, { status: 500 });
  }
}
