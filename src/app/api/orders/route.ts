import { NextResponse } from "next/server";
import { saveOrder } from "@/lib/store";

export async function POST(request: Request) {
  const body = await request.json();
  const orderId = `HERA-${Date.now()}`;

  const order: import("@/lib/store").OrderRecord = {
    id: orderId,
    customer: {
      firstName: body.customer?.firstName ?? "Client",
      lastName: body.customer?.lastName ?? "",
      email: body.customer?.email ?? "contact@herajoaillerie.fr",
      phone: body.customer?.phone ?? "",
    },
    items: Array.isArray(body.items)
      ? body.items.map((item: { id: string; name: string; quantity: number; price: number }) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        }))
      : [],
    total: Number(body.total ?? 0),
    status: "en attente",
    createdAt: new Date().toISOString(),
  };

  await saveOrder(order);

  return NextResponse.json({
    ok: true,
    orderId,
    status: "en attente",
    message: "Commande enregistrée avec succès",
  });
}
