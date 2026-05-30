import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getBackendUrl } from "@/lib/config";
import { Link } from "@tanstack/react-router";
import { Copy, ExternalLink, Loader2, PlayCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

type EndpointOption = "/api/search" | "/api/song" | "/api/video";

interface TryItWidgetProps {
  compact?: boolean;
}

export function TryItWidget({ compact = false }: TryItWidgetProps) {
  const [endpoint, setEndpoint] = useState<EndpointOption>("/api/search");
  const [params, setParams] = useState({ q: "", query: "" });
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!apiKey.trim()) {
      toast.error("API key required", {
        description: "Enter your API key to send a request.",
      });
      return;
    }
    setLoading(true);
    setResponse(null);
    setError(null);
    try {
      let url = `${getBackendUrl()}${endpoint}?api=${encodeURIComponent(apiKey.trim())}`;
      if (endpoint === "/api/search" && params.q) {
        url += `&q=${encodeURIComponent(params.q)}`;
      } else if (
        (endpoint === "/api/song" || endpoint === "/api/video") &&
        params.query
      ) {
        url += `&query=${encodeURIComponent(params.query)}`;
      }
      const res = await fetch(url, { credentials: "include" });
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        setResponse(JSON.stringify(json, null, 2));
      } catch {
        setResponse(text);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  const paramLabel =
    endpoint === "/api/search" ? "q (search query)" : "query (video ID)";
  const paramKey = endpoint === "/api/search" ? "q" : "query";
  const maxH = compact ? "max-h-48" : "max-h-72";
  const pad = compact ? "p-4" : "p-5";

  return (
    <motion.div
      className="bg-card border border-border rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      data-ocid="try_it.widget"
    >
      {/* Widget header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/40">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-primary/70" />
        </div>
        <span className="ml-2 font-mono text-xs text-muted-foreground">
          api-playground
        </span>
        <PlayCircle className="w-4 h-4 text-primary ml-auto" />
        <span className="font-display font-semibold text-sm text-foreground">
          Try It Live
        </span>
        <Badge
          variant="outline"
          className="ml-2 text-[10px] border-primary/30 text-primary"
        >
          Live API
        </Badge>
      </div>

      <div className={`${pad} space-y-4`}>
        {/* Endpoint selector */}
        <div>
          <label
            htmlFor="try-endpoint"
            className="block text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-2"
          >
            Endpoint
          </label>
          <select
            id="try-endpoint"
            value={endpoint}
            onChange={(e) => {
              setEndpoint(e.target.value as EndpointOption);
              setResponse(null);
              setError(null);
            }}
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-smooth"
            data-ocid="try_it.endpoint.select"
          >
            <option value="/api/search">GET /api/search</option>
            <option value="/api/song">GET /api/song</option>
            <option value="/api/video">GET /api/video</option>
          </select>
        </div>

        {/* Dynamic param */}
        <div>
          <label
            htmlFor="try-param"
            className="block text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-2"
          >
            {paramLabel}
          </label>
          <input
            id="try-param"
            type="text"
            value={params[paramKey as keyof typeof params]}
            onChange={(e) =>
              setParams((p) => ({ ...p, [paramKey]: e.target.value }))
            }
            placeholder={
              endpoint === "/api/search"
                ? "e.g. shape of you"
                : "e.g. JGwWNGJdvx8"
            }
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-smooth"
            data-ocid="try_it.param.input"
          />
        </div>

        {/* API Key */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="try-apikey"
              className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider"
            >
              API Key
            </label>
            <Link
              to="/panel/api-keys"
              className="text-[11px] text-primary hover:underline flex items-center gap-1"
            >
              Get your key <ExternalLink className="w-2.5 h-2.5" />
            </Link>
          </div>
          <input
            id="try-apikey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="YOUR_API_KEY"
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-smooth"
            data-ocid="try_it.api_key.input"
          />
        </div>

        {/* Send button */}
        <Button
          type="button"
          onClick={handleSend}
          disabled={loading}
          className="w-full font-display font-semibold gradient-primary text-white hover:opacity-90 gap-2 hover:scale-[1.02] transition-smooth"
          data-ocid="try_it.send.button"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <PlayCircle className="w-4 h-4" />
              Send Request
            </>
          )}
        </Button>

        {/* Response panel */}
        {(loading || response || error) && (
          <div
            className="rounded-lg border border-border bg-background overflow-hidden"
            data-ocid="try_it.response.panel"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/40">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                Response
              </span>
              {response && !loading && (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(response);
                    toast.success("Copied!");
                  }}
                  className="text-[10px] font-mono text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
              )}
            </div>
            <div className={`p-4 ${maxH} overflow-y-auto`}>
              {loading && (
                <div className="space-y-2" data-ocid="try_it.loading_state">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              )}
              {error && !loading && (
                <p
                  className="text-xs text-destructive font-mono"
                  data-ocid="try_it.error_state"
                >
                  Error: {error}
                </p>
              )}
              {response && !loading && (
                <pre
                  className="text-[11px] font-mono text-foreground/85 leading-relaxed whitespace-pre-wrap"
                  data-ocid="try_it.success_state"
                >
                  {response}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
