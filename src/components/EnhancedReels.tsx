"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./EnhancedReels.module.css";

const reelsData = [
    "Habits are the compound interest of self-improvement. Getting 1% better each day counts for a lot in the long run, as these small improvements compound over time.",
    "You do not rise to the level of your goals. You fall to the level of your systems. Focus on creating systems rather than setting goals.",
    "The most effective way to change your habits is to focus on who you want to become, not what you want to achieve. Every action you take is a vote for the type of person you wish to be.",
    "Your habits shape your identity, and your identity shapes your habits. The more you repeat a behavior, the more you reinforce the identity associated with it.",
    "The Four Laws of Behavior Change: make it obvious, make it attractive, make it easy, and make it satisfying. These four laws can be used to build better habits or break bad ones.",
    "Environment is the invisible hand that shapes human behavior. Create an environment where good habits are easy and bad habits are difficult.",
    "Habit stacking: Identify a current habit you already do each day and then stack your new behavior on top. After [CURRENT HABIT], I will [NEW HABIT].",
    "Make the cues of good habits obvious in your environment. The more visible and accessible a cue is, the more likely it is to trigger a habit.",
    "Use temptation bundling by pairing an action you want to do with an action you need to do. Only watch your favorite show while at the gym.",
    "The Two-Minute Rule: When you start a new habit, it should take less than two minutes to do. Scaling down a habit to just two minutes makes it feel manageable.",
    "Habits are automatic choices that influence the conscious decisions that follow. Your habits create your future self through tiny, daily choices.",
    "Motivation is overrated; environment often matters more. Design your environment to make good habits inevitable and bad habits impossible.",
    "People with high self-control tend to spend less time in tempting situations. It's easier to avoid temptation than resist it.",
    "The Goldilocks Rule: humans experience peak motivation when working on tasks that are right on the edge of their current abilities—not too hard, not too easy.",
    "The greatest threat to success is not failure but boredom. Anyone can work hard when they feel motivated, but it's the ability to keep going when work isn't exciting that makes the difference.",
    "Never miss twice. Missing once is an accident. Missing twice is the start of a new habit. When you slip up, get back on track quickly.",
    "Habit tracking provides clear evidence of your progress and gives you immediate satisfaction for maintaining your habits.",
    "Just because you can measure something doesn't mean it's the most important thing. Focus on what truly matters, not just what's easily quantifiable.",
    "Join a culture where your desired behavior is the normal behavior. We tend to imitate the habits of those around us.",
    "Play to your strengths. Pick the right habit and progress is easy. Pick the wrong habit and life is a struggle. Choose habits that best suit your natural abilities and tendencies.",
    "Breakthrough moments are often the result of many previous actions that build up potential over time. What looks like an overnight success is usually the result of months or years of small, consistent improvements.",
    "The purpose of setting goals is to win the game; the purpose of building systems is to continue playing the game. True long-term thinking is goal-less thinking.",
    "Professionals stick to the schedule; amateurs let life get in the way. The difference between professionals and amateurs is that professionals show up even when they don't feel like it.",
    "Small habits don't add up. They compound. That's the power of atomic habits—tiny changes, remarkable results over time.",
    "Be the designer of your world and not merely the consumer of it. When you understand how environment shapes behavior, you can create spaces that make good habits easier.",
    "We imitate the habits of three groups in particular: the close (family and friends), the many (the tribe), and the powerful (those with status and prestige).",
    "Every time you create a habit, you're essentially creating an algorithm for your future self. It's a mental rule: if this, then that.",
    "The human brain is a prediction machine. When a habit becomes automatic, the brain predicts what will happen next without conscious thought.",
    "Create an implementation intention: 'I will [BEHAVIOR] at [TIME] in [LOCATION].' Being specific about when and where you will act makes it more likely you'll follow through.",
    "The inversion of the Four Laws of Behavior Change for breaking bad habits: make it invisible, make it unattractive, make it difficult, and make it unsatisfying.",
    "Make decisive moments work in your favor. These small choices—like what to eat for lunch or whether to go to the gym—can deliver an outsized impact on your life path.",
    "Until you make your habits a part of your identity, progress is temporary. True behavior change is identity change.",
    "In a distracted world, the ability to focus without interruption is becoming increasingly valuable. Design your environment to remove the cues that trigger distracting habits.",
    "We naturally gravitate toward the path of least resistance. Use this tendency to your advantage by reducing friction for habits you want and increasing friction for habits you want to avoid.",
    "The costs of your good habits are in the present. The costs of your bad habits are in the future. This is why it can be so difficult to develop good habits and so easy to develop bad ones.",
    "To make a habit stick, it must be immediately satisfying. Find ways to add immediate pleasure to habits that pay off in the long-run.",
    "Habits + Deliberate Practice = Mastery. Habits are necessary for improvement, but not sufficient for mastering a skill. You need both repetition and deliberate challenges.",
    "Improvement is not just about learning new habits; it's also about refining them. Reflection and review ensure you spend your time on the right things.",
    "The Diderot Effect: obtaining a new possession often creates a spiral of consumption, leading to additional purchases. Similarly, one new habit often leads to related new habits.",
    "Standardize before you optimize. You can't improve a habit that doesn't exist. Establish the behavior first, then improve it.",
    "Make your habits satisfying by tracking your progress. The most effective form of motivation is progress.",
    "The first mistake is never the one that ruins you. It is the spiral of repeated mistakes that follows. Get back on track quickly when you slip up.",
    "The hard and stiff will be broken. The soft and supple will prevail. Be willing to adapt your habits as your identity evolves.",
    "Happiness is not about the achievement of pleasure but about the absence of desire. It arrives when you have no urge to feel differently.",
    "Don't break the chain. Try to keep your habit streak alive. This creates a powerful momentum that helps maintain your habits.",
    "Becoming an expert isn't about knowing all the answers; it's about avoiding rookie mistakes. Eliminate obvious errors to improve your performance.",
    "Prime your environment for future use. Set up your space to make your next action as easy as possible.",
    "Use habit shaping to gradually build up to your target behavior. Master each stage before moving to the next level.",
    "Make it obvious when you're falling short. Visual measures—like moving paper clips from one jar to another—provide clear evidence of your progress.",
    "What gets measured gets managed. Track the habits that matter most to see meaningful improvements.",
    "The Cardinal Rule of Behavior Change: What is immediately rewarded is repeated. What is immediately punished is avoided.",
    "For one-time behaviors like getting vaccinated, create an implementation intention. For habits you want to build for life, focus on identity change.",
    "The brain's primary purpose is to control the body, and it uses feedback loops to accomplish this. Cue, craving, response, reward—this is how all habits form.",
    "When you're feeling unmotivated to practice a habit, reframe your mindset. Don't focus on how hard it is; focus on the opportunity it provides.",
    "Reframe your habits to highlight their benefits rather than their drawbacks. Shift 'I have to' to 'I get to' to transform how you view your responsibilities.",
    "One of the most practical ways to eliminate a bad habit is to reduce exposure to the cue that causes it. Out of sight, out of mind.",
    "A commitment device is a choice you make in the present that limits your future behavior—like cutting up credit cards or using website blockers.",
    "One-time actions that lock in good behaviors: buying smaller plates, setting up automatic savings, buying a good mattress, unsubscribing from emails, turning off notifications.",
    "The human brain evolved to prioritize immediate rewards over delayed rewards. This made sense for survival situations but works against us in the modern world.",
    "Choose habits that align with your natural abilities and skills. Work hard on the things that come easy to you.",
    "When looking for a new habit, ask yourself: What feels like fun to me, but work to others? Where do I get greater returns than the average person?",
    "Every habit produces multiple outcomes across time. The immediate outcome is often different from the ultimate outcome.",
    "All big things come from small beginnings. The seed of every habit is a single, tiny decision.",
    "Until you work as hard as those you admire, don't explain away their success as luck. Genes can't make you successful if you're not doing the work.",
    "Your habits need to be aligned with your personality and natural inclinations to be sustainable. Choose the habit that best suits you, not the one that is most popular.",
    "If you want to master a habit, the key is to start with repetition, not perfection. Focus on doing it consistently rather than doing it perfectly.",
    "Make 'showing up' your habit. The more consistent you are, the more confidence and evidence you build that you're the type of person who does this particular activity.",
    "We often fall into the all-or-nothing cycle with our habits. But it's better to do less than you hoped than to do nothing at all.",
    "The plateau of latent potential: you need to persist through the Valley of Disappointment, where your results are delayed, and maintain habits long enough to break through this plateau.",
    "The downside of creating good habits is that we start to overlooking small errors once we're comfortable. Maintain continuous improvement by reflecting on your process.",
    "Each month, set aside time for an 'Integrity Report' where you reflect on your values, assess how you're living in line with them, and set a higher standard for the future.",
    "Get an accountability partner to make the costs of your bad habits public and painful. We care deeply about what others think, so leverage this to your advantage.",
    "Realize that your habits are a form of vote for the type of person you wish to become. Every time you choose a certain action, you're voting for that identity.",
    "Lost days hurt you more than successful days help you. The math of success shows that avoiding zeros (days with no progress) is more valuable than occasional heroic efforts.",
    "To become the best version of yourself requires you to continuously edit your beliefs and upgrade your identity as you grow and learn.",
    "The human body will always take the path of least resistance, so make that path aligned with your long-term goals.",
    "An accountability partner creates an immediate cost to inaction. You'll jump through a lot of hoops to avoid a little bit of immediate pain.",
    "The most proven scientific analysis of personality traits is known as the 'Big Five': openness to experience, conscientiousness, extroversion, agreeableness, and neuroticism.",
    "For a learning curve, habits form based on frequency, not time. It's not about how long it takes, but about how many times you've practiced.",
    "Hope is often the first step to change, but it's not enough by itself. You need a plan and a system to translate that hope into results.",
    "The difference between winners and losers is often how they respond to failure. Winners rebound quickly; losers let failure spiral into a worse performance.",
    "Surround yourself with people who have the habits you want to have. Join communities where your desired behavior is the normal behavior.",
    "Create a motivation ritual—do something you enjoy immediately before a difficult habit to make the start of the process more attractive.",
    "Establish habits in the areas where you want to excel. This frees up mental capacity for other activities, as the habitual tasks require less mental energy.",
    "You can either work with your nature or against it. If you align with it, success is simple. If you fight it, progress will always be a struggle.",
    "To change a habit, identify the cue, the craving behind it, the response, and the reward it provides. Then, find an alternate behavior that delivers the same reward.",
    "Avoid making your streak the measurement of success. The all-or-nothing approach can lead you to abandon a habit if you break the streak once.",
    "A lack of self-awareness is poison. Reflection and review is the antidote. Continuously examine your habits to ensure they're still serving you well.",
    "Focus on systems instead of goals to succeed in the long term. The score takes care of itself when you focus on the process.",
    "Cravings are the desire to change your internal state. What you crave is not the habit itself but the change it delivers.",
    "Before you can build good habits, you need to get your beliefs in order. Your habits are how you embody your identity.",
    "Pointing-and-Calling is a technique that raises awareness by verbalizing actions. Simply stating what you're doing and why can prevent mindless habits.",
    "The process of behavior change is like an ice cube melting. Small changes that seem to make no difference will eventually lead to remarkable results once you cross the threshold.",
    "Bad habits are autocatalytic—they feed themselves. Breaking them requires disrupting the feedback loop that sustains them.",
    "Your outcomes are a lagging measure of your habits. Your weight is a lagging measure of your eating habits; your knowledge is a lagging measure of your learning habits.",
    "When you fall in love with the process rather than the product, you don't have to wait to give yourself permission to be happy.",
    "Motion is when you're planning, strategizing, and learning. Action is when you're actually producing a result. Focus on action rather than motion.",
    "Design your environment to make the good habit the path of least resistance. Make good behaviors easy and bad behaviors difficult.",
    "Behavior followed by satisfying consequences tends to be repeated. Create a reward to satisfy your craving and complete the habit loop.",
    "Make your habits so easy that you'll do them even when you don't feel like it. Then, master the decisive moments that shape your day.",
    "The habit loop involves four steps: cue, craving, response, and reward. Understanding this loop helps you create good habits and break bad ones.",
    "Becoming aware of your habits is the first step to changing them. You can't improve a habit if you're not aware of it.",
    "Curiosity is better than criticism. Be curious about why habits form rather than critical of your bad habits.",
    "Create a habit contract that states your commitment and the punishment that will occur if you don't follow through, then find someone to hold you accountable.",
    "The more immediate the pain, the less likely the behavior. Add immediate costs to bad behaviors to make them unsatisfying.",
    "Use reinforcement to make good habits satisfying. Give yourself an immediate reward when you complete your habit.",
    "For habits of avoidance (stopping a bad habit), make it satisfying by creating a way to see your progress—like transferring money to a special account each time you resist temptation.",
    "Apply the Goldilocks Rule to maintain motivation: working on challenges just difficult enough to keep you engaged—not so easy you get bored, not so hard you become frustrated.",
    "Create a 'commitment device' that makes bad behaviors more difficult. Victor Hugo once locked away his clothes to force himself to write when facing a deadline.",
    "Supernormal stimuli are exaggerated versions of reality that create stronger responses than normal. Many of modern society's biggest distractions use this principle.",
    "Master the entry point of a habit. A decisive moment determines whether you follow a good or bad route. These gateway moments often come at the beginning of an activity.",
    "Establish a closing ritual to end the day. Like Twyla Tharp's habit of hailing a cab as the start of her workout, create a way to tell yourself 'this day is done.'",
    "What looks like a talent gap is often a consistency gap. The people at the top are often the ones who consistently showed up, not necessarily the most talented.",
    "If you want behaviors to become automatic, you need to practice under the same cues each time. Habits tied to specific contexts are easier to build.",
    "Implementation intentions are mental plans for overcoming obstacles: 'When X happens, I will do Y.' Create a plan for what you'll do when faced with a temptation.",
    "To maintain good habits, create a system for reflection and review. Pat Riley's 'Career Best Effort' program for the LA Lakers had them track and improve key metrics continually.",
    "Time inconsistency explains why we value immediate rewards over future ones. Create short-term rewards for actions that align with your long-term goals.",
    "Automate good decisions to guarantee reliable outcomes. Make one-time actions that lock in better behavior in the future, like subscribing to automatic savings plans.",
    "When you notice your habits, you gain power over them. What begins as awareness becomes choice, and what starts as a choice becomes automatic.",
    "The secret to permanent change is understanding your habits form the bedrock of your identity. Decide the type of person you want to be, then prove it to yourself with small wins.",
    "Make new habits satisfying by creating a way to see your progress—like the paper clip method, where each accomplishment is represented by moving a clip from one jar to another.",
    "Keep your identity small. When you tie your identity too closely to one activity, it's harder to adapt when circumstances change.",
    "The goal is to win the majority of the time, not every time. Your habits don't need to be perfect, they just need to be consistent.",
    "Small wins create momentum, which builds confidence, which leads to bigger wins. Start with an easy win to create a cascade of good behavior.",
    "Repetition is a form of change. The more you repeat an activity, the more the structure of your brain changes to become efficient at that activity.",
    "Breakthrough moments often come after crossing a threshold of accumulated advantages. Stick with small improvements long enough to break through 'the Plateau of Latent Potential.'",
    "The true measure of success is whether your habits are putting you on a trajectory toward success. You don't need to be perfect—you just need to be on the path.",
    "When you can't win by being better, you can win by being different. Create a game where the odds are in your favor by combining your skills in a unique way.",
    "A habit must be established before it can be improved. You can't optimize what doesn't yet exist.",
    "Create an environment of inevitability. Surround yourself with people who have the habits you want to have, and you'll rise together.",
    "Make the consequences of your bad habits so painful that you're forced to avoid them. For example, tell everyone about your goal so you'll be embarrassed if you fail.",
    "The more you ritualize the beginning of a process, the more likely it becomes that you can slip into the flow state necessary for great performance.",
    "Your life today is essentially the sum of your habits. What you repeatedly do ultimately forms the person you are, the things you believe, and the results you enjoy.",
];

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
