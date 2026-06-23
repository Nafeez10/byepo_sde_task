"use client";
import { useState } from "react";
import { useAuth } from "@/context/useAuth";
import {
  OrganizationsAPI,
  useGetOrganizations,
} from "@/api/routes/OrganizationsAPI";
import { toast } from "sonner";
import { LogOut, Plus, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import InputContainer from "@/components/ui/InputContainer";

export default function Home() {
  const { user, logout } = useAuth();
  const { orgs, isLoading, mutate } = useGetOrganizations();
  const [name, setName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  if (!user) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !adminEmail.trim()) return;
    setLoading(true);
    try {
      const data = await OrganizationsAPI.createOrganization({
        name,
        adminEmail,
      });
      toast.success("Organization created");
      setName("");
      setAdminEmail("");
      setInviteLink(data.inviteLink);
      mutate();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create organization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Building2 className="text-primary" />
            Super Admin Portal
          </h1>
          <p className="text-zinc-400 mt-1">
            Manage global organizations across the platform.
          </p>
        </div>
        <button
          onClick={logout}
          className="text-zinc-400 hover:text-white flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800 transition-colors cursor-pointer"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl h-fit sticky top-8">
          <h2 className="text-lg font-semibold text-white mb-4">
            New Organization
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <InputContainer title="Organization Name">
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Corp"
                required
              />
            </InputContainer>
            <InputContainer title="Admin Email">
              <Input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@acme.com"
                required
              />
            </InputContainer>
            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full"
            >
              <Plus size={18} />
              {loading ? "Creating..." : "Create"}
            </Button>
          </form>

          {inviteLink && (
            <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <h3 className="text-emerald-500 font-medium text-sm mb-2">
                Admin Invite Link Generated!
              </h3>
              <p className="text-zinc-400 text-xs mb-3">
                Share this link with the admin so they can set their password
                and log in.
              </p>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto py-2 w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(inviteLink);
                    toast.success("Link copied to clipboard");
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white mb-6">
            Active Organizations
          </h2>
          {isLoading ? (
            <div className="text-zinc-500 animate-pulse">
              Loading organizations...
            </div>
          ) : orgs.length === 0 ? (
            <div className="text-zinc-500 border border-dashed border-zinc-800 rounded-2xl p-8 text-center">
              No organizations found. Create one to get started.
            </div>
          ) : (
            <div className="grid gap-4">
              {orgs.map((org: any) => (
                <div
                  key={org.id}
                  className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl flex justify-between items-center hover:bg-zinc-900 transition-colors"
                >
                  <div>
                    <h3 className="text-white font-medium text-lg">
                      {org.name}
                    </h3>
                    <p className="text-zinc-500 text-sm mt-1">ID: {org.id}</p>
                  </div>
                  <div className="text-xs text-zinc-500 bg-zinc-950 px-3 py-1 rounded-full border border-zinc-800">
                    {new Date(org.createdAt).toLocaleDateString()}
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
