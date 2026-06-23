"use client";
import { useState } from 'react';
import { useAuth } from '@/context/useAuth';
import { AuthAPI } from '@/api/routes/AuthAPI';
import { toast } from 'sonner';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import InputContainer from '@/components/ui/InputContainer';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await AuthAPI.login({ email, password });
      toast.success('Logged in successfully');
      login(res.token, res.user);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Organization Admin</h1>
          <p className="text-zinc-400 text-sm">Sign in to manage your feature flags.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <InputContainer title="Email Address">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </InputContainer>

          <InputContainer title="Password">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </InputContainer>

          <Button type="submit" disabled={loading} className="w-full mt-4">
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-zinc-400 text-sm mt-8">
          Don't have an account? <Link href="/signup" className="text-white hover:underline transition-colors">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
