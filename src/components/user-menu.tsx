"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, User, BookOpen, BarChart3 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface UserMenuProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "U";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="User menu"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 animate-in rounded-md border border-border bg-popover p-1 shadow-lg">
          <div className="px-3 py-2 border-b border-border mb-1">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-secondary"
          >
            <User className="h-4 w-4" /> Profile
          </Link>
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-secondary"
          >
            <BookOpen className="h-4 w-4" /> My Watchlist
          </Link>
          <Link
            href="/account?tab=progress"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-secondary"
          >
            <BarChart3 className="h-4 w-4" /> Progress
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-secondary"
          >
            <Settings className="h-4 w-4" /> Settings
          </Link>
          <div className="border-t border-border mt-1 pt-1">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
