"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";

export default function LogoutPage() {
    const router = useRouter();
    const { logout } = useAuth();

    useEffect(() => {
        const performLogout = async () => {
            try {
                // Call the server-side logout endpoint
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reels/auth/logout`, {
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                // Update frontend auth context
                if (logout) {
                    logout();
                }

                // Redirect to homepage after logout
                setTimeout(() => {
                    router.push("/");
                }, 1000);
            } catch (error) {
                console.error("Error during logout:", error);
            }
        };

        performLogout();
    }, [router, logout]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-8">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">Logging out...</h2>
                    <p className="mt-2 text-sm text-gray-600">You will be redirected in a moment</p>
                </div>
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
                </div>
            </div>
        </div>
    );
}
