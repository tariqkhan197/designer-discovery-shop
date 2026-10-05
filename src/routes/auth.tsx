import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — LUXORA" },
      { name: "description", content: "Sign in or create your LUXORA account." },
      { property: "og:title", content: "Sign in — LUXORA" },
      { property: "og:description", content: "Sign in or create your LUXORA account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"in" | "up" | "forgot">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/account" });
      } else if (mode === "up") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
        setMode("in");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        toast.success("Password reset link sent.");
        setMode("in");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) { toast.error(r.error.message ?? "Google sign-in failed"); return; }
    if (r.redirected) return;
    navigate({ to: "/account" });
  };

  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <p className="eyebrow text-center">Account</p>
      <h1 className="mt-3 text-center text-5xl">
        {mode === "in" ? "Welcome back" : mode === "up" ? "Create account" : "Reset password"}
      </h1>
      <form onSubmit={submit} className="mt-12 space-y-5">
        {mode === "up" && (
          <div className="space-y-2"><Label htmlFor="name">Full name</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
        )}
        <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        {mode !== "forgot" && (
          <div className="space-y-2"><Label htmlFor="pw">Password</Label><Input id="pw" type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        )}
        <Button variant="luxe" size="xl" className="w-full" disabled={busy}>
          {mode === "in" ? "Sign in" : mode === "up" ? "Create account" : "Send reset link"}
        </Button>
      </form>
      {mode !== "forgot" && (
        <>
          <div className="my-6 flex items-center gap-4 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
          <Button variant="luxeOutline" size="xl" className="w-full" onClick={google}>Continue with Google</Button>
        </>
      )}
      <div className="mt-8 space-y-2 text-center text-sm text-muted-foreground">
        {mode === "in" && <>
          <button className="block w-full hover:text-foreground" onClick={() => setMode("forgot")}>Forgot password?</button>
          <button className="block w-full hover:text-foreground" onClick={() => setMode("up")}>New to LUXORA? Create an account</button>
        </>}
        {mode !== "in" && <button className="hover:text-foreground" onClick={() => setMode("in")}>Back to sign in</button>}
      </div>
    </div>
  );
}
