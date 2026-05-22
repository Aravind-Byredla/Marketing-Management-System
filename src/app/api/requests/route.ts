import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateRequestId } from "@/lib/server-utils";
import { z } from "zod";

const createRequestSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  objective: z.string().min(10, "Objective must be at least 10 characters"),
  summary: z.string().optional(),
  quantity: z.string().optional(),
  notes: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  deadline: z.string().optional(),
  companyId: z.string().min(1, "Company is required"),
  branchId: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  subcategoryId: z.string().optional(),
  status: z.enum(["DRAFT", "PENDING"]).default("PENDING"),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = createRequestSchema.parse(body);
    const requestId = await generateRequestId();

    const request = await prisma.request.create({
      data: {
        ...data,
        requestId,
        createdById: session.user.id,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        branchId: data.branchId || undefined,
        subcategoryId: data.subcategoryId || undefined,
      },
    });

    // Notify all admins
    const admins = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] }, isActive: true },
    });

    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        requestId: request.id,
        title: "New Request Submitted",
        message: `${session.user.name} submitted a new request: ${request.title} (${request.requestId})`,
      })),
    });

    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const role = session.user.role;

  const where: any = {};
  if (role === "MANAGER") where.createdById = session.user.id;
  if (role === "TEAM_MEMBER") where.assignedToId = session.user.id;
  if (status) where.status = status;

  const requests = await prisma.request.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      company: true,
      branch: true,
      category: true,
      subcategory: true,
      createdBy: { select: { id: true, name: true, email: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
      attachments: true,
    },
  });

  return NextResponse.json(requests);
}
