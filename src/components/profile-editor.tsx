"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { updateProfile } from "@/server/profile";

interface ProfileEditorProps {
  currentName: string;
  currentBio: string;
}

export function ProfileEditor({ currentName, currentBio }: ProfileEditorProps) {
  const [name, setName] = useState(currentName);
  const [bio, setBio] = useState(currentBio);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    startTransition(async () => {
      await updateProfile({ name: name.trim() || undefined, bio: bio.trim() || null });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="profile-name" className="mb-1 block text-sm font-medium">Display Name</label>
        <Input
          id="profile-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
        />
      </div>
      <div>
        <label htmlFor="profile-bio" className="mb-1 block text-sm font-medium">Bio</label>
        <textarea
          id="profile-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Tell us about yourself..."
        />
        <p className="mt-1 text-xs text-muted-foreground">{bio.length}/500</p>
      </div>
      <Button onClick={handleSave} disabled={isPending}>
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {saved ? "Saved!" : "Save Changes"}
      </Button>
    </div>
  );
}
