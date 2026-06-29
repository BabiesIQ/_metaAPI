import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Eye, Pin, Megaphone, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import {
  ALLOWED_REACTIONS,
  fetchAnnouncements,
  fetchAnnouncementById,
  getUserReactions,
  reactToAnnouncement,
  type ReactionEmoji,
} from "@/lib/channel-api";
import type { AnnouncementListItem } from "@/types/announcements";

function BlueTick({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-label="Verified">
      <circle cx="10" cy="10" r="10" fill="#2196F3" />
      <path d="M5.5 10.5L8.5 13.5L14.5 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatDate(d: string | Date): string {
  const date = new Date(d);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ═══════════════════════════════════════════════════════════════
// Syntax Highlighter — VS Code Dark+ palette, zero deps
// ═══════════════════════════════════════════════════════════════

const COLORS: Record<string, string> = {
  comment:   "#6A9955", // green
  string:    "#CE9178", // orange
  keyword:   "#C792EA", // purple
  type:      "#4EC9B0", // cyan
  number:    "#B5CEA8", // light green
  func:      "#DCDCAA", // yellow
  variable:  "#9CDCFE", // light blue
  operator:  "#89DDFF", // bright cyan
  builtin:   "#82AAFF", // blue
  decorator: "#82AAFF", // blue/violet
};

function ESC(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

type Rule = [string, RegExp]; // [tokenType, stickyRegex]

function mk(rules: Array<[string, string | RegExp]>): Rule[] {
  return rules.map(([t, re]) => [t, new RegExp(typeof re === "string" ? re : re.source, "y")] as Rule);
}

const RULES: Record<string, Rule[]> = {
  python: mk([
    ["comment",   /#[^\n]*/],
    ["string",    /"""[\s\S]*?"""|'''[\s\S]*?'''|[bBfFrRuU]{0,2}"(?:[^"\\]|\\.)*"|[bBfFrRuU]{0,2}'(?:[^'\\]|\\.)*'/],
    ["decorator", /@\w+/],
    ["keyword",   /\b(?:def|class|import|from|return|if|elif|else|for|while|try|except|finally|with|as|in|not|and|or|is|None|True|False|pass|break|continue|lambda|yield|async|await|raise|del|global|nonlocal|assert)\b/],
    ["type",      /\b(?:int|str|list|dict|tuple|set|bool|float|bytes|complex|frozenset|type|object|Any|Optional|Union|List|Dict|Tuple|Set)\b/],
    ["builtin",   /\b(?:print|len|range|isinstance|issubclass|hasattr|getattr|setattr|open|super|zip|map|filter|enumerate|sorted|reversed|sum|min|max|abs|round|repr|input|vars|dir|id|hash|hex|bin|oct|next|iter)\b/],
    ["func",      /\b[a-zA-Z_]\w*(?=\s*\()/],
    ["number",    /\b(?:0x[0-9a-fA-F]+|0o[0-7]+|0b[01]+|\d+\.?\d*(?:[eE][+-]?\d+)?[jJ]?)\b/],
    ["operator",  /[+\-*/%=<>!&|^~@]+|[,:.]/],
  ]),

  go: mk([
    ["comment",   /\/\/[^\n]*|\/\*[\s\S]*?\*\//],
    ["string",    /`[\s\S]*?`|"(?:[^"\\]|\\.)*"/],
    ["keyword",   /\b(?:func|var|const|type|struct|interface|map|chan|go|defer|return|if|else|for|range|switch|case|default|break|continue|import|package|select|fallthrough|goto)\b/],
    ["type",      /\b(?:string|int|int8|int16|int32|int64|uint|uint8|uint16|uint32|uint64|uintptr|float32|float64|complex64|complex128|bool|byte|rune|error|any)\b/],
    ["builtin",   /\b(?:make|new|len|cap|append|copy|delete|close|panic|recover|print|println)\b/],
    ["func",      /\b[a-zA-Z_]\w*(?=\s*\()/],
    ["number",    /\b(?:0x[0-9a-fA-F]+|\d+\.?\d*(?:[eE][+-]?\d+)?i?)\b/],
    ["operator",  /[:=<>!+\-*\/&|^%]+|[,;.]/],
  ]),

  bash: mk([
    ["comment",   /#[^\n]*/],
    ["string",    /"(?:[^"\\]|\\.)*"|'[^']*'/],
    ["variable",  /\$\{[^}]*\}|\$[a-zA-Z_][a-zA-Z0-9_]*|\$\d+|\$[@#?!*$]/],
    ["keyword",   /\b(?:if|then|else|elif|fi|for|do|done|while|until|case|esac|function|return|exit|in|select|break|continue|local|readonly|shift|trap)\b/],
    ["builtin",   /\b(?:echo|printf|read|export|source|cd|ls|grep|awk|sed|curl|wget|git|mkdir|rm|rmdir|cp|mv|cat|head|tail|find|chmod|chown|sudo|apt|npm|pip|go|python|python3|node|bash|sh|touch|xargs)\b/],
    ["func",      /\b[a-zA-Z_]\w*(?=\s*\()/],
    ["operator",  /--?[a-zA-Z][a-zA-Z0-9_-]*/],
    ["number",    /\b\d+\b/],
  ]),

  javascript: mk([
    ["comment",   /\/\/[^\n]*|\/\*[\s\S]*?\*\//],
    ["string",    /`(?:[^`\\]|\\.)*`|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/],
    ["decorator", /@\w+/],
    ["keyword",   /\b(?:const|let|var|function|return|if|else|for|while|do|class|import|export|from|default|async|await|try|catch|finally|new|this|typeof|instanceof|void|null|undefined|true|false|throw|extends|implements|super|switch|case|break|continue|of|in|delete|yield|static|get|set)\b/],
    ["type",      /\b(?:string|number|boolean|any|void|never|unknown|object|Array|Promise|Record|Map|Set|Symbol|BigInt|Error|Object|Function|Date|RegExp|HTMLElement|Event|React)\b/],
    ["builtin",   /\b(?:console|Math|JSON|parseInt|parseFloat|isNaN|isFinite|setTimeout|clearTimeout|setInterval|clearInterval|fetch|document|window|process|require|module|exports|localStorage|sessionStorage)\b/],
    ["func",      /\b[a-zA-Z_$]\w*(?=\s*\()/],
    ["number",    /\b(?:0x[0-9a-fA-F]+|0o[0-7]+|0b[01]+|\d+\.?\d*(?:[eE][+-]?\d+)?n?)\b/],
    ["operator",  /[=<>!+\-*\/&|^%?:]+|[.,;]/],
  ]),

  rust: mk([
    ["comment",   /\/\/[^\n]*|\/\*[\s\S]*?\*\//],
    ["string",    /r#*"[\s\S]*?"#*|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/],
    ["decorator", /#\[[\s\S]*?\]/],
    ["keyword",   /\b(?:fn|let|mut|const|static|struct|enum|impl|trait|for|if|else|while|loop|match|return|use|mod|pub|crate|super|self|Self|where|type|async|await|move|ref|Box|Option|Result|Some|None|Ok|Err|true|false)\b/],
    ["type",      /\b(?:i8|i16|i32|i64|i128|isize|u8|u16|u32|u64|u128|usize|f32|f64|bool|char|str|String|Vec|HashMap|HashSet)\b/],
    ["builtin",   /\b(?:println|print|eprintln|eprint|format|panic|assert|assert_eq|assert_ne|todo|unimplemented|unreachable|dbg)\b/],
    ["func",      /\b[a-zA-Z_]\w*(?=\s*\()/],
    ["number",    /\b(?:0x[0-9a-fA-F_]+|0o[0-7_]+|0b[01_]+|\d[\d_]*\.?[\d_]*(?:[eE][+-]?\d+)?(?:i8|i16|i32|i64|i128|isize|u8|u16|u32|u64|u128|usize|f32|f64)?)\b/],
    ["operator",  /[=<>!+\-*\/&|^%?:]+|[.,;]/],
  ]),
};

RULES["typescript"] = RULES["javascript"];
RULES["ts"]         = RULES["javascript"];
RULES["js"]         = RULES["javascript"];
RULES["jsx"]        = RULES["javascript"];
RULES["tsx"]        = RULES["javascript"];
RULES["sh"]         = RULES["bash"];
RULES["shell"]      = RULES["bash"];
RULES["zsh"]        = RULES["bash"];
RULES["py"]         = RULES["python"];
RULES["rs"]         = RULES["rust"];

function applyRules(code: string, rules: Rule[]): string {
  let out = "";
  let i = 0;
  while (i < code.length) {
    let matched = false;
    for (const [type, re] of rules) {
      re.lastIndex = i;
      const m = re.exec(code);
      if (m) {
        const color = COLORS[type] ?? "#E2E8F0";
        out += `<span style="color:${color}">${ESC(m[0])}</span>`;
        i += m[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      out += ESC(code[i]);
      i++;
    }
  }
  return out;
}

function highlightCode(code: string, lang: string): string {
  const rules = RULES[lang];
  if (!rules) return ESC(code);
  return applyRules(code, rules);
}

// Language badge metadata
const LANG_META: Record<string, { label: string; bg: string; color: string }> = {
  python:     { label: "Python",     bg: "#3776AB", color: "#FFD43B" },
  py:         { label: "Python",     bg: "#3776AB", color: "#FFD43B" },
  go:         { label: "Go",         bg: "#00ADD8", color: "#fff"    },
  javascript: { label: "JavaScript", bg: "#F7DF1E", color: "#323330" },
  js:         { label: "JavaScript", bg: "#F7DF1E", color: "#323330" },
  jsx:        { label: "JSX",        bg: "#F7DF1E", color: "#323330" },
  typescript: { label: "TypeScript", bg: "#3178C6", color: "#fff"    },
  ts:         { label: "TypeScript", bg: "#3178C6", color: "#fff"    },
  tsx:        { label: "TSX",        bg: "#3178C6", color: "#fff"    },
  bash:       { label: "Bash",       bg: "#4EAA25", color: "#fff"    },
  sh:         { label: "Shell",      bg: "#4EAA25", color: "#fff"    },
  shell:      { label: "Shell",      bg: "#4EAA25", color: "#fff"    },
  zsh:        { label: "Zsh",        bg: "#4EAA25", color: "#fff"    },
  rust:       { label: "Rust",       bg: "#CE412B", color: "#fff"    },
  rs:         { label: "Rust",       bg: "#CE412B", color: "#fff"    },
  json:       { label: "JSON",       bg: "#555",    color: "#FFD700" },
  yaml:       { label: "YAML",       bg: "#CB171E", color: "#fff"    },
  sql:        { label: "SQL",        bg: "#F29111", color: "#fff"    },
  html:       { label: "HTML",       bg: "#E34F26", color: "#fff"    },
  css:        { label: "CSS",        bg: "#1572B6", color: "#fff"    },
};

function buildCodeBlock(lang: string, code: string): string {
  const l = lang.toLowerCase();
  const meta = LANG_META[l];
  const highlighted = highlightCode(code, l);
  const badge = meta
    ? `<span class="md-lang-badge" style="background:${meta.bg};color:${meta.color}">${meta.label}</span>`
    : lang
    ? `<span class="md-lang-badge" style="background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.5)">${lang}</span>`
    : "";
  return `<div class="md-pre-wrap">${badge}<pre class="md-pre"><code>${highlighted}</code></pre></div>`;
}

// ═══════════════════════════════════════════════════════════════
// Markdown renderer
// ═══════════════════════════════════════════════════════════════
function renderMarkdown(md: string): string {
  return md
    // Fenced code blocks — must be first
    .replace(/```(\w*)\n?([\s\S]*?)```/g, (_m, lang, code) => buildCodeBlock(lang, code.trim()))
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="md-code">$1</code>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="md-hr" />')
    // Headings
    .replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="md-h1">$1</h1>')
    // Bold + Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote class="md-blockquote">$1</blockquote>')
    // Unordered list
    .replace(/^- (.+)$/gm, '<li class="md-li">$1</li>')
    .replace(/(<li[\s\S]*?<\/li>(\n|$))+/g, (m) => `<ul class="md-ul">${m}</ul>`)
    // Ordered list
    .replace(/^\d+\. (.+)$/gm, '<li class="md-li">$1</li>')
    // Table
    .replace(/(\|.+\|\n\|[-| :]+\|\n(\|.+\|\n?)+)/g, (table) => {
      const rows = table.trim().split("\n").filter((r) => !r.match(/^\|[-| :]+\|$/));
      const [header, ...body] = rows;
      const th = (header ?? "").split("|").filter(Boolean).map((c) => `<th class="md-th">${c.trim()}</th>`).join("");
      const trs = body.map((r) => {
        const tds = r.split("|").filter(Boolean).map((c) => `<td class="md-td">${c.trim()}</td>`).join("");
        return `<tr>${tds}</tr>`;
      }).join("");
      return `<table class="md-table"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`;
    })
    // Paragraphs
    .replace(/\n\n(?!<)/g, '</p><p class="md-p">')
    .replace(/\n(?!<)/g, "<br />")
    .replace(/^([^<])/, '<p class="md-p">$1')
    .replace(/([^>])$/, "$1</p>");
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <div
      className="md-root text-sm text-white/75 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// PostCard
// ═══════════════════════════════════════════════════════════════
type PostState = AnnouncementListItem & { reactions?: Record<string, number> };

function PostCard({ ann, onReact }: {
  ann: PostState;
  onReact: (id: number, emoji: ReactionEmoji) => void;
}) {
  const userReactions = getUserReactions(ann.id);
  const reactions = ann.reactions ?? {};
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [viewCount, setViewCount] = useState(ann.view_count ?? 0);

  const handleExpand = useCallback(async () => {
    if (!expanded && content === null) {
      setLoadingContent(true);
      const full = await fetchAnnouncementById(ann.id);
      if (full) {
        setContent(full.content ?? "");
        setViewCount(full.view_count ?? 0);
      }
      setLoadingContent(false);
    }
    setExpanded((v) => !v);
  }, [expanded, content, ann.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm"
          style={{ background: "linear-gradient(135deg,#a855f7 0%,#ec4899 60%,#3b82f6 100%)", boxShadow: "0 0 14px rgba(168,85,247,.45)" }}
        >B</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-white">BabiesIQ</span>
            <BlueTick className="w-3.5 h-3.5" />
            {ann.pinned && (
              <span className="flex items-center gap-1 text-[10px] text-purple-300 bg-purple-500/15 px-1.5 py-0.5 rounded-full border border-purple-500/25">
                <Pin className="w-2.5 h-2.5" /> Pinned
              </span>
            )}
          </div>
          <div className="text-[11px] text-white/40 mt-0.5">{formatDate(ann.created_at)}</div>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-white/35 shrink-0">
          <Eye className="w-3 h-3" />
          <span>{viewCount.toLocaleString()}</span>
        </div>
      </div>

      {/* Tags */}
      {ann.tags?.length > 0 && (
        <div className="flex gap-1.5 flex-wrap px-4 pb-2">
          {ann.tags.map((tag) => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-white/50 border border-white/8">#{tag}</span>
          ))}
        </div>
      )}

      {/* Title */}
      <div className="px-4 pb-1">
        <h3 className="text-base font-semibold text-white leading-snug">{ann.title}</h3>
      </div>

      {/* Short description */}
      {ann.description && (
        <div className="px-4 pb-2">
          <p className="text-sm text-white/55 leading-relaxed">{ann.description}</p>
        </div>
      )}

      {/* Read more / collapse */}
      <div className="px-4 pb-2">
        <button
          type="button"
          onClick={handleExpand}
          className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 transition-colors duration-150"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? "Show less" : "Read full post"}
        </button>
      </div>

      {/* Full markdown content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 border-t border-white/6 pt-3">
              {loadingContent ? (
                <div className="flex items-center gap-2 text-white/30 text-xs py-2">
                  <div className="w-3 h-3 rounded-full border border-purple-400/40 border-t-purple-400 animate-spin" />
                  Loading…
                </div>
              ) : content ? (
                <MarkdownContent content={content} />
              ) : (
                <p className="text-xs text-white/25 italic">No content available.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reactions */}
      <div className="flex items-center gap-1.5 flex-wrap px-4 pb-4 pt-1 border-t border-white/6">
        {ALLOWED_REACTIONS.map((emoji) => {
          const count = reactions[emoji] ?? 0;
          const active = userReactions.includes(emoji as ReactionEmoji);
          return (
            <button
              key={emoji}
              type="button"
              onClick={() => onReact(ann.id, emoji as ReactionEmoji)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm transition-all duration-200 border ${
                active
                  ? "bg-purple-500/25 border-purple-400/50 text-white scale-105"
                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white hover:scale-105"
              }`}
            >
              <span>{emoji}</span>
              {count > 0 && (
                <span className="text-[11px] font-medium tabular-nums">
                  {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// UpdateChannel panel
// ═══════════════════════════════════════════════════════════════
export function UpdateChannel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [posts, setPosts] = useState<PostState[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchAnnouncements();
    setPosts(data.map((a) => ({ ...a, reactions: (a as PostState).reactions ?? {} })));
    setLastFetched(new Date());
    setLoading(false);
  }, []);

  useEffect(() => { if (open) load(); }, [open, load]);
  useEffect(() => {
    if (!open) return;
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [open, load]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleReact = async (id: number, emoji: ReactionEmoji) => {
    const userReactions = getUserReactions(id);
    const action = userReactions.includes(emoji) ? "remove" : "add";
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const current = (p.reactions ?? {})[emoji] ?? 0;
        return { ...p, reactions: { ...(p.reactions ?? {}), [emoji]: Math.max(0, current + (action === "add" ? 1 : -1)) } };
      })
    );
    const updated = await reactToAnnouncement(id, emoji, action);
    if (updated) setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, reactions: updated } : p)));
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm" onClick={onClose} />

          <motion.div key="panel" ref={panelRef}
            initial={{ opacity: 0, x: 380 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 380 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 bottom-0 z-[201] w-full max-w-sm flex flex-col"
            style={{ background: "linear-gradient(180deg,rgba(9,6,20,.97) 0%,rgba(14,10,30,.99) 100%)", borderLeft: "1px solid rgba(255,255,255,.08)", boxShadow: "-24px 0 80px rgba(0,0,0,.6)" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-white/8 shrink-0"
              style={{ background: "linear-gradient(180deg,rgba(168,85,247,.08) 0%,transparent 100%)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold"
                style={{ background: "linear-gradient(135deg,#a855f7 0%,#ec4899 60%,#3b82f6 100%)", boxShadow: "0 0 20px rgba(168,85,247,.5)" }}>B</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-base">BabiesIQ Update</span>
                  <BlueTick className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-white/40 mt-0.5">
                  <Megaphone className="w-3 h-3" />
                  <span>Official Announcements Channel</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={load} disabled={loading}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-all duration-200 disabled:opacity-40">
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button type="button" onClick={onClose}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-all duration-200">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Channel description */}
            <div className="px-4 py-2.5 border-b border-white/6 shrink-0 bg-white/2">
              <p className="text-[11px] text-white/35 leading-relaxed">
                Official updates, new features, and important announcements from the BabiesIQ team.
                {lastFetched && <span className="ml-1 text-white/20">· Updated {formatDate(lastFetched)}</span>}
              </p>
            </div>

            {/* Posts */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {loading && posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-white/25">
                  <div className="w-8 h-8 rounded-full border-2 border-purple-500/40 border-t-purple-400 animate-spin" />
                  <span className="text-sm">Loading posts…</span>
                </div>
              ) : posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-white/30">
                  <Megaphone className="w-10 h-10 opacity-30" />
                  <div className="text-center">
                    <p className="text-sm font-medium">No announcements yet</p>
                    <p className="text-xs mt-1 text-white/20">Check back soon for updates</p>
                  </div>
                </div>
              ) : (
                posts.map((ann) => <PostCard key={ann.id} ann={ann} onReact={handleReact} />)
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-white/6 shrink-0">
              <p className="text-[10px] text-white/20 text-center">BabiesIQ Update · Official Channel · Verified</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
