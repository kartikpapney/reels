"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import styles from "@/components/EnhancedReels.module.css";
import { useAuth } from "@/components/AuthContext";
import LoginPage from "@/components/Login";
import { useRouter } from "next/navigation";

export default function EnhancedReels() {
    const router = useRouter();
    const { user } = useAuth();
    const [reelsData, setReelsData] = useState<string[]>([]);
    const [reelIds, setReelIds] = useState<string[]>([]); // Store reel IDs for tracking
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const [loadedReelIds, setLoadedReelIds] = useState<Set<string>>(new Set());
    const isFetchingRef = useRef<boolean>(false);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const engagementTimerRef = useRef<NodeJS.Timeout | null>(null);
    const seenReelsRef = useRef<Set<string>>(new Set()); // Track which reels have been marked as seen
    const DEBOUNCE_DELAY = 500;
    const ENGAGEMENT_TIME = 1500; // 1 second
    const [hasMore, setHasMore] = useState(true);

    const handleLogout = () => {
        router.push("/logout");
    };

    // Function to mark content as seen
    const markContentAsSeen = useCallback(async (contentId: string) => {
        if (!contentId || seenReelsRef.current.has(contentId)) return;
        
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${contentId}/seen`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                console.log(`Marked content ${contentId} as seen`);
                seenReelsRef.current.add(contentId); // Add to seen set
            } else {
                console.error(`Failed to mark content as seen: ${response.status}`);
            }
        } catch (error) {
            console.error('Error marking content as seen:', error);
        }
    }, []);

    // Start engagement timer when index changes
    useEffect(() => {
        // Clear any existing timer
        if (engagementTimerRef.current) {
            clearTimeout(engagementTimerRef.current);
        }
        
        // Skip if no reels or if outside valid range
        if (!reelIds.length || currentIndex < 0 || currentIndex >= reelIds.length) return;
        
        const currentReelId = reelIds[currentIndex];
        
        // Set a timer to mark content as seen after 1 second
        engagementTimerRef.current = setTimeout(() => {
            markContentAsSeen(currentReelId);
        }, ENGAGEMENT_TIME);
        
        return () => {
            if (engagementTimerRef.current) {
                clearTimeout(engagementTimerRef.current);
            }
        };
    }, [currentIndex, reelIds, markContentAsSeen]);

    const fetchReels = useCallback(
        async (isInitial = false) => {
            if (!hasMore && !isInitial) {
                return;
            }

            try {
                if (isInitial) {
                    setLoading(true);
                    setLoadedReelIds(new Set());
                    setHasMore(true);
                    seenReelsRef.current = new Set(); // Reset seen reels on initial load
                } else {
                    setLoadingMore(true);
                }

                // Use the proxied API endpoint from next.config.js
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}`, {
                    credentials: "include", // Important for sending cookies/auth
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch reels: ${response.status}`);
                }

                const data = await response.json();

                if (data && data.reels && Array.isArray(data.reels)) {
                    const newReelsWithIds = data.reels.filter((reel: any) => !loadedReelIds.has(reel._id));

                    if (newReelsWithIds.length > 0) {
                        const newIds = newReelsWithIds.map((reel: any) => reel._id);
                        setLoadedReelIds((prevIds) => {
                            const updatedIds = new Set(prevIds);
                            newIds.forEach((id: any) => updatedIds.add(id));
                            return updatedIds;
                        });

                        // Extract content from reels
                        const contents = newReelsWithIds.map(
                            (reel: any) => reel.content || reel.description || `Reel from ${reel.bookId?.name || "unknown book"}`
                        );

                        // Store reel IDs for engagement tracking
                        const ids = newReelsWithIds.map((reel: any) => reel._id);

                        if (isInitial) {
                            setReelsData(contents);
                            setReelIds(ids);
                        } else {
                            setReelsData((prevReels) => [...prevReels, ...contents]);
                            setReelIds((prevIds) => [...prevIds, ...ids]);
                        }
                    } else {
                        console.log("No new reels to add");
                        setHasMore(false);
                    }
                } else {
                    throw new Error("Invalid response format");
                }

                setError(null);
            } catch (err) {
                console.error("Error fetching reels:", err);
                setError(err instanceof Error ? err.message : "Failed to fetch reels");
                setHasMore(false);
            } finally {
                if (isInitial) {
                    setLoading(false);
                } else {
                    setLoadingMore(false);
                }
            }
        },
        [hasMore, setLoadedReelIds, setReelsData, setReelIds, setLoading, setLoadingMore, setHasMore, setError]
    );

    // Rest of your useEffects and handlers remain unchanged
    useEffect(() => {
        if (user) {
            console.log("User authenticated, fetching initial reels");
            fetchReels(true);
        } else {
            console.log("No user, not fetching reels");
            // Reset reels data when user logs out
            setReelsData([]);
            setReelIds([]);
            setLoading(false);
        }
    }, [user, fetchReels]); // Depend on user and fetchReels

    const debouncedFetchMore = useCallback(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            if (!isFetchingRef.current && !loadingMore && !loading && hasMore) {
                console.log("Debounced: Loading more reels");
                isFetchingRef.current = true;
                fetchReels(false).finally(() => {
                    isFetchingRef.current = false;
                });
            }
        }, DEBOUNCE_DELAY);
    }, [fetchReels, hasMore, loading, loadingMore]);

    useEffect(() => {
        const handleScroll = () => {
            if (containerRef.current && reelsData.length > 0) {
                const scrollPos = containerRef.current.scrollTop;
                const height = window.innerHeight;
                const index = Math.round(scrollPos / height);

                if (index !== currentIndex && index >= 0 && index < reelsData.length) {
                    setCurrentIndex(index);
                }
                if (scrollPos + 2 * height > reelsData.length * height && !loadingMore && !loading && !isFetchingRef.current && hasMore) {
                    console.log("Nearing end, triggering debounced fetch");
                    debouncedFetchMore();
                }
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener("scroll", handleScroll);
            return () => container.removeEventListener("scroll", handleScroll);
        }
    }, [currentIndex, reelsData.length, loadingMore, loading, hasMore, debouncedFetchMore]);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientY);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isSwipeUp = distance > 50;
        const isSwipeDown = distance < -50;

        if (isSwipeUp && currentIndex < reelsData.length - 1) {
            scrollToReel(currentIndex + 1);
        }

        if (isSwipeDown && currentIndex > 0) {
            scrollToReel(currentIndex - 1);
        }

        setTouchStart(null);
        setTouchEnd(null);
    };

    const scrollToReel = useCallback((index: number) => {
        if (containerRef.current) {
            containerRef.current.scrollTo({
                top: index * window.innerHeight,
                behavior: "smooth",
            });
        }
    }, []);

    if (!user) {
        return (
            <div className={styles.container}>
                <div
                    className={styles.contentWrapper}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100vh",
                        textAlign: "center",
                        padding: "20px",
                    }}
                >
                    <LoginPage />
                </div>
            </div>
        );
    }

    if (loading || error || (reelsData.length === 0 && !loading)) {
        return (
            <div className={styles.container}>
                <div
                    className={styles.contentWrapper}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100vh",
                        textAlign: "center",
                        padding: "20px",
                    }}
                >
                    {loading ? (
                        <>
                            <div
                                style={{
                                    border: "4px solid rgba(255, 255, 255, 0.3)",
                                    borderRadius: "50%",
                                    borderTop: "4px solid #fff",
                                    width: "40px",
                                    height: "40px",
                                    animation: "spin 1s linear infinite",
                                    marginBottom: "20px",
                                }}
                            ></div>
                            <p>Loading reels...</p>
                            <style jsx>{`
                                @keyframes spin {
                                    0% {
                                        transform: rotate(0deg);
                                    }
                                    100% {
                                        transform: rotate(360deg);
                                    }
                                }
                            `}</style>
                        </>
                    ) : (
                        <>
                            <p>{error || "No reels available."}</p>
                            <button
                                style={{
                                    background: "#0070f3",
                                    color: "white",
                                    border: "none",
                                    padding: "10px 20px",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    marginTop: "20px",
                                }}
                                onClick={() => window.location.reload()}
                            >
                                Retry
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Logout Button in the top right corner */}
            <button
                onClick={handleLogout}
                style={{
                    position: "absolute",
                    top: "15px",
                    right: "15px",
                    zIndex: 100,
                    background: "rgba(0, 0, 0, 0.5)",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "8px 15px",
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    backdropFilter: "blur(5px)",
                }}
            >
                <svg
                    style={{ marginRight: "5px" }}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Logout
            </button>

            {/* First-time swipe indicator */}
            {currentIndex === 0 && (
                <div className={styles.swipeIndicator}>
                    <span>Swipe up for next</span>
                    <svg viewBox="0 0 24 24" fill="white" width="24" height="24">
                        <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
                    </svg>
                </div>
            )}

            <div
                ref={containerRef}
                className={styles.scrollContainer}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {reelsData.map((reel, index) => (
                    <div key={index + 1} className={styles.slide}>
                        <div className={styles.contentWrapper}>
                            <div className={styles.content}>
                                <div className={styles.textContainer}>
                                    <p className={styles.text}>{reel}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {loadingMore && (
                    <div className={styles.slide}>
                        <div
                            className={styles.contentWrapper}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <div
                                style={{
                                    border: "4px solid rgba(255, 255, 255, 0.3)",
                                    borderRadius: "50%",
                                    borderTop: "4px solid #fff",
                                    width: "40px",
                                    height: "40px",
                                    animation: "spin 1s linear infinite",
                                    marginBottom: "20px",
                                }}
                            ></div>
                            <p>Loading more reels...</p>
                            <style jsx>{`
                                @keyframes spin {
                                    0% {
                                        transform: rotate(0deg);
                                    }
                                    100% {
                                        transform: rotate(360deg);
                                    }
                                }
                            `}</style>
                        </div>
                    </div>
                )}

                {!loadingMore && !hasMore && reelsData.length > 0 && (
                    <div className={styles.slide}>
                        <div
                            className={styles.contentWrapper}
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                padding: "20px",
                                color: "white",
                                textAlign: "center",
                            }}
                        >
                            <p>No more reels to load.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}