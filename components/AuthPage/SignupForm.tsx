"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bot, ArrowLeft, Loader2 } from "lucide-react";
import { authService } from "@/services/auth.service";

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!email || !password) {
        throw new Error("Please fill in all fields");
      }
      await authService.register({ email, password, status: "active" });
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      <div
        className="bg-primary/8 pointer-events-none absolute top-0 left-0 size-[min(100vw,500px)] rounded-full blur-[120px]"
        aria-hidden
      />
      <div
        className="bg-primary/10 pointer-events-none absolute right-0 bottom-0 size-[min(100vw,500px)] rounded-full blur-[120px]"
        aria-hidden
      />

      <Link
        href="/"
        className="text-muted-foreground hover:text-primary absolute top-8 left-8 z-20 flex items-center text-sm font-medium transition-colors"
      >
        <ArrowLeft className="mr-2 size-4" aria-hidden />
        Back to Home
      </Link>

      <div className="z-10 w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="border-primary/20 bg-primary/10 rounded-2xl border p-3 backdrop-blur-sm">
            <Bot className="text-primary size-8" aria-hidden />
          </div>
        </div>

        <Card className="border-border bg-card/80 shadow-lg backdrop-blur-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
            <CardDescription>Register for staff access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1">
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full"
                disabled
                title="Google sign-up coming soon"
              >
                <svg
                  className="mr-2 size-4 opacity-50"
                  aria-hidden
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 488 512"
                >
                  <path
                    fill="currentColor"
                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                  />
                </svg>
                Sign up with Google
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="border-border w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card text-muted-foreground px-2">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error ? (
                <div
                  className="bg-destructive/10 text-destructive rounded-md p-3 text-center text-sm"
                  role="alert"
                >
                  {error}
                </div>
              ) : null}
              <div className="space-y-2 text-left">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" disabled={loading} className="h-11 w-full text-base">
                {loading ? <Loader2 className="mr-2 size-4 animate-spin" aria-hidden /> : null}
                {loading ? "Creating…" : "Create account"}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-muted-foreground w-full text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
