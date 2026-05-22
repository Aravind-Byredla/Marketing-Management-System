import { prisma } from "@/lib/prisma";

export async function generateRequestId(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.request.count();
  const padded = String(count + 1).padStart(4, "0");
  return `MBR-${year}-${padded}`;
}
