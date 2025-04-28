"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
    _id: string;
    googleId: string;
    email: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: () => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshUser = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                throw new Error("Failed to fetch user");
            }

            const userData = await res.json();
            setUser(userData);
            return userData;
        } catch (err) {
            setUser(null);
            console.error("Error refreshing user:", err);
        }
    };

    useEffect(() => {
        // Check if user is logged in on initial load
        refreshUser()
            .then(() => setLoading(false))
            .catch(() => {
                setLoading(false);
            });
    }, []);

    const login = () => {
        window.location.href = process.env.NEXT_PUBLIC_API_URL+"/auth/google";
    };

    const logout = () => {
        window.location.href = process.env.NEXT_PUBLIC_FRONTEND_URL ?? "";
    };

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
