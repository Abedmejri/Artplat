// src/components/MusicPlayer.tsx

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Reusable SVG Icons ---
const PlayIcon = () => <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />;
const PauseIcon = () => <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />;

const MusicPlayer = () => {
  // We use a ref to hold the Audio object so it persists across re-renders
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // This effect runs only once when the component first mounts
  useEffect(() => {
    // Initialize the Audio object
    // The path '/ambient-music.mp3' is relative to the `public` folder
    audioRef.current = new Audio('/ii.mp3');
    audioRef.current.loop = true; // Make the music loop forever
    audioRef.current.volume = 0.3; // Set a pleasant, non-intrusive volume

    // --- AUTOPLAY LOGIC ---
    // We attempt to play the audio automatically.
    const playPromise = audioRef.current.play();

    if (playPromise !== undefined) {
      playPromise.then(_ => {
        // If the promise resolves, autoplay started successfully.
        setIsPlaying(true);
      }).catch(error => {
        // If the promise rejects, autoplay was prevented by the browser.
        // This is expected behavior on most modern browsers.
        // We log it for debugging and ensure our UI state is correct.
        console.log("Autoplay was prevented by the browser. User interaction is required to start the music.", error);
        setIsPlaying(false);
      });
    }
    // --- END AUTOPLAY LOGIC ---

    // This is a "cleanup" function. It runs when the component is removed from the screen.
    // This ensures the music stops if the user logs out and the App component unmounts.
    return () => {
      audioRef.current?.pause();
    };
  }, []); // The empty dependency array `[]` ensures this effect runs only once.

  // This function is called when the user clicks the button
  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // If the user clicks play, we try to play the audio.
      audioRef.current.play();
    }
    // We flip the state to reflect the new status
    setIsPlaying(!isPlaying);
  };

  const buttonVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={togglePlayPause}
        className="w-16 h-16 bg-stone-dark/50 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-parchment/20 text-parchment shadow-lg"
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
      >
        <AnimatePresence mode="wait">
          {isPlaying ? (
            <motion.div key="pause" variants={buttonVariants} initial="hidden" animate="visible" exit="hidden">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><PauseIcon /></svg>
            </motion.div>
          ) : (
            <motion.div key="play" variants={buttonVariants} initial="hidden" animate="visible" exit="hidden">
              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><PlayIcon /></svg>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default MusicPlayer;