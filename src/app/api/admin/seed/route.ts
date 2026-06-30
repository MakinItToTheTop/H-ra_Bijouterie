import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const adminEmail = "admin@hera-bijouterie.fr";
    const adminPassword = "Admin123!";

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin && existingAdmin.role === "admin") {
      return NextResponse.json({ ok: true, message: "Admin user already exists" });
    }

    const hashedPassword = await hash(adminPassword, 10);

    if (existingAdmin) {
      // Update existing user to admin
      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          role: "admin",
          passwordHash: hashedPassword,
        },
      });
    } else {
      // Create new admin user
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
      message: "Admin user created/updated successfully",
      credentials: {
        email: adminEmail,
        password: adminPassword,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, message: "Failed to create admin user" }, { status: 500 });
  }
}
