import { DashboardLayout } from "@/components/DashboardLayout";
import { PageTransition } from "@/components/PageTransition";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getInvoicePdfUrl, getInvoices } from "@/lib/api";
import { PLAN_LABELS } from "@/types/index";
import type { Invoice, InvoiceStatus, PlanCode } from "@/types/index";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Receipt,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
};

const PAGE_SIZE = 10;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => `sk-${i}`).map((k) => (
        <TableRow key={k} className="border-border">
          {Array.from({ length: 7 }, (_, idx) => `c-${idx}`).map((c, ci) => (
            <TableCell key={c} className="py-4">
              <Skeleton
                className="h-4 rounded"
                style={{ width: `${45 + ci * 7}%` }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

function MobileSkeleton() {
  return (
    <div className="space-y-3 sm:hidden">
      {Array.from({ length: 3 }, (_, i) => `msk-${i}`).map((k) => (
        <div
          key={k}
          className="rounded-xl border border-border bg-card p-4 space-y-3 animate-pulse"
        >
          <div className="flex justify-between">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex justify-between items-end">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function InvoicesPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: async () => {
      const res = await getInvoices();
      return res.success && res.data ? res.data : [];
    },
    staleTime: 60_000,
  });

  const sorted = [...invoices].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageData = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const paidCount = invoices.filter((i) => i.status === "paid").length;
  const totalSpend = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.amount, 0);

  const headers = [
    t("invoices.invoice_no"),
    t("invoices.plan"),
    t("invoices.months"),
    t("invoices.amount"),
    t("invoices.status"),
    t("invoices.date"),
    t("invoices.download"),
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PageTransition>
          <div data-ocid="invoices.page" className="space-y-5">
            {/* Page header */}
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground">
                  {t("invoices.title")}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {isLoading
                    ? t("invoices.loading")
                    : invoices.length === 1
                      ? `1 ${t("invoices.total_invoices")}`
                      : `${invoices.length} ${t("invoices.total_invoices_plural")}`}
                </p>
              </div>
            </div>

            {/* Summary mini-cards */}
            {!isLoading && invoices.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-3"
              >
                {[
                  {
                    label: t("invoices.total_invoices_plural"),
                    value: invoices.length.toString(),
                    icon: Receipt,
                    cls: "text-primary",
                  },
                  {
                    label: t("invoices.paid"),
                    value: paidCount.toString(),
                    icon: FileText,
                    cls: "text-emerald-400",
                  },
                  {
                    label: t("invoices.total_spend"),
                    value: `₹${totalSpend.toLocaleString("en-IN")}`,
                    icon: Receipt,
                    cls: "text-accent",
                  },
                ].map((s) => (
                  <Card
                    key={s.label}
                    className="bg-card/50 backdrop-blur-sm border-border/60"
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg bg-muted/40 flex items-center justify-center flex-shrink-0 ${s.cls}`}
                      >
                        <s.icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground truncate">
                          {s.label}
                        </p>
                        <p className="text-lg font-display font-bold text-foreground">
                          {s.value}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            )}

            {/* Desktop table */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/60 overflow-hidden hidden sm:block">
              <CardHeader className="pb-0 pt-4 px-5">
                <CardTitle className="font-display text-sm text-muted-foreground">
                  {t("invoices.billing_history")}
                </CardTitle>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20 border-border hover:bg-muted/20">
                    {headers.map((h) => (
                      <TableHead
                        key={h}
                        className="font-display text-xs uppercase tracking-wide text-muted-foreground h-11"
                      >
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableSkeleton />
                  ) : invoices.length === 0 ? null : (
                    pageData.map((inv, idx) => (
                      <TableRow
                        key={inv.id}
                        className="border-border hover:bg-muted/10 transition-colors duration-150 group"
                        data-ocid={`invoices.item.${(page - 1) * PAGE_SIZE + idx + 1}`}
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground py-4">
                          {inv.invoice_no}
                        </TableCell>
                        <TableCell className="text-sm font-medium py-4">
                          {PLAN_LABELS[inv.plan as PlanCode] ?? inv.plan}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground py-4">
                          {inv.months}&nbsp;
                          {inv.months !== 1
                            ? t("invoices.months").toLowerCase()
                            : t("invoices.month")}
                        </TableCell>
                        <TableCell className="text-sm text-right font-mono py-4">
                          ₹{inv.amount.toLocaleString("en-IN")}
                          <span className="text-xs text-muted-foreground ml-1">
                            {inv.currency}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge
                            variant="outline"
                            className={`text-xs capitalize font-medium ${STATUS_STYLES[inv.status]}`}
                          >
                            {t(`invoices.${inv.status}`)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground py-4">
                          {formatDate(inv.created_at)}
                        </TableCell>
                        <TableCell className="text-right py-4">
                          {inv.status === "paid" ? (
                            <a
                              href={getInvoicePdfUrl(inv.id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${t("invoices.download")} ${inv.invoice_no}`}
                            >
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-primary group-hover:bg-primary/5 transition-colors duration-150"
                                data-ocid={`invoices.download.${(page - 1) * PAGE_SIZE + idx + 1}`}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </a>
                          ) : (
                            <span className="text-muted-foreground/30 text-sm px-3">
                              —
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>

            {/* Mobile card list */}
            {isLoading ? (
              <MobileSkeleton />
            ) : (
              <div className="space-y-3 sm:hidden">
                {pageData.map((inv, idx) => (
                  <motion.div
                    key={inv.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.05 }}
                    className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4 space-y-3 hover:border-border/80 transition-colors duration-150"
                    data-ocid={`invoices.item.${(page - 1) * PAGE_SIZE + idx + 1}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {inv.invoice_no}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize font-medium ${STATUS_STYLES[inv.status]}`}
                      >
                        {t(`invoices.${inv.status}`)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {PLAN_LABELS[inv.plan as PlanCode] ?? inv.plan}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {inv.months}&nbsp;
                          {inv.months !== 1
                            ? t("invoices.months").toLowerCase()
                            : t("invoices.month")}{" "}
                          · {formatDate(inv.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-mono font-bold text-foreground">
                          ₹{inv.amount.toLocaleString("en-IN")}
                        </p>
                        {inv.status === "paid" && (
                          <a
                            href={getInvoicePdfUrl(inv.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                            data-ocid={`invoices.download.${(page - 1) * PAGE_SIZE + idx + 1}`}
                          >
                            <Download className="w-3 h-3" />
                            {t("invoices.download")}
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && invoices.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed border-border bg-muted/5"
                data-ocid="invoices.empty_state"
              >
                <div className="w-16 h-16 rounded-2xl bg-muted/40 flex items-center justify-center mb-4 ring-1 ring-border">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-1">
                  {t("invoices.no_invoices_title")}
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  {t("invoices.no_invoices_desc")}
                </p>
              </motion.div>
            )}

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-muted-foreground">
                  {t("invoices.showing")} {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, invoices.length)}{" "}
                  {t("invoices.of")} {invoices.length}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    data-ocid="invoices.pagination_prev"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPage(n)}
                        className={`h-8 w-8 rounded-md text-sm font-medium transition-colors duration-150 ${
                          page === n
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                        data-ocid={`invoices.page.${n}`}
                      >
                        {n}
                      </button>
                    ),
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    data-ocid="invoices.pagination_next"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </PageTransition>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
