'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * /app/envelope
 * ----------------
 * Full-screen, fully responsive video experience.
 *
 * Behavior:
 * 1. Video is rendered paused on load, with a gentle "tap to play" prompt.
 * 2. A tap/click anywhere on the screen starts playback and hides the prompt.
 * 3. When the video finishes, the app automatically navigates to /content.
 *
 * UX notes:
 * - object-fit: cover + 100dvh keeps the video filling the viewport on any
 *   device without letterboxing, while preserving aspect ratio.
 * - preload="auto" + poster-less playsInline avoids the iOS fullscreen
 *   takeover and lets the video start instantly when tapped.
 * - A loading state covers the brief moment before the video is ready,
 *   avoiding a flash of blank/black screen.
 */
export default function EnvelopePage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Prefetch the destination route so navigation after the video is instant
  useEffect(() => {
    router.prefetch('/content');
  }, [router]);

  const handleStart = useCallback(() => {
    const video = videoRef.current;
    if (!video || isPlaying) return;

    video
      .play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        // Autoplay-with-sound can be blocked by some browsers on first
        // interaction in rare cases; fail silently and let the user retap.
        console.error('Video playback failed:', err);
      });
  }, [isPlaying]);

  const handleEnded = useCallback(() => {
    // Trigger the fade-out, then navigate once the transition completes
    setIsLeaving(true);
    setTimeout(() => {
      router.push('/content');
    }, 500);
  }, [router]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleStart();
      }
    },
    [handleStart]
  );

  return (
    <main
      className="full-screen"
      role="button"
      tabIndex={0}
      aria-label={
        isPlaying ? 'Playing video' : 'Tap anywhere to play the video'
      }
      onClick={handleStart}
      onKeyDown={handleKeyDown}
      onTouchEnd={(e) => {
        // Avoids the synthetic double-fire of touchend + click on some mobile browsers
        e.preventDefault();
        handleStart();
      }}
      style={{
        backgroundColor: '#000',
        cursor: isPlaying ? 'default' : 'pointer',
        opacity: isLeaving ? 0 : 1,
        transition: 'opacity 0.5s ease',
      }}
    >
      {/* Responsive, full-bleed video */}
      <video
        ref={videoRef}
        className="absolute-fill"
        src="/media/m-t.mp4"
        playsInline
        preload="auto"
        // Mute by default to ensure playback is allowed on mobile/browsers
        // that block autoplay or programmatic play with sound.
        muted={true}
        controls={false}
        onEnded={handleEnded}
        onCanPlay={() => setIsReady(true)}
          style={{
            width: '100%',
            height: '100dvh',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      >
        Your browser does not support the video tag.
      </video>

      {/* Loading veil — covers any brief delay before the video can play */}
      {!isReady && (
        <div
          className="absolute-fill center-content"
          style={{ backgroundColor: '#000' }}
        >
          <div className="loading-spinner" aria-hidden="true" />
          <span className="sr-only">Loading video…</span>
        </div>
      )}

      {/* Tap-to-play overlay & prompt */}
      {!isPlaying && (
        <div
          className="absolute-fill center-content"
          style={{
            opacity: isLeaving ? 0 : 1,
            transition: 'opacity 0.5s ease',
            width: '100%',
            height: '100dvh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
        

        </div>
      )}

      <style jsx>{`
        .loading-spinner {
          width: 42px;
          height: 42px;
          border: 3px solid rgba(255, 255, 255, 0.2);
          border-top-color: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          animation: spin 0.9s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}