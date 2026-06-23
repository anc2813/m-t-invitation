'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function EnvelopePage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    router.prefetch('/content');
  }, [router]);

  const handleStart = useCallback(() => {
    const video = videoRef.current;
    if (!video || isPlaying) return;
    video
      .play()
      .then(() => setIsPlaying(true))
      .catch((err) => console.error('Video playback failed:', err));
  }, [isPlaying]);

  const handleEnded = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      router.push('/content');
    }, 1000);
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
      aria-label={isPlaying ? 'Playing video' : 'Tap anywhere to play the video'}
      onClick={handleStart}
      onKeyDown={handleKeyDown}
      onTouchEnd={(e) => {
        e.preventDefault();
        handleStart();
      }}
      style={{
        backgroundColor: '#000',
        cursor: isPlaying ? 'default' : 'pointer',
      }}
    >
      {/* Video */}
      <video
        ref={videoRef}
        className="absolute-fill"
        src="/media/0623.mp4"
        playsInline
        preload="auto"
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

      {/* Loading veil */}
      {!isReady && (
        <div
          className="absolute-fill center-content"
          style={{ backgroundColor: '#000' }}
        >
          <div className="loading-spinner" aria-hidden="true" />
          <span className="sr-only">Loading video…</span>
        </div>
      )}

      {/* Tap-to-play prompt */}
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
        />
      )}

      {/* ← Transition overlay — must be INSIDE return/main */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#ecdbdc',
          opacity: isLeaving ? 1 : 0,
          transition: 'opacity 1s cubic-bezier(0.22, 1, 0.36, 1)',
          pointerEvents: isLeaving ? 'all' : 'none',
          zIndex: 99,
        }}
      />

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
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}