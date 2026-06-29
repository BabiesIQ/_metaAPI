import { useState } from "react";
import { motion } from "motion/react";
import {
  Copy,
  Check,
  Download,
  ExternalLink,
  Terminal,
  BookOpen,
  Package,
  GitBranch,
  Upload,
  ChevronRight,
  Zap,
  Shield,
  Globe,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/Layout";

// ─── Language Icons ───────────────────────────────────────────────────────────
function PythonIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.914 0C5.82 0 6.2 2.656 6.2 2.656l.007 2.752h5.814v.826H3.9S0 5.789 0 11.969c0 6.18 3.403 5.963 3.403 5.963h2.031v-2.867s-.109-3.403 3.347-3.403h5.765s3.236.052 3.236-3.127V3.204S18.28 0 11.914 0zm-3.21 1.853a1.043 1.043 0 1 1 0 2.087 1.044 1.044 0 0 1 0-2.087z" fill="#3776AB"/>
      <path d="M12.086 24c6.094 0 5.714-2.656 5.714-2.656l-.007-2.752h-5.814v-.826h8.121S24 18.211 24 12.031c0-6.18-3.403-5.963-3.403-5.963h-2.031v2.867s.109 3.403-3.347 3.403H9.454s-3.236-.052-3.236 3.127v5.331S5.72 24 12.086 24zm3.21-1.853a1.043 1.043 0 1 1 0-2.087 1.044 1.044 0 0 1 0 2.087z" fill="#FFD43B"/>
    </svg>
  );
}

function JSIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="2" fill="#F7DF1E"/>
      <path d="M6.235 17.234l1.621-.981c.313.555.597.925 1.204.925.581 0 .95-.228.95-.925V9.897h1.994v6.397c0 1.534-.899 2.234-2.211 2.234-1.185 0-1.872-.613-2.228-1.294zm4.824-.24l1.621-.981c.399.654.921 1.134 1.844 1.134.777 0 1.277-.389 1.277-.932 0-.647-.512-.877-1.376-1.254l-.47-.201c-1.363-.58-2.267-1.31-2.267-2.855 0-1.42 1.083-2.5 2.775-2.5 1.206 0 2.071.419 2.692 1.516l-1.55.994c-.323-.578-.674-.803-1.142-.803-.52 0-.852.33-.852.803 0 .561.331.79 1.1 1.135l.47.201c1.607.688 2.512 1.39 2.512 2.967 0 1.698-1.334 2.636-3.127 2.636-1.754 0-2.886-.832-3.434-1.86z" fill="#323330"/>
    </svg>
  );
}

function GoIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M1.811 10.231c-.047 0-.058-.023-.035-.059l.246-.315c.023-.035.081-.058.128-.058h4.172c.046 0 .058.035.035.07l-.199.303c-.023.036-.082.07-.117.07zm-.177 1.082c-.047 0-.059-.023-.035-.058l.245-.316c.023-.035.082-.058.129-.058h5.328c.047 0 .07.035.059.07l-.093.28c-.012.047-.059.07-.105.07zm2.828 1.075c-.047 0-.059-.035-.035-.07l.163-.292c.023-.035.07-.07.117-.07h2.337c.047 0 .07.035.07.082l-.023.28c0 .047-.047.082-.082.082z" fill="#00ADD8"/>
      <path d="M19.753 11.143c-.745.186-1.257.327-1.99.514-.186.046-.198.058-.362-.117-.187-.198-.327-.327-.607-.444-.817-.397-1.608-.28-2.343.164-.876.537-1.327 1.35-1.304 2.38.023.98.679 1.795 1.655 1.913.817.105 1.514-.175 2.061-.7.105-.105.198-.222.315-.362h-2.225c-.245 0-.303-.152-.222-.35.152-.362.432-1.003.596-1.319.047-.105.152-.28.362-.28h4.793c-.058.585-.058 1.157-.152 1.716-.269 1.716-1.003 3.198-2.237 4.423-1.979 1.96-4.363 2.647-7.07 2.157-2.45-.444-4.22-1.842-5.235-4.07-.94-2.04-.69-4.14.315-6.04 1.074-2.051 2.694-3.38 5.012-3.79 1.876-.328 3.674-.023 5.247 1.015.77.503 1.327 1.191 1.702 2.017.094.163.07.222-.093.257z" fill="#00ADD8"/>
    </svg>
  );
}

function PHPIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="12" cy="12" rx="12" ry="6.5" fill="#777BB4"/>
      <path d="M5.996 14.577l.668-3.417h1.32c.74 0 1.262.197 1.568.59.306.392.386.937.24 1.633-.148.696-.439 1.246-.874 1.65-.435.403-.967.606-1.596.606H6.34l-.344-.01zm1.388-1.42l.343-.001c.25 0 .467-.09.65-.27.183-.18.307-.435.374-.766.064-.302.046-.534-.052-.694-.098-.16-.274-.24-.527-.24h-.37l-.418 1.971zm3.348 1.42l.667-3.417h.88l-.136.698h.36c.496 0 .853.088 1.07.264.217.175.29.45.219.824-.076.388-.261.69-.554.903-.292.213-.647.32-1.063.32l-.344-.001-.185.41h-.914zm1.175-1.01l.12-.583h.283c.218 0 .37.03.454.09.085.06.114.16.088.302-.026.137-.09.238-.19.302-.1.063-.242.095-.425.095l-.33-.001-.009-.205zm2.44 1.01l.668-3.417h.88l-.136.698h.36c.495 0 .852.088 1.07.264.216.175.29.45.218.824-.075.388-.26.69-.553.903-.293.213-.647.32-1.063.32l-.344-.001-.185.41h-.915zm1.176-1.01l.12-.583h.283c.217 0 .37.03.454.09.084.06.113.16.087.302-.025.137-.09.238-.19.302-.1.063-.24.095-.424.095l-.33-.001-.009-.205z" fill="#fff"/>
    </svg>
  );
}

