'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * PageTransition
 * ----------------
 * Wraps every route with a soft fade-in whenever the pathname changes,
 * giving the whole app a smooth, cinematic feel as the user moves from
 * /envelope -> /content (or any future route) instead of a hard cut.
 *
 * This is intentionally lightweight (no extra dependency like Framer Motion)
 * so it stays fast and has zero impact on video/image loading performance.
 */
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Reset then trigger the fade-in on every route change
    setVisible(false);
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s ease',
        width: '100%',
        height: '100%',
      }}
    >
      {children}
    </div>
  );
}