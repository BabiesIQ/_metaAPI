import { Layout } from "@/components/Layout";
// TryItWidget is extracted to its own component file
import { TryItWidget } from "@/components/TryItWidget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getBackendUrl } from "@/lib/config";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  BookOpen,
  Check,
  ChevronDown,
  Code2,
  Copy,
  Download,
  Gauge,
  Key,
  Music2,
  Package,
  PlayCircle,
  Sliders,
  Terminal,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionId =
  | "overview"
  | "authentication"
  | "endpoints"
  | "rate-limits"
  | "eq-presets"
  | "code-examples"
  | "sdk"
  | "cli"
  | "try-it";

interface NavItem {
  id: SectionId;
  label: string;
  icon: React.ElementType;
}

const EQ_PRESETS = [
  "normal",
  "bass",
  "bass_boost",
  "super_bass",
  "treble",
  "vocal",
  "acoustic",
  "electronic",
  "dance",
  "rock",
  "pop",
  "jazz",
  "classical",
  "hiphop",
  "reggae",
  "lounge",
  "cinema",
  "night",
  "party",
  "live",
  "studio",
  "headphones",
  "car",
  "radio",
  "8d",
  "slow",
  "fast",
  "nightcore",
  "lofi",
  "chipmunk",
  "deep",
];

const CODE_LANGUAGES = [
  "curl",
  "Python",
  "JavaScript",
  "Go",
  "Rust",
  "Ruby",
] as const;
type CodeLang = (typeof CODE_LANGUAGES)[number];

function getCodeExamples(base: string): Record<CodeLang, string> {
  return {
    curl: `# Search
curl "${base}/api/search?q=shape+of+you&api=YOUR_KEY"

# Get audio stream URL
curl "${base}/api/song?query=JGwWNGJdvx8&api=YOUR_KEY"

# Stream with equalizer
curl "${base}/api/stream/audio_JGwWNGJdvx8?token=tok_xxx&eq=bass_boost&seek=30&api=YOUR_KEY" \\
  --output audio.mp3`,

    Python: `import requests

API_KEY = "YOUR_API_KEY"
BASE = "${base}/api"

# Search
res = requests.get(f"{BASE}/search", params={"q": "shape of you", "api": API_KEY})
results = res.json()["results"]

# Get audio stream URL
song = requests.get(f"{BASE}/song", params={"query": results[0]["id"], "api": API_KEY})
stream_url = song.json()["stream"]

# Stream with EQ (bass_boost, start at 30s)
audio = requests.get(stream_url, params={"eq": "bass_boost", "seek": 30, "api": API_KEY})
with open("audio.mp3", "wb") as f:
    f.write(audio.content)`,

    JavaScript: `const API_KEY = "YOUR_API_KEY";
const BASE = "${base}/api";

// Search
const search = await fetch(\`\${BASE}/search?q=shape+of+you&api=\${API_KEY}\`);
const { results } = await search.json();

// Get audio stream URL
const songRes = await fetch(\`\${BASE}/song?query=\${results[0].id}&api=\${API_KEY}\`);
const { stream } = await songRes.json();

// Stream with EQ preset
const audioRes = await fetch(\`\${stream}?eq=bass_boost&seek=30&api=\${API_KEY}\`);
const audioBlob = await audioRes.blob();
const url = URL.createObjectURL(audioBlob);
const audio = new Audio(url);
audio.play();`,

    Go: `package main

import (
  "encoding/json"
  "fmt"
  "io"
  "net/http"
  "os"
)

const apiKey = "YOUR_API_KEY"
const base = "${base}/api"

func main() {
  // Search
  resp, _ := http.Get(fmt.Sprintf("%s/search?q=shape+of+you&api=%s", base, apiKey))
  defer resp.Body.Close()

  var result map[string]interface{}
  json.NewDecoder(resp.Body).Decode(&result)

  results := result["results"].([]interface{})
  videoID := results[0].(map[string]interface{})["id"].(string)

  // Get audio stream URL
  songResp, _ := http.Get(fmt.Sprintf("%s/song?query=%s&api=%s", base, videoID, apiKey))
  defer songResp.Body.Close()

  var songData map[string]interface{}
  json.NewDecoder(songResp.Body).Decode(&songData)
  streamURL := songData["stream"].(string)

  // Download with EQ
  audioResp, _ := http.Get(fmt.Sprintf("%s?eq=bass_boost&api=%s", streamURL, apiKey))
  defer audioResp.Body.Close()

  f, _ := os.Create("audio.mp3")
  io.Copy(f, audioResp.Body)
}`,

    Rust: `use reqwest;
use std::fs;
use std::fs;
use serde_json::Value;

const API_KEY: &str = "YOUR_API_KEY";
const BASE: &str = "${base}/api";

#[tokio::main]
async fn main() -> Result<(), reqwest::Error> {
    let client = reqwest::Client::new();

    // Search
    let search: Value = client
        .get(format!("{}/search?q=shape+of+you&api={}", BASE, API_KEY))
        .send().await?.json().await?;

    let video_id = &search["results"][0]["id"].as_str().unwrap();

    // Get audio stream URL
    let song: Value = client
        .get(format!("{}/song?query={}&api={}", BASE, video_id, API_KEY))
        .send().await?.json().await?;

    let stream_url = song["stream"].as_str().unwrap();

    // Stream with EQ
    let bytes = client
        .get(format!("{}?eq=bass_boost&api={}", stream_url, API_KEY))
        .send().await?.bytes().await?;

    fs::write("audio.mp3", &bytes)?;
    Ok(())
}`,

    Ruby: `require 'net/http'
require 'json'

API_KEY = 'YOUR_API_KEY'
BASE = '${base}/api'

# Search
search_uri = URI("#{BASE}/search?q=shape+of+you&api=#{API_KEY}")
search_res = Net::HTTP.get(search_uri)
results = JSON.parse(search_res)['results']
video_id = results[0]['id']

# Get audio stream URL
song_uri = URI("#{BASE}/song?query=#{video_id}&api=#{API_KEY}")
song_res = Net::HTTP.get(song_uri)
stream_url = JSON.parse(song_res)['stream']

# Download with EQ preset
audio_uri = URI("#{stream_url}?eq=bass_boost&api=#{API_KEY}")
audio_bytes = Net::HTTP.get(audio_uri)
File.write('audio.mp3', audio_bytes, mode: 'wb')
puts 'Downloaded!'`,
  };
}

