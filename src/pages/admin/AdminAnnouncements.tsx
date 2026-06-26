import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  adminListAnnouncements,
  adminCreateAnnouncement,
  adminUpdateAnnouncement,
  adminDeleteAnnouncement,
  adminArchiveAnnouncement,
  adminRestoreAnnouncement,
} from "@/lib/admin-announcements-api";
import type { Announcement } from "@/types/announcements";

const STATUS_BADGE: Record<string, string> = {
  published: "bg-green-500/10 text-green-400 border-green-500/20",
  draft: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  archived: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const EMPTY_FORM = {
  title: "",
  description: "",
  content: "",
  tags: "",
  status: "draft",
  pinned: false,
  publish_at: "",
};

export function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Announcement | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminListAnnouncements();
    if (res.success) setAnnouncements(res.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (ann: Announcement) => {
    setEditTarget(ann);
    setForm({
      title: ann.title,
      description: ann.description,
      content: ann.content,
      tags: ann.tags?.join(", ") ?? "",
      status: ann.status,
      pinned: ann.pinned,
      publish_at: ann.publish_at ?? "",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      content: form.content.trim(),
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      status: form.status,
      pinned: form.pinned,
      publish_at: form.publish_at || null,
    };
    try {
      const res = editTarget
        ? await adminUpdateAnnouncement(editTarget.id, payload)
        : await adminCreateAnnouncement(payload);
      if (res.success) {
        toast.success(editTarget ? "Announcement updated" : "Announcement created");
        setModalOpen(false);
        load();
      } else {
        toast.error(res.error ?? "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ann: Announcement) => {
    if (!confirm(`Delete "${ann.title}"?`)) return;
    const res = await adminDeleteAnnouncement(ann.id);
    if (res.success) { toast.success("Deleted"); load(); }
    else toast.error("Could not delete");
  };

  const handleArchive = async (ann: Announcement) => {
    const res = await adminArchiveAnnouncement(ann.id);
    if (res.success) { toast.success("Archived"); load(); }
    else toast.error("Could not archive");
  };

  const handleRestore = async (ann: Announcement) => {
    const res = await adminRestoreAnnouncement(ann.id);
    if (res.success) { toast.success("Restored to draft"); load(); }
    else toast.error("Could not restore");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Publish announcements visible to all users on the platform.
            </p>
          </div>
          <Button onClick={openCreate}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5">
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5z" />
            </svg>
            New Announcement
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Loading...</div>
          ) : announcements.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No announcements yet. Create one to get started.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Views</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Author</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {announcements.map((ann) => (
                  <tr key={ann.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {ann.pinned && (
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-indigo-400 shrink-0">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
                          </svg>
                        )}
                        <div>
                          <div className="font-medium">{ann.title}</div>
                          {ann.description && (
                            <div className="text-xs text-muted-foreground truncate max-w-xs">{ann.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_BADGE[ann.status] ?? ""}`}>
                        {ann.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{ann.view_count}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{ann.author_name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(ann)}>Edit</Button>
                        {ann.status === "archived" ? (
                          <Button variant="ghost" size="sm" onClick={() => handleRestore(ann)}>Restore</Button>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => handleArchive(ann)}>Archive</Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" onClick={() => handleDelete(ann)}>
                          Delete
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

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Announcement" : "New Announcement"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Title *</Label>
              <Input
                className="mt-1"
                placeholder="Announcement title"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <Label>Short Description</Label>
              <Input
                className="mt-1"
                placeholder="Brief summary shown in the announcement bar"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <Label>Content (Markdown supported)</Label>
              <Textarea
                className="mt-1 font-mono text-sm min-h-[140px]"
                placeholder="Write your announcement in Markdown..."
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tags (comma-separated)</Label>
                <Input
                  className="mt-1"
                  placeholder="update, feature, maintenance"
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Publish At (optional)</Label>
                <Input
                  className="mt-1"
                  type="datetime-local"
                  value={form.publish_at}
                  onChange={e => setForm(f => ({ ...f, publish_at: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-3 mt-6">
                <Switch
                  id="pinned"
                  checked={form.pinned}
                  onCheckedChange={v => setForm(f => ({ ...f, pinned: v }))}
                />
                <Label htmlFor="pinned">Pin this announcement</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editTarget ? "Update" : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
