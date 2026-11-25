import { MetaIcon } from "@/components/MetaIcon";
import { Layout } from "@/components/Layout";
import { TryItWidget } from "@/components/TryItWidget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Download,
  Gauge,
  Globe2,
  Key,
  Lock,
  Music2,
  Play,
  Search,
  Server,
  Settings2,
  Shield,
  Sliders,
  Star,
  Video,
  Zap,
} from "lucide-react";
import { motion, useScroll, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePageSeo } from "@/lib/seo";

const HOME_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://babiesiq.tech/#organization",
      name: "BabiesIQ",
      alternateName: "BabiesIQ API",
      url: "https://babiesiq.tech/",
      sameAs: ["https://github.com/BabiesIQ/_metaAPI"],
    },
    {
      "@type": "WebSite",
      "@id": "https://babiesiq.tech/#website",
      name: "BabiesIQ",
      url: "https://babiesiq.tech/",
      publisher: { "@id": "https://babiesiq.tech/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://babiesiq.tech/docs?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "BabiesIQ API",
      alternateName: "BabiesIQ API",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      url: "https://babiesiq.tech/",
      description:
        "YouTube audio and video streaming API for developers with search, stream URLs, downloads, and EQ presets.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
        description: "Free forever developer plan",
      },
    },
  ],
};

// ─── Scroll progress ──────────────────────────────────────────────────────────
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <motion.div
      style={{ scaleX, transformOrigin: "left" }}
      className="fixed top-0 left-0 right-0 h-[2px] z-[9999] bg-gradient-to-r from-primary to-accent"
    />
  );
}

// ─── FadeUp wrapper ───────────────────────────────────────────────────────────
function FadeUp({
  children,
  delay = 0,
  className = "",
}: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimatedCounter({
  to,
  suffix = "",
  duration = 2,
}: { to: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const tick = (now: number) => {
            const elapsed = (now - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - (1 - progress) ** 3;
            setCount(Math.floor(eased * to));
            if (progress < 1) requestAnimationFrame(tick);
            else setCount(to);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to, duration]);
  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// ─── Typewriter terminal animation ───────────────────────────────────────────
const TERMINAL_LINES = [
  { text: "> GET /api/search?q=lofi&api=BABYXF...", type: "cmd", delay: 0 },
  { text: "", type: "blank", delay: 600 },
  { text: "✓ 200 OK  12ms", type: "ok", delay: 900 },
  { text: "", type: "blank", delay: 1300 },
  { text: "{", type: "json", delay: 1600 },
  { text: '  "results": [', type: "json", delay: 1900 },
  {
    text: '    { "id": "dQw4w", "title": "lofi hip hop..." },',
    type: "json",
    delay: 2200,
  },
  {
    text: '    { "id": "5qap5", "title": "chill beats to..." }',
    type: "json",
    delay: 2500,
  },
  { text: "  ]", type: "json", delay: 2800 },
  { text: "}", type: "json", delay: 3000 },
];

function TerminalAnimation() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const genRef = useRef(0);
  useEffect(() => {
    const gen = ++genRef.current;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const schedule = () => {
      setVisibleCount(0);
      setTypedChars(0);
      TERMINAL_LINES.forEach((line, i) => {
        const t = setTimeout(() => {
          if (genRef.current !== gen) return;
          setVisibleCount(i + 1);
          if (i === 0) setTypedChars(0);
        }, line.delay);
        timers.push(t);
      });
      const restart = setTimeout(() => {
        if (genRef.current !== gen) return;
        schedule();
      }, 5500);
      timers.push(restart);
    };
    schedule();
    return () => {
      genRef.current += 1;
      timers.forEach(clearTimeout);
    };
  }, []);
  useEffect(() => {
    if (visibleCount !== 1) return;
    const full = TERMINAL_LINES[0].text;
    if (typedChars >= full.length) return;
    const t = setTimeout(() => setTypedChars((c) => c + 1), 28);
    return () => clearTimeout(t);
  }, [visibleCount, typedChars]);
  return (
    <div className="font-mono text-[11px] leading-relaxed space-y-0.5 min-h-[160px]">
      {TERMINAL_LINES.map((line) => {
        const i = TERMINAL_LINES.indexOf(line);
        if (i >= visibleCount) return null;
        const content = i === 0 ? line.text.slice(0, typedChars) : line.text;
        const colorClass =
          line.type === "cmd"
            ? "text-primary"
            : line.type === "ok"
              ? "text-emerald-400"
              : line.type === "blank"
                ? ""
                : "text-foreground/70";
        return (
          <div
            key={`d${line.delay}-t${line.type}`}
            className={`${colorClass} whitespace-pre`}
          >
            {content}
            {i === 0 && typedChars < line.text.length && (
              <span className="typewriter-cursor inline-block w-[7px] h-[12px] bg-primary ml-px align-middle" />
            )}
            {i === 0 &&
              typedChars >= line.text.length &&
              visibleCount === 1 && (
                <span className="typewriter-cursor inline-block w-[7px] h-[12px] bg-primary ml-px align-middle" />
              )}
          </div>
        );
      })}
      {visibleCount >= TERMINAL_LINES.length && (
        <span className="typewriter-cursor inline-block w-[7px] h-[12px] bg-primary align-middle" />
      )}
    </div>
  );
}

// ─── Floating musical notes ───────────────────────────────────────────────────
const NOTES: {
  char: string;
  size: number;
  left: string;
  bottom: string;
  dur: string;
  delay: string;
}[] = [
  { char: "♪", size: 14, left: "15%", bottom: "60%", dur: "2.5s", delay: "0s" },
  {
    char: "♫",
    size: 18,
    left: "35%",
    bottom: "72%",
    dur: "3.2s",
    delay: "0.9s",
  },
  {
    char: "♩",
    size: 14,
    left: "55%",
    bottom: "64%",
    dur: "3.9s",
    delay: "1.8s",
  },
  {
    char: "♬",
    size: 22,
    left: "75%",
    bottom: "76%",
    dur: "4.6s",
    delay: "2.7s",
  },
];
function FloatingNotes() {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {NOTES.map((n) => (
        <span
          key={n.char}
          className="absolute text-primary/60 font-bold select-none"
          style={{
            fontSize: n.size,
            left: n.left,
            bottom: n.bottom,
            animation: `float-note ${n.dur} ease-out infinite`,
            animationDelay: n.delay,
          }}
        >
          {n.char}
        </span>
      ))}
    </div>
  );
}

// ─── Mini EQ bars ─────────────────────────────────────────────────────────────
const MINI_EQ: { h: number; dur: string; delay: string }[] = [
  { h: 12, dur: "0.5s", delay: "0s" },
  { h: 20, dur: "0.65s", delay: "0.08s" },
  { h: 28, dur: "0.8s", delay: "0.16s" },
  { h: 16, dur: "0.5s", delay: "0.24s" },
  { h: 24, dur: "0.65s", delay: "0.32s" },
  { h: 18, dur: "0.8s", delay: "0.4s" },
  { h: 22, dur: "0.5s", delay: "0.48s" },
];
function MiniEqBars() {
  return (
    <div className="flex items-end gap-[2px]" aria-hidden="true">
      {MINI_EQ.map((bar) => (
        <div
          key={`mini-eq-${bar.h}-${bar.delay}`}
          className="rounded-full bg-gradient-to-t from-primary to-accent/70 flex-shrink-0"
          style={{
            width: 3,
            height: bar.h,
            animation: `waveform-bar ${bar.dur} ease-in-out infinite alternate`,
            animationDelay: bar.delay,
          }}
        />
      ))}
    </div>
  );
}

// ─── Developer Girl SVG Scene ─────────────────────────────────────────────────
function DeveloperGirlScene() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full flex flex-col items-center justify-center"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, oklch(0.72 0.24 254 / 0.12) 0%, transparent 70%)",
        }}
      />
      <div className="relative w-full max-w-[420px]">
        <FloatingNotes />
        <img src="/assets/meta/music-api-hero.svg" alt="" className="w-full rounded-3xl shadow-elevated" draggable={false} />
        <div className="flex justify-center mt-2">
          <MiniEqBars />
        </div>
        <motion.div
          className="absolute top-[8%] right-[2%] flex items-center gap-1 px-2.5 py-1 rounded-full border border-primary/30 bg-card/80 backdrop-blur-sm text-[10px] font-mono text-primary shadow-lg"
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          12ms response
        </motion.div>
        <motion.div
          className="absolute top-[28%] left-[0%] flex items-center gap-1 px-2.5 py-1 rounded-full border border-accent/30 bg-card/80 backdrop-blur-sm text-[10px] font-mono text-accent shadow-lg"
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 0.8,
          }}
        >
          99.9% uptime
        </motion.div>
        <motion.div
          className="absolute bottom-[22%] right-[0%] flex items-center gap-1 px-2.5 py-1 rounded-full border border-border bg-card/80 backdrop-blur-sm text-[10px] font-mono text-muted-foreground shadow-lg"
          animate={{ y: [0, -5, 0] }}
          transition={{
            duration: 3.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1.5,
          }}
        >
          30+ EQ presets
        </motion.div>
      </div>
      <motion.div
        className="relative w-full max-w-[380px] rounded-xl border border-primary/20 bg-card/90 backdrop-blur-md shadow-elevated overflow-hidden mt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/50">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground ml-2">
            BabiesIQ Console
          </span>
          <div className="ml-auto flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-mono text-emerald-400">LIVE</span>
          </div>
        </div>
        <div className="px-5 py-4">
          <TerminalAnimation />
        </div>
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      </motion.div>
    </motion.div>
  );
}

// ─── Waveform bars ────────────────────────────────────────────────────────────
const WAVE_BARS = Array.from({ length: 38 }, (_, i) => ({
  id: i,
  delay: (i * 0.07) % 1.4,
  minH: 8 + ((i * 13) % 20),
  maxH: 32 + ((i * 17) % 48),
}));
function WaveformBars({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-end gap-[3px] ${className}`} aria-hidden="true">
      {WAVE_BARS.map((bar) => (
        <div
          key={bar.id}
          className="rounded-full bg-gradient-to-t from-primary/70 to-accent/50 flex-shrink-0"
          style={{
            width: 3,
            animation: `waveform-bar ${0.8 + (bar.id % 5) * 0.2}s ease-in-out infinite alternate`,
            animationDelay: `${bar.delay}s`,
            minHeight: bar.minH,
            maxHeight: bar.maxH,
            height: bar.minH,
          }}
        />
      ))}
    </div>
  );
}

// ─── Ripple hook ──────────────────────────────────────────────────────────────
function useRipple() {
  function createRipple(e: React.MouseEvent<HTMLButtonElement>) {
    const btn = e.currentTarget;
    const circle = document.createElement("span");
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    circle.className = "ripple-circle";
    circle.style.width = circle.style.height = `${size}px`;
    circle.style.left = `${e.clientX - rect.left - size / 2}px`;
    circle.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(circle);
    circle.addEventListener("animationend", () => circle.remove());
  }
  return createRipple;
}

const MARQUEE_ITEMS = [
  "Python",
  "JavaScript",
  "Go",
  "Ruby",
  "Rust",
  "curl",
  "React",
  "Node.js",
  "TypeScript",
  "PHP",
  "Swift",
  "Kotlin",
  "Java",
  "C#",
  "Elixir",
];

function getHowItWorks(t: (k: string) => string) {
  return [
    {
      num: "01",
      icon: Key,
      title: t("home.step1_title"),
      desc: t("home.step1_desc"),
    },
    {
      num: "02",
      icon: Settings2,
      title: t("home.step2_title"),
      desc: t("home.step2_desc"),
    },
    {
      num: "03",
      icon: Play,
      title: t("home.step3_title"),
      desc: t("home.step3_desc"),
    },
  ];
}

function getFeatures(t: (k: string) => string) {
  return [
    {
      icon: Search,
      title: t("home.feat1_title"),
      desc: t("home.feat1_desc"),
      color: "from-blue-500/10 to-blue-500/5",
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/10 group-hover:bg-blue-500/20",
    },
    {
      icon: Music2,
      title: t("home.feat2_title"),
      desc: t("home.feat2_desc"),
      color: "from-primary/10 to-primary/5",
      iconColor: "text-primary",
      iconBg: "bg-primary/10 group-hover:bg-primary/20",
    },
    {
      icon: Video,
      title: t("home.feat3_title"),
      desc: t("home.feat3_desc"),
      color: "from-purple-500/10 to-purple-500/5",
      iconColor: "text-purple-400",
      iconBg: "bg-purple-500/10 group-hover:bg-purple-500/20",
    },
    {
      icon: Sliders,
      title: t("home.feat4_title"),
      desc: t("home.feat4_desc"),
      color: "from-emerald-500/10 to-emerald-500/5",
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
    },
    {
      icon: Download,
      title: t("home.feat5_title"),
      desc: t("home.feat5_desc"),
      color: "from-orange-500/10 to-orange-500/5",
      iconColor: "text-orange-400",
      iconBg: "bg-orange-500/10 group-hover:bg-orange-500/20",
    },
    {
      icon: Gauge,
      title: t("home.feat6_title"),
      desc: t("home.feat6_desc"),
      color: "from-pink-500/10 to-pink-500/5",
      iconColor: "text-pink-400",
      iconBg: "bg-pink-500/10 group-hover:bg-pink-500/20",
    },
  ];
}

function getStats(t: (k: string) => string) {
  return [
    { value: 300000, suffix: "+", label: t("home.stat1_label") },
    { value: 1000000000, suffix: "+", label: t("home.stat2_label") },
    { value: 99, suffix: ".9%", label: t("home.stat3_label") },
    { value: 150, suffix: "ms", label: t("home.stat4_label") },
  ];
}

function getTestimonials(t: (k: string) => string) {
  return [
    {
      name: "Rajesh Kumar",
      role: t("home.t1_role"),
      company: "TechStartup India",
      avatar: "RK",
      color: "bg-primary/20 text-primary",
      stars: 5,
      quote: t("home.t1_quote"),
    },
    {
      name: "Amir Hassan",
      role: t("home.t2_role"),
      company: "StreamFlow Labs",
      avatar: "AH",
      color: "bg-accent/20 text-accent",
      stars: 5,
      quote: t("home.t2_quote"),
    },
    {
      name: "Priya Sharma",
      role: t("home.t3_role"),
      company: "MusicTech Co.",
      avatar: "PS",
      color: "bg-emerald-500/20 text-emerald-500",
      stars: 5,
      quote: t("home.t3_quote"),
    },
  ];
}

const EQ_WAVE_HEIGHTS = [
  16, 32, 24, 40, 20, 48, 28, 36, 18, 44, 30, 38, 22, 46, 26, 42, 20, 50, 24,
  38, 16, 44, 28, 36, 20, 48, 22, 40, 18, 46, 30, 36,
];
function EqShowcaseBars() {
  return (
    <div className="flex items-end justify-center gap-1" aria-hidden="true">
      {EQ_WAVE_HEIGHTS.map((h, i) => (
        <div
          key={`eq-${i}-${h}`}
          className="rounded-sm bg-gradient-to-t from-primary to-accent/60 flex-shrink-0"
          style={{
            width: 5,
            animation: `waveform-bar ${0.7 + (i % 6) * 0.15}s ease-in-out infinite alternate`,
            animationDelay: `${(i * 0.06) % 1.2}s`,
            minHeight: Math.max(6, h / 3),
            height: h,
          }}
        />
      ))}
    </div>
  );
}

// ─── Trust logos ──────────────────────────────────────────────────────────────
const TRUST_LOGOS = [
  { name: "Spotify", icon: Music2 },
  { name: "SoundCloud", icon: Server },
  { name: "TuneCore", icon: Globe2 },
  { name: "Bandcamp", icon: Lock },
  { name: "AudioMack", icon: Zap },
  { name: "Deezer", icon: Shield },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export function HomePage() {
  usePageSeo({
    title: "BabiesIQ | YouTube Audio & Video Streaming API",
    description:
      "BabiesIQ is a fast YouTube audio and video streaming API for developers. Search videos, get stream URLs, apply EQ presets, and build with one API key.",
    path: "/",
    jsonLd: HOME_SCHEMA,
  });
  const ripple = useRipple();
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  const { t } = useTranslation();

  const HOW_IT_WORKS = getHowItWorks(t);
  const FEATURES = getFeatures(t);
  const STATS = getStats(t);
  const TESTIMONIALS = getTestimonials(t);

  return (
    <Layout>
      <ScrollProgressBar />

      {/* ═══ HERO ═══ */}
      <section
        className="relative overflow-hidden bg-background"
        data-ocid="home.hero.section"
      >
        {/* Grid overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.55 0.01 260 / 0.6) 1px, transparent 1px), linear-gradient(90deg, oklch(0.55 0.01 260 / 0.6) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Radial glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.72 0.24 254 / 0.12) 0%, transparent 70%)",
          }}
        />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />

        <div className="relative mx-auto max-w-5xl px-5 pb-16 pt-20 sm:pt-28 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: copy */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-start">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Badge
                  variant="outline"
                  className="mb-8 border-primary/30 text-primary font-mono text-[11px] px-4 py-1.5 inline-flex items-center gap-1.5 bg-primary/5"
                  data-ocid="home.hero.badge"
                >
                  <Zap className="w-3 h-3" />
                  {t("hero.badge")}
                </Badge>
              </motion.div>

              <motion.h1
                className="font-display font-semibold text-4xl sm:text-5xl lg:text-6xl leading-[1.13] tracking-[-0.045em] text-foreground mb-5"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.09 } },
                }}
              >
                {t("hero.title")}
              </motion.h1>

              <motion.p
                className="text-base md:text-lg text-muted-foreground font-body leading-relaxed mb-10 max-w-lg"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.65 }}
              >
                {t("hero.subtitle")}
              </motion.p>

              <motion.div
                className="flex flex-wrap items-center gap-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.82 }}
                data-ocid="home.hero.cta_group"
              >
                <Link to="/signup" data-ocid="home.hero.primary_cta.button">
                  <button
                    type="button"
                    onMouseDown={ripple}
                    className="btn-ripple inline-flex items-center gap-2 px-8 h-12 text-base font-display font-semibold rounded-lg gradient-primary text-white hover:opacity-90 transition-smooth shadow-lg shadow-primary/30"
                  >
                    {t("hero.cta_primary")}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link to="/docs" data-ocid="home.hero.secondary_cta.button">
                  <Button
                    size="lg"
                    variant="outline"
                    className="font-display font-semibold gap-2 border-border hover:border-primary hover:text-primary transition-smooth h-12 text-base"
                  >
                    <Play className="w-4 h-4" />
                    {t("hero.cta_secondary")}
                  </Button>
                </Link>
              </motion.div>

              {/* 3 inline trust chips */}
              <motion.div
                className="mt-8 flex flex-wrap gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                {[
                  { icon: Check, text: t("home.trust_free") },
                  { icon: Zap, text: t("home.trust_start") },
                  { icon: Shield, text: t("home.trust_no_cc") },
                ].map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground font-body"
                  >
                    <Icon className="w-3.5 h-3.5 text-primary" />
                    <span>{text}</span>
                  </div>
                ))}
              </motion.div>

              {/* Stats bar */}
              <motion.div
                className="mt-10 pt-8 border-t border-border/50 grid grid-cols-2 sm:grid-cols-4 gap-6 w-full"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.3 }}
                data-ocid="home.hero.stats"
              >
                {STATS.map((stat, i) => (
                  <div
                    key={stat.label}
                    className="flex flex-col"
                    data-ocid={`home.hero.stat.${i + 1}`}
                  >
                    <p className="font-display font-bold text-2xl text-foreground tabular-nums leading-none">
                      <AnimatedCounter to={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="text-[11px] text-muted-foreground font-body mt-1">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: illustration + terminal */}
            <div className="hidden lg:flex items-center justify-center">
              <DeveloperGirlScene />
            </div>
          </div>

          {/* Mobile API preview */}
          <div className="lg:hidden mt-8 space-y-4"><img src="/assets/meta/music-api-hero.svg" alt="" className="w-full max-w-[460px] mx-auto rounded-3xl" draggable={false}/>
            <motion.div
              className="relative w-full max-w-[460px] mx-auto rounded-xl border border-primary/20 bg-card/90 backdrop-blur-md shadow-2xl shadow-primary/15 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
            >
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground ml-2">
                  BabiesIQ Console
                </span>
                <div className="ml-auto flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-mono text-emerald-400">
                    LIVE
                  </span>
                </div>
              </div>
              <div className="px-5 py-4">
                <TerminalAnimation />
              </div>
              <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ TRUST BAR ═══ */}
      <section
        className="bg-card/60 border-y border-border/60 py-10"
        data-ocid="home.trust_bar.section"
      >
        <div className="container mx-auto px-6 max-w-5xl">
          <FadeUp className="text-center mb-8">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.2em]">
              {t("home.trust_bar_label")}
            </p>
          </FadeUp>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-6">
            {TRUST_LOGOS.map((logo, i) => (
              <motion.div
                key={logo.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="flex flex-col items-center gap-2 group"
                data-ocid={`home.trust_bar.logo.${i + 1}`}
              >
                <div className="w-10 h-10 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5 transition-smooth">
                  <logo.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                </div>
                <span className="text-[11px] font-mono text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                  {logo.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MARQUEE ═══ */}
      <section
        className="border-b border-border bg-background py-4 overflow-hidden"
        aria-label={t("home.marquee_label")}
        data-ocid="home.marquee.section"
      >
        <div className="marquee-track">
          {doubled.map((item, i) => (
            <div
              key={`marquee-${Math.floor(i / MARQUEE_ITEMS.length)}-${item}`}
              className="flex items-center gap-2 px-8 shrink-0 text-sm font-mono text-muted-foreground"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
              <span>{item}</span>
              <span className="ml-8 text-border/50">|</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section
        className="bg-muted/20 py-16 sm:py-20 border-b border-border"
        data-ocid="home.how_it_works.section"
      >
        <div className="container mx-auto px-6 max-w-5xl">
          <FadeUp className="text-center mb-16">
            <p className="text-[11px] font-mono text-primary uppercase tracking-[0.18em] mb-3">
              {t("home.how_it_works_eyebrow")}
            </p>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
              {t("home.how_it_works_title")}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground font-body max-w-md mx-auto">
              {t("home.how_it_works_subtitle")}
            </p>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            <div className="hidden md:block absolute top-[2.2rem] left-[calc(16.5%+1.5rem)] right-[calc(16.5%+1.5rem)] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            {HOW_IT_WORKS.map(({ num, icon: Icon, title, desc }, i) => (
              <FadeUp
                key={num}
                delay={i * 0.12}
                className="flex flex-col items-center text-center group"
              >
                <div className="relative mb-5">
                  <div className="w-[4.5rem] h-[4.5rem] rounded-2xl border border-border bg-card flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/5 transition-smooth shadow-sm">
                    <Icon className="w-7 h-7 text-primary group-hover:scale-110 transition-smooth" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-white text-[9px] font-mono font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-muted-foreground mb-2 tracking-widest uppercase">
                  {num}
                </p>
                <h3 className="font-display font-semibold text-foreground text-base mb-2">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed max-w-xs">
                  {desc}
                </p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES GRID ═══ */}
      <section
        className="bg-background py-16 sm:py-20 border-b border-border"
        data-ocid="home.features.section"
      >
        <div className="container mx-auto px-6 max-w-5xl">
          <FadeUp className="text-center mb-14">
            <p className="text-[11px] font-mono text-primary uppercase tracking-[0.18em] mb-3">
              {t("home.features_eyebrow")}
            </p>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
              {t("features.title")}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground font-body max-w-lg mx-auto">
              {t("features.subtitle")}
            </p>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(
              ({ title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="meta-feature-card group relative rounded-2xl border border-border bg-card p-5 sm:p-6 overflow-hidden hover:border-primary/40 transition-colors"
                  data-ocid={`home.features.item.${i + 1}`}
                >
                  
                  <div className="relative">
                    <MetaIcon name={["search","audio","video","equalizer","download","speed"][i]} size={52} className="mb-4" />
                    <h3 className="font-display font-semibold text-foreground text-base mb-2">
                      {title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-body leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </motion.div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ═══ WAVEFORM SHOWCASE ═══ */}
      <section
        className="relative bg-card border-b border-border py-16 sm:py-20 overflow-hidden"
        data-ocid="home.waveform.section"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeUp>
              <div className="relative flex flex-col items-center gap-6">
                <div className="w-full rounded-2xl border border-border bg-background/60 backdrop-blur-sm p-8 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-3 w-full mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Play className="w-4 h-4 text-primary ml-0.5" />
                    </div>
                    <div className="flex-1">
                      <div className="h-1.5 rounded-full bg-border overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: "62%" }}
                          transition={{
                            duration: 2.5,
                            delay: 1,
                            ease: "easeOut",
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      2:41 / 3:53
                    </span>
                  </div>
                  <EqShowcaseBars />
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className="text-[10px] border-primary/30 text-primary font-mono"
                    >
                      eq=bass_boost
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[10px] border-border text-muted-foreground font-mono"
                    >
                      seek=0
                    </Badge>
                  </div>
                </div>
                <div className="w-full opacity-30">
                  <WaveformBars />
                </div>
              </div>
            </FadeUp>
            <FadeUp delay={0.15}>
              <p className="text-[11px] font-mono text-primary uppercase tracking-[0.18em] mb-4">
                {t("home.waveform_eyebrow")}
              </p>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-6 leading-tight">
                {t("home.waveform_title")}
                <br />
                <span className="text-gradient">
                  {t("home.waveform_title2")}
                </span>
              </h2>
              <ul className="space-y-4">
                {[
                  {
                    label: t("home.wave_f1_label"),
                    detail: t("home.wave_f1_detail"),
                  },
                  {
                    label: t("home.wave_f2_label"),
                    detail: t("home.wave_f2_detail"),
                  },
                  {
                    label: t("home.wave_f3_label"),
                    detail: t("home.wave_f3_detail"),
                  },
                  {
                    label: t("home.wave_f4_label"),
                    detail: t("home.wave_f4_detail"),
                  },
                ].map((item, i) => (
                  <motion.li
                    key={item.label}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                  >
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <div>
                      <p className="font-display font-semibold text-sm text-foreground">
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground font-body">
                        {item.detail}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section
        className="bg-muted/25 border-b border-border py-16 sm:py-20"
        data-ocid="home.testimonials.section"
      >
        <div className="container mx-auto px-6 max-w-5xl">
          <FadeUp className="text-center mb-14">
            <p className="text-[11px] font-mono text-primary uppercase tracking-[0.18em] mb-3">
              {t("home.testimonials_eyebrow")}
            </p>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
              {t("home.testimonials_title")}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground font-body max-w-lg mx-auto">
              {t("home.testimonials_subtitle")}
            </p>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-card rounded-2xl border border-border p-6 flex flex-col gap-4 transition-smooth hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                data-ocid={`home.testimonials.item.${i + 1}`}
              >
                <div className="flex items-center gap-1">
                  {Array.from({ length: testimonial.stars }, (_, si) => (
                    <Star
                      key={`star-${testimonial.name}-${si}`}
                      className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-foreground/85 font-body leading-relaxed flex-1">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-border">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-display font-bold flex-shrink-0 ${testimonial.color}`}
                  >
                    {testimonial.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-display font-semibold text-foreground truncate">
                      {testimonial.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-body truncate">
                      {testimonial.role} · {testimonial.company}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <FadeUp delay={0.3} className="mt-12">
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-body">
              {[
                { icon: Shield, text: t("home.trust_badge1") },
                { icon: Zap, text: t("home.trust_badge2") },
                { icon: Key, text: t("home.trust_badge3") },
                { icon: Gauge, text: t("home.trust_badge4") },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══ TRY IT LIVE ═══ */}
      <section
        className="relative bg-background border-b border-border py-16 sm:py-20 overflow-hidden"
        data-ocid="home.try_it.section"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-6 max-w-5xl relative">
          <FadeUp className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <p className="text-[11px] font-mono text-primary uppercase tracking-[0.18em]">
                {t("home.try_it_eyebrow")}
              </p>
              <Badge
                variant="outline"
                className="text-[10px] border-primary/30 text-primary font-mono"
              >
                {t("home.try_it_badge")}
              </Badge>
            </div>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
              {t("home.try_it_title")}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground font-body max-w-xl mx-auto">
              {t("home.try_it_subtitle")}
            </p>
          </FadeUp>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl mx-auto"
          >
            <TryItWidget compact />
          </motion.div>
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Link to="/docs" data-ocid="home.try_it.full_docs.button">
              <Button
                variant="ghost"
                className="font-body text-muted-foreground hover:text-primary gap-1.5"
              >
                {t("home.try_it_docs_link")}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ PRICING TEASER ═══ */}
      <section
        className="bg-card py-24 border-b border-border"
        data-ocid="home.pricing_teaser.section"
      >
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <FadeUp>
            <p className="text-[11px] font-mono text-primary uppercase tracking-[0.18em] mb-3">
              {t("home.pricing_eyebrow")}
            </p>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-3">
              {t("pricing.title")}
            </h2>
            <p className="text-sm text-muted-foreground font-body mb-10">
              {t("pricing.subtitle")}
            </p>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10 max-w-3xl mx-auto">
            {[
              {
                name: "Free",
                detail: "500 req/day",
                price: "\u20B90",
                highlight: false,
                features: [
                  t("home.plan_feat_1key"),
                  t("home.plan_feat_all_endpoints"),
                  t("home.plan_feat_community"),
                ],
              },
              {
                name: "Pro",
                detail: "2,500 req/day",
                price: "\u20B949",
                highlight: true,
                features: [
                  t("home.plan_feat_1key"),
                  t("home.plan_feat_all_endpoints"),
                  t("home.plan_feat_email_support"),
                ],
              },
              {
                name: "Pro Plus",
                detail: "5,000 req/day",
                price: "\u20B999",
                highlight: false,
                features: [
                  t("home.plan_feat_1key"),
                  t("home.plan_feat_priority"),
                  t("home.plan_feat_seek"),
                ],
              },
            ].map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                data-ocid={`home.pricing_teaser.plan.${i + 1}`}
                className={`flex flex-col p-6 rounded-2xl border text-start transition-smooth ${
                  plan.highlight
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 ring-1 ring-primary/20"
                    : "border-border bg-background hover:border-primary/30"
                }`}
              >
                {plan.highlight && (
                  <Badge className="gradient-primary text-white text-[10px] font-display self-start mb-3">
                    {t("billing.most_popular")}
                  </Badge>
                )}
                <h3
                  className={`font-display font-bold text-base mb-1 ${
                    plan.highlight ? "text-primary" : "text-foreground"
                  }`}
                >
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-display font-extrabold text-2xl text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t("billing.per_mo")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-mono mb-4">
                  {plan.detail}
                </p>
                <ul className="space-y-1.5 mb-5">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-xs text-foreground font-body"
                    >
                      <Check
                        className={`w-3.5 h-3.5 flex-shrink-0 ${
                          plan.highlight
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/pricing" className="mt-auto">
                  <Button
                    size="sm"
                    variant={plan.highlight ? "default" : "outline"}
                    className={`w-full font-display font-semibold text-xs ${
                      plan.highlight ? "gradient-primary text-white" : ""
                    }`}
                  >
                    {plan.highlight
                      ? t("pricing.get_started")
                      : t("home.plan_learn_more")}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
          <FadeUp delay={0.3}>
            <Link to="/pricing" data-ocid="home.pricing_teaser.see_all.button">
              <Button
                variant="ghost"
                className="font-display font-semibold gap-2 text-muted-foreground hover:text-primary"
              >
                {t("home.see_full_pricing")}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ═══ FOOTER CTA ═══ */}
      <section
        className="relative py-32 overflow-hidden animated-gradient-bg"
        data-ocid="home.footer_cta.section"
      >
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center overflow-hidden opacity-20 pointer-events-none">
          <WaveformBars className="w-full max-w-4xl" />
        </div>
        <div className="container mx-auto px-6 relative text-center">
          <motion.div
            className="max-w-2xl mx-auto flex flex-col items-center gap-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65 }}
          >
            <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground leading-tight">
              {t("home.cta_title")}{" "}
              <span className="text-gradient">{t("home.cta_title2")}</span>
            </h2>
            <p className="text-muted-foreground font-body text-base leading-relaxed">
              {t("home.cta_subtitle")}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              <Link to="/signup">
                <button
                  type="button"
                  onMouseDown={ripple}
                  className="btn-ripple inline-flex items-center gap-2 px-10 h-12 text-base font-display font-semibold rounded-lg gradient-primary text-white hover:opacity-90 hover:scale-105 transition-smooth shadow-xl shadow-primary/30"
                  data-ocid="home.footer_cta.signup.button"
                >
                  {t("hero.cta_primary")}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="font-display font-semibold border-border hover:border-primary hover:text-primary hover:scale-105 transition-smooth px-8 h-12"
                  data-ocid="home.footer_cta.contact.button"
                >
                  {t("home.cta_contact")}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
