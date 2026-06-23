"use client";
import { useState } from 'react';
import { useAuth } from '@/context/useAuth';
import { AuthAPI } from '@/api/routes/AuthAPI';
import { toast } from 'sonner';
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
      toast.success('Welcome Super Admin');
      login(res.token, res.user);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative z-10">
        <h1 className="text-2xl font-bold text-white mb-6 tracking-tight text-center">Super Admin</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputContainer title="Admin Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </InputContainer>

          <InputContainer title="Password">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </InputContainer>

          <Button type="submit" disabled={loading} variant="primary" className="w-full mt-2">
            {loading ? 'Authenticating...' : 'Secure Login'}
          </Button>
        </form>
      </div>
    </div>
  );
}
