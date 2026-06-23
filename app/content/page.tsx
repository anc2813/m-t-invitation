'use client';
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
  style?: React.CSSProperties;  // ← add this
  children: ReactNode;
}

function Reveal({ as: Tag = 'div', delay = 0, className = '', style, children }: RevealProps) {
  const { ref, inView } = useReveal<HTMLElement>();
  return (
    <Tag
      ref={ref as never}
      className={`reveal ${inView ? 'reveal-in' : ''} ${className}`}
      style={{ transitionDelay: inView ? `${delay}ms` : '0ms', ...style }}  // ← spread style
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
/*  CountdownTimer — moved to top level (was nested inside ContentPage) */
/* ------------------------------------------------------------------ */
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0, done: false });

  useEffect(() => {
    const target = new Date('2026-07-04T20:00:00');

    function tick() {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0, done: true });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
        done: false,
      });
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { label: 'days', value: timeLeft.days },
    { label: 'hours', value: timeLeft.hours },
    { label: 'minutes', value: timeLeft.mins },
    { label: 'seconds', value: timeLeft.secs },
  ];

  if (timeLeft.done) {
    return (
      <p style={{
        fontFamily: 'Georgia, serif',
        fontStyle: 'italic',
        fontSize: '22px',
        color: '#ffcf6b',
        margin: 0,
      }}>
        The celebration has begun!
      </p>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      gap: 'clamp(10px, 2vw, 18px)',
      width: '100%',
    }}>
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
            <span style={{
              fontFamily: 'Georgia, serif',
              fontStyle: 'italic',
              fontSize: 'clamp(26px, 6vw, 48px)',
              color: '#fbf7f2',
              lineHeight: 1,
            }}>
              {String(value).padStart(2, '0')}
            </span>
          </div>
          <span style={{
            fontFamily: "'Arial', sans-serif",
            fontSize: '10px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(255,207,107,0.7)',
          }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  GuestBook — moved out of the JSX tree (was a syntax error there)   */
/* ------------------------------------------------------------------ */
function GuestBook() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [messages, setMessages] = useState<{ name: string; message: string; time: string }[]>([]);

  function handleSubmit() {
    if (!name.trim() || !message.trim()) return;
    const entry = {
      name: name.trim(),
      message: message.trim(),
      time: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    };
    setMessages(prev => [entry, ...prev]);
    setName('');
    setMessage('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
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
          cursor: 'pointer',
          alignSelf: 'center',
          transition: 'background 0.3s ease',
        }}
      >
        {submitted ? 'Message sent ✓' : 'Leave your message'}
      </button>

      {messages.length > 0 && (
        <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            width: '40px',
            height: '1px',
            background: 'rgba(255,207,107,0.3)',
            margin: '0 auto 8px',
          }} />
          {messages.map((m, i) => (
            <div key={i} style={{
              background: 'rgba(251,247,242,0.06)',
              border: '1px solid rgba(255,207,107,0.18)',
              borderRadius: '4px',
              padding: '20px 24px',
            }}>
              <p style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: 'italic',
                fontSize: '15px',
                color: '#fbf7f2',
                lineHeight: 1.7,
                margin: '0 0 10px',
              }}>
                &ldquo;{m.message}&rdquo;
              </p>
              <p style={{
                fontFamily: "'Arial', sans-serif",
                fontSize: '11px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#ffcf6b',
                margin: 0,
              }}>
                {m.name} · {m.time}
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
  const [hintVisible, setHintVisible] = useState(true);

  const flowers = ['🌸','💗', '🌼','💕' ,'🏵️', '💛'];

  function spawnPetals() {
    const wrap = wrapRef.current;
    if (!wrap) return;
    setHintVisible(false);

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

  function handleClick() { spawnPetals(); }

  function handleTouch(e: React.TouchEvent<HTMLDivElement>) {
    e.preventDefault();
    spawnPetals();
  }

  return (
    <>
      <style jsx>{`
        @keyframes petalRain {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0.95;
          }
          50% {
            transform: translateY(240px) translateX(calc(var(--sway) * 0.5)) rotate(180deg);
            opacity: 0.85;
          }
          100% {
            transform: translateY(560px) translateX(var(--sway)) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>

      <div
        ref={wrapRef}
        onClick={handleClick}
        onTouchStart={handleTouch}
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
          style={{
            objectFit: 'contain',
            objectPosition: 'center bottom',
            zIndex: 2,
          }}
        />

         
          <p style={{
            position: 'absolute',
            top: '16px',
            left: 0, right: 0,
            textAlign: 'center',
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            fontSize: '15px',
            color: 'rgba(255,207,107,0.85)',
            margin: 0,
            zIndex: 10,
            pointerEvents: 'none',
          }}>
            🌼🌼🌼🌼
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
    <main aria-label="Mariam & Tarek's wedding invitation">

      {/* ============================================================ */}
      {/*  HERO                                                         */}
      {/* ============================================================ */}
      <section className="full-screen center-content hero" aria-label="Save the date">
        {/* Full-bleed background */}
        <Image
          src="/media/mandt1.webp"
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

        {/* Card frame + overlaid text */}
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

          {/* Text overlay — centered inside the card */}
          <div
            className={showMessage ? 'animate-float' : ''}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'clamp(24px, 8%, 56px)',
              textAlign: 'center',
              gap: 0,
            }}
          >
            {/* "we are getting married" — eyebrow style */}
            <p
              style={{
                fontFamily: "'Arial', sans-serif",
                fontSize: 'clamp(16px, 1.4vw, 12px)',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: '#ffefdc',
                margin: '0 0 clamp(12px, 3%, 20px)',
              }}
            >
              we are getting married
            </p>

            {/* Name 1 */}
            <h1
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: 'italic',
                fontWeight: 500,
                fontSize: 'clamp(25px, 4vw, 32px)',
                color: '#ffffff',
                margin: '0 0 4px',
                lineHeight: 1.25,
              }}
            >
              Mohamed Abdelrahman
            </h1>
            <h1
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: 'italic',
                fontWeight: 500,
                fontSize: 'clamp(25px, 4vw, 32px)',
                color: '#ffffff',
                margin: '0 0 8px',
                lineHeight: 1.25,
              }}
            >
              Mohammed Hassanein
            </h1>

            {/* Ampersand */}
            <p
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: 'italic',
                fontSize: 'clamp(21px, 2.5vw, 20px)',
                color: '#ffefdc',
                margin: '0 0 8px',
              }}
            >
              &amp;
            </p>

            {/* Name 2 */}
            <h1
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: 'italic',
                fontWeight: 500,
                fontSize: 'clamp(25px, 4vw, 32px)',
                color: '#ffffff',
                margin: '0 0 clamp(16px, 4%, 28px)',
                lineHeight: 1.25,
              }}
            >
              Tibyan Elsheikh Mustafa
            </h1>

            {/* Thin divider */}
            <div
              style={{
                width: '40px',
                height: '1px',
                background: 'rgba(184, 120, 42, 0.4)',
                margin: '0 auto clamp(12px, 3%, 20px)',
              }}
            />

            {/* Date — eyebrow style */}
            <p
              style={{
                fontFamily: "'Arial', sans-serif",
                fontSize: 'clamp(16px, 1.4vw, 12px)',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: '#ffefdc',
                margin: '0 0 6px',
              }}
            >
              04 · 07 · 2026
            </p>

            {/* Venue — eyebrow style */}
            <p
              style={{
                fontFamily: "'Arial', sans-serif",
                fontSize: 'clamp(16px, 1.4vw, 12px)',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: '#ffefdc',
                margin: 0,
              }}
            >
              Waldorf Astoria
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  OUR STORY                                                    */}
      {/* ============================================================ */}
<section
  id="story"
  style={{
    backgroundImage: "url('/media/withlove.webp')",
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
  {/* Spacer that pushes content below the wax seal — ~42% of the image height */}
  <div style={{ height: '42vh', minHeight: '280px', flexShrink: 0 }} />

  {/* Content sits on the paper area */}
  <div style={{
    width: '100%',
    maxWidth: '560px',
    padding: '0 clamp(32px, 8vw, 80px) clamp(80px, 12vh, 140px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  }}>
    <Reveal as="p" style={{
      fontFamily: "'Arial', sans-serif",
      fontSize: '11px',
      letterSpacing: '0.28em',
      textTransform: 'uppercase',
      color: '#b8782a',
      margin: '0 0 24px',
    }}>
      With love
    </Reveal>

    <Reveal delay={120}>
      <p style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontStyle: 'italic',
        fontSize: 'clamp(14px, 2vw, 17px)',
        lineHeight: 2,
        color: '#3a2010',
        margin: 0,
      }}>
        John Green once wrote, &ldquo;What the hell is instant? Nothing is instant.
        Instant rice takes five minutes; instant pudding, an hour.&rdquo;
        And perhaps nowhere is this truer than in love. For love asks us to surrender
        the instant in favor of the journey — to choose patience over haste,
        perseverance over ease, and selflessness over certainty. It is in taking the
        longer road, through every trial and every season of waiting, that the heart
        is refined and the soul finds its way home.
        Through every hurdle, every whispered prayer, and every moment spent holding
        on to hope, our hearts found their way back to one another.
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

        <Reveal delay={100}>
          <p style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontStyle: 'italic',
            fontSize: 'clamp(20px, 3vw, 26px)',
            color: '#fbf7f2',
            margin: '0 0 6px',
            textAlign: 'center',
          }}>
            Waldorf Astoria
          </p>
          <p style={{
            fontFamily: "'Arial', sans-serif",
            fontSize: '12px',
            letterSpacing: '0.12em',
            color: 'rgba(251,247,242,0.55)',
            textAlign: 'center',
            margin: '0 0 40px',
          }}>
            Cairo, Egypt
          </p>
        </Reveal>



        <Reveal delay={300}>
          <a
            href="https://maps.app.goo.gl/mrD65feFV6JFv5hL8"
            target="_blank"
            rel="noopener noreferrer"
            className="gold-button"
            style={{ marginTop: '8px' }}
          >
            Get directions
          </a>
        </Reveal>
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
      {/*  COUNTDOWN                                                    */}
      {/* ============================================================ */}
      <section id="countdown" style={{
        background: 'radial-gradient(ellipse at 50% 0%, #883f48 0%, #4d0e12 72%)',
        padding: 'clamp(64px, 12vh, 120px) clamp(20px, 6vw, 48px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}>
        <section style={{
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
          fontSize: '14px',
          color: '#fbf7f2',
          lineHeight: 1,
        }}>
          <Reveal as="h2" delay={80}>
            After all this time — always
          </Reveal>
          <br />
        </section>

        <Reveal delay={160}>
          <CountdownTimer />
        </Reveal>
      </section>



      {/* ============================================================ */}
      {/*  WEDDING TIMELINE                                             */}
      {/* ============================================================ */}
      <section id="timeline" className="story-section">
        <Reveal as="p" className="eyebrow">the evening</Reveal>
        <Reveal as="h2" delay={80} className="section-title">
          How the night unfolds
        </Reveal>

        <div className="timeline">
          <div className="timeline-rail" aria-hidden="true" />

          {[
            { num: '01', time: '8:00 pm', event: 'Guest arrival', desc: 'Welcome drinks and the first moments of a night to remember.' },
            { num: '02', time: '8:30 pm', event: 'Bride & groom entrance', desc: 'The moment we have all been waiting for.' },
            { num: '03', time: '11:00 pm', event: 'Dinner', desc: 'A feast shared with the people we love most.' },
            { num: '04', time: '1:00 am', event: 'Jirtig', desc: 'A cherished tradition — joyful, loud, and full of love.' },
            { num: '05', time: '1:00 am~', event: 'After party', desc: 'Keep the night going for those who never want it to end.' },
          ].map(({ num, time, event, desc }, i) => (
            <Reveal key={num} as="div" delay={120 + i * 80} className="timeline-item">
              <span className="timeline-num">{num}</span>
              <div>
                   <p style={{
                  fontFamily: 'Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: '16px',
                  color: '#b8782a',
                  margin: 0,
                }}>
                  {time}
                </p>
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
      {/*  GUEST MESSAGES                                               */}
      {/* ============================================================ */}
      <section id="messages" style={{
        background: 'radial-gradient(ellipse at 50% 0%, #883f48 0%, #4d0e12 72%)',
        padding: 'clamp(64px, 12vh, 120px) clamp(20px, 6vw, 48px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>

        <Reveal delay={80}>
          <p style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontStyle: 'italic',
            fontSize: 'clamp(20px, 3vw, 26px)',
            color: '#fbf7f2',
            margin: '0 0 6px',
            textAlign: 'center',
          }}>
          Leave us a loving message or your best marriage advice — help us remember this special day forever.
          </p>
          <br></br>
          </Reveal>
    
      <section  style={{ width: '100%', maxWidth: '600px' }}>
        <Reveal delay={160}>
          <GuestBook />
        </Reveal></section>
      </section>




{/* ============================================================ */}
{/*  PETAL GAME                                                   */}
{/* ============================================================ */}
<section id="game" style={{
  background: 'radial-gradient(ellipse at 50% 0%, #883f48 0%, #4d0e12 72%)',
  padding: 'clamp(64px, 12vh, 120px) clamp(20px, 6vw, 48px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}}>
  <Reveal as="h2" delay={80} className="section-title section-title-light">
    Shower them with love
  </Reveal>
  <Reveal delay={140} style={{ width: '100%', maxWidth: '420px' }}>
    <PetalGame />
  </Reveal>
</section>





      {/*  
      

      
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

        
        </div>
      </section> */}

    </main>
  );
}