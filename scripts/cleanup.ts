import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function cleanup() {
  const result = await prisma.share.deleteMany({
    where: {
      expiresAt: {
        lte: new Date(),
      },
    },
  });

  console.log(`Deleted ${result.count} expired share(s).`);
}

cleanup()
  .catch((error) => {
    console.error("Cleanup failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });