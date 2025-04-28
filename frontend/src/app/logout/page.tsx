"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";

export default function LogoutPage() {
    const router = useRouter();
    const { logout } = useAuth();

    useEffect(() => {
        const performLogout = async () => {
            // Debug the URL
            const logoutUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`;

            try {
                // Call the server-side logout endpoint
                const response = await fetch(logoutUrl, {
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                
                console.log("Logout response status:", response.status);
                
                // Update frontend auth context
                if (logout) {
                    logout();
                    console.log("Local logout successful");
                }

                // Redirect to homepage after logout
                setTimeout(() => {
                    router.push("/");
                }, 1000);
            } catch (error) {
                console.error("Error during logout:", error);
                // Still logout locally even if server logout fails
                if (logout) {
                    logout();
                }
                router.push("/");
            }
        };

        performLogout();
    }, [router, logout]);

    // Rest of your component remains the same
}