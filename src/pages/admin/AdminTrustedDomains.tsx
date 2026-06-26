import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  adminListDomains,
  adminCreateDomain,
  adminUpdateDomain,
  adminDeleteDomain,
} from "@/lib/admin-announcements-api";
import type { TrustedDomain } from "@/types/announcements";

const STATUS_COLORS = {
  active: "bg-green-500/10 text-green-400 border-green-500/20",
  disabled: "bg-red-500/10 text-red-400 border-red-500/20",
};

const ENV_COLORS = {
  production: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  staging: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  development: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const EMPTY_FORM = {
  domain: "",
  environment: "production",
  notes: "",
};

const EMPTY_EDIT = {
  status: "active",
  environment: "production",
  notes: "",
};

export function AdminTrustedDomainsPage() {
  const [domains, setDomains] = useState<TrustedDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TrustedDomain | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminListDomains();
    if (res.success) setDomains(res.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = domains.filter(
    (d) =>
      d.domain.includes(search.toLowerCase()) ||
      d.added_by.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!form.domain.trim()) { toast.error("Domain is required"); return; }
    setSaving(true);
    try {
      const res = await adminCreateDomain({
        domain: form.domain.trim(),
        environment: form.environment,
        notes: form.notes.trim(),
      });
      if (res.success) {
        toast.success(`Domain ${form.domain.trim()} added`);
        setCreateOpen(false);
        setForm(EMPTY_FORM);
        load();
      } else {
        toast.error(res.error ?? "Could not add domain — it may already exist");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      const res = await adminUpdateDomain(editTarget.id, editForm);
      if (res.success) {
        toast.success("Domain updated");
        setEditTarget(null);
        load();
      } else {
        toast.error(res.error ?? "Could not update domain");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (d: TrustedDomain) => {
    if (!confirm(`Remove trusted domain "${d.domain}"? This will block any deployments using this domain.`)) return;
    const res = await adminDeleteDomain(d.id);
    if (res.success) { toast.success("Domain removed"); load(); }
    else toast.error("Could not remove domain");
  };

  const openEdit = (d: TrustedDomain) => {
    setEditTarget(d);
    setEditForm({ status: d.status, environment: d.environment, notes: d.notes });
  };

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Trusted Domains</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Only domains listed here may access the BabiesIQ platform. All others are blocked.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5">
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5z" />
            </svg>
            Add Domain
          </Button>
        </div>

        {/* Security notice */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-amber-400 shrink-0 mt-0.5">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" clipRule="evenodd" />
          </svg>
          <div className="text-sm">
            <p className="font-medium text-amber-400">Domain Protection Active</p>
            <p className="text-muted-foreground mt-0.5">
              The backend enforces strict CORS and domain verification. Removing a domain will immediately block it.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <svg viewBox="0 0 20 20" fill="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9z" clipRule="evenodd" />
          </svg>
          <Input
            className="pl-9"
            placeholder="Search domains..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              {search ? "No domains match your search." : "No trusted domains configured yet."}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Domain</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Environment</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Added By</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Last Verified</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-mono font-medium">{d.domain}</div>
                      {d.notes && <div className="text-xs text-muted-foreground mt-0.5">{d.notes}</div>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[d.status as keyof typeof STATUS_COLORS] ?? ""}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${ENV_COLORS[d.environment as keyof typeof ENV_COLORS] ?? ""}`}>
                        {d.environment}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{d.added_by}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                      {d.last_verified ? formatDate(d.last_verified) : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(d)}>Edit</Button>
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" onClick={() => handleDelete(d)}>
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Domain Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Trusted Domain</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Domain *</Label>
              <Input
                className="mt-1 font-mono"
                placeholder="babiesiq.tech"
                value={form.domain}
                onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">Enter the hostname without https:// or trailing slash</p>
            </div>
            <div>
              <Label>Environment</Label>
              <Select value={form.environment} onValueChange={v => setForm(f => ({ ...f, environment: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Textarea
                className="mt-1"
                placeholder="e.g. Main production deployment"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? "Adding..." : "Add Domain"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Domain Modal */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Domain — <span className="font-mono">{editTarget?.domain}</span></DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Status</Label>
              <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Environment</Label>
              <Select value={editForm.environment} onValueChange={v => setEditForm(f => ({ ...f, environment: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                className="mt-1"
                value={editForm.notes}
                onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
