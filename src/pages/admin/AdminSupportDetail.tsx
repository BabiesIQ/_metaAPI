import { AdminLayout } from "@/components/AdminLayout";
  import { getSupportTicket, replyToTicket, updateTicketStatus } from "@/lib/admin-api";
  import { TICKET_STATUS_COLORS, type ContactMessage } from "@/types/admin";
  import { useQuery, useQueryClient } from "@tanstack/react-query";
  import { useParams } from "@tanstack/react-router";
  import { Link } from "@tanstack/react-router";
  import { ArrowLeft, Bell, Bot, Mail, MessageSquare, Send, User } from "lucide-react";
  import { useState } from "react";
  import { toast } from "sonner";
  import { cn } from "@/lib/utils";

  export function AdminSupportDetailPage() {
    const { id } = useParams({ from: "/admin/support/$id" });
    const qc = useQueryClient();
    const [replyText, setReplyText] = useState("");
    const [sendEmail, setSendEmail] = useState(true);
    const [sendNotif, setSendNotif] = useState(true);
    const [sendTelegram, setSendTelegram] = useState(false);
    const [sending, setSending] = useState(false);

    const { data, isLoading } = useQuery({
      queryKey: ["admin-ticket", id],
      queryFn: () => getSupportTicket(Number(id)),
    });
    const ticket: ContactMessage | undefined = data?.data ?? undefined;

    const handleReply = async () => {
      if (!replyText.trim()) { toast.error("Message cannot be empty"); return; }
      setSending(true);
      const res = await replyToTicket(Number(id), replyText, sendEmail, sendNotif, sendTelegram);
      setSending(false);
      if (res.success) {
        toast.success("Reply sent successfully");
        setReplyText("");
        qc.invalidateQueries({ queryKey: ["admin-ticket", id] });
        qc.invalidateQueries({ queryKey: ["admin-tickets"] });
      } else {
        toast.error(res.error ?? "Failed to send reply");
      }
    };

    const handleStatusChange = async (newStatus: string) => {
      const res = await updateTicketStatus(Number(id), newStatus);
      if (res.success) {
        toast.success("Status updated");
        qc.invalidateQueries({ queryKey: ["admin-ticket", id] });
      } else {
        toast.error(res.error ?? "Failed to update status");
      }
    };

    if (isLoading) return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );

    if (!ticket) return (
      <AdminLayout>
        <div className="text-center py-16 text-muted-foreground">Ticket not found.</div>
      </AdminLayout>
    );

    return (
      <AdminLayout>
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Header */}
          <div className="flex items-center gap-3">
            <Link to="/admin/support" className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{ticket.subject || "Support Ticket"}</h1>
              <p className="text-sm text-muted-foreground">#{ticket.id} · {new Date(ticket.created_at).toLocaleString()}</p>
            </div>
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background cursor-pointer"
            >
              <option value="open">Open</option>
              <option value="replied">Replied</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Ticket info */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <User className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="font-medium">{ticket.name}</span>
              <span className="text-muted-foreground">&lt;{ticket.email}&gt;</span>
              <span className={cn("ml-auto text-xs px-2 py-0.5 rounded-full border capitalize", TICKET_STATUS_COLORS[ticket.status])}>
                {ticket.status}
              </span>
            </div>
            {ticket.subject && (
              <div className="flex items-center gap-2 text-sm">
                <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="font-medium">{ticket.subject}</span>
              </div>
            )}
            <div className="pt-2 border-t border-border">
              <p className="text-sm whitespace-pre-wrap">{ticket.message}</p>
            </div>
          </div>

          {/* Previous replies */}
          {ticket.replies && ticket.replies.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Previous Replies</h2>
              {ticket.replies.map((r, i) => (
                <div key={i} className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-primary">{r.admin_name || "Admin"}</span>
                    <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{r.message}</p>
                </div>
              ))}
            </div>
          )}

          {/* Reply box */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            <h2 className="text-sm font-semibold">Send Reply</h2>

            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply here..."
              rows={5}
              className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            />

            {/* Notification channel toggles */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notify via</p>
              <div className="flex flex-wrap gap-2">

                <label className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors select-none",
                  sendNotif
                    ? "border-primary/40 bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-muted-foreground"
                )}>
                  <input type="checkbox" checked={sendNotif} onChange={(e) => setSendNotif(e.target.checked)} className="hidden" />
                  <Bell className="w-4 h-4" />
                  In-app
                </label>

                <label className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors select-none",
                  sendEmail
                    ? "border-primary/40 bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-muted-foreground"
                )}>
                  <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="hidden" />
                  <Mail className="w-4 h-4" />
                  Email
                </label>

                <label className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors select-none",
                  sendTelegram
                    ? "border-blue-500/40 bg-blue-500/5 text-blue-500"
                    : "border-border text-muted-foreground hover:border-muted-foreground"
                )}>
                  <input type="checkbox" checked={sendTelegram} onChange={(e) => setSendTelegram(e.target.checked)} className="hidden" />
                  <Bot className="w-4 h-4" />
                  Telegram
                  <span className="text-xs opacity-50">(if connected)</span>
                </label>

              </div>
            </div>

            <button
              onClick={handleReply}
              disabled={sending || !replyText.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
              {sending ? "Sending..." : "Send Reply"}
            </button>
          </div>

        </div>
      </AdminLayout>
    );
  }
  