// ─── Rate limit plans for visual bars ────────────────────────────────────────
const RATE_LIMIT_PLANS = [
  {
    name: "Free",
    limit: "500 / day",
    pct: 10,
    prefix: "BABYXF…",
    color: "bg-muted-foreground/60",
  },
  {
    name: "Pro",
    limit: "2,500 / day",
    pct: 50,
    prefix: "BABYXP…",
    color: "bg-primary",
  },
  {
    name: "Pro Plus",
    limit: "5,000 / day",
    pct: 100,
    prefix: "BABYXPP…",
    color: "bg-primary",
  },
  {
    name: "Business",
    limit: "Unlimited",
    pct: 100,
    prefix: "ADMINBABYX…",
    color: "gradient-primary",
    isUnlimited: true,
  },
];

// ─── Components ───────────────────────────────────────────────────────────────

function CopyableCode({
  code,
  lang = "bash",
}: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <motion.div
      className="relative mt-3 rounded-lg border border-border bg-background group"
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-border">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
          {lang}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors duration-200"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-primary" />
              <span className="text-primary">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="text-xs font-mono text-foreground/85 overflow-x-auto p-4 leading-relaxed">
        <code>{code}</code>
      </pre>
    </motion.div>
  );
}

function SectionHeading({
  id,
  title,
  subtitle,
}: { id: string; title: string; subtitle?: string }) {
  return (
    <motion.div
      className="mb-6 scroll-mt-24"
      id={id}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="font-display font-bold text-xl text-foreground">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 text-sm text-muted-foreground font-body">
          {subtitle}
        </p>
      )}
      <div className="mt-3 h-px bg-border" />
    </motion.div>
  );
}

function SubHeading({ title }: { title: string }) {
  return (
    <h3 className="font-display font-semibold text-base text-foreground mt-8 mb-2">
      {title}
    </h3>
  );
}

