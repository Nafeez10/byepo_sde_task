"use client";
import { createContext } from 'react';

export interface User {
  id: string;
  email: string;
  role: string;
  organizationId: string;
}

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
