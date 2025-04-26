"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import styles from "@/components/EnhancedReels.module.css";

export default function EnhancedReels() {
    const [reelsData, setReelsData] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [autoSpeak, setAutoSpeak] = useState(false);
    const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
    const [loadedReelIds, setLoadedReelIds] = useState<Set<string>>(new Set());
    const isFetchingRef = useRef<boolean>(false);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const DEBOUNCE_DELAY = 500;
    const [hasMore, setHasMore] = useState(true);

    const fetchReels = useCallback(async (isInitial = false) => {
        if (!hasMore && !isInitial) {
            return;
        }

        try {
            if (isInitial) {
                setLoading(true);
                setLoadedReelIds(new Set());
                setHasMore(true);
            } else {
                setLoadingMore(true);
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api`);

            if (!response.ok) {
                throw new Error(`Failed to fetch reels: ${response.status}`);
            }

            const data = await response.json();

            if (data && data.reels && Array.isArray(data.reels)) {
                const newReelsWithIds = data.reels.filter((reel: any) =>
                    !loadedReelIds.has(reel._id)
                );

                if (newReelsWithIds.length > 0) {
                    const newIds = newReelsWithIds.map((reel: any) => reel._id);
                    setLoadedReelIds(prevIds => {
                        const updatedIds = new Set(prevIds);
                        newIds.forEach((id: any) => updatedIds.add(id));
                        return updatedIds;
                    });

                    const contents = newReelsWithIds.map((reel: any) => reel.content);

                    if (isInitial) {
                        setReelsData(contents);
                    } else {
                        setReelsData(prevReels => [...prevReels, ...contents]);
                    }
                } else {
                    console.log("No new reels to add");
                    setHasMore(false);
                }
            } else {
                throw new Error('Invalid response format');
            }

            setError(null);
        } catch (err) {
            console.error('Error fetching reels:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch reels');
            setHasMore(false);
        } finally {
            if (isInitial) {
                setLoading(false);
            } else {
                setLoadingMore(false);
            }
        }
    }, [hasMore, setLoadedReelIds, setReelsData, setLoading, setLoadingMore, setHasMore, setError]);

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
        // Initialize speech synthesis
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            speechSynthRef.current = new SpeechSynthesisUtterance();

            speechSynthRef.current.rate = 0.9;
            speechSynthRef.current.pitch = 0.95;
            speechSynthRef.current.volume = 0.9;

            window.speechSynthesis.onvoiceschanged = () => {
                const voices = window.speechSynthesis.getVoices();
                const preferredVoices = [
                    voices.find((voice) => voice.name.includes("Samantha")),
                    voices.find((voice) => voice.name.includes("Google UK English Female")),
                    voices.find((voice) => voice.name.includes("Daniel")),
                    voices.find((voice) => voice.name.includes("Karen")),
                    voices.find((voice) => voice.name.includes("Moira")),
                    voices.find((voice) => voice.lang.includes("en") && voice.name.includes("Female")),
                    voices.find((voice) => voice.lang.includes("en")),
                ].filter(Boolean)[0];

                if (speechSynthRef.current && preferredVoices) {
                    speechSynthRef.current.voice = preferredVoices;
                    console.log("Selected voice:", preferredVoices.name);
                }
            };
            window.speechSynthesis.getVoices();
        }

        fetchReels(true);
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            if (typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, [fetchReels]); // fetchReels in dependency array

    const speakText = useCallback((text: string) => {
        if (typeof window !== "undefined" && "speechSynthesis" in window && speechSynthRef.current) {
            window.speechSynthesis.cancel();
            speechSynthRef.current.text = text;
            setIsSpeaking(true);
            speechSynthRef.current.onend = () => {
                setIsSpeaking(false);
            };
            window.speechSynthesis.speak(speechSynthRef.current);
        }
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (containerRef.current && reelsData.length > 0) {
                const scrollPos = containerRef.current.scrollTop;
                const height = window.innerHeight;
                const index = Math.round(scrollPos / height);

                if (index !== currentIndex && index >= 0 && index < reelsData.length) {
                    setCurrentIndex(index);
                    if (autoSpeak) {
                        speakText(reelsData[index]);
                    }
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
    }, [currentIndex, autoSpeak, reelsData.length, loadingMore, loading, hasMore, debouncedFetchMore, speakText]); // Added debouncedFetchMore and speakText

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

    const toggleAutoSpeak = () => {
        const newState = !autoSpeak;
        setAutoSpeak(newState);
        if (newState && reelsData.length > 0) {
            speakText(reelsData[currentIndex]);
        } else {
            if (typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
            }
        }
    };

    const handleSpeakButton = () => {
        if (isSpeaking) {
            if (typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
            }
        } else if (reelsData.length > 0) {
            speakText(reelsData[currentIndex]);
        }
    };

    if (loading || error || (reelsData.length === 0 && !loading)) {
        return (
            <div className={styles.container}>
                <div className={styles.contentWrapper} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    textAlign: 'center',
                    padding: '20px'
                }}>
                    {loading ? (
                        <>
                            <div style={{
                                border: '4px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '50%',
                                borderTop: '4px solid #fff',
                                width: '40px',
                                height: '40px',
                                animation: 'spin 1s linear infinite',
                                marginBottom: '20px'
                            }}></div>
                            <p>Loading reels...</p>
                            <style jsx>{`
                                @keyframes spin {
                                    0% { transform: rotate(0deg); }
                                    100% { transform: rotate(360deg); }
                                }
                            `}</style>
                        </>
                    ) : (
                        <>
                            <p>{error || "No reels available."}</p>
                            <button
                                style={{
                                    background: '#0070f3',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    marginTop: '20px'
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
            {/* Text-to-speech controls */}
            <div className={styles.audioControls}>
                <button
                    className={`${styles.audioButton} ${isSpeaking ? styles.speaking : ""}`}
                    onClick={handleSpeakButton}
                    aria-label={isSpeaking ? "Stop speaking" : "Read aloud"}
                >
                    {isSpeaking ? (
                        <svg viewBox="0 0 24 24" fill="white" width="24" height="24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="white" width="24" height="24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                        </svg>
                    )}
                </button>

                <button
                    className={`${styles.audioToggle} ${autoSpeak ? styles.autoActive : ""}`}
                    onClick={toggleAutoSpeak}
                    aria-label={autoSpeak ? "Turn off auto-read" : "Turn on auto-read"}
                >
                    {autoSpeak ? "Auto: ON" : "Auto: OFF"}
                </button>
            </div>

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
                        <div className={styles.contentWrapper} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <div style={{
                                border: '4px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '50%',
                                borderTop: '4px solid #fff',
                                width: '40px',
                                height: '40px',
                                animation: 'spin 1s linear infinite',
                                marginBottom: '20px'
                            }}></div>
                            <p>Loading more reels...</p>
                            <style jsx>{`
                                @keyframes spin {
                                    0% { transform: rotate(0deg); }
                                    100% { transform: rotate(360deg); }
                                }
                            `}</style>
                        </div>
                    </div>
                )}

                {!loadingMore && !hasMore && reelsData.length > 0 && (
                    <div className={styles.slide}>
                        <div className={styles.contentWrapper} style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '20px',
                            color: 'white',
                            textAlign: 'center'
                        }}>
                            <p>No more reels to load.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}