function EndpointBlock({
  method,
  path,
  description,
  params,
  example,
  response,
  index,
}: {
  method: string;
  path: string;
  description: string;
  params: { name: string; desc: string; required: boolean }[];
  example: string;
  response: string;
  index: number;
}) {
  const [open, setOpen] = useState(false);

  const METHOD_STYLE: Record<string, string> = {
    GET: "border-primary/30 bg-primary/10 text-primary",
  };

  return (
    <motion.div
      className="border border-border rounded-lg overflow-hidden mb-3 transition-all duration-200 hover:border-primary/30 hover:bg-primary/[0.02]"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      data-ocid={`docs.endpoints.item.${index}`}
    >
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-card hover:bg-muted/40 transition-colors duration-200 text-left group"
      >
        <span
          className={`inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded border w-14 text-center ${METHOD_STYLE[method] ?? "text-foreground border-border"}`}
        >
          {method}
        </span>
        <code className="text-xs font-mono text-foreground flex-1 group-hover:text-primary transition-colors duration-150">
          {path}
        </code>
        <span className="text-xs text-muted-foreground hidden sm:block flex-1 min-w-0 truncate">
          {description}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <motion.div
          className="bg-background border-t border-border px-4 py-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.25 }}
        >
          {params.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">
                Parameters
              </p>
              <div className="space-y-1.5">
                {params.map((p) => (
                  <div key={p.name} className="flex items-start gap-3 text-xs">
                    <code className="font-mono text-primary shrink-0">
                      {p.name}
                    </code>
                    {p.required && (
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1.5 border-destructive/30 text-destructive h-4"
                      >
                        required
                      </Badge>
                    )}
                    <span className="text-muted-foreground font-body">
                      {p.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
                Request
              </p>
              <CopyableCode code={example} lang="curl" />
            </div>
            <div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
                Response
              </p>
              <CopyableCode code={response} lang="json" />
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({
  active,
  onNavigate,
  navItems,
}: {
  active: SectionId;
  onNavigate: (id: SectionId) => void;
  navItems: NavItem[];
}) {
  return (
    <nav
      className="flex flex-col gap-0.5"
      data-ocid="docs.sidebar"
      aria-label="Documentation navigation"
    >
      <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2">
        Documentation
      </p>
      {navItems.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onNavigate(id)}
          data-ocid={`docs.sidebar.${id.replace(/-/g, "_")}.link`}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-body font-medium transition-colors duration-150 text-left w-full ${
            active === id
              ? "bg-primary/10 text-primary border-l-2 border-primary pl-[10px]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border-l-2 border-transparent pl-[10px]"
          }`}
        >
          <Icon className="w-3.5 h-3.5 flex-shrink-0" />
          {label}
        </button>
      ))}
    </nav>
  );
}

// ─── EqPresetBadge ────────────────────────────────────────────────────────────
function EqPresetBadge({ preset, delay }: { preset: string; delay: number }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(preset);
    setCopied(true);
    toast.success("Copied!", { description: preset });
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <motion.button
      type="button"
      onClick={handleCopy}
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ scale: 1.04 }}
      className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-smooth group text-left"
      data-ocid={`docs.eq_presets.${preset}.button`}
    >
      <code className="text-xs font-mono text-foreground/85 group-hover:text-primary transition-colors duration-150 truncate">
        {preset}
      </code>
      {copied ? (
        <Check className="w-3 h-3 text-primary flex-shrink-0" />
      ) : (
        <Copy className="w-3 h-3 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
      )}
    </motion.button>
  );
}


// ─── Language Icons ───────────────────────────────────────────────────────────
function LangIcon({ lang }: { lang: string }) {
  if (lang === "Python") {
    return (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.914 0C5.82 0 6.2 2.656 6.2 2.656l.007 2.752h5.814v.826H3.9S0 5.789 0 11.969c0 6.18 3.403 5.963 3.403 5.963h2.031v-2.867s-.109-3.403 3.347-3.403h5.765s3.236.052 3.236-3.127V3.204S18.28 0 11.914 0zm-3.21 1.853a1.043 1.043 0 1 1 0 2.087 1.044 1.044 0 0 1 0-2.087z" fill="#3776AB"/>
        <path d="M12.086 24c6.094 0 5.714-2.656 5.714-2.656l-.007-2.752h-5.814v-.826h8.121S24 18.211 24 12.031c0-6.18-3.403-5.963-3.403-5.963h-2.031v2.867s.109 3.403-3.347 3.403H9.454s-3.236-.052-3.236 3.127v5.331S5.72 24 12.086 24zm3.21-1.853a1.043 1.043 0 1 1 0-2.087 1.044 1.044 0 0 1 0 2.087z" fill="#FFD43B"/>
      </svg>
    );
  }
  if (lang === "JavaScript / TypeScript") {
    return (
      <svg viewBox="0 0 24 24" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="2" fill="#F7DF1E"/>
        <path d="M6.235 17.234l1.621-.981c.313.555.597.925 1.204.925.581 0 .95-.228.95-.925V9.897h1.994v6.397c0 1.534-.899 2.234-2.211 2.234-1.185 0-1.872-.613-2.228-1.294zm4.824-.24l1.621-.981c.399.654.921 1.134 1.844 1.134.777 0 1.277-.389 1.277-.932 0-.647-.512-.877-1.376-1.254l-.47-.201c-1.363-.58-2.267-1.31-2.267-2.855 0-1.42 1.083-2.5 2.775-2.5 1.206 0 2.071.419 2.692 1.516l-1.55.994c-.323-.578-.674-.803-1.142-.803-.52 0-.852.33-.852.803 0 .561.331.79 1.1 1.135l.47.201c1.607.688 2.512 1.39 2.512 2.967 0 1.698-1.334 2.636-3.127 2.636-1.754 0-2.886-.832-3.434-1.86z" fill="#323330"/>
      </svg>
    );
  }
  if (lang === "Go") {
    return (
      <svg viewBox="0 0 24 24" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.811 10.231c-.047 0-.058-.023-.035-.059l.246-.315c.023-.035.081-.058.128-.058h4.172c.046 0 .058.035.035.07l-.199.303c-.023.036-.082.07-.117.07zm-.177 1.082c-.047 0-.059-.023-.035-.058l.245-.316c.023-.035.082-.058.129-.058h5.328c.047 0 .07.035.059.07l-.093.28c-.012.047-.059.07-.105.07zm2.828 1.075c-.047 0-.059-.035-.035-.07l.163-.292c.023-.035.07-.07.117-.07h2.337c.047 0 .07.035.07.082l-.023.28c0 .047-.047.082-.082.082z" fill="#00ADD8"/>
        <path d="M19.753 11.143c-.745.186-1.257.327-1.99.514-.186.046-.198.058-.362-.117-.187-.198-.327-.327-.607-.444-.817-.397-1.608-.28-2.343.164-.876.537-1.327 1.35-1.304 2.38.023.98.679 1.795 1.655 1.913.817.105 1.514-.175 2.061-.7.105-.105.198-.222.315-.362h-2.225c-.245 0-.303-.152-.222-.35.152-.362.432-1.003.596-1.319.047-.105.152-.28.362-.28h4.793c-.058.585-.058 1.157-.152 1.716-.269 1.716-1.003 3.198-2.237 4.423-1.979 1.96-4.363 2.647-7.07 2.157-2.45-.444-4.22-1.842-5.235-4.07-.94-2.04-.69-4.14.315-6.04 1.074-2.051 2.694-3.38 5.012-3.79 1.876-.328 3.674-.023 5.247 1.015.77.503 1.327 1.191 1.702 2.017.094.163.07.222-.093.257z" fill="#00ADD8"/>
      </svg>
    );
  }
  if (lang === "PHP") {
    return (
      <svg viewBox="0 0 24 24" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="12" cy="12" rx="12" ry="6.5" fill="#777BB4"/>
        <path d="M5.996 14.577l.668-3.417h1.32c.74 0 1.262.197 1.568.59.306.392.386.937.24 1.633-.148.696-.439 1.246-.874 1.65-.435.403-.967.606-1.596.606H6.34l-.344-.01zm1.388-1.42l.343-.001c.25 0 .467-.09.65-.27.183-.18.307-.435.374-.766.064-.302.046-.534-.052-.694-.098-.16-.274-.24-.527-.24h-.37l-.418 1.971zm3.348 1.42l.667-3.417h.88l-.136.698h.36c.496 0 .853.088 1.07.264.217.175.29.45.219.824-.076.388-.261.69-.554.903-.292.213-.647.32-1.063.32l-.344-.001-.185.41h-.914zm1.175-1.01l.12-.583h.283c.218 0 .37.03.454.09.085.06.114.16.088.302-.026.137-.09.238-.19.302-.1.063-.242.095-.425.095l-.33-.001-.009-.205zm2.44 1.01l.668-3.417h.88l-.136.698h.36c.495 0 .852.088 1.07.264.216.175.29.45.218.824-.075.388-.26.69-.553.903-.293.213-.647.32-1.063.32l-.344-.001-.185.41h-.915zm1.176-1.01l.12-.583h.283c.217 0 .37.03.454.09.084.06.113.16.087.302-.025.137-.09.238-.19.302-.1.063-.24.095-.424.095l-.33-.001-.009-.205z" fill="#fff"/>
      </svg>
    );
  }
  return <span className="text-2xl">📦</span>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function DocsPage() {
  const { t } = useTranslation();
  const [active, setActive] = useState<SectionId>("overview");
  const [codeLang, setCodeLang] = useState<CodeLang>("curl");
  const contentRef = useRef<HTMLDivElement>(null);

  const base = getBackendUrl();
  const CODE_EXAMPLES = getCodeExamples(base);

  const NAV_ITEMS = useMemo<NavItem[]>(
    () => [
      { id: "overview", label: t("docs.nav_overview"), icon: BookOpen },
      { id: "authentication", label: t("docs.nav_authentication"), icon: Key },
      { id: "endpoints", label: t("docs.nav_endpoints"), icon: Code2 },
      { id: "rate-limits", label: t("docs.nav_rate_limits"), icon: Gauge },
      { id: "eq-presets", label: t("docs.nav_eq_presets"), icon: Sliders },
      { id: "code-examples", label: t("docs.nav_code_examples"), icon: Music2 },
      { id: "try-it", label: t("docs.nav_try_it_live"), icon: PlayCircle },
    ],
    [t],
  );

  function scrollToSection(id: SectionId) {
    setActive(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background" data-ocid="docs.page">
        {/* Hero bar */}
        <motion.div
          className="bg-card border-b border-border px-4 py-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-mono text-primary uppercase tracking-widest">
                Developer Reference
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-1">
              API Documentation
            </h1>
            <p className="text-sm text-muted-foreground font-body">
              Complete guide to BabiesIQ — YouTube audio/video streaming made
              simple.
            </p>
          </div>
        </motion.div>

        {/* Mobile nav */}
        <div className="lg:hidden border-b border-border bg-card/50 px-4 py-3 overflow-x-auto">
          <div className="flex gap-1.5 min-w-max" data-ocid="docs.mobile_nav">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => scrollToSection(id)}
                data-ocid={`docs.mobile_nav.${id.replace(/-/g, "_")}.tab`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-body font-medium whitespace-nowrap flex-shrink-0 transition-colors duration-150 ${
                  active === id
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "bg-muted/40 text-muted-foreground border border-border hover:text-foreground"
                }`}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content layout */}
        <div className="max-w-6xl mx-auto px-4 py-8 flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-52 flex-shrink-0">
            <div className="sticky top-24">
              <ScrollArea className="h-[calc(100vh-8rem)]">
                <Sidebar
                  active={active}
                  onNavigate={scrollToSection}
                  navItems={NAV_ITEMS}
                />
              </ScrollArea>
            </div>
          </aside>

          {/* Main content */}
          <div
            ref={contentRef}
            className="flex-1 min-w-0"
            data-ocid="docs.content"
          >
            {/* ── Overview ── */}
            <motion.section
              className="mb-14"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45 }}
              data-ocid="docs.overview.section"
            >
              <SectionHeading
                id="overview"
                title={t("docs.section_overview")}
                subtitle="BabiesIQ gives you programmatic access to YouTube audio & video streaming."
              />
              <p className="text-sm text-muted-foreground font-body leading-relaxed mb-4">
                BabiesIQ is a REST API service that lets you search YouTube,
                extract audio and video stream URLs, apply 30+ equalizer
                presets, and stream with seek support. All via simple GET
                requests to{" "}
                <code className="font-mono text-primary text-xs">
                  {base}/api
                </code>
                .
              </p>
              <SubHeading title="Quick Start" />
              <CopyableCode
                lang="bash"
                code={`# 1. Get your API key from the dashboard after signup
# 2. Search for a video
curl "${base}/api/search?q=shape+of+you&api=YOUR_KEY"

# 3. Get audio stream URL using video ID from search results
curl "${base}/api/song?query=JGwWNGJdvx8&api=YOUR_KEY"
# → { "stream": "${base}/api/stream/audio_JGwWNGJdvx8" }

# 4. Stream with an equalizer preset
curl "${base}/api/stream/audio_JGwWNGJdvx8?token=tok_xxx&eq=bass_boost&api=YOUR_KEY"`}
              />
            </motion.section>

            {/* ── Authentication ── */}
            <motion.section
              className="mb-14"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45 }}
              data-ocid="docs.authentication.section"
            >
              <SectionHeading
                id="authentication"
                title={t("docs.section_auth")}
                subtitle="Every request requires your API key."
              />
              <p className="text-sm text-muted-foreground font-body leading-relaxed mb-4">
                Include your API key in every request using the{" "}
                <code className="font-mono text-primary text-xs">?api=</code>{" "}
                query parameter, or via the{" "}
                <code className="font-mono text-primary text-xs">
                  x-api-key
                </code>{" "}
                header.
              </p>

              <SubHeading title="Method 1 — Query parameter (recommended)" />
              <CopyableCode
                lang="bash"
                code={`curl "${base}/api/search?q=lofi&api=YOUR_KEY"`}
              />

              <SubHeading title="Method 2 — Header" />
              <CopyableCode
                lang="bash"
                code={`curl "${base}/api/search?q=lofi" \\
  -H "x-api-key: YOUR_KEY"`}
              />

              <div className="mt-5 flex gap-3 p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
                <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-display font-semibold text-yellow-400 mb-0.5">
                    Keep your API key secret
                  </p>
                  <p className="text-xs text-muted-foreground font-body leading-relaxed">
                    Never expose your key in client-side code or public repos.
                    Regenerate it immediately if compromised — the old key will
                    be automatically revoked.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* ── Endpoints ── */}
            <section className="mb-14" data-ocid="docs.endpoints.section">
              <SectionHeading
                id="endpoints"
                title={t("docs.section_endpoints")}
                subtitle="Click any endpoint to see parameters and examples."
              />
              <EndpointBlock
                method="GET"
                path="/api/search"
                description="Search YouTube and get a list of video results"
                params={[
                  { name: "q", desc: "Search query string", required: true },
                  { name: "api", desc: "Your API key", required: true },
                ]}
                example={`curl "${base}/api/search?q=shape+of+you&api=YOUR_KEY"`}
                response={`{
  "results": [
    {
      "id": "JGwWNGJdvx8",
      "title": "Ed Sheeran - Shape of You",
      "duration": "3:53",
      "thumbnail": "https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg",
      "channel": "Ed Sheeran"
    }
  ]
}`}
                index={1}
              />
              <EndpointBlock
                method="GET"
                path="/api/song"
                description="Get an audio stream URL for a YouTube video"
                params={[
                  {
                    name: "query",
                    desc: "YouTube video ID (from search results)",
                    required: true,
                  },
                  { name: "api", desc: "Your API key", required: true },
                ]}
                example={`curl "${base}/api/song?query=JGwWNGJdvx8&api=YOUR_KEY"`}
                response={`{
  "stream": "${base}/api/stream/audio_JGwWNGJdvx8",
  "title": "Ed Sheeran - Shape of You",
  "duration": 233
}`}
                index={2}
              />
              <EndpointBlock
                method="GET"
                path="/api/video"
                description="Get a video stream URL for a YouTube video"
                params={[
                  {
                    name: "query",
                    desc: "YouTube video ID (from search results)",
                    required: true,
                  },
                  { name: "api", desc: "Your API key", required: true },
                ]}
                example={`curl "${base}/api/video?query=JGwWNGJdvx8&api=YOUR_KEY"`}
                response={`{
  "stream": "${base}/api/stream/video_JGwWNGJdvx8",
  "title": "Ed Sheeran - Shape of You",
  "duration": 233,
  "quality": "720p"
}`}
                index={3}
              />
              <EndpointBlock
                method="GET"
                path="/api/stream/{file_id}"
                description="Stream audio or video bytes, with optional EQ and seek"
                params={[
                  {
                    name: "token",
                    desc: "Short-lived token returned by /api/song or /api/video",
                    required: true,
                  },
                  { name: "api", desc: "Your API key", required: true },
                  {
                    name: "eq",
                    desc: "Equalizer preset (default: normal). See EQ Presets section.",
                    required: false,
                  },
                  {
                    name: "seek",
                    desc: "Seconds offset to start from (default: 0)",
                    required: false,
                  },
                  {
                    name: "download",
                    desc: "Set to true to force download Content-Disposition header",
                    required: false,
                  },
                ]}
                example={`curl "${base}/api/stream/audio_JGwWNGJdvx8?token=tok_xxx&eq=bass_boost&seek=30&api=YOUR_KEY" \\
  --output audio.mp3`}
                response={`# Returns raw audio/video bytes
# Content-Type: audio/mpeg (or video/mp4)
# Accept-Ranges: bytes
# Transfer-Encoding: chunked
# Cache-Control: no-cache`}
                index={4}
              />
            </section>

            {/* ── Rate Limits (visual bars) ── */}
            <section className="mb-14" data-ocid="docs.rate_limits.section">
              <SectionHeading
                id="rate-limits"
                title={t("docs.section_rate_limits")}
                subtitle="Limits reset daily at midnight UTC."
              />

              {/* Visual progress bars */}
              <div className="space-y-4 mb-8">
                {RATE_LIMIT_PLANS.map((plan, i) => (
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="bg-card border border-border rounded-lg px-5 py-4"
                    data-ocid={`docs.rate_limits.item.${i + 1}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-semibold text-sm text-foreground">
                          {plan.name}
                        </span>
                        <code className="text-[10px] font-mono text-primary/70">
                          {plan.prefix}
                        </code>
                      </div>
                      <span className="font-mono text-sm font-bold text-foreground tabular-nums">
                        {plan.isUnlimited ? "∞" : plan.limit}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${plan.isUnlimited ? "gradient-primary" : plan.color}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${plan.pct}%` }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{
                          duration: 1.2,
                          delay: i * 0.15,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              <p className="mt-3 text-xs text-muted-foreground font-body">
                Exceeding your daily limit returns a{" "}
                <code className="font-mono text-primary">429</code> error.
                Upgrade your plan for higher limits.{" "}
                <Link to="/pricing" className="text-primary hover:underline">
                  View pricing →
                </Link>
              </p>
            </section>

            {/* ── EQ Presets ── */}
            <section className="mb-14" data-ocid="docs.eq_presets.section">
              <SectionHeading
                id="eq-presets"
                title={t("docs.section_eq_presets")}
                subtitle="Pass any preset name as the eq parameter in /api/stream."
              />
              <p className="text-sm text-muted-foreground font-body leading-relaxed mb-5">
                Apply audio equalizer effects in real-time during streaming. Use
                the{" "}
                <code className="font-mono text-primary text-xs">
                  eq=preset_name
                </code>{" "}
                parameter. Default is{" "}
                <code className="font-mono text-primary text-xs">normal</code>.
              </p>
              <div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
                data-ocid="docs.eq_presets.grid"
              >
                {EQ_PRESETS.map((preset, i) => (
                  <EqPresetBadge
                    key={preset}
                    preset={preset}
                    delay={Math.min(i * 0.03, 0.6)}
                  />
                ))}
              </div>
            </section>

            {/* ── Code Examples ── */}
            <section className="mb-14" data-ocid="docs.code_examples.section">
              <SectionHeading
                id="code-examples"
                title={t("docs.section_code_examples")}
                subtitle="Full search → stream flow in your language."
              />

              {/* Language tabs with sliding indicator */}
              <div
                className="relative flex flex-wrap gap-1.5 mb-4"
                data-ocid="docs.code_examples.lang_tabs"
              >
                {CODE_LANGUAGES.map((lang) => (
                  <motion.button
                    key={lang}
                    type="button"
                    onClick={() => setCodeLang(lang)}
                    data-ocid={`docs.code_examples.tab.${lang.toLowerCase()}`}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className={`relative px-3 py-1.5 rounded-md text-xs font-mono transition-all duration-200 ${
                      codeLang === lang
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-muted/40 text-muted-foreground border border-border hover:text-foreground hover:border-primary/20"
                    }`}
                  >
                    {lang}
                    {codeLang === lang && (
                      <motion.div
                        layoutId="lang-indicator"
                        className="absolute inset-0 rounded-md border border-primary/30 bg-primary/10 -z-10"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              <CopyableCode
                lang={codeLang.toLowerCase()}
                code={CODE_EXAMPLES[codeLang]}
              />
            </section>


            {/* ── SDK Downloads ── */}
            <section className="mb-14" data-ocid="docs.sdk.section">
              <SectionHeading
                id="sdk"
                title="SDKs & Libraries"
                subtitle="Official client libraries for popular languages — zero boilerplate, typed responses."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {[
                  {
                    lang: "Python",
                    pkg: "biq-api",
                    install: "pip install biq-api",
                    usage: `from biq_api import BabiesIQ, _metadata

# SDK info
print(_metadata["version"])  # 2.0.0
print(_metadata["name"])     # biq-api

# Create client & search
client = BabiesIQ(api_key="biq_YOUR_KEY")
song = client.songs.search("Shape of You")
print(song.stream_url)`,
                    badge: "PyPI",
                    color: "from-blue-500/20 to-cyan-500/20",
                    border: "border-blue-500/25",
                    link: "https://github.com/BabiesIQ/_metaAPI/tree/main/sdk/python",
                    download: "https://github.com/BabiesIQ/_metaAPI/tree/main/sdk/python",
                  },
                  {
                    lang: "JavaScript / TypeScript",
                    pkg: "biq-api",
                    install: "npm install biq-api",
                    usage: `import { BabiesIQ, _metadata } from 'biq-api';

// SDK info
console.log(_metadata.version); // 2.0.0
console.log(_metadata.name);    // biq-api

// Create client & search
const client = new BabiesIQ({ apiKey: 'biq_YOUR_KEY' });
const song = await client.songs.search('Shape of You');
console.log(song.streamUrl);`,
                    badge: "npm",
                    color: "from-yellow-500/20 to-amber-500/20",
                    border: "border-yellow-500/25",
                    link: "https://github.com/BabiesIQ/_metaAPI/tree/main/sdk/javascript",
                    download: "https://github.com/BabiesIQ/_metaAPI/tree/main/sdk/javascript",
                  },
                  {
                    lang: "Go",
                    pkg: "github.com/BabiesIQ/biq-api-go",
                    install: "go get github.com/BabiesIQ/biq-api-go",
                    usage: `import babiesiq "github.com/BabiesIQ/biq-api-go"

// SDK info
fmt.Println(babiesiq.Metadata.Version) // 2.0.0
fmt.Println(babiesiq.Metadata.Name)    // biq-api

// Create client & search
client, _ := babiesiq.New("biq_YOUR_KEY")
song, _ := client.Songs.Search(ctx, "Shape of You", nil)
fmt.Println(song.StreamURL)`,
                    badge: "go get",
                    color: "from-cyan-500/20 to-teal-500/20",
                    border: "border-cyan-500/25",
                    link: "https://github.com/BabiesIQ/_metaAPI/tree/main/sdk/go",
                    download: "https://github.com/BabiesIQ/_metaAPI/tree/main/sdk/go",
                  },
                  {
                    lang: "PHP",
                    pkg: "babiesiq/biq-api",
                    install: "composer require babiesiq/biq-api",
                    usage: `use BabiesIQ\BabiesIQ;

// SDK info
echo BabiesIQ::$_metadata['version']; // 2.0.0
echo BabiesIQ::$_metadata['name'];    // biq-api

// Create client & search
$client = new BabiesIQ('biq_YOUR_KEY');
$song = $client->songs->search('Shape of You');
echo $song->streamUrl;`,
                    badge: "Composer",
                    color: "from-violet-500/20 to-purple-500/20",
                    border: "border-violet-500/25",
                    link: "https://github.com/BabiesIQ/_metaAPI/tree/main/sdk/php",
                    download: "https://github.com/BabiesIQ/_metaAPI/tree/main/sdk/php",
                  },
                ]
                ].map((sdk, i) => {
                  const [codeOpen, setCodeOpen] = [false, () => {}];
                  return (
                    <motion.div
                      key={sdk.lang}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-30px" }}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                      className={`rounded-xl border ${sdk.border} bg-gradient-to-br ${sdk.color} p-4 flex flex-col gap-3`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <LangIcon lang={sdk.lang} />
                          <div>
                            <h3 className="font-semibold text-sm text-foreground">{sdk.lang}</h3>
                            <span className="text-[10px] font-mono text-muted-foreground">{sdk.badge}</span>
                          </div>
                        </div>
                        <a
                          href={sdk.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors font-medium"
                        >
                          <Download className="w-3 h-3" />
                          Source
                        </a>
                      </div>
                      <CopyableCode code={sdk.install} lang="bash" />
                      <details className="group">
                        <summary className="text-[11px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none list-none flex items-center gap-1">
                          <Code2 className="w-3 h-3" />
                          Quick example
                          <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform duration-200" />
                        </summary>
                        <div className="mt-2">
                          <CopyableCode code={sdk.usage} lang={sdk.lang.toLowerCase().split("/")[0].trim()} />
                        </div>
                      </details>
                    </motion.div>
                  );
                })}
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  All SDKs are open source and maintained in the{" "}
                  <a href="https://github.com/BabiesIQ/_metaAPI" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    BabiesIQ/_metaAPI repository
                  </a>
                  . Community contributions welcome.
                </p>
              </div>
            </section>

            {/* ── CLI Tool ── */}
            <section className="mb-14" data-ocid="docs.cli.section">
              <SectionHeading
                id="cli"
                title="CLI Tool"
                subtitle="Use BabiesIQ directly from your terminal — search, download, and stream without writing any code."
              />
              <div className="mb-5 rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground ml-2">Terminal</span>
                </div>
                <div className="p-4 space-y-4">
                  {[
                    {
                      title: "Install",
                      code: `# Using Go (recommended)
go install github.com/BabiesIQ/_metaAPI/cli@latest

# Or clone and build manually
git clone https://github.com/BabiesIQ/_metaAPI.git
cd web/cli && go build -o babiesiq .`,
                    },
                    {
                      title: "Configure",
                      code: `# Set your API key (stored in ~/.babiesiq/config.json)
babiesiq config set api-key YOUR_API_KEY

# Or use environment variable
export BABIESIQ_API_KEY=YOUR_API_KEY`,
                    },
                    {
                      title: "Search & Download",
                      code: `# Search for a song
babiesiq search "shape of you"

# Download audio (MP3)
babiesiq song "shape of you" --download --out ./music/

# Apply EQ preset while downloading
babiesiq song JGwWNGJdvx8 --eq bass_boost --download

# Search for a video and download
babiesiq video "lofi hip hop" --download

# Generate a YouTube thumbnail (design 1-20)
babiesiq thumbnail JGwWNGJdvx8 --design 5 --out ./thumbs/`,
                    },
                    {
                      title: "Streaming",
                      code: `# Get stream URL (prints to stdout)
babiesiq song "shape of you" --stream-url

# Play directly with mpv/ffplay
babiesiq song "shape of you" --stream-url | xargs mpv

# Pipe to ffmpeg for transcoding
babiesiq song JGwWNGJdvx8 --stream-url | xargs ffmpeg -i - output.ogg`,
                    },
                  ].map((item) => (
                    <div key={item.title}>
                      <p className="text-[10px] font-mono text-primary uppercase tracking-widest mb-1.5">
                        # {item.title}
                      </p>
                      <CopyableCode code={item.code} lang="bash" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: Terminal, title: "Cross-platform", desc: "Works on macOS, Linux, and Windows (WSL)" },
                  { icon: Zap, title: "Fast", desc: "Native Go binary — starts in <10ms, no runtime needed" },
                  { icon: Key, title: "Secure", desc: "API key stored locally, never transmitted beyond BabiesIQ API" },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="rounded-lg border border-border bg-muted/20 p-3.5 flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Try It ── */}
            <section className="mb-14" data-ocid="docs.try_it.section">
              <SectionHeading
                id="try-it"
                title={t("docs.section_try_it")}
                subtitle="Make a real API request directly from the browser."
              />
              <TryItWidget />
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
