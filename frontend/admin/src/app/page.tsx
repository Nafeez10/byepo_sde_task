"use client";
import { useState } from 'react';
import { useAuth } from '@/context/useAuth';
import { FlagsAPI, useGetFeatureFlags } from '@/api/routes/FlagsAPI';
import { OrganizationsAPI } from '@/api/routes/OrganizationsAPI';
import { toast } from 'sonner';
import { LogOut, Plus, Trash2, Power, PowerOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import InputContainer from '@/components/ui/InputContainer';

export default function Home() {
  const { user, logout } = useAuth();
  const { flags, isLoading, mutate } = useGetFeatureFlags();
  const [newKey, setNewKey] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);

  if (!user) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;
    setLoading(true);
    try {
      await FlagsAPI.createFlag({ key: newKey, isEnabled: false });
      toast.success('Feature flag created');
      setNewKey('');
      mutate();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create flag');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteLoading(true);
    try {
      await OrganizationsAPI.inviteUser({ email: inviteEmail });
      toast.success('User invited successfully');
      setInviteEmail('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to invite user');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await FlagsAPI.updateFlag(id, { isEnabled: !currentStatus });
      toast.success('Flag updated');
      mutate();
    } catch (err: any) {
      toast.error('Failed to update flag');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await FlagsAPI.deleteFlag(id);
      toast.success('Flag deleted');
      mutate();
    } catch (err: any) {
      toast.error('Failed to delete flag');
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Feature Flags Dashboard</h1>
          <p className="text-zinc-400 mt-1">Manage feature rollouts for your organization.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-zinc-300">{user.email}</div>
            <div className="text-xs text-zinc-500">Org Admin</div>
          </div>
          <button onClick={logout} className="text-zinc-400 hover:text-white flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800 transition-colors cursor-pointer">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl h-fit sticky top-8">
          <h2 className="text-lg font-semibold text-white mb-4">New Feature Flag</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <InputContainer title="Flag Key">
              <Input type="text" value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="e.g. new-checkout-flow" required />
            </InputContainer>
            <Button type="submit" disabled={loading} variant="primary" className="w-full">
              <Plus size={18} />
              {loading ? 'Adding...' : 'Add Flag'}
            </Button>
          </form>
        
          <div className="mt-8 border-t border-zinc-800 pt-8">
            <h2 className="text-lg font-semibold text-white mb-4">Invite User</h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <InputContainer title="User Email">
                <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="e.g. user@example.com" required />
              </InputContainer>
              <Button type="submit" disabled={inviteLoading} variant="primary" className="w-full">
                <Plus size={18} />
                {inviteLoading ? 'Inviting...' : 'Send Invite'}
              </Button>
            </form>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white mb-6">Your Flags</h2>
          {isLoading ? (
            <div className="text-zinc-500 animate-pulse">Loading flags...</div>
          ) : flags.length === 0 ? (
            <div className="text-zinc-500 border border-dashed border-zinc-800 rounded-2xl p-8 text-center">
              No feature flags created yet. Add your first flag from the sidebar.
            </div>
          ) : (
            <div className="grid gap-4">
              {flags.map((flag: any) => (
                <div key={flag.id} className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl flex justify-between items-center hover:bg-zinc-900 transition-colors">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-white font-medium text-lg flex items-center gap-2">
                      {flag.key}
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${flag.isEnabled ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-800 text-zinc-400'}`}>
                        {flag.isEnabled ? 'Active' : 'Inactive'}
                      </span>
                    </h3>
                    <p className="text-zinc-500 text-sm">Created: {new Date(flag.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggle(flag.id, flag.isEnabled)}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${flag.isEnabled ? 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                      title={flag.isEnabled ? 'Disable flag' : 'Enable flag'}
                    >
                      {flag.isEnabled ? <Power size={20} /> : <PowerOff size={20} />}
                    </button>
                    <button
                      onClick={() => handleDelete(flag.id)}
                      className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors cursor-pointer"
                      title="Delete flag"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
