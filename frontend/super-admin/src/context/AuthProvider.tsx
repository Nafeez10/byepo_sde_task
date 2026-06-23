"use client";
import { useEffect, ReactNode } from 'react';
import { AuthContext, User } from './AuthContext';
import { StorageKeys } from '@/enum/StorageKeys';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/api/routes/AuthAPI/AuthAPI';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading, mutate } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user && pathname !== '/login' && pathname !== '/signup') {
        router.push('/login');
      } else if (user && (pathname === '/login' || pathname === '/signup')) {
        router.push('/');
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = (token: string, userData: User) => {
    localStorage.setItem(StorageKeys.TOKEN, token);
    mutate();
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem(StorageKeys.TOKEN);
    mutate(null, false);
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
