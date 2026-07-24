import { prisma } from "@/lib/prisma";

export async function syncProductAggregate(productId: string) {
  const aggregate = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: aggregate._avg.rating ? Math.round(aggregate._avg.rating * 10) / 10 : 0,
      reviews: aggregate._count.rating,
    },
  });
}