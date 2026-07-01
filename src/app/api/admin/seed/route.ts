import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

// One-time bootstrap endpoint to create/reset the admin account.
// Protected by ADMIN_SETUP_SECRET so it can't be triggered by strangers who
// simply discover the URL. Set ADMIN_SETUP_SECRET in your environment
// variables before calling this, then feel free to unset/rotate it once
// you've logged in and changed your password.
export async function POST(request: Request) {
  try {
    const setupSecret = process.env.ADMIN_SETUP_SECRET;
    if (!setupSecret) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "ADMIN_SETUP_SECRET n'est pas configuré sur le serveur. Ajoutez cette variable d'environnement avant d'utiliser cette route.",
        },
        { status: 503 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const providedSecret = request.headers.get("x-admin-setup-secret") ?? body.secret;

    if (providedSecret !== setupSecret) {
      return NextResponse.json({ ok: false, message: "Non autorisé." }, { status: 401 });
    }

    const adminEmail = typeof body.email === "string" && body.email ? body.email : "admin@hera-bijouterie.fr";
    const adminPassword =
      typeof body.password === "string" && body.password.length >= 8 ? body.password : null;

    if (!adminPassword) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Merci de fournir un mot de passe (au moins 8 caractères) dans le corps de la requête, ex: { \"secret\": \"...\", \"email\": \"vous@exemple.fr\", \"password\": \"un-mot-de-passe-fort\" }.",
        },
        { status: 400 },
      );
    }

    const hashedPassword = await hash(adminPassword, 10);

    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (existingAdmin) {
      await prisma.user.update({
        where: { email: adminEmail },
        data: { role: "admin", passwordHash: hashedPassword },
      });
    } else {
      await prisma.user.create({
        data: {
          email: adminEmail,
          name: "Admin",
          passwordHash: hashedPassword,
          role: "admin",
        },
      });
    }

    return NextResponse.json({
      ok: true,
      message: "Compte admin créé/mis à jour avec succès.",
      email: adminEmail,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, message: "Échec de la création du compte admin." }, { status: 500 });
  }
}