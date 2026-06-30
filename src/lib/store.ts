import { promises as fs } from "fs";
import path from "path";

export type OrderStatus = "en attente" | "payée" | "expédiée" | "retirée en boutique" | "annulée";

export type OrderRecord = {
  id: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  items: Array<{ id: string; name: string; quantity: number; price: number }>;
  total: number;
  status: OrderStatus;
  createdAt: string;
};

const ordersPath = path.join(process.cwd(), "data", "orders.json");

async function ensureFile() {
  await fs.mkdir(path.dirname(ordersPath), { recursive: true });
  try {
    await fs.access(ordersPath);
  } catch {
    await fs.writeFile(ordersPath, "[]", "utf8");
  }
}

export async function getOrders(): Promise<OrderRecord[]> {
  await ensureFile();
  const raw = await fs.readFile(ordersPath, "utf8");
  try {
    return JSON.parse(raw) as OrderRecord[];
  } catch {
    return [];
  }
}

export async function saveOrder(order: OrderRecord) {
  await ensureFile();
  const orders = await getOrders();
  const nextOrders = [order, ...orders];
  await fs.writeFile(ordersPath, JSON.stringify(nextOrders, null, 2), "utf8");
  return order;
}
