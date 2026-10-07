import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — LUXORA" },
      { name: "description", content: "Choose a new password for your LUXORA account." },
      { property: "og:title", content: "Set a new password — LUXORA" },
      { property: "og:description", content: "Choose a new password for your LUXORA account." },
    ],
  }),
  component: Reset,
});

function Reset() {
  const [pw, setPw] = useState("");
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <h1 className="text-center text-5xl">New password</h1>
      <form
        className="mt-12 space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          const { error } = await supabase.auth.updateUser({ password: pw });
          if (error) { toast.error(error.message); return; }
          toast.success("Password updated");
          navigate({ to: "/account" });
        }}
      >
        <div className="space-y-2"><Label htmlFor="pw">New password</Label><Input id="pw" type="password" minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} required /></div>
        <Button variant="luxe" size="xl" className="w-full">Update password</Button>
      </form>
    </div>
  );
}
