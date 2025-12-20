import type { ReactNode } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import { Footer } from "@/components/layouts/footer";
import { Header } from "@/components/layouts/header";

export default function AuthorizedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthGuard>
      <Header />
      {children}
      <Footer />
    </AuthGuard>
  );
}
