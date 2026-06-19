'use client';

import Image from 'next/image';
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type ElementType,
} from 'react';

/* ------------------------------------------------------------------ */
/*  useReveal — IntersectionObserver hook for scroll-in reveals        */
/* ------------------------------------------------------------------ */
function useReveal<T extends HTMLElement>(threshold = 0.18) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

interface RevealProps {
  as?: ElementType;
  delay?: number;
  className?: string;
  children: ReactNode;
}

function Reveal({ as: Tag = 'div', delay = 0, className = '', children }: RevealProps) {
  const { ref, inView } = useReveal<HTMLElement>();
  return (
    <Tag
      ref={ref as never}
      className={`reveal ${inView ? 'reveal-in' : ''} ${className}`}
      style={{ transitionDelay: inView ? `${delay}ms` : '0ms' }}
    >
      {children}
      <style jsx>{`
        .reveal {
          opacity: 0;
          transform: translateY(28px);
          transition:
            opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-in {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function ContentPage() {
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (!backgroundLoaded) return;
    const timer = setTimeout(() => setShowMessage(true), 350);
    return () => clearTimeout(timer);
  }, [backgroundLoaded]);

  return (
    <main aria-label="Mariam & Tarek's wedding invitation">

      {/* ============================================================ */}
      {/*  HERO                                                         */}
      {/* ============================================================ */}
      <section className="full-screen center-content hero" aria-label="Save the date">
        <Image
          src="/media/roses.webp"
          alt=""
          role="presentation"
          fill
          priority
          sizes="100vw"
          quality={90}
          className={`absolute-fill ${backgroundLoaded ? 'animate-fade-in' : ''}`}
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: backgroundLoaded ? undefined : 0,
          }}
          onLoad={() => setBackgroundLoaded(true)}
        />

        <div
          className="absolute-fill"
          style={{
            background:
              'radial-gradient(circle at center, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.32) 100%)',
          }}
        />

        <div
          className="center-content"
          style={{
            position: 'relative',
            width: 'min(92vw, 640px)',
            opacity: showMessage ? 1 : 0,
            transform: showMessage ? 'scale(1)' : 'scale(0.92)',
            transition:
              'opacity 1s cubic-bezier(0.22, 1, 0.36, 1), transform 1s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <Image
            src="/media/message.webp"
            alt="Mariam & Tarek — October 24, 2026"
            width={640}
            height={640}
            priority
            sizes="(max-width: 768px) 92vw, 640px"
            style={{
              width: '100%',
              height: 'auto',
              filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.35))',
            }}
            className={showMessage ? 'animate-float' : ''}
          />
        </div>
      </section>

      {/* ============================================================ */}
      {/*  OUR STORY                                                    */}
      {/* ============================================================ */}
      <section id="story" className="story-section">
        <Reveal as="p" className="eyebrow">our story</Reveal>
        <Reveal as="h2" delay={80} className="section-title">
          How it all came together
        </Reveal>

        <div className="timeline">
          <div className="timeline-rail" aria-hidden="true" />

          <Reveal as="div" delay={120} className="timeline-item">
            <span className="timeline-num">01</span>
            <div>
              <h3>Where we met</h3>
              <p>
                A mutual friend&rsquo;s dinner table, a long conversation that
                should have ended an hour earlier, and neither of us in a hurry to leave.
              </p>
            </div>
          </Reveal>

          <Reveal as="div" delay={200} className="timeline-item">
            <span className="timeline-num">02</span>
            <div>
              <h3>The proposal</h3>
              <p>
                A quiet evening, a question that wasn&rsquo;t really a surprise,
                and an answer that was never really in doubt.
              </p>
            </div>
          </Reveal>

          <Reveal as="div" delay={280} className="timeline-item">
            <span className="timeline-num">03</span>
            <div>
              <h3>Today</h3>
              <p>
                We&rsquo;re bringing together the people who shaped our story
                so far, to celebrate the next part of it with us.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  PARALLAX DIVIDER                                             */}
      {/* ============================================================ */}
      <div className="parallax-divider" aria-hidden="true">
        <div
          style={{
            backgroundImage: "url('/media/roses.webp')",
            backgroundAttachment: 'fixed',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            width: '100%',
            height: '100%',
          }}
        />
        <div className="parallax-overlay" />
      </div>

      {/* ============================================================ */}
      {/*  LOCATION                                                     */}
      {/* ============================================================ */}
      <section id="location" className="location-section">
        <Reveal as="p" className="eyebrow eyebrow-light">when & where</Reveal>
        <Reveal as="h2" delay={80} className="section-title section-title-light">
          Join us
        </Reveal>

        <div className="location-grid">
          <Reveal as="div" delay={140} className="location-card">
            <h3>Ceremony</h3>
            <p className="location-time">6:00 in the evening</p>
            <p className="location-venue">The Garden Pavilion</p>
            <p className="location-address">Giza, Egypt</p>
          </Reveal>

          <Reveal as="div" delay={220} className="location-card">
            <h3>Reception</h3>
            <p className="location-time">8:00 in the evening</p>
            <p className="location-venue">The Garden Pavilion</p>
            <p className="location-address">Same address — follow the signs</p>
          </Reveal>
        </div>

        <Reveal delay={300}>
          <a
            href="https://maps.google.com/?q=Giza,Egypt"
            target="_blank"
            rel="noopener noreferrer"
            className="gold-button"
          >
            Get directions
          </a>
        </Reveal>
      </section>

      {/* ============================================================ */}
      {/*  DETAILS                                                      */}
      {/* ============================================================ */}
      <section id="details" className="details-section">
        <Reveal as="p" className="eyebrow">the details</Reveal>
        <Reveal as="h2" delay={80} className="section-title">
          A few things to know
        </Reveal>

        <div className="details-grid">
          <Reveal as="div" delay={140} className="details-card">
            <h3>Dress code</h3>
            <p>Garden romantic — soft, breathable fabrics in these tones:</p>
            <div className="swatches" aria-label="Suggested color palette">
              <span className="swatch" style={{ background: '#4d0e12' }} />
              <span className="swatch" style={{ background: '#883f48' }} />
              <span className="swatch" style={{ background: '#b8782a' }} />
              <span className="swatch" style={{ background: '#ede8e4' }} />
            </div>
            <p className="swatch-caption">Please avoid pure white.</p>
          </Reveal>

          <Reveal as="div" delay={220} className="details-card">
            <h3>Schedule</h3>
            <ul className="schedule-list">
              <li><span>5:30 pm</span>Guest arrival</li>
              <li><span>6:00 pm</span>Ceremony</li>
              <li><span>8:00 pm</span>Reception & dinner</li>
              <li><span>11:00 pm</span>Last dance</li>
            </ul>
          </Reveal>

          <Reveal as="div" delay={300} className="details-card">
            <h3>Gifts</h3>
            <p>
              Your presence at our wedding is the only gift we&rsquo;re hoping for.
              For those who&rsquo;d still like to give something, a small honeymoon
              fund will be available on the RSVP page.
            </p>
          </Reveal>
        </div>
      </section>



      <style jsx>{`
        main {
          background: #fbf7f2;
        }

        /* ---------- Hero ---------- */
        .hero {
          position: relative;
          overflow: hidden;
        }

        /* ---------- Shared section rhythm ---------- */
        .eyebrow {
          font-family: 'Arial', sans-serif;
          font-size: 12px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #b8782a;
          text-align: center;
          margin: 0 0 12px;
        }
        .eyebrow-light {
          color: #ffcf6b;
        }
        .section-title {
          font-family: Georgia, 'Times New Roman', serif;
          font-style: italic;
          font-weight: 500;
          font-size: clamp(28px, 5vw, 44px);
          color: #2f1810;
          text-align: center;
          margin: 0 auto clamp(40px, 7vh, 72px);
          max-width: 20ch;
        }
        .section-title-light {
          color: #fbf7f2;
        }

        /* ---------- Story ---------- */
        .story-section {
          padding: clamp(64px, 12vh, 120px) clamp(20px, 6vw, 48px);
          max-width: 880px;
          margin: 0 auto;
        }
        .timeline {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: clamp(36px, 6vh, 56px);
          padding-left: clamp(36px, 6vw, 56px);
        }
        .timeline-rail {
          position: absolute;
          left: 14px;
          top: 6px;
          bottom: 6px;
          width: 1px;
          background: linear-gradient(
            to bottom,
            rgba(184, 120, 42, 0.05),
            rgba(184, 120, 42, 0.45),
            rgba(184, 120, 42, 0.05)
          );
        }
        .timeline-item {
          position: relative;
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }
        .timeline-num {
          position: absolute;
          left: calc(-1 * clamp(36px, 6vw, 56px));
          top: -4px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #fbf7f2;
          border: 1px solid rgba(184, 120, 42, 0.5);
          color: #b8782a;
          font-family: Georgia, serif;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .timeline-item h3 {
          font-family: Georgia, 'Times New Roman', serif;
          font-style: italic;
          font-size: clamp(19px, 2.6vw, 23px);
          color: #2f1810;
          margin: 0 0 8px;
        }
        .timeline-item p {
          font-size: 15px;
          line-height: 1.75;
          color: #5a4030;
          margin: 0;
          max-width: 56ch;
        }

        /* ---------- Parallax divider ---------- */
        .parallax-divider {
          position: relative;
          width: 100%;
          height: clamp(220px, 32vh, 360px);
          overflow: hidden;
        }
        .parallax-overlay {
          position: absolute;
          inset: 0;
          background: rgba(77, 14, 18, 0.55);
        }

        /* ---------- Location ---------- */
        .location-section {
          background: radial-gradient(ellipse at 50% 0%, #883f48 0%, #4d0e12 72%);
          padding: clamp(64px, 12vh, 120px) clamp(20px, 6vw, 48px);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .location-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          width: 100%;
          max-width: 640px;
          margin-bottom: clamp(36px, 6vh, 56px);
        }
        .location-card {
          background: rgba(251, 247, 242, 0.06);
          border: 1px solid rgba(255, 207, 107, 0.25);
          border-radius: 4px;
          padding: 28px 24px;
          text-align: center;
        }
        .location-card h3 {
          font-family: 'Arial', sans-serif;
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #ffcf6b;
          margin: 0 0 14px;
        }
        .location-time {
          font-family: Georgia, serif;
          font-style: italic;
          font-size: 20px;
          color: #fbf7f2;
          margin: 0 0 6px;
        }
        .location-venue {
          font-size: 14px;
          color: #f0d9ce;
          margin: 0;
        }
        .location-address {
          font-size: 12.5px;
          color: rgba(240, 217, 206, 0.7);
          margin: 4px 0 0;
        }
        .gold-button {
          font-family: 'Arial', sans-serif;
          font-size: 13px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #4d0e12;
          background: #ffcf6b;
          border: none;
          border-radius: 999px;
          padding: 14px 40px;
          text-decoration: none;
          display: inline-block;
          transition: transform 0.25s ease, background 0.25s ease;
        }
        .gold-button:hover {
          background: #ffd87f;
          transform: translateY(-1px);
        }

        /* ---------- Details ---------- */
        .details-section {
          padding: clamp(64px, 12vh, 120px) clamp(20px, 6vw, 48px);
          max-width: 1020px;
          margin: 0 auto;
        }
        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 24px;
        }
        .details-card {
          background: #ffffff;
          border: 1px solid rgba(184, 120, 42, 0.18);
          border-radius: 4px;
          padding: 32px 28px;
        }
        .details-card h3 {
          font-family: Georgia, 'Times New Roman', serif;
          font-style: italic;
          font-size: 20px;
          color: #2f1810;
          margin: 0 0 14px;
        }
        .details-card p {
          font-size: 14.5px;
          line-height: 1.7;
          color: #5a4030;
          margin: 0 0 14px;
        }
        .swatches {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }
        .swatch {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.08);
          display: inline-block;
        }
        .swatch-caption {
          font-size: 12.5px;
          color: #8a6c5a;
          margin: 0;
        }
        .schedule-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .schedule-list li {
          display: flex;
          gap: 14px;
          font-size: 14.5px;
          color: #5a4030;
          padding: 9px 0;
          border-bottom: 1px solid rgba(184, 120, 42, 0.12);
        }
        .schedule-list li:last-child {
          border-bottom: none;
        }
        .schedule-list span {
          font-family: Georgia, serif;
          font-style: italic;
          color: #b8782a;
          min-width: 64px;
        }

        /* ---------- Footer ---------- */
        .site-footer {
          background: #4d0e12;
          padding: clamp(48px, 9vh, 88px) 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .footer-seal {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: 1px solid rgba(255, 207, 107, 0.5);
          color: #ffcf6b;
          font-family: Georgia, serif;
          font-style: italic;
          font-size: 16px;
          margin: 0 auto 16px;
        }
        .footer-line {
          font-family: Georgia, serif;
          font-style: italic;
          font-size: 15px;
          color: rgba(251, 247, 242, 0.75);
          margin: 0;
        }
      `}</style>
    </main>
  );
}