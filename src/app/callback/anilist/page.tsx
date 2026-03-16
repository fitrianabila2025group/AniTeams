"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { connectAniList } from "@/server/anilist-sync";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function AniListCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setStatus("error");
      return;
    }

    connectAniList(code)
      .then(() => {
        setStatus("success");
        setTimeout(() => router.push("/profile"), 2000);
      })
      .catch(() => {
        setStatus("error");
      });
  }, [searchParams, router]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      {status === "loading" && (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Connecting to AniList...</p>
        </>
      )}
      {status === "success" && (
        <>
          <CheckCircle className="h-8 w-8 text-green-400" />
          <p className="mt-4">AniList connected successfully! Redirecting...</p>
        </>
      )}
      {status === "error" && (
        <>
          <XCircle className="h-8 w-8 text-destructive" />
          <p className="mt-4 text-muted-foreground">Failed to connect AniList. Please try again.</p>
        </>
      )}
    </div>
  );
}
