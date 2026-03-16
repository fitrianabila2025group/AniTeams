import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Sign In",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <LoginForm />
    </div>
  );
}
