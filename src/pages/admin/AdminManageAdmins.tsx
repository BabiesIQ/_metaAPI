import { AdminLayout } from "@/components/AdminLayout";
import {
  addAdmin, listAdmins, removeAdmin,
  updateAdminPermissions, updateAdminStatus
} from "@/lib/admin-api";
import { ALL_PERMISSIONS, PERMISSION_LABELS, type Admin } from "@/types/admin";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Crown, Plus, Shield, ShieldOff, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ModalType = "add" | "permissions" | "remove" | null;

export function AdminManageAdminsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<ModalType>(null);
  const [selected, setSelected] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(false);

  // Add admin form
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newPerms, setNewPerms] = useState<string[]>([]);

  // Edit permissions
  const [editPerms, setEditPerms] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-admins"],
    queryFn: () => listAdmins(),
  });
  const admins: Admin[] = data?.data ?? [];

  const doAction = async (fn: () => Promise<{ success: boolean; error?: string | null }>, msg: string) => {
    setLoading(true);
    const res = await fn();
    setLoading(false);
    if (res.success) {
      toast.success(msg);
      setModal(null);
      qc.invalidateQueries({ queryKey: ["admin-admins"] });
    } else {
      toast.error(res.error ?? "Operation failed");
    }
  };

  const openPermissions = (admin: Admin) => {
    setSelected(admin);
    setEditPerms([...admin.permissions]);
    setModal("permissions");
  };

  const togglePerm = (perm: string, arr: string[], setter: (v: string[]) => void) => {
    setter(arr.includes(perm) ? arr.filter(p => p !== perm) : [...arr, perm]);
  };

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Manage Admins</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Owner-only — add, remove, and configure admin access</p>
          </div>
          <button onClick={() => { setNewEmail(""); setNewName(""); setNewPass(""); setNewPerms([]); setModal("add"); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> Add Admin
          </button>
        </div>

        <div className="space-y-3">
          {isLoading && Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted/40 animate-pulse" />
          ))}
          {!isLoading && admins.map((admin) => (
            <div key={admin.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                  {admin.name?.charAt(0)?.toUpperCase() ?? "A"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{admin.name}</span>
                    {admin.is_owner && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <Crown className="w-3 h-3" /> Owner
                      </span>
                    )}
                    <span className={cn("text-xs px-2 py-0.5 rounded-full border capitalize",
                      admin.status === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-red-500/10 text-red-400 border-red-500/30")}>
                      {admin.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{admin.email}</p>
                  {!admin.is_owner && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {admin.permissions.length === 0 ? (
                        <span className="text-xs text-muted-foreground">No permissions set</span>
                      ) : admin.permissions.map(p => (
                        <span key={p} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {PERMISSION_LABELS[p] ?? p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {!admin.is_owner && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openPermissions(admin)}
                      title="Edit permissions"
                      className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                      <Shield className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => doAction(
                        () => updateAdminStatus(admin.id, admin.status === "active" ? "suspended" : "active"),
                        admin.status === "active" ? "Admin suspended" : "Admin activated"
                      )}
                      title={admin.status === "active" ? "Suspend" : "Activate"}
                      className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                      {admin.status === "active" ? <ShieldOff className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    </button>
                    <button onClick={() => { setSelected(admin); setModal("remove"); }}
                      title="Remove admin"
                      className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {!isLoading && admins.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No admins found.</div>
          )}
        </div>
      </div>

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>

            {modal === "add" && (
              <>
                <h3 className="text-lg font-semibold mb-4">Add New Admin</h3>
                <div className="space-y-3">
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full name" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Password (min 8 chars)" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  <div>
                    <p className="text-sm font-medium mb-2">Permissions</p>
                    <div className="grid grid-cols-2 gap-2">
                      {ALL_PERMISSIONS.map((perm) => (
                        <label key={perm} className="flex items-center gap-2 text-xs cursor-pointer p-2 rounded-lg hover:bg-muted transition-colors">
                          <input type="checkbox" checked={newPerms.includes(perm)} onChange={() => togglePerm(perm, newPerms, setNewPerms)} className="rounded" />
                          {PERMISSION_LABELS[perm]}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={() => setModal(null)} className="flex-1 py-2 rounded-lg border border-border text-sm hover:bg-muted">Cancel</button>
                  <button
                    onClick={() => doAction(() => addAdmin({ email: newEmail, name: newName, password: newPass, permissions: newPerms }), "Admin added")}
                    disabled={loading || !newEmail || !newName || newPass.length < 8}
                    className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-60">
                    {loading ? "..." : "Add Admin"}
                  </button>
                </div>
              </>
            )}

            {modal === "permissions" && selected && (
              <>
                <h3 className="text-lg font-semibold mb-1">Edit Permissions</h3>
                <p className="text-sm text-muted-foreground mb-4">{selected.name} — {selected.email}</p>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_PERMISSIONS.map((perm) => (
                    <label key={perm} className="flex items-center gap-2 text-xs cursor-pointer p-2 rounded-lg hover:bg-muted transition-colors">
                      <input type="checkbox" checked={editPerms.includes(perm)} onChange={() => togglePerm(perm, editPerms, setEditPerms)} className="rounded" />
                      {PERMISSION_LABELS[perm]}
                    </label>
                  ))}
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={() => setModal(null)} className="flex-1 py-2 rounded-lg border border-border text-sm hover:bg-muted">Cancel</button>
                  <button
                    onClick={() => doAction(() => updateAdminPermissions(selected.id, editPerms), "Permissions updated")}
                    disabled={loading}
                    className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-60">
                    {loading ? "..." : "Save"}
                  </button>
                </div>
              </>
            )}

            {modal === "remove" && selected && (
              <>
                <h3 className="text-lg font-semibold mb-2 text-red-400">Remove Admin</h3>
                <p className="text-sm text-muted-foreground">Are you sure you want to remove <strong>{selected.name}</strong> ({selected.email}) as admin? This cannot be undone.</p>
                <div className="flex gap-3 mt-5">
                  <button onClick={() => setModal(null)} className="flex-1 py-2 rounded-lg border border-border text-sm hover:bg-muted">Cancel</button>
                  <button
                    onClick={() => doAction(() => removeAdmin(selected.id), "Admin removed")}
                    disabled={loading}
                    className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600 disabled:opacity-60">
                    {loading ? "..." : "Remove"}
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
