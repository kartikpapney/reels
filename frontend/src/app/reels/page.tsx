"use client";

import React from "react";
import EnhancedReels from "@/components/EnhancedReels";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthContext";

export default function ReelsPage() {
    const { user, loading } = useAuth();

    // Show loading state while auth state is being determined
    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div
                        className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                        role="status"
                    >
                        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                            Loading...
                        </span>
                    </div>
                    <p className="mt-2">Loading...</p>
                </div>
            </main>
        );
    }

    return (
        <ProtectedRoute>
            <main className="min-h-screen">
                <EnhancedReels />
            </main>
        </ProtectedRoute>
    );
}
