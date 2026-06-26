"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Lock, Mail, UserRound } from "lucide-react";
import { signInWithEmail, signInWithGoogle, signUpWithEmail } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthMode = "login" | "signup";

export function AuthShell({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  const isSignup = mode === "signup";

  const title = useMemo(
    () => (isSignup ? "Create your free PocketSense account" : "Log in to PocketSense"),
    [isSignup]
  );

  const subtitle = useMemo(
    () =>
      isSignup
        ? "No paid SMS provider needed. Just email and password."
        : "Use your email, password, or Google account to get back into your dashboard.",
    [isSignup]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!email.trim() || !password.trim()) {
      setMessage("Email and password are required.");
      return;
    }

    if (isSignup) {
      if (!name.trim()) {
        setMessage("Please enter your name.");
        return;
      }

      if (password.length < 6) {
        setMessage("Password should be at least 6 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setMessage("Passwords do not match.");
        return;
      }
    }

    setIsPending(true);

    try {
      if (isSignup) {
        const result = await signUpWithEmail({
          email,
          password,
          name
        });

        if (!result.success) {
          setMessage(result.error || "Could not create your account.");
          return;
        }

        if (result.requiresEmailConfirmation) {
          setMessage("Account created. Check your email for the confirmation link, then log in.");
          return;
        }

        router.push("/onboarding");
        router.refresh();
        return;
      }

      const result = await signInWithEmail(email, password);

      if (!result.success) {
        setMessage(result.error || "Could not log you in.");
        return;
      }

      router.push(result.onboardingCompleted ? "/dashboard" : "/onboarding");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  async function handleGoogleSignIn() {
    setMessage("");
    setIsPending(true);

    try {
      const result = await signInWithGoogle();

      if (!result.success) {
        setMessage(result.error || "Could not start Google sign-in.");
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.2),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.18),transparent_28%),linear-gradient(180deg,#f8fffb_0%,#fff8ef_100%)] px-4 py-10">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden rounded-[40px] border border-white/60 bg-slate-950 p-8 text-white shadow-2xl lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">PocketSense BD</p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight">
              Student money management,
              <br />
              now with a fully free login system.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/72">
              Email, password, and Google sign-in work without any SMS gateway setup, so you can keep
              PocketSense fully free to start.
            </p>
          </div>

          <div className="grid gap-3">
            {[
              "Free on Supabase Auth",
              "Google sign-in supported",
              "Works with onboarding and dashboard"
            ].map((item) => (
              <div key={item} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/85">
                {item}
              </div>
            ))}
          </div>
        </section>

        <Card className="border-white/60 bg-white/92 shadow-xl backdrop-blur">
          <CardHeader className="space-y-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/25">
              ৳
            </div>
            <div>
              <CardTitle className="text-3xl">{title}</CardTitle>
              <CardDescription className="mt-2 text-sm leading-6">{subtitle}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              {isSignup ? (
                <div className="space-y-2">
                  <Label htmlFor="auth-name">Full name</Label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="auth-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="pl-11"
                      placeholder="Your name"
                    />
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="auth-email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="pl-11"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth-password">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="auth-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="pl-11"
                    placeholder="Minimum 6 characters"
                  />
                </div>
              </div>

              {isSignup ? (
                <div className="space-y-2">
                  <Label htmlFor="auth-confirm-password">Confirm password</Label>
                  <Input
                    id="auth-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Type the password again"
                  />
                </div>
              ) : null}

              <Button type="submit" className="w-full rounded-full" disabled={isPending}>
                {isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSignup ? "Create free account" : "Log in"}
              </Button>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative mx-auto w-fit bg-white px-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  or
                </div>
              </div>

              <Button type="button" variant="outline" className="w-full rounded-full" disabled={isPending} onClick={handleGoogleSignIn}>
                {isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                Continue with Google
              </Button>

              {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

              <div className="text-sm text-muted-foreground">
                {isSignup ? "Already have an account?" : "Need a new account?"}{" "}
                <Link
                  href={isSignup ? "/auth/login" : "/auth/signup"}
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  {isSignup ? "Log in" : "Sign up"}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
