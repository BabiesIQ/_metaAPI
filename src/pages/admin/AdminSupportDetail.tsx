import { AdminLayout } from "@/components/AdminLayout";
import { getSupportTicket, replyToTicket, updateTicketStatus } from "@/lib/admin-api";
import { TICKET_STATUS_COLORS, type ContactMessage } from "@/types/admin";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, Mail, MessageSquare, Send, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AdminSupportDetailPage() {
  const { id } = useParams({ from: "/admin/support/$id" });
  const qc = useQueryClient();
  const [replyText, setReplyText] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [sending, setSending] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-ticket", id],
    queryFn: () => getSupportTicket(Number(id)),
  });
  const ticket: ContactMessage | undefined = data?.data ?? undefined;

  const handleReply = async () => {
    if (!replyText.trim()) { toast.error("Message cannot be empty"); return; }
    setSending(true);
    const res = await replyToTicket(Number(id), replyText, sendEmail);
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
            className="text-xs px-3 py-1.5 rounded-full border bg-card focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
          >
            <option value="open">Open</option>
            <option value="replied">Replied</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Original message */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">{ticket.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3" /> {ticket.email}
              </p>
            </div>
            <span className={cn("ml-auto text-xs px-2 py-0.5 rounded-full border capitalize", TICKET_STATUS_COLORS[ticket.status])}>
              {ticket.status}
            </span>
          </div>
          <p className="text-sm whitespace-pre-wrap text-foreground/80">{ticket.message}</p>
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {new Date(ticket.created_at).toLocaleString()}
          </p>
        </div>

        {/* Replies thread */}
        {ticket.replies && ticket.replies.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Replies</h3>
            {ticket.replies.map((reply) => (
              <div key={reply.id} className="bg-primary/5 border border-primary/20 rounded-xl p-4 ml-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                    {reply.admin_name?.charAt(0)?.toUpperCase() ?? "A"}
                  </div>
                  <div>
                    <span className="text-sm font-medium">{reply.admin_name}</span>
                    <span className="text-xs text-muted-foreground ml-2">Admin</span>
                  </div>
                  <span className="ml-auto text-xs text-muted-foreground">{new Date(reply.created_at).toLocaleString()}</span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Reply box */}
        {ticket.status !== "closed" && (
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" /> Send Reply
            </h3>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
              placeholder="Type your reply here..."
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
            <div className="flex items-center justify-between mt-3 gap-3 flex-wrap">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="rounded"
                />
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                Send email to {ticket.email}
              </label>
              <button
                onClick={handleReply}
                disabled={sending || !replyText.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
              >
                {sending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? "Sending..." : "Send Reply"}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
