import { getBackendUrl } from "@/lib/config";
import type { Announcement, AnnouncementListItem } from "@/types/announcements";

export const ALLOWED_REACTIONS = ["👍", "❤️", "🔥", "😂", "😮", "👏"] as const;
export type ReactionEmoji = (typeof ALLOWED_REACTIONS)[number];

const STORAGE_KEY = "babiesiq-reactions";

function getStoredReactions(): Record<number, ReactionEmoji[]> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveStoredReactions(data: Record<number, ReactionEmoji[]>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getUserReactions(announcementId: number): ReactionEmoji[] {
  return getStoredReactions()[announcementId] ?? [];
}

export async function fetchAnnouncements(): Promise<AnnouncementListItem[]> {
  try {
    const res = await fetch(`${getBackendUrl()}/api/v1/announcements`, {
      credentials: "omit",
      headers: { "X-Requested-With": "XMLHttpRequest" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const json = await res.json() as { success: boolean; data: AnnouncementListItem[] };
    return json.success ? (json.data ?? []) : [];
  } catch {
    return [];
  }
}

// Fetches full announcement (with content) AND increments view count on backend
export async function fetchAnnouncementById(id: number): Promise<Announcement | null> {
  try {
    const res = await fetch(`${getBackendUrl()}/api/v1/announcements/${id}`, {
      credentials: "omit",
      headers: { "X-Requested-With": "XMLHttpRequest" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const json = await res.json() as { success: boolean; data: Announcement };
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function reactToAnnouncement(
  id: number,
  emoji: ReactionEmoji,
  action: "add" | "remove"
): Promise<Record<string, number> | null> {
  try {
    const res = await fetch(`${getBackendUrl()}/api/v1/announcements/${id}/react`, {
      method: "POST",
      credentials: "omit",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify({ emoji, action }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const json = await res.json() as { success: boolean; data: { reactions: Record<string, number> } };
    if (json.success) {
      const stored = getStoredReactions();
      const current = stored[id] ?? [];
      if (action === "add") {
        stored[id] = [...new Set([...current, emoji])];
      } else {
        stored[id] = current.filter((e) => e !== emoji);
      }
      saveStoredReactions(stored);
      return json.data?.reactions ?? null;
    }
    return null;
  } catch {
    return null;
  }
}