// ─── Copy button ──────────────────────────────────────────────────────────────
function CopyBtn({ text, className = "" }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`flex items-center gap-1.5 text-[11px] font-mono transition-colors duration-200 ${copied ? "text-primary" : "text-muted-foreground hover:text-foreground"} ${className}`}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function InstallBlock({ cmd }: { cmd: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm">
      <span className="text-muted-foreground select-none mr-1">$</span>
      <span className="flex-1 text-foreground">{cmd}</span>
      <CopyBtn text={cmd} />
    </div>
  );
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  return (
    <div className="relative rounded-lg border border-border bg-background overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{lang}</span>
        <CopyBtn text={code} />
      </div>
      <pre className="text-xs font-mono text-foreground/85 overflow-x-auto p-4 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ─── SDK data ─────────────────────────────────────────────────────────────────
const SDKS = [
  {
    id: "python",
    label: "Python",
    Icon: PythonIcon,
    badge: "PyPI",
    pkg: "biq-api",
    install: "pip install biq-api",
    importNote: "Import stays `from babiesiq import BabiesIQ` — the module name is unchanged.",
    color: "from-blue-500/10 to-cyan-500/10",
    border: "border-blue-500/20",
    accent: "text-blue-400",
    version: "2.0.0",
    link: "https://github.com/BabiesIQ/web/tree/main/sdk/python",
    usage: `from babiesiq import BabiesIQ

client = BabiesIQ(api_key="YOUR_KEY")

# Search
results = client.search("shape of you")
print(results[0]["title"])

# Get audio stream URL
song = client.song(results[0]["id"])
print(song["stream"])

# With EQ preset
song_eq = client.song(results[0]["id"], eq="bass_boost")
print(song_eq["stream"])`,
  },
  {
    id: "javascript",
    label: "JavaScript / TypeScript",
    Icon: JSIcon,
    badge: "npm",
    pkg: "babiesiq",
    install: "npm install babiesiq",
    importNote: "Full TypeScript support with typed responses out of the box.",
    color: "from-yellow-500/10 to-amber-500/10",
    border: "border-yellow-500/20",
    accent: "text-yellow-400",
    version: "2.0.0",
    link: "https://github.com/BabiesIQ/web/tree/main/sdk/javascript",
    usage: `import { BabiesIQ } from 'babiesiq';

const client = new BabiesIQ({ apiKey: 'YOUR_KEY' });

// Search
const results = await client.search('shape of you');
console.log(results[0].title);

// Get audio stream
const { stream } = await client.song(results[0].id);
console.log(stream);

// With EQ preset
const boosted = await client.song(results[0].id, { eq: 'bass_boost' });
console.log(boosted.stream);`,
  },
  {
    id: "go",
    label: "Go",
    Icon: GoIcon,
    badge: "go get",
    pkg: "github.com/BabiesIQ/babiesiq-sdk-go",
    install: "go get github.com/BabiesIQ/babiesiq-sdk-go",
    importNote: "Zero external dependencies. Compatible with Go 1.21+.",
    color: "from-cyan-500/10 to-teal-500/10",
    border: "border-cyan-500/20",
    accent: "text-cyan-400",
    version: "2.0.0",
    link: "https://github.com/BabiesIQ/web/tree/main/sdk/go",
    usage: `import babiesiq "github.com/BabiesIQ/babiesiq-sdk-go"

client := babiesiq.New("YOUR_KEY")

// Search
results, err := client.Search("shape of you")
if err != nil { log.Fatal(err) }
fmt.Println(results[0].Title)

// Get audio stream
song, err := client.Song(results[0].ID)
fmt.Println(song.Stream)

// With EQ preset
song, _ = client.SongWithEQ(results[0].ID, "bass_boost")
fmt.Println(song.Stream)`,
  },
  {
    id: "php",
    label: "PHP",
    Icon: PHPIcon,
    badge: "Composer",
    pkg: "babiesiq/babiesiq-php",
    install: "composer require babiesiq/babiesiq-php",
    importNote: "Requires PHP 8.0+ and Composer. PSR-4 autoloading.",
    color: "from-violet-500/10 to-purple-500/10",
    border: "border-violet-500/20",
    accent: "text-violet-400",
    version: "2.0.0",
    link: "https://github.com/BabiesIQ/web/tree/main/sdk/php",
    usage: `use BabiesIQ\\BabiesIQ;

$client = new BabiesIQ('YOUR_KEY');

// Search
$results = $client->search('shape of you');
echo $results[0]['title'];

// Get audio stream
$song = $client->song($results[0]['id']);
echo $song['stream'];

// With EQ preset
$boosted = $client->song($results[0]['id'], ['eq' => 'bass_boost']);
echo $boosted['stream'];`,
  },
];

const PUBLISH_STEPS = [
  {
    step: "01",
    title: "PyPI account banao",
    desc: 'pypi.org par account create karo aur API token generate karo "Account Settings" se.',
    code: "# PyPI par jaake account banao\n# pypi.org/account/register/",
  },
  {
    step: "02",
    title: "Build tools install karo",
    desc: "Package build aur upload ke liye required tools install karo.",
    code: "pip install build twine",
  },
  {
    step: "03",
    title: "Package build karo",
    desc: "sdk/python/ folder mein jaake build command run karo.",
    code: "cd sdk/python\npython -m build\n# dist/ folder create hoga",
  },
  {
    step: "04",
    title: "PyPI par upload karo",
    desc: "Twine se dist/ folder ko PyPI par upload karo. Token maangega.",
    code: "twine upload dist/*\n# Username: __token__\n# Password: pypi-YOUR_TOKEN",
  },
  {
    step: "05",
    title: "GitHub Actions se automate karo (recommended)",
    desc: "Tag push karne par automatically publish ho — manual steps ki zaroorat nahi.",
    code: `# .github/workflows/publish-python.yml
name: Publish Python SDK
on:
  push:
    tags: ['sdk-python-v*']
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
      - run: pip install build twine
      - run: python -m build
        working-directory: sdk/python
      - run: twine upload dist/*
        working-directory: sdk/python
        env:
          TWINE_USERNAME: __token__
          TWINE_PASSWORD: \${{ secrets.PYPI_TOKEN }}`,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export function SdkPage() {
  const [activeSDK, setActiveSDK] = useState("python");
  const sdk = SDKS.find((s) => s.id === activeSDK)!;

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* ── Hero ── */}
        <motion.div
          className="border-b border-border bg-card/60 px-6 py-14"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-mono text-primary uppercase tracking-widest">
                SDKs &amp; CLI
              </span>
            </div>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-3">
              Official Client Libraries
            </h1>
            <p className="text-sm text-muted-foreground font-body max-w-xl mb-8 leading-relaxed">
              Typed, zero-boilerplate SDKs for Python, JavaScript, Go, and PHP.
              Plus a native CLI for terminal-based workflows.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { icon: Shield, text: "MIT Licensed" },
                { icon: Globe, text: "Open Source" },
                { icon: Zap, text: "v2.0.0" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground font-body border border-border rounded-full px-3 py-1"
                >
                  <Icon className="w-3 h-3 text-primary" />
                  {text}
                </div>
              ))}
              <a
                href="https://github.com/BabiesIQ/web/tree/main/sdk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-primary border border-primary/30 rounded-full px-3 py-1 hover:bg-primary/5 transition-colors"
              >
                <GitBranch className="w-3 h-3" />
                View on GitHub
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </motion.div>

        <div className="max-w-5xl mx-auto px-6 py-10 space-y-14">
          {/* ── SDK Tabs ── */}
          <section>
            <h2 className="font-display font-bold text-xl text-foreground mb-6">
              Choose your language
            </h2>

            {/* Tab bar */}
            <div className="flex flex-wrap gap-2 mb-8">
              {SDKS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSDK(s.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-display font-medium transition-all duration-200 ${
                    activeSDK === s.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  <s.Icon className="w-4 h-4" />
                  {s.label}
                </button>
              ))}
            </div>

            {/* SDK card */}
            <motion.div
              key={activeSDK}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`rounded-2xl border ${sdk.border} bg-gradient-to-br ${sdk.color} p-6`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-background/60 border border-border flex items-center justify-center">
                    <sdk.Icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-foreground">
                      {sdk.label} SDK
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] font-mono px-2 py-0 border-border">
                        {sdk.badge}
                      </Badge>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        v{sdk.version}
                      </span>
                    </div>
                  </div>
                </div>
                <a
                  href={sdk.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 text-[11px] font-medium ${sdk.accent} hover:opacity-80 transition-opacity`}
                >
                  <Download className="w-3.5 h-3.5" />
                  Source
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Install */}
              <div className="mb-5">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">
                  Install
                </p>
                <InstallBlock cmd={sdk.install} />
                {sdk.importNote && (
                  <p className="text-[11px] text-muted-foreground font-body mt-2 pl-1">
                    {sdk.importNote}
                  </p>
                )}
              </div>

              {/* Package name */}
              <div className="mb-5 flex items-center gap-3 text-xs font-mono">
                <span className="text-muted-foreground">Package:</span>
                <code className={`${sdk.accent} bg-background/50 px-2 py-0.5 rounded`}>
                  {sdk.pkg}
                </code>
              </div>

              {/* Usage */}
              <div>
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">
                  Quick Example
                </p>
                <CodeBlock code={sdk.usage} lang={sdk.label.toLowerCase().split("/")[0].trim()} />
              </div>
            </motion.div>
          </section>

          {/* ── All SDKs overview ── */}
          <section>
            <h2 className="font-display font-bold text-xl text-foreground mb-2">
              All packages at a glance
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              One command to get started in any language.
            </p>
            <div className="space-y-3">
              {SDKS.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.07 }}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3 sm:w-40 shrink-0">
                    <s.Icon className="w-6 h-6" />
                    <div>
                      <p className="text-sm font-display font-semibold text-foreground">
                        {s.label}
                      </p>
                      <p className="text-[10px] font-mono text-muted-foreground">{s.badge}</p>
                    </div>
                  </div>
                  <div className="flex-1 font-mono text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                    <span className="text-primary/60 mr-2">$</span>
                    {s.install}
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSDK(s.id)}
                    className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors shrink-0"
                  >
                    View details
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── CLI ── */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Terminal className="w-5 h-5 text-primary" />
              <h2 className="font-display font-bold text-xl text-foreground">CLI Tool</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Native Go binary — search, stream, and download from your terminal. No runtime needed.
            </p>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground ml-2">Terminal</span>
              </div>
              <div className="p-5 space-y-5">
                {[
                  {
                    label: "Install",
                    code: `# Using Go (recommended)\ngo install github.com/BabiesIQ/web/cli@latest\n\n# Or clone and build\ngit clone https://github.com/BabiesIQ/web.git\ncd web/cli && go build -o babiesiq .`,
                  },
                  {
                    label: "Configure",
                    code: `babiesiq config set api-key YOUR_API_KEY\n# Or via env var\nexport BABIESIQ_API_KEY=YOUR_API_KEY`,
                  },
                  {
                    label: "Use",
                    code: `babiesiq search "shape of you"\nbabiesiq song "shape of you" --download --out ./music/\nbabiesiq song JGwWNGJdvx8 --eq bass_boost --stream-url | xargs mpv\nbabiesiq thumbnail JGwWNGJdvx8 --design 5 --out ./thumbs/`,
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-[10px] font-mono text-primary uppercase tracking-widest mb-2">
                      # {item.label}
                    </p>
                    <CodeBlock code={item.code} lang="bash" />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Globe className="w-3.5 h-3.5 text-primary" />
                Cross-platform — macOS, Linux, Windows (WSL)
              </div>
              <a
                href="https://github.com/BabiesIQ/web/tree/main/cli"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors"
              >
                Source <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </section>

          {/* ── How to publish ── */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-5 h-5 text-primary" />
              <h2 className="font-display font-bold text-xl text-foreground">
                Package ko Public kaise karein?
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Automatically publish nahi hota — ek baar manually setup karna hoga. Phir GitHub Actions se automate kar sakte ho.
            </p>
            <div className="mb-8 flex gap-3 p-4 rounded-lg border border-primary/20 bg-primary/5">
              <BookOpen className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Python (PyPI):</strong> Package name{" "}
                <code className="font-mono text-primary text-[11px]">biq-api</code> already available hai. Niche ke steps follow karo.
                JavaScript ke liye npm, Go ke liye pkg.go.dev (automatic), PHP ke liye Packagist.
              </p>
            </div>

            <div className="space-y-4">
              {PUBLISH_STEPS.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.35, delay: i * 0.07 }}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  <div className="flex items-start gap-4 p-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[11px] font-mono font-bold text-primary">{step.step}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-sm text-foreground mb-1">
                        {step.title}
                      </h3>
                      <p className="text-xs text-muted-foreground font-body mb-3 leading-relaxed">
                        {step.desc}
                      </p>
                      <CodeBlock code={step.code} lang="bash" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  title: "npm (JavaScript)",
                  cmd: "npm login && npm publish",
                  link: "https://www.npmjs.com",
                  note: "npmjs.com par account banao",
                },
                {
                  title: "Go (pkg.go.dev)",
                  cmd: "git tag sdk-go-v2.0.0 && git push --tags",
                  link: "https://pkg.go.dev",
                  note: "Automatic — tag push karo, Go proxy index karta hai",
                },
                {
                  title: "Packagist (PHP)",
                  cmd: "# packagist.org par repo link karo",
                  link: "https://packagist.org",
                  note: "GitHub repo connect karo, auto-sync hota hai",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-border bg-muted/20 p-4"
                >
                  <h4 className="font-display font-semibold text-xs text-foreground mb-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mb-3">{item.note}</p>
                  <div className="font-mono text-[11px] text-muted-foreground bg-background rounded px-3 py-2">
                    {item.cmd}
                  </div>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] text-primary mt-2 hover:underline"
                  >
                    {item.link.replace("https://", "")}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* ── CTA ── */}
          <section className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
            <h2 className="font-display font-bold text-2xl text-foreground mb-3">
              Ready to build?
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Get your API key, pick your SDK, and start streaming in minutes.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/signup">
                <Button className="gradient-primary text-white font-display font-semibold gap-2">
                  Get API Key
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/docs">
                <Button variant="outline" className="font-display font-semibold gap-2">
                  <BookOpen className="w-4 h-4" />
                  Full Docs
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
