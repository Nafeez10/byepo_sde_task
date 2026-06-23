"use client";
import { useState } from "react";
import { useAuth } from "@/context/useAuth";
import { FlagsAPI, useGetFeatureFlagKeys } from "@/api/routes/FlagsAPI";
import { toast } from "sonner";
import { LogOut, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import InputContainer from "@/components/ui/InputContainer";

export default function Home() {
  const { user, logout } = useAuth();
  const { availableKeys, isLoading: loadingKeys } = useGetFeatureFlagKeys();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [results, setResults] = useState<
    { key: string; enabled: boolean; message?: string }[] | null
  >(null);
  const [loading, setLoading] = useState(false);



  const checkFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedKeys.length === 0) {
      toast.error("Please select at least one feature key");
      return;
    }

    setLoading(true);
    try {
      const keysParam = selectedKeys
        .map((k) => encodeURIComponent(k))
        .join(",");
      const data = await FlagsAPI.checkStatuses(keysParam);
      setResults(data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to check feature flags");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4 flex items-center gap-4 bg-zinc-900/50 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-800">
        <span className="text-zinc-300 text-sm font-medium">{user.email}</span>
        <div className="w-[1px] h-4 bg-zinc-700" />
        <button
          onClick={logout}
          className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium cursor-pointer"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl mt-16 p-8 shadow-2xl backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-white mb-2 text-center tracking-tight">
          Feature Flag Check
        </h1>
        <p className="text-zinc-400 text-sm text-center mb-8">
          Select feature keys to see if they are enabled for your organization.
        </p>

        <form onSubmit={checkFlag} className="space-y-6">
          <InputContainer title="Available Feature Keys">
            {loadingKeys ? (
              <p className="text-sm text-zinc-400 py-2">Loading keys...</p>
            ) : availableKeys.length === 0 ? (
              <p className="text-sm text-zinc-400 py-2">
                No feature keys available.
              </p>
            ) : (
              <div className="space-y-3 mt-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {availableKeys.map((key) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        className="peer appearance-none w-5 h-5 border border-zinc-700 rounded bg-zinc-800/50 checked:bg-emerald-500 checked:border-emerald-500 transition-all cursor-pointer"
                        checked={selectedKeys.includes(key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedKeys((prev) => [...prev, key]);
                          } else {
                            setSelectedKeys((prev) =>
                              prev.filter((k) => k !== key),
                            );
                          }
                        }}
                      />
                      <CheckCircle2 className="absolute text-white opacity-0 peer-checked:opacity-100 w-3.5 h-3.5 pointer-events-none transition-opacity" />
                    </div>
                    <span className="text-zinc-300 text-sm group-hover:text-white transition-colors">
                      {key}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </InputContainer>

          <Button
            type="submit"
            disabled={loading || availableKeys.length === 0}
            className="w-full"
          >
            {loading ? "Checking..." : "Check Status"}
          </Button>
        </form>

        {results && (
          <div className="mt-8 space-y-4">
            {results.map((result, idx) => (
              <div
                key={result.key}
                className={`p-4 rounded-2xl flex items-start gap-4 transition-all duration-500 ease-out animate-in slide-in-from-bottom-4 fade-in ${
                  result.enabled
                    ? "bg-emerald-500/10 border border-emerald-500/20"
                    : "bg-red-500/10 border border-red-500/20"
                }`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {result.enabled ? (
                  <CheckCircle2
                    className="text-emerald-500 mt-1 shrink-0"
                    size={24}
                  />
                ) : (
                  <XCircle className="text-red-500 mt-1 shrink-0" size={24} />
                )}
                <div>
                  <h3
                    className={`text-base font-semibold ${result.enabled ? "text-emerald-500" : "text-red-500"}`}
                  >
                    {result.key}: {result.enabled ? "Enabled" : "Disabled"}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    {result.message ||
                      (result.enabled
                        ? "This feature is active for your organization."
                        : "This feature is turned off for your organization.")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
