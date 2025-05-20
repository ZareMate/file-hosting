import { PrismaClient } from '~/app/generated/prisma-client/client.js';
import { withAccelerate } from '@prisma/extension-accelerate'


import { env } from "~/env";

const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  }).$extends(withAccelerate());

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

//const prisma = new PrismaClient().$extends(withAccelerate());

//export const db = prisma;
