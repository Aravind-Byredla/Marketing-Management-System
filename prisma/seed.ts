import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/mbrms" });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEFAULT_CATEGORIES = [
  { name: "Printed Materials / Branding", icon: "Printer", subcategories: ["Pamphlets", "Brochures", "Catalogs", "Posters", "Menus", "Packaging Boxes"] },
  { name: "Social Media Designs", icon: "Share2", subcategories: ["Post Design", "Story Design", "Banner", "Profile Cover"] },
  { name: "Photography", icon: "Camera", subcategories: ["Product Photography", "Event Photography", "Corporate Photography"] },
  { name: "Videography", icon: "Video", subcategories: ["Promo Video", "Event Coverage", "Product Video", "Social Reel"] },
  { name: "Influencer Marketing", icon: "Users", subcategories: ["Instagram", "TikTok", "YouTube", "Facebook"] },
  { name: "TV / Radio / Screen Updates", icon: "Tv", subcategories: ["TV Ad", "Radio Ad", "Digital Screen"] },
  { name: "Shop Branding", icon: "Store", subcategories: ["Signage", "Vehicle Branding", "Billboards", "Danglers", "Promo Tables", "T-Shirts"] },
  { name: "Outdoor Marketing Activities", icon: "MapPin", subcategories: ["Events", "Roadshows", "Pop-up Activations"] },
];

const DEFAULT_COMPANIES = [
  { name: "MA MAISON SUPERMARCHE", branches: ["Lubumbashi", "Likasi", "Kolwezi"] },
  { name: "LIBERTY BISTRO", branches: ["Lubumbashi"] },
  { name: "B2B", branches: ["All Katanga"] },
  { name: "TOKON", branches: ["Lubumbashi", "Likasi"] },
];

async function main() {
  console.log("🌱 Seeding...");

  for (const company of DEFAULT_COMPANIES) {
    const created = await prisma.company.upsert({
      where: { name: company.name },
      update: {},
      create: { name: company.name, branches: { create: company.branches.map((b) => ({ name: b })) } },
    });
    console.log(`✅ Company: ${created.name}`);
  }

  for (const cat of DEFAULT_CATEGORIES) {
    const created = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name, icon: cat.icon, subcategories: { create: cat.subcategories.map((s) => ({ name: s })) } },
    });
    console.log(`✅ Category: ${created.name}`);
  }

  const pwd = await bcrypt.hash("admin123", 12);

  const users = [
    { email: "superadmin@mbrms.com", name: "Super Admin", role: "SUPER_ADMIN" as const },
    { email: "admin@mbrms.com", name: "Admin User", role: "ADMIN" as const },
    { email: "manager@mbrms.com", name: "Manager User", role: "MANAGER" as const, department: "MA MAISON SUPERMARCHE" },
    { email: "team@mbrms.com", name: "Team Member", role: "TEAM_MEMBER" as const },
  ];

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password: pwd },
    });
    console.log(`✅ User: ${user.email}`);
  }

  console.log("\n🎉 Done! Password: admin123");
}

main().catch(console.error).finally(() => prisma.$disconnect());