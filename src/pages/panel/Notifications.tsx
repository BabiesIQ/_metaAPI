import { DashboardLayout } from "@/components/DashboardLayout";
import { PageTransition } from "@/components/PageTransition";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  deleteNotifications,
  getNotifications,
  markNotificationsRead,
} from "@/lib/api";
import type { Notification, NotificationLevel } from "@/types/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, parseISO } from "date-fns";
import {
  AlertTriangle,
  Bell,
  BellOff,
  CheckCheck,
  CheckCircle2,
  Filter,
  Info,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

type FilterTab = "all" | "unread";

const LEVEL_LEFT_BORDER: Record<NotificationLevel, string> = {
  info: "border-l-primary",
  success: "border-l-emerald-500",
  warning: "border-l-yellow-500",
};

const LEVEL_ICON_STYLE: Record<NotificationLevel, string> = {
  info: "text-primary bg-primary/10",
  success: "text-emerald-400 bg-emerald-500/10",
  warning: "text-yellow-400 bg-yellow-500/10",
};

const LEVEL_BADGE: Record<NotificationLevel, string> = {
  info: "bg-primary/10 text-primary border-primary/20",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

function LevelIcon({
  level,
  className,
}: { level: NotificationLevel; className?: string }) {
  const base = `w-4 h-4 ${className ?? ""}`;
  if (level === "success") return <CheckCircle2 className={base} />;
  if (level === "warning") return <AlertTriangle className={base} />;
  return <Info className={base} />;
}

function relativeTime(dateStr: string) {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return "";
  }
}

function absoluteTime(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function NotificationsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [detailNotif, setDetailNotif] = useState<Notification | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>("all");

  const { data: items = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await getNotifications();
      return res.success && res.data ? res.data : [];
    },
    staleTime: 30_000,
  });

  const markReadMutation = useMutation({
    mutationFn: (ids: number[] | "all") =>
      markNotificationsRead(ids === "all" ? "all" : ids.map(String)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (ids: number[]) => deleteNotifications(ids.map(String)),
    onSuccess: (_, ids) => {
      toast.success(
        `${ids.length} ${t("notifications.delete_selected").toLowerCase()}${
          ids.length > 1 ? "s" : ""
        }.`,
      );
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => toast.error(t("common.error")),
  });

  const handleMarkAllRead = async () => {
    const res = await markReadMutation.mutateAsync("all");
    if (res.success) {
      toast.success(t("notifications.mark_all_read"));
    } else {
      toast.error(t("common.error"));
    }
  };

  const handleMarkSelectedRead = () => {
    if (selectedIds.size === 0) return;
    markReadMutation.mutate(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    deleteMutation.mutate(Array.from(selectedIds));
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openDetail = (notif: Notification) => {
    setDetailNotif(notif);
    if (!notif.read_at) {
      markReadMutation.mutate([notif.id]);
    }
  };

  const unreadCount = items.filter((n) => !n.read_at).length;
  const filteredItems =
    filterTab === "unread" ? items.filter((n) => !n.read_at) : items;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PageTransition>
          <div className="space-y-5 max-w-3xl" data-ocid="notifications.page">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
                  <Bell className="w-6 h-6 text-primary" />
                  {t("notifications.title")}
                </h1>
                {unreadCount > 0 && (
                  <Badge className="gradient-primary text-white border-0 text-xs px-2.5 py-0.5 rounded-full">
                    {unreadCount} {t("notifications.unread")}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedIds.size > 0 && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground gap-1.5 text-sm"
                      onClick={handleMarkSelectedRead}
                      disabled={markReadMutation.isPending}
                      data-ocid="notifications.mark_selected_read.button"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      {t("notifications.mark_read")} ({selectedIds.size})
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 text-sm"
                      onClick={handleDeleteSelected}
                      disabled={deleteMutation.isPending}
                      data-ocid="notifications.delete_selected.button"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {t("notifications.delete_selected")} ({selectedIds.size})
                    </Button>
                  </>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                  onClick={handleMarkAllRead}
                  disabled={markReadMutation.isPending || unreadCount === 0}
                  data-ocid="notifications.mark_all_read.button"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  {t("notifications.mark_all_read")}
                </Button>
              </div>
            </div>

            {/* Filter tabs */}
            <div
              className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border w-fit"
              data-ocid="notifications.filter.tab"
            >
              {(["all", "unread"] as FilterTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-smooth flex items-center gap-2 ${
                    filterTab === tab
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-ocid={`notifications.filter.${tab}`}
                >
                  <Filter className="w-3 h-3" />
                  {t(`notifications.filter_${tab}`)}
                  {tab === "unread" && unreadCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Bulk toolbar — shown when items selected */}
            <AnimatePresence>
              {selectedIds.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/20"
                >
                  <span className="text-sm font-medium text-foreground">
                    {selectedIds.size} {t("notifications.selected")}
                  </span>
                  <div className="flex items-center gap-2 ml-auto">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-xs text-muted-foreground hover:text-foreground h-7"
                      onClick={handleMarkSelectedRead}
                      disabled={markReadMutation.isPending}
                    >
                      <CheckCheck className="w-3 h-3" />
                      {t("notifications.mark_read")}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 h-7"
                      onClick={handleDeleteSelected}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-3 h-3" />
                      {t("notifications.delete_selected")}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* List */}
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }, (_, i) => `skel-${i}`).map((k) => (
                  <div
                    key={k}
                    className="rounded-xl border border-border bg-card/50 p-4 flex items-start gap-3"
                  >
                    <Skeleton className="h-4 w-4 mt-0.5 rounded flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between gap-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed border-border bg-muted/5"
                data-ocid="notifications.empty_state"
              >
                <div className="w-16 h-16 rounded-2xl bg-muted/40 flex items-center justify-center mb-4 ring-1 ring-border">
                  <BellOff className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-1">
                  {filterTab === "unread"
                    ? t("notifications.no_unread_title")
                    : t("notifications.no_notifications_title")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {filterTab === "unread"
                    ? t("notifications.no_unread_desc")
                    : t("notifications.no_notifications_desc")}
                </p>
              </motion.div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {filteredItems.map((notif, idx) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{
                        duration: 0.2,
                        delay: idx < 5 ? idx * 0.04 : 0,
                      }}
                      className={`relative flex items-start gap-3 p-4 rounded-xl border transition-colors duration-150 group ${
                        notif.read_at
                          ? "bg-card/40 border-border/60"
                          : `bg-card border-l-2 border-border ${LEVEL_LEFT_BORDER[notif.level]}`
                      }`}
                      data-ocid={`notifications.item.${idx + 1}`}
                    >
                      {/* Checkbox */}
                      <Checkbox
                        checked={selectedIds.has(notif.id)}
                        onCheckedChange={() => toggleSelect(notif.id)}
                        className="mt-1 flex-shrink-0"
                        aria-label={t("notifications.select")}
                        data-ocid={`notifications.checkbox.${idx + 1}`}
                      />

                      {/* Level icon */}
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          LEVEL_ICON_STYLE[notif.level]
                        }`}
                      >
                        <LevelIcon level={notif.level} />
                      </div>

                      {/* Content */}
                      <button
                        type="button"
                        className="flex-1 min-w-0 text-left"
                        onClick={() => openDetail(notif)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 min-w-0 flex-wrap">
                            {!notif.read_at && (
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                            )}
                            <span
                              className={`text-sm truncate ${
                                notif.read_at
                                  ? "text-muted-foreground font-medium"
                                  : "text-foreground font-semibold"
                              }`}
                            >
                              {notif.title}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-xs capitalize flex-shrink-0 ${LEVEL_BADGE[notif.level]}`}
                            >
                              {t(`notifications.${notif.level}`)}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0 whitespace-nowrap">
                            {relativeTime(notif.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 text-left">
                          {notif.message}
                        </p>
                      </button>

                      {/* Per-item quick actions — show on hover */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0 mt-0.5">
                        {!notif.read_at && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              markReadMutation.mutate([notif.id]);
                            }}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-150"
                            aria-label={t("notifications.mark_read")}
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMutation.mutate([notif.id]);
                          }}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-150"
                          aria-label={t("notifications.delete")}
                          data-ocid={`notifications.delete_button.${idx + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </PageTransition>

        {/* Detail Modal */}
        <Dialog
          open={!!detailNotif}
          onOpenChange={(open) => !open && setDetailNotif(null)}
        >
          <DialogContent
            className="bg-card border-border max-w-md"
            data-ocid="notifications.dialog"
          >
            {detailNotif && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-1">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        LEVEL_ICON_STYLE[detailNotif.level]
                      }`}
                    >
                      <LevelIcon
                        level={detailNotif.level}
                        className="w-5 h-5"
                      />
                    </div>
                    <DialogTitle className="font-display text-base leading-tight">
                      {detailNotif.title}
                    </DialogTitle>
                  </div>
                  <div className="flex items-center gap-2 pl-13">
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${LEVEL_BADGE[detailNotif.level]}`}
                    >
                      {t(`notifications.${detailNotif.level}`)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {absoluteTime(detailNotif.created_at)}
                    </span>
                  </div>
                </DialogHeader>

                <div className="py-2">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {detailNotif.message}
                  </p>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-border hover:border-primary/40 transition-colors duration-150"
                    onClick={() => setDetailNotif(null)}
                    data-ocid="notifications.close_button"
                  >
                    {t("notifications.close")}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
