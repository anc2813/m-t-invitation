'use client';
import Image from 'next/image';
import "@/app/globals.css"  // ✅ or just remove it from the envelope page entirely
// @ts-ignore: framer-motion types may not be installed in this environment
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';

type AnimState = 'idle' | 'breakingSeal' | 'opening' | 'revealing' | 'opened';

export default function WeddingEnvelope() {
  const [state, setState] = useState<AnimState>('idle');
  const [showInvitation, setShowInvitation] = useState(false);

  const envelopeControls  = useAnimation();
  const flapControls      = useAnimation();
  const sealControls      = useAnimation();
  const invitationControls = useAnimation();

  // Page entrance
  useEffect(() => {
    envelopeControls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
    });
  }, [envelopeControls]);

  const handleOpen = useCallback(async () => {
    if (state !== 'idle') return;

    // ── Step 1: Seal breaks ──────────────────────────────────
    setState('breakingSeal');
    await sealControls.start({
      scale:   [1, 1.14, 0.9, 0],
      opacity: [1, 1,    0.6, 0],
      rotate:  [0, -5,   8,   0],
      transition: { duration: 0.72, ease: 'easeInOut' },
    });

    // ── Step 2: Flap opens (3-D rotateX) ────────────────────
    setState('opening');
    await flapControls.start({
      rotateX: -180,
      transition: { duration: 0.85, ease: [0.4, 0, 0.2, 1] },
    });

    // ── Step 3: Invitation slides up ────────────────────────
    setState('revealing');
    setShowInvitation(true);
    await invitationControls.start({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
    });

    // ── Step 4: Envelope recedes; card floats ────────────────
    setState('opened');
    envelopeControls.start({
      opacity: 0.22,
      scale: 0.86,
      y: 50,
      transition: { duration: 0.9, ease: 'easeOut' },
    });
    invitationControls.start({
      y: [0, -7, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
        repeatType: 'loop',
      },
    });
  }, [state, sealControls, flapControls, invitationControls, envelopeControls]);

  // Keyboard accessibility
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && state === 'idle') {
        e.preventDefault();
        handleOpen();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleOpen, state]);

  return (
    <div
      className="relative flex items-center justify-center w-full h-full"
      style={{ perspective: '1200px' }}
    >
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(circle at top, rgba(255,248,240,0.96), rgba(230,216,194,0.96) 40%, rgba(194,167,135,0.92) 100%)',
        }}
      />
      {/* ── Envelope block ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 70 }}
        animate={envelopeControls}
        className="relative"
        style={{ width: 'min(480px, 88vw)', aspectRatio: '1 / 1' }}
      >
        {/* Idle float */}
        <motion.div
          animate={state === 'idle' ? { y: [0, -9, 0] } : {}}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
          className="relative w-full h-full"
          role="button"
          aria-label="Open wedding invitation — press Enter or Space"
          tabIndex={state === 'idle' ? 0 : -1}
          onClick={handleOpen}
          style={{
            cursor: state === 'idle' ? 'pointer' : 'default',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Envelope body */}
          <Image
            src="/media/first.webp"
            alt="Burgundy wedding envelope with gold wax seal"
            fill
            priority
            style={{ objectFit: 'cover', borderRadius: 10 }}
          />

          {/* 3-D flap — sits over top half, rotates open */}
          <motion.div
            initial={{ rotateX: 0 }}
            animate={flapControls}
            style={{
              transformOrigin: 'top center',
              transformStyle: 'preserve-3d',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '52%',
              zIndex: 10,
              pointerEvents: 'none',
              overflow: 'hidden',
              borderRadius: '10px 10px 0 0',
            }}
          >
            {/* Same envelope image cropped to top — creates the flap visual */}

            {/* Shadow underside of flap */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(to bottom, rgba(15,0,4,0.22) 0%, transparent 80%)',
              }}
            />
          </motion.div>

          {/* Wax seal */}
          <motion.div
            initial={{ scale: 1, opacity: 1 }}
            animate={sealControls}
            style={{
              position: 'absolute',
              top: '46%',
              left: '50%',
              translate: '-50% -50%',
              zIndex: 20,
              width: '21%',
              aspectRatio: '1 / 1',
            }}
          >
            {/* Shimmer glow ring (idle only) */}
            {state === 'idle' && (
              <motion.div
                animate={{
                  opacity: [0, 0.6, 0],
                  scale: [0.8, 1.25, 0.8],
                }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: '-15%',
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle, rgba(212,175,55,0.5) 0%, transparent 68%)',
                  pointerEvents: 'none',
                }}
              />
            )}
            {/* Seal image — use the close-up seal PNG */}

          </motion.div>
        </motion.div>

        {/* Tap hint */}
        <AnimatePresence>
          {state === 'idle' && (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1.4, duration: 0.8 }}
              style={{
                position: 'absolute',
                bottom: '-2.6rem',
                width: '100%',
                textAlign: 'center',
                color: 'rgba(212,175,55,0.7)',
                fontSize: '0.76rem',
                letterSpacing: '0.2em',
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                textTransform: 'uppercase',
                userSelect: 'none',
              }}
            >
              tap to open
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Invitation card ────────────────────────────────── */}
      <AnimatePresence>
        {showInvitation && (
          <>
            {/* Glow halo */}
            <motion.div
              key="glow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.4 }}
              aria-hidden="true"
              style={{
                position: 'absolute',
                width: 'min(420px, 78vw)',
                height: 'min(580px, 108vw)',
                borderRadius: 18,
                background:
                  'radial-gradient(ellipse at 50% 55%, rgba(212,175,55,0.2) 0%, transparent 68%)',
                pointerEvents: 'none',
                zIndex: 28,
              }}
            />

            {/* Card */}
            <motion.div
              key="invitation"
              initial={{ opacity: 0, y: 130, scale: 0.88 }}
              animate={invitationControls}
              style={{
                position: 'absolute',
                width: 'min(390px, 72vw)',
                aspectRatio: '3 / 4.25',
                zIndex: 35,
              }}
            >
              <Image
                src="/media/second.webp"
                alt="Wedding invitation card for M and T"
                fill
                style={{
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 28px 52px rgba(0,0,0,0.42))',
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
