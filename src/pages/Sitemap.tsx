import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  BookOpen,
  CreditCard,
  FileText,
  Home,
  LogIn,
  Mail,
  Map,
  RefreshCw,
  ShieldCheck,
  UserRoundPlus,
  type LucideIcon,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { usePageSeo } from "@/lib/seo";
import SEO_ROUTE_DATA from "@/lib/seo-routes.json";

type PublicPath = "/" | "/docs" | "/pricing" | "/contact" | "/privacy" | "/terms" | "/refund" | "/sitemap";

const ICONS: Record<string, LucideIcon> = {
  "/": Home,
  "/docs": BookOpen,
  "/pricing": CreditCard,
  "/contact": Mail,
  "/privacy": ShieldCheck,
  "/terms": FileText,
  "/refund": RefreshCw,
  "/sitemap": Map,
};

const GROUPS = [
  { title: "Product & developer resources", description: "Explore the platform, build with the API, and choose the plan that fits.", paths: ["/", "/docs", "/pricing", "/contact"] },
  { title: "Policies", description: "The legal and privacy information for using BabiesIQ.", paths: ["/privacy", "/terms", "/refund"] },
];

const ROUTES = SEO_ROUTE_DATA.routes;

function SitemapCard({ route }: { route: (typeof ROUTES)[number] }) {
  const Icon = ICONS[route.path] ?? Map;
  return (
    <Link
      to={route.path as PublicPath}
      className="group flex h-full items-start gap-4 rounded-2xl border border-border bg-card/80 p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:bg-primary/5 hover:shadow-xl hover:shadow-primary/5"
      data-ocid={"sitemap." + route.path.replaceAll("/", "root").replaceAll("-", "_") + ".link"}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 font-display font-semibold text-foreground">
          {route.label}
          <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{route.summary}</span>
        <span className="mt-3 block font-mono text-xs text-muted-foreground/70">babiesiq.tech{route.path === "/" ? "/" : route.path}</span>
      </span>
    </Link>
  );
}

export function SitemapPage() {
  const sitemap = ROUTES.find((route) => route.path === "/sitemap");
  usePageSeo({
    title: sitemap?.title ?? "BabiesIQ Site Map | All Public Pages",
    description: sitemap?.description ?? "Browse all public BabiesIQ pages and developer resources.",
    path: "/sitemap",
  });

  return (
    <Layout>
      <section className="relative overflow-hidden bg-background px-4 py-16 md:py-24" data-ocid="sitemap.page">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-96 w-[min(90vw,64rem)] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
        <div className="mx-auto max-w-6xl">
          <header className="mx-auto mb-12 max-w-3xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <Map className="h-4 w-4" aria-hidden="true" /> Website guide
            </span>
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">Explore BabiesIQ</h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground">Find product information, API references, pricing, support, and policies. Each page is grouped by purpose for a quicker route to what you need.</p>
          </header>

          <div className="space-y-12">
            {GROUPS.map((group, groupIndex) => (
              <motion.section
                key={group.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: groupIndex * 0.06 }}
                aria-labelledby={"sitemap-group-" + groupIndex}
              >
                <div className="mb-5">
                  <h2 id={"sitemap-group-" + groupIndex} className="font-display text-xl font-bold text-foreground">{group.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {group.paths.map((path) => {
                    const route = ROUTES.find((item) => item.path === path);
                    return route ? <SitemapCard key={route.path} route={route} /> : null;
                  })}
                </div>
              </motion.section>
            ))}

            <motion.section
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: 0.12 }}
              aria-labelledby="sitemap-account-heading"
            >
              <div className="mb-5">
                <h2 id="sitemap-account-heading" className="font-display text-xl font-bold text-foreground">Your account</h2>
                <p className="mt-1 text-sm text-muted-foreground">Account pages are available to members and are intentionally excluded from search indexing.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Link to="/signup" className="group flex items-center gap-4 rounded-2xl border border-border bg-card/80 p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:bg-primary/5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500"><UserRoundPlus className="h-5 w-5" aria-hidden="true" /></span>
                  <span><span className="block font-display font-semibold text-foreground">Create an account</span><span className="mt-1 block text-sm text-muted-foreground">Start using the BabiesIQ developer platform.</span></span>
                  <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
                <Link to="/signin" className="group flex items-center gap-4 rounded-2xl border border-border bg-card/80 p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:bg-primary/5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500"><LogIn className="h-5 w-5" aria-hidden="true" /></span>
                  <span><span className="block font-display font-semibold text-foreground">Sign in</span><span className="mt-1 block text-sm text-muted-foreground">Open your account and API dashboard.</span></span>
                  <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </div>
            </motion.section>
          </div>

          <div className="mt-12 flex justify-center">
            <a href="/sitemap.xml" className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
              <FileText className="h-4 w-4" aria-hidden="true" /> Open machine-readable XML sitemap
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
