import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  return NextResponse.json({
    ok: true,
    message: "Votre demande a bien été reçue. Nous vous répondrons rapidement.",
    payload: body,
  });
}
