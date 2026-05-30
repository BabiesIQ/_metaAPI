import { AdminLayout } from "@/components/AdminLayout";
import { listSupportTickets } from "@/lib/admin-api";
import { TICKET_STATUS_COLORS, type ContactMessage } from "@/types/admin";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, MessageSquare, RefreshCw } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function AdminSupportPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-tickets", status, page],
    queryFn: () => listSupportTickets({ status, page, limit: 20 }),
  });

  const tickets: ContactMessage[] = data?.data?.tickets ?? [];
  const total = data?.data?.total ?? 0;
  const pages = data?.data?.pages ?? 1;

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Support Tickets</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{total} total messages</p>
          </div>
          <button onClick={() => refetch()} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {["", "open", "replied", "closed"].map((s) => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={cn("px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize",
                status === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground")}>
              {s === "" ? "All" : s}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {isLoading && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted/40 animate-pulse" />
          ))}
          {!isLoading && tickets.map((t) => (
            <Link to={`/admin/support/${t.id}`} key={t.id}
              className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/30 hover:bg-muted/20 transition-colors block">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{t.name}</span>
                  <span className="text-xs text-muted-foreground">{t.email}</span>
                  <span className={cn("ml-auto text-xs px-2 py-0.5 rounded-full border capitalize", TICKET_STATUS_COLORS[t.status])}>
                    {t.status}
                  </span>
                </div>
                {t.subject && <p className="text-sm font-medium mt-0.5">{t.subject}</p>}
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{t.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(t.created_at).toLocaleString()}</p>
              </div>
            </Link>
          ))}
          {!isLoading && tickets.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No tickets found</p>
            </div>
          )}
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Page {page} of {pages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
