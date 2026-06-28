'use client';
import { supabase } from '@/lib/supabase';
import "./content.css"
import Image from 'next/image';
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type ElementType,
  type CSSProperties,
} from 'react';

/* ------------------------------------------------------------------ */
/*  useReveal                                                          */
/* ------------------------------------------------------------------ */
function useReveal<T extends HTMLElement>(threshold = 0.18) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { setInView(true); return; }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
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
  style?: CSSProperties;
  children: ReactNode;
}

function Reveal({ as: Tag = 'div', delay = 0, className = '', style, children }: RevealProps) {
  const { ref, inView } = useReveal<HTMLElement>();
  return (
    <Tag
      ref={ref as never}
      className={`reveal ${inView ? 'reveal-in' : ''} ${className}`}
      style={{ transitionDelay: inView ? `${delay}ms` : '0ms', ...style }}
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
/*  CountdownTimer                                                     */
/* ------------------------------------------------------------------ */
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0, done: false });

  useEffect(() => {
    const target = new Date('2026-07-04T20:00:00');
    function tick() {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0, done: true }); return; }
      setTimeLeft({
        days:  Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins:  Math.floor((diff % 3600000) / 60000),
        secs:  Math.floor((diff % 60000) / 1000),
        done: false,
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { label: 'days',    value: timeLeft.days },
    { label: 'hours',   value: timeLeft.hours },
    { label: 'minutes', value: timeLeft.mins },
    { label: 'seconds', value: timeLeft.secs },
  ];

  if (timeLeft.done) {
    return (
      <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '22px', color: '#ffcf6b', margin: 0 }}>
        The celebration has begun!
      </p>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 'clamp(10px, 2vw, 18px)', width: '100%' }}>
      {units.map(({ label, value }) => (
        <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'rgba(251,247,242,0.07)',
            border: '1px solid rgba(255,207,107,0.22)',
            borderRadius: '6px',
            width: '100%',
            aspectRatio: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(26px, 6vw, 48px)', color: '#fbf7f2', lineHeight: 1 }}>
              {String(value).padStart(2, '00')}
            </span>
          </div>
          <span style={{ fontFamily: "'Arial', sans-serif", fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,207,107,0.7)' }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  GuestBook                                                          */
/* ------------------------------------------------------------------ */
function GuestBook() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{
    id: string;
    name: string;
    message: string;
    created_at: string;
  }[]>([]);

  // Load all messages on mount
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setMessages(data);
    }
    load();
  }, []);

  async function handleSubmit() {
    if (!name.trim() || !message.trim()) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('messages')
      .insert([{ name: name.trim(), message: message.trim() }])
      .select()
      .single();

    if (!error && data) {
      setMessages(prev => [data, ...prev]);
      setName('');
      setMessage('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
    setLoading(false);
  }

  const inputStyle: CSSProperties = {
    width: '100%',
    background: 'rgba(251,247,242,0.08)',
    border: '1px solid rgba(255,207,107,0.3)',
    borderRadius: '4px',
    padding: '12px 16px',
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontStyle: 'italic',
    fontSize: '15px',
    color: '#fbf7f2',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={e => setName(e.target.value)}
        style={inputStyle}
      />
      <textarea
        placeholder="Your message or advice..."
        value={message}
        onChange={e => setMessage(e.target.value)}
        rows={4}
        style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.65 }}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          fontFamily: "'Arial', sans-serif",
          fontSize: '12px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#4d0e12',
          background: submitted ? '#a8d5a2' : '#ffcf6b',
          border: 'none',
          borderRadius: '999px',
          padding: '14px 40px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          alignSelf: 'center',
          transition: 'background 0.3s ease',
        }}
      >
        {loading ? 'Sending...' : submitted ? 'Message sent ✓' : 'Leave your message'}
      </button>

      {messages.length > 0 && (
        <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ width: '40px', height: '1px', background: 'rgba(255,207,107,0.3)', margin: '0 auto 8px' }} />
          {messages.map((m) => (
            <div key={m.id} style={{ background: 'rgba(251,247,242,0.06)', border: '1px solid rgba(255,207,107,0.18)', borderRadius: '4px', padding: '20px 24px' }}>
              <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', fontSize: '15px', color: '#fbf7f2', lineHeight: 1.7, margin: '0 0 10px' }}>
                &ldquo;{m.message}&rdquo;
              </p>
              <p style={{ fontFamily: "'Arial', sans-serif", fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ffcf6b', margin: 0 }}>
                {m.name} · {new Date(m.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
/* ------------------------------------------------------------------ */
/*  PetalGame                                                          */
/* ------------------------------------------------------------------ */
function PetalGame() {
  const wrapRef = useRef<HTMLDivElement>(null);

  const flowers = ['🌸', '🌹', '🌼', '🍀', '🏵️', '🌺', '💐', '🌷'];

  function spawnPetals() {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const count = 30 + Math.floor(Math.random() * 20);
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const p = document.createElement('div');
        const size = 20 + Math.random() * 20;
        const startX = Math.random() * 100;
        const flower = flowers[Math.floor(Math.random() * flowers.length)];
        const duration = 2.5 + Math.random() * 2;
        const swayX = (Math.random() - 0.5) * 200;
        p.style.cssText = `
          position:absolute;
          left:${startX}%;
          top:-30px;
          font-size:${size}px;
          line-height:1;
          pointer-events:none;
          z-index:10;
          opacity:0.95;
          animation: petalRain ${duration}s ease-in forwards;
          --sway: ${swayX}px;
          user-select:none;
        `;
        p.textContent = flower;
        wrap.appendChild(p);
        setTimeout(() => p.remove(), duration * 1000 + 100);
      }, i * 40);
    }
  }

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const handler = (e: TouchEvent) => {
      e.preventDefault();
      spawnPetals();
    };
    wrap.addEventListener('touchstart', handler, { passive: false });
    return () => wrap.removeEventListener('touchstart', handler);
  }, []);

  return (
    <>
      <style jsx>{`
        @keyframes petalRain {
          0%   { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0.95; }
          50%  { transform: translateY(240px) translateX(calc(var(--sway) * 0.5)) rotate(180deg); opacity: 0.85; }
          100% { transform: translateY(560px) translateX(var(--sway)) rotate(360deg); opacity: 0; }
        }
      `}</style>

      <div
        ref={wrapRef}
        onClick={spawnPetals}
        style={{
          position: 'relative',
          width: '100%',
          height: '520px',
          overflow: 'hidden',
          cursor: 'pointer',
          userSelect: 'none',
          background: 'transparent',
        }}
      >
        <Image
          src="/media/bandg.webp"
          alt="Mohamed and Tibyan"
          fill
          style={{ objectFit: 'contain', objectPosition: 'center bottom', zIndex: 2 }}
        />
        <p style={{
          position: 'absolute', top: '16px',
          left: 0, right: 0, textAlign: 'center',
          fontFamily: 'Georgia, serif', fontStyle: 'italic',
          fontSize: '15px', color: 'rgba(255,207,107,0.85)',
          margin: 0, zIndex: 10, pointerEvents: 'none',
        }}>
          🏵️ 🍀🌼🌸🌹
        </p>
      </div>
    </>
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
    <main aria-label="Mohamed & Tibyan's wedding invitation">

      {/* ============================================================ */}
      {/*  HERO                                                         */}
      {/* ============================================================ */}
      <section className="full-screen center-content hero" aria-label="Save the date">
        <Image
          src="/media/mandt1.webp"
          alt=""
          role="presentation"
          fill
          priority
          sizes="100vw"
          quality={90}
          className={`absolute-fill ${backgroundLoaded ? 'animate-fade-in' : ''}`}
          style={{ objectFit: 'cover', objectPosition: 'center', opacity: backgroundLoaded ? undefined : 0 }}
          onLoad={() => setBackgroundLoaded(true)}
        />
        <div className="absolute-fill" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.55) 100%)' }} />

        <div
          className="center-content"
          style={{
            position: 'relative',
            width: 'min(92vw, 640px)',
            opacity: showMessage ? 1 : 0,
            transform: showMessage ? 'scale(1)' : 'scale(0.92)',
            transition: 'opacity 1s cubic-bezier(0.22, 1, 0.36, 1), transform 1s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <div
            className={showMessage ? 'animate-float' : ''}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 'clamp(24px, 8%, 56px)', gap: 0 }}
          >
            <p style={{ fontFamily: "'Arial', sans-serif", fontSize: 'clamp(10px, 1.4vw, 12px)', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#ffefdc', textShadow: '0 1px 8px rgba(0,0,0,0.6)', margin: '0 0 clamp(12px, 3%, 20px)' }}>
              we are getting married
            </p>
            <h1 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(23px, 4vw, 32px)', color: '#ffffff', textShadow: '0 2px 12px rgba(0,0,0,0.7)', margin: '0 0 8px', lineHeight: 1.25 }}>
              Mohamed Abdelrahman
            </h1>
            <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', fontSize: 'clamp(18px, 2.5vw, 22px)', color: '#ffefdc', textShadow: '0 1px 8px rgba(0,0,0,0.6)', margin: '0 0 8px' }}>
              &amp;
            </p>
            <h1 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(23px, 4vw, 32px)', color: '#ffffff', textShadow: '0 2px 12px rgba(0,0,0,0.7)', margin: '0 0 clamp(16px, 4%, 28px)', lineHeight: 1.25 }}>
              Tibyan Elsheikh
            </h1>
            <div style={{ width: '40px', height: '1px', background: 'rgba(255,207,107,0.6)', margin: '0 auto clamp(12px, 3%, 20px)' }} />
            <p style={{ fontFamily: "'Arial', sans-serif", fontSize: 'clamp(10px, 1.4vw, 12px)', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#ffefdc', textShadow: '0 1px 8px rgba(0,0,0,0.6)', margin: '0 0 6px' }}>
              04 · 07 · 2026
            </p>
            <p style={{ fontFamily: "'Arial', sans-serif", fontSize: 'clamp(10px, 1.4vw, 12px)', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#ffefdc', textShadow: '0 1px 8px rgba(0,0,0,0.6)', margin: 0 }}>
              Waldorf Astoria Hotel
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  WITH LOVE                                                    */}
      {/* ============================================================ */}
      <section
        id="story"
        style={{
          backgroundImage: "url('/media/withlove.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0',
        }}
      >
        <div style={{ height: '20vh', minHeight: '100px', flexShrink: 0 }} />
        <div style={{
          width: '100%',
          maxWidth: '460px',
          padding: '0 clamp(32px, 8vw, 80px) clamp(80px, 12vh, 140px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}>
          <Reveal as="p" style={{ fontFamily: "'Arial', sans-serif", fontSize: '12px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#b8782a', margin: '0 0 15px' }}>
            With love
          </Reveal>
          <Reveal delay={120}>
            <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', fontSize: 'clamp(14px, 2vw, 17px)', lineHeight: 2, color: '#3a2010', margin: 0 }}>
              John Green once wrote, &ldquo;What the hell is instant? Nothing is instant.
              Instant rice takes five minutes; instant pudding, an hour.&rdquo;
              <br /><br />
              And perhaps nowhere is this truer than in love. For love asks us to surrender
              the instant in favor of the journey — to choose patience over haste,
              perseverance over ease, and selflessness over certainty. It is in taking the
              longer road, through every trial and every season of waiting, that the heart
              is refined and the soul finds its way home.
              <br /><br />
              Through every hurdle, every whispered prayer, and every moment spent holding
              on to hope, our hearts found their way back to one another.
              <br /><br />
              And now, at last, surrounded by our family, friends, and countless blessings,
              we invite you to share in the joy as we celebrate the beginning of our forever.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  PARALLAX DIVIDER                                             */}
      {/* ============================================================ */}
      <div className="parallax-divider" aria-hidden="true">
        <div style={{ backgroundImage: "url('/media/roses.webp')", backgroundAttachment: 'scroll', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', width: '100%', height: '100%' }} />
        <div className="parallax-overlay" />
      </div>

      {/* ============================================================ */}
      {/*  LOCATION                                                     */}
      {/* ============================================================ */}
      <section id="location" className="location-section">
        <Reveal as="p" className="eyebrow eyebrow-light">when &amp; where</Reveal>
        <Reveal as="h2" delay={80} className="section-title section-title-light">Join us</Reveal>
        <Reveal delay={100}>
          <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', fontSize: 'clamp(20px, 3vw, 26px)', color: '#fbf7f2', margin: '0 0 6px', textAlign: 'center' }}>
            Waldorf Astoria Hotel
          </p>
          <p style={{ fontFamily: "'Arial', sans-serif", fontSize: '12px', letterSpacing: '0.12em', color: 'rgba(251,247,242,0.55)', textAlign: 'center', margin: '0 0 40px' }}>
            Cairo, Egypt
          </p>
        </Reveal>
        <Reveal delay={300}>
          <a href="https://maps.app.goo.gl/mrD65feFV6JFv5hL8" target="_blank" rel="noopener noreferrer" className="gold-button" style={{ marginTop: '8px' }}>
            Get directions
          </a>
        </Reveal>
      </section>

      {/* ============================================================ */}
      {/*  PARALLAX DIVIDER                                             */}
      {/* ============================================================ */}
      <div className="parallax-divider" aria-hidden="true">
        <div style={{ backgroundImage: "url('/media/roses.webp')", backgroundAttachment: 'scroll', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', width: '100%', height: '100%' }} />
        <div className="parallax-overlay" />
      </div>

      {/* ============================================================ */}
      {/*  COUNTDOWN                                                    */}
      {/* ============================================================ */}
      <section id="countdown" style={{ background: 'radial-gradient(ellipse at 50% 0%, #883f48 0%, #4d0e12 72%)', padding: 'clamp(64px, 12vh, 120px) clamp(20px, 6vw, 48px)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <Reveal as="p" className="eyebrow eyebrow-light">counting down to forever</Reveal>
        <Reveal as="h2" delay={80} style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', fontWeight: 500, fontSize: 'clamp(24px, 5vw, 38px)', color: '#fbf7f2', margin: '0 0 10px' }}>
          After all this time — always
        </Reveal>
        <Reveal as="p" delay={120} style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '14px', color: 'rgba(251,247,242,0.55)', margin: '0 0 52px', letterSpacing: '0.04em' }}>
          04 · 07 · 2026 &nbsp;·&nbsp; 8:00 in the evening &nbsp;·&nbsp; Waldorf Astoria
        </Reveal>
        <Reveal delay={160} style={{ width: '100%', maxWidth: '520px' }}>
          <CountdownTimer />
        </Reveal>
      </section>

      {/* ============================================================ */}
      {/*  WEDDING TIMELINE                                             */}
      {/* ============================================================ */}
      <section id="timeline" className="story-section">
        <Reveal as="p" className="eyebrow">the evening</Reveal>
        <Reveal as="h2" delay={80} className="section-title">Schedule</Reveal>
        <div className="timeline">
          <div className="timeline-rail" aria-hidden="true" />
          {[
            { num: '01', time: '8:00 pm',  event: 'Guest arrival',          desc: 'Welcome drinks and the first moments of a night to remember.' },
            { num: '02', time: '8:30 pm',  event: 'Bride & groom entrance', desc: 'The moment we have all been waiting for.' },
            { num: '03', time: '11:00 pm', event: 'Dinner',                 desc: 'A feast shared with the people we love most.' },
            { num: '04', time: '1:00 am',  event: 'Jirtig',                 desc: 'A cherished tradition — joyful, loud, and full of love.' },
            { num: '05', time: '1:00 am~', event: 'After party',            desc: 'Keep the night going for those who never want it to end.' },
          ].map(({ num, time, event, desc }, i) => (
            <Reveal key={num} as="div" delay={120 + i * 80} className="timeline-item">
              <span className="timeline-num">{num}</span>
              <div>
                <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '14px', color: '#b8782a', margin: '0 0 4px' }}>{time}</p>
                <h3>{event}</h3>
                <p style={{ marginBottom: '4px' }}>{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  PARALLAX DIVIDER                                             */}
      {/* ============================================================ */}
      <div className="parallax-divider" aria-hidden="true">
        <div style={{ backgroundImage: "url('/media/roses.webp')", backgroundAttachment: 'scroll', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', width: '100%', height: '100%' }} />
        <div className="parallax-overlay" />
      </div>

      {/* ============================================================ */}
      {/*  GUEST MESSAGES                                               */}
      {/* ============================================================ */}
      <section id="messages" style={{ background: 'radial-gradient(ellipse at 50% 0%, #883f48 0%, #4d0e12 72%)', padding: 'clamp(64px, 12vh, 120px) clamp(20px, 6vw, 48px)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Reveal as="p" className="eyebrow eyebrow-light">leave your mark</Reveal>
        <Reveal as="h2" delay={80} className="section-title section-title-light">Our love story continues</Reveal>
        <Reveal delay={120} style={{ maxWidth: '44ch', textAlign: 'center', margin: '0 auto clamp(36px, 6vh, 56px)' }}>
          <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '15px', color: 'rgba(251,247,242,0.7)', lineHeight: 1.75, margin: 0 }}>
            Leave us a loving message or your best marriage advice — help us remember this special day forever.
          </p>
        </Reveal>
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <Reveal delay={160}>
            <GuestBook />
          </Reveal>
        </div>
      </section>


  
    </main>
  );
}