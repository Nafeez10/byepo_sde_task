"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/useAuth";
import { AuthAPI } from "@/api/routes/AuthAPI";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import InputContainer from "@/components/ui/InputContainer";
import { useSearchParams, useRouter } from "next/navigation";

export default function InviteSignup() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteId = searchParams.get("inviteId");
  
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!inviteId) {
      toast.error("Invalid or missing invite link");
      router.push("/login");
    }
  }, [inviteId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteId) return;

    setLoading(true);
    try {
      const res = await AuthAPI.signupWithInvite({ inviteId, password });
      toast.success("Account created successfully");
      login(res.token, res.user);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  if (!inviteId) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Accept Admin Invite
          </h1>
          <p className="text-zinc-400 text-sm">
            Set a password to complete your organization admin account setup.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <InputContainer title="New Password">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter a secure password"
            />
          </InputContainer>

          <Button type="submit" disabled={loading} variant="primary" className="w-full mt-2">
            {loading ? "Completing Setup..." : "Complete Setup"}
          </Button>
        </form>
      </div>
    </div>
  );
}
