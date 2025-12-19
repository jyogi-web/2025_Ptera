import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "@/lib/auth-server";

export default async function FirestoreTestLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return <>{children}</>;
}
