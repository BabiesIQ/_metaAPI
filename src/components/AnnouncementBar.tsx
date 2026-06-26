/**
 * AnnouncementBar — Real-time announcement channel for BabiesIQ
 *
 * Displays the latest pinned or most-recent published announcement at the top
 * of the page. Polls for updates every 60 seconds for near-real-time updates.
 */

import { useEffect, useState } from "react";
import { getBackendUrl } from "@/lib/config";
import type { AnnouncementListItem } from "@/types/announcements";

interface AnnouncementBarProps {
  className?: string;
}

export function AnnouncementBar({ className = "" }: AnnouncementBarProps) {
  const [announcement, setAnnouncement] = useState<AnnouncementListItem | null>(null);
  const [dismissed, setDismissed] = useState<number | null>(null);

  const fetchLatest = async () => {
    try {
      const res = await fetch(`${getBackendUrl()}/api/v1/announcements`, {
        credentials: "omit",
        headers: { "X-Requested-With": "XMLHttpRequest" },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return;
      const json = await res.json() as { success: boolean; data: AnnouncementListItem[] };
      if (json.success && json.data?.length > 0) {
        setAnnouncement(json.data[0]);
      }
    } catch {
      // silent — don't break the page
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("babiesiq-dismissed-announcement");
    if (stored) setDismissed(parseInt(stored, 10));

    fetchLatest();
    const interval = setInterval(fetchLatest, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!announcement) return null;
  if (dismissed === announcement.id) return null;

  const handleDismiss = () => {
    setDismissed(announcement.id);
    localStorage.setItem("babiesiq-dismissed-announcement", String(announcement.id));
  };

  return (
    <div className={`relative flex items-center justify-center gap-3 px-4 py-2.5 text-sm bg-indigo-600 text-white overflow-hidden ${className}`}>
      {/* Background shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 opacity-80" />

      {/* Verified badge */}
      <span className="relative flex items-center gap-1.5 shrink-0">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white/90">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
          BabiesIQ
        </span>
      </span>

      <span className="relative text-white/30">·</span>

      {/* Content */}
      <span className="relative font-medium truncate max-w-prose">
        {announcement.title}
        {announcement.description ? (
          <span className="text-white/70 ml-1.5 font-normal hidden sm:inline">
            — {announcement.description}
          </span>
        ) : null}
      </span>

      {/* Tags */}
      {announcement.tags?.slice(0, 2).map((tag) => (
        <span
          key={tag}
          className="relative hidden md:inline-flex shrink-0 items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/15 text-white/90"
        >
          {tag}
        </span>
      ))}

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
        className="relative ml-auto shrink-0 p-1 rounded-md hover:bg-white/10 transition-colors text-white/60 hover:text-white"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>
    </div>
  );
}
