import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import CoachDashboardClient from "@/components/coach/CoachDashboardClient";

export default async function CoachPage() {
  const session = await getServerSession();

  if (!session) redirect("/auth/signin");

  return <CoachDashboardClient userName={session.user?.name || "Coach"} />;
}