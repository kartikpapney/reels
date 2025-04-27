// pages/api/user.ts
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // Make a request to your Express backend to get user data
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
            headers: {
                // Forward cookies for authentication
                Cookie: req.headers.cookie || "",
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        if (!response.ok) {
            if (response.status === 401) {
                return res.status(401).json({ error: "Not authenticated" });
            }
            throw new Error(`API error: ${response.status}`);
        }

        const userData = await response.json();
        return res.status(200).json(userData);
    } catch (error) {
        console.error("Error fetching user data:", error);
        return res.status(500).json({ error: "Failed to fetch user data" });
    }
}
