"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "@/components/EnhancedReels.module.css";
import { reelsData } from "@/lib/demo";
export default function EnhancedReels() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [autoSpeak, setAutoSpeak] = useState(false);
    const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Initialize speech synthesis
    useEffect(() => {
        // Check if speech synthesis is available
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            speechSynthRef.current = new SpeechSynthesisUtterance();

            // Configure for a more soothing voice
            speechSynthRef.current.rate = 0.9; // Slightly slower rate for better comprehension
            speechSynthRef.current.pitch = 0.95; // Slightly lower pitch for a smoother sound
            speechSynthRef.current.volume = 0.9; // Slightly lower volume to feel less harsh

            // Get available voices and set a preferred one if available
            window.speechSynthesis.onvoiceschanged = () => {
                const voices = window.speechSynthesis.getVoices();

                // Try to find the most soothing voices in this priority order
                const preferredVoices = [
                    // These voices are known to be more natural/soothing
                    voices.find((voice) => voice.name.includes("Samantha")), // iOS/macOS soothing voice
                    voices.find((voice) => voice.name.includes("Google UK English Female")),
                    voices.find((voice) => voice.name.includes("Daniel")), // UK English voice
                    voices.find((voice) => voice.name.includes("Karen")), // Australian English
                    voices.find((voice) => voice.name.includes("Moira")), // Irish English
                    // Fallbacks
                    voices.find((voice) => voice.lang.includes("en") && voice.name.includes("Female")),
                    voices.find((voice) => voice.lang.includes("en")),
                ].filter(Boolean)[0]; // Get first non-null voice

                if (speechSynthRef.current && preferredVoices) {
                    speechSynthRef.current.voice = preferredVoices;
                    console.log("Selected voice:", preferredVoices.name);
                }
            };

            // Get voices (this might trigger onvoiceschanged in some browsers)
            window.speechSynthesis.getVoices();
        }

        // Cleanup on component unmount
        return () => {
            if (typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // Function to read text aloud
    const speakText = (text: string) => {
        if (typeof window !== "undefined" && "speechSynthesis" in window && speechSynthRef.current) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            // Set new text and speak
            speechSynthRef.current.text = text;
            setIsSpeaking(true);

            // Add event listener for when speaking ends
            speechSynthRef.current.onend = () => {
                setIsSpeaking(false);
            };

            window.speechSynthesis.speak(speechSynthRef.current);
        }
    };

    // Handle scroll events
    useEffect(() => {
        const handleScroll = () => {
            if (containerRef.current) {
                const scrollPos = containerRef.current.scrollTop;
                const height = window.innerHeight;
                const index = Math.round(scrollPos / height);

                if (index !== currentIndex && index >= 0 && index < reelsData.length) {
                    setCurrentIndex(index);

                    // Read the text of the new slide if auto-speak is enabled
                    if (autoSpeak) {
                        speakText(reelsData[index]);
                    }
                }
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener("scroll", handleScroll);
            return () => container.removeEventListener("scroll", handleScroll);
        }
    }, [currentIndex, autoSpeak]);

    // Touch handlers for mobile swipe
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

    // Scroll to specific reel
    const scrollToReel = (index: number) => {
        if (containerRef.current) {
            containerRef.current.scrollTo({
                top: index * window.innerHeight,
                behavior: "smooth",
            });
        }
    };

    // Toggle auto-speak
    const toggleAutoSpeak = () => {
        const newState = !autoSpeak;
        setAutoSpeak(newState);

        // If we're turning it on, speak the current slide
        if (newState) {
            speakText(reelsData[currentIndex]);
        } else {
            // If turning off, stop any current speech
            if (typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
            }
        }
    };

    // Manual speak button handler
    const handleSpeakButton = () => {
        if (isSpeaking) {
            // Stop speaking if already in progress
            if (typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
            }
        } else {
            // Start speaking
            speakText(reelsData[currentIndex]);
        }
    };

    return (
        <div className={styles.container}>
            {/* YouTube-style progress indicator */}
            {/* <div className={styles.progressContainer}>
                {reelsData.map((_, index) => (
                    <div
                        key={`progress-${index}`}
                        className={`${styles.progressDot} ${index === currentIndex ? styles.progressActive : ""}`}
                        onClick={() => scrollToReel(index)}
                    />
                ))}
            </div> */}

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
                        {/* Content wrapper for better layout */}
                        <div className={styles.contentWrapper}>
                            {/* Header */}

                            <div className={styles.content}>
                                <div className={styles.textContainer}>
                                    <p className={styles.text}>{reel}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
