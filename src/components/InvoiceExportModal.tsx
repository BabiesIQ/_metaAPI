import { AnimatePresence, motion } from "motion/react";
import { X, Download, Printer } from "lucide-react";
import type { Invoice } from "@/types/index";
import { useRef } from "react";

interface InvoiceExportModalProps {
  open: boolean;
  invoice: Invoice | null;
  userEmail?: string;
  userName?: string;
  onClose: () => void;
}

const PLAN_LABELS: Record<string, string> = {
  free: "Free", pro: "Pro", pro_plus: "Pro Plus", business: "Business",
};

export function InvoiceExportModal({ open, invoice, userEmail, userName, onClose }: InvoiceExportModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank", "width=700,height=900");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head>
      <meta charset="UTF-8">
      <title>Invoice ${invoice?.invoice_no ?? ""} — BabiesIQ</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; color: #111; padding: 0; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      </style>
    </head><body>${content}</body></html>`);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 400);
  };

  if (!invoice) return null;

  const issueDate = new Date(invoice.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  const planLabel = PLAN_LABELS[invoice.plan] ?? invoice.plan;

  const invoiceHTML = `
<div style="max-width:640px;margin:0 auto;padding:40px 36px;background:#fff;">
  <!-- Header -->
  <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:36px;padding-bottom:24px;border-bottom:2px solid #f3f4f6;">
    <div>
      <div style="font-size:28px;font-weight:800;letter-spacing:-0.5px;background:linear-gradient(135deg,#7c3aed,#db2777);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">BabiesIQ</div>
      <div style="font-size:12px;color:#9ca3af;margin-top:4px;">babyapi.pro</div>
      <div style="font-size:12px;color:#9ca3af;">support@babyapi.pro</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:22px;font-weight:700;color:#111;letter-spacing:-0.3px;">INVOICE</div>
      <div style="font-size:13px;color:#7c3aed;font-weight:600;margin-top:4px;">#${invoice.invoice_no}</div>
      <div style="font-size:12px;color:#9ca3af;margin-top:4px;">${issueDate}</div>
    </div>
  </div>

  <!-- Status badge -->
  <div style="margin-bottom:28px;">
    <span style="display:inline-block;background:${invoice.status === "paid" ? "#dcfce7" : "#fef9c3"};color:${invoice.status === "paid" ? "#16a34a" : "#ca8a04"};font-size:11px;font-weight:700;letter-spacing:1px;padding:4px 12px;border-radius:20px;text-transform:uppercase;">${invoice.status}</span>
  </div>

  <!-- Billing to -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px;">
    <div>
      <div style="font-size:11px;font-weight:700;letter-spacing:1px;color:#9ca3af;text-transform:uppercase;margin-bottom:8px;">Billed To</div>
      <div style="font-size:14px;font-weight:600;color:#111;">${userName || "—"}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:2px;">${userEmail || "—"}</div>
    </div>
    <div>
      <div style="font-size:11px;font-weight:700;letter-spacing:1px;color:#9ca3af;text-transform:uppercase;margin-bottom:8px;">From</div>
      <div style="font-size:14px;font-weight:600;color:#111;">BabiesIQ Technologies</div>
      <div style="font-size:13px;color:#6b7280;margin-top:2px;">support@babyapi.pro</div>
    </div>
  </div>

  <!-- Line items table -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <thead>
      <tr style="background:#f9fafb;">
        <th style="text-align:left;padding:10px 14px;font-size:11px;font-weight:700;letter-spacing:0.8px;color:#6b7280;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Description</th>
        <th style="text-align:center;padding:10px 14px;font-size:11px;font-weight:700;letter-spacing:0.8px;color:#6b7280;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Duration</th>
        <th style="text-align:right;padding:10px 14px;font-size:11px;font-weight:700;letter-spacing:0.8px;color:#6b7280;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:14px;font-size:14px;color:#111;border-bottom:1px solid #f3f4f6;">
          <strong>BabiesIQ ${planLabel} Plan</strong><br>
          <span style="font-size:12px;color:#9ca3af;">API streaming subscription</span>
        </td>
        <td style="padding:14px;font-size:14px;color:#374151;text-align:center;border-bottom:1px solid #f3f4f6;">${invoice.months} month${invoice.months > 1 ? "s" : ""}</td>
        <td style="padding:14px;font-size:14px;color:#111;text-align:right;font-weight:600;border-bottom:1px solid #f3f4f6;">₹${Number(invoice.amount).toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  <!-- Total -->
  <div style="display:flex;justify-content:flex-end;margin-bottom:32px;">
    <div style="width:220px;">
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-top:2px solid #111;">
        <span style="font-size:15px;font-weight:700;color:#111;">Total</span>
        <span style="font-size:15px;font-weight:700;color:#111;">${invoice.currency} ₹${Number(invoice.amount).toFixed(2)}</span>
      </div>
    </div>
  </div>

  <!-- Note -->
  <div style="padding:16px;background:#faf5ff;border:1px solid #ede9fe;border-radius:8px;margin-bottom:28px;">
    <p style="font-size:12px;color:#7c3aed;margin:0;line-height:1.6;">
      Thank you for subscribing to BabiesIQ. Your subscription has been activated and API access is now available.
      For any billing queries, contact us at <strong>support@babyapi.pro</strong>.
    </p>
  </div>

  <!-- Footer -->
  <div style="text-align:center;padding-top:20px;border-top:1px solid #f3f4f6;">
    <p style="font-size:11px;color:#9ca3af;">© 2025 BabiesIQ · babyapi.pro · All prices in INR</p>
  </div>
</div>`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-2xl my-6 bg-white rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Action bar */}
            <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200 no-print">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Invoice #{invoice.invoice_no}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${invoice.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {invoice.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-100 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </button>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Invoice preview */}
            <div ref={printRef} dangerouslySetInnerHTML={{ __html: invoiceHTML }} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
