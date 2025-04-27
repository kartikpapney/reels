"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");

    // Updated API endpoint to match your backend routes
    useEffect(() => {
        // Check if user is already logged in
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => {
                if (res.ok) return res.json();
                throw new Error("Not authenticated");
            })
            .then((userData) => {
                setUser(userData);
                router.push("/"); // Redirect to home if already logged in
            })
            .catch(() => {
                // Not logged in, show login button
                setLoading(false);
            });
    }, [router]);

    // Updated Google login URL to match your backend routes
    const handleGoogleLogin = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    };

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-8">
                <div className="w-full max-w-md p-6 space-y-8">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-bold text-gray-900">Loading...</h2>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ 
            width: "100%", 
            maxWidth: "400px", 
            margin: "0 auto", 
            padding: "20px",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent" // Override any inherited background
        }}>
            <div
                style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: "40px",  // Increased padding
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    textAlign: "center",
                    width: "100%"
                }}
            >
              {/* Additional note to help with troubleshooting */}
              <p style={{ 
                    
                    fontSize: "14px", 
                    color: "#666"
                }}>
                    In the era of unwanted shorts and reels, we want you to consume quality content.
                </p>
                <h2 style={{ 
                  marginTop: "20px", 
                    fontSize: "24px", 
                    fontWeight: "bold", 
                    marginBottom: "10px", // Increased margin
                    color: "#333" 
                }}>
                    Sign in to your account
                </h2>

                {error && <p style={{ color: "red", marginBottom: "20px" }}>{error}</p>}

                <button
                    onClick={handleGoogleLogin}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        padding: "20px", // Increased padding
                        backgroundColor: "#4285F4",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "16px",
                        fontWeight: "500", // Made text slightly bolder
                        cursor: "pointer",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" // Added subtle shadow
                    }}
                >
                    Sign in with Google
                </button>
                
                
            </div>
        </div>
    );
}