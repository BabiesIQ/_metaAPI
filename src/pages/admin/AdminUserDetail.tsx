import { AdminLayout } from "@/components/AdminLayout";
import {
  banUser, changeUserRole, getAdminUser, resetUserPassword,
  restrictUser, sendUserNotification, suspendUser, unbanUser,
  unrestrictUser, unsuspendUser
} from "@/lib/admin-api";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { ROLE_COLORS, ROLE_LABELS, STATUS_COLORS, type AdminUserRow } from "@/types/admin";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { ArrowLeft, Ban, Bell, CheckCircle, Crown, Key, Lock, Mail, ShieldOff, UserCheck, UserX } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ModalType = "suspend" | "ban" | "restrict" | "reset_password" | "change_role" | "notify" | null;

export function AdminUserDetailPage() {
  const { id } = useParams({ from: "/admin/users/$id" });
  const { admin } = useAdminAuth();
  const qc = useQueryClient();
  const [modal, setModal] = useState<ModalType>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [reason, setReason] = useState("");
  const [durationHours, setDurationHours] = useState(24);
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("free");
  const [subMonths, setSubMonths] = useState(1);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifLevel, setNotifLevel] = useState("info");
  const [notifEmail, setNotifEmail] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-user", id],
    queryFn: () => getAdminUser(Number(id)),
  });
  const user: AdminUserRow | undefined = data?.data ?? undefined;

  const hasPerm = (perm: string) => admin?.is_owner || admin?.permissions.includes(perm);

  const doAction = async (fn: () => Promise<{ success: boolean; error?: string | null }>, successMsg: string) => {
    setLoading(true);
    const res = await fn();
    setLoading(false);
    if (res.success) {
      toast.success(successMsg);
      setModal(null);
      qc.invalidateQueries({ queryKey: ["admin-user", id] });
    } else {
      toast.error(res.error ?? "Operation failed");
    }
  };

  const closeModal = () => { setModal(null); setReason(""); setNewPassword(""); };

  if (isLoading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </AdminLayout>
  );

  if (!user) return (
    <AdminLayout>
      <div className="text-center py-16 text-muted-foreground">User not found.</div>
    </AdminLayout>
  );

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "—";

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/admin/users" className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">{fullName}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium capitalize", STATUS_COLORS[user.status])}>
              {user.status}
            </span>
            <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", ROLE_COLORS[user.role])}>
              {ROLE_LABELS[user.role] ?? user.role}
            </span>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Daily Usage", value: user.daily_usage },
            { label: "Total Usage", value: user.total_usage },
            { label: "Joined", value: new Date(user.created_at).toLocaleDateString() },
            { label: "Sub Expires", value: user.subscription_expires_at ? new Date(user.subscription_expires_at).toLocaleDateString() : "N/A" },
          ].map((item) => (
            <div key={item.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-lg font-bold">{item.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold mb-4">Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {hasPerm("suspend_users") && (
              <>
                {user.status !== "restricted" ? (
                  <ActionBtn icon={ShieldOff} label="Suspend" color="amber" onClick={() => setModal("suspend")} />
                ) : (
                  <ActionBtn icon={UserCheck} label="Unsuspend" color="green" onClick={() => doAction(() => unsuspendUser(user.id), "User unsuspended")} />
                )}
              </>
            )}
            {hasPerm("ban_users") && (
              <>
                {user.status !== "banned" ? (
                  <ActionBtn icon={Ban} label="Ban User" color="red" onClick={() => setModal("ban")} />
                ) : (
                  <ActionBtn icon={CheckCircle} label="Unban User" color="green" onClick={() => doAction(() => unbanUser(user.id), "User unbanned")} />
                )}
                {user.status === "active" && (
                  <ActionBtn icon={UserX} label="Restrict" color="orange" onClick={() => setModal("restrict")} />
                )}
                {user.status === "restricted" && (
                  <ActionBtn icon={UserCheck} label="Unrestrict" color="green" onClick={() => doAction(() => unrestrictUser(user.id), "User unrestricted")} />
                )}
              </>
            )}
            {hasPerm("reset_passwords") && (
              <ActionBtn icon={Key} label="Reset Password" color="purple" onClick={() => setModal("reset_password")} />
            )}
            {hasPerm("change_roles") && (
              <ActionBtn icon={Crown} label="Change Role" color="amber" onClick={() => { setNewRole(user.role); setModal("change_role"); }} />
            )}
            <ActionBtn icon={Bell} label="Send Notification" color="blue" onClick={() => setModal("notify")} />
          </div>
        </div>
      </div>

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>

            {modal === "suspend" && (
              <>
                <h3 className="text-lg font-semibold mb-4">Suspend User</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Reason</label>
                    <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for suspension..." className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Duration</label>
                    <select value={durationHours} onChange={(e) => setDurationHours(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none">
                      <option value={1}>1 Hour</option>
                      <option value={6}>6 Hours</option>
                      <option value={24}>24 Hours</option>
                      <option value={72}>3 Days</option>
                      <option value={168}>1 Week</option>
                      <option value={720}>1 Month</option>
                      <option value={0}>Indefinite</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={closeModal} className="flex-1 py-2 rounded-lg border border-border text-sm hover:bg-muted">Cancel</button>
                  <button onClick={() => doAction(() => suspendUser(user.id, reason, durationHours), "User suspended")} disabled={loading}
                    className="flex-1 py-2 rounded-lg bg-amber-500 text-white text-sm hover:bg-amber-600 disabled:opacity-60">
                    {loading ? "..." : "Suspend"}
                  </button>
                </div>
              </>
            )}

            {modal === "ban" && (
              <>
                <h3 className="text-lg font-semibold mb-4 text-red-400">Ban User</h3>
                <p className="text-sm text-muted-foreground mb-3">This will permanently ban the user. They will not be able to login.</p>
                <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for ban..." className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                <div className="flex gap-3 mt-5">
                  <button onClick={closeModal} className="flex-1 py-2 rounded-lg border border-border text-sm hover:bg-muted">Cancel</button>
                  <button onClick={() => doAction(() => banUser(user.id, reason), "User banned")} disabled={loading}
                    className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600 disabled:opacity-60">
                    {loading ? "..." : "Ban User"}
                  </button>
                </div>
              </>
            )}

            {modal === "restrict" && (
              <>
                <h3 className="text-lg font-semibold mb-4">Restrict User</h3>
                <p className="text-sm text-muted-foreground mb-3">User's API access will be limited.</p>
                <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason..." className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                <div className="flex gap-3 mt-5">
                  <button onClick={closeModal} className="flex-1 py-2 rounded-lg border border-border text-sm hover:bg-muted">Cancel</button>
                  <button onClick={() => doAction(() => restrictUser(user.id, reason), "User restricted")} disabled={loading}
                    className="flex-1 py-2 rounded-lg bg-orange-500 text-white text-sm hover:bg-orange-600 disabled:opacity-60">
                    {loading ? "..." : "Restrict"}
                  </button>
                </div>
              </>
            )}

            {modal === "reset_password" && (
              <>
                <h3 className="text-lg font-semibold mb-4">Reset Password</h3>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password (min 6 chars)..." className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                <div className="flex gap-3 mt-5">
                  <button onClick={closeModal} className="flex-1 py-2 rounded-lg border border-border text-sm hover:bg-muted">Cancel</button>
                  <button onClick={() => doAction(() => resetUserPassword(user.id, newPassword), "Password reset")} disabled={loading || newPassword.length < 6}
                    className="flex-1 py-2 rounded-lg bg-purple-500 text-white text-sm hover:bg-purple-600 disabled:opacity-60">
                    {loading ? "..." : "Reset"}
                  </button>
                </div>
              </>
            )}

            {modal === "change_role" && (
              <>
                <h3 className="text-lg font-semibold mb-4">Change Role / Subscription</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Role</label>
                    <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none">
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="pro_plus">Pro Plus</option>
                      <option value="business">Business</option>
                    </select>
                  </div>
                  {newRole !== "free" && (
                    <div>
                      <label className="text-sm font-medium mb-1 block">Months to add</label>
                      <select value={subMonths} onChange={(e) => setSubMonths(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none">
                        {[1,2,3,6,12].map(m => <option key={m} value={m}>{m} month{m > 1 ? "s" : ""}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={closeModal} className="flex-1 py-2 rounded-lg border border-border text-sm hover:bg-muted">Cancel</button>
                  <button onClick={() => doAction(() => changeUserRole(user.id, newRole, subMonths), "Role updated")} disabled={loading}
                    className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-60">
                    {loading ? "..." : "Update Role"}
                  </button>
                </div>
              </>
            )}

            {modal === "notify" && (
              <>
                <h3 className="text-lg font-semibold mb-4">Send Notification</h3>
                <div className="space-y-3">
                  <input value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} placeholder="Title..." className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  <textarea value={notifMessage} onChange={(e) => setNotifMessage(e.target.value)} rows={3} placeholder="Message..." className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
                  <select value={notifLevel} onChange={(e) => setNotifLevel(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none">
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={notifEmail} onChange={(e) => setNotifEmail(e.target.checked)} className="rounded" />
                    Also send email
                  </label>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={closeModal} className="flex-1 py-2 rounded-lg border border-border text-sm hover:bg-muted">Cancel</button>
                  <button onClick={() => doAction(() => sendUserNotification(user.id, notifTitle, notifMessage, notifLevel, notifEmail), "Notification sent")} disabled={loading || !notifTitle || !notifMessage}
                    className="flex-1 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 disabled:opacity-60">
                    {loading ? "..." : "Send"}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function ActionBtn({ icon: Icon, label, color, onClick }: { icon: React.ElementType; label: string; color: string; onClick: () => void }) {
  const colorMap: Record<string, string> = {
    amber: "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20",
    red: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20",
    orange: "bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border-orange-500/20",
    green: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
    purple: "bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/20",
    blue: "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20",
  };
  return (
    <button onClick={onClick} className={cn("flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-colors", colorMap[color] ?? colorMap.blue)}>
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );
}
