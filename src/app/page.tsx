import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = session.user.role;
  if (role === "MANAGER") redirect("/manager");
  if (role === "ADMIN") redirect("/admin");
  if (role === "TEAM_MEMBER") redirect("/team");
  if (role === "SUPER_ADMIN") redirect("/super-admin");

  redirect("/login");
}
