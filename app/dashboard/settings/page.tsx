"use client";

import { useEffect, useState } from "react";
import { userService } from "@/services/user.service";
import type { UserMe } from "@/types/user";
import { clearSession } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserMe | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    userService
      .getMe()
      .then(setUser)
      .catch((e: Error) => setError(e.message));
  }, []);

  const logout = () => {
    clearSession();
    router.push("/login");
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h2 className="text-foreground text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-1 text-sm">Account and session.</p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Signed-in staff user from the API.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <p className="text-destructive text-sm">{error}</p>
          ) : user ? (
            <>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Email</Label>
                <p className="text-foreground text-sm font-medium">{user.email}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">User ID</Label>
                <p className="text-foreground font-mono text-sm">{String(user.id)}</p>
              </div>
              {user.status ? (
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Status</Label>
                  <p className="text-foreground text-sm">{user.status}</p>
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-muted-foreground text-sm">Loading…</p>
          )}
          <Button type="button" variant="destructive" onClick={logout} className="w-full sm:w-auto">
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
