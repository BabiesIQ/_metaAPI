import { getBackendUrl } from "@/lib/config";
import type { Announcement, AnnouncementListItem, TrustedDomain } from "@/types/announcements";

function adminHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  };
}

async function adminFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data: T; error: string | null }> {
  const res = await fetch(`${getBackendUrl()}${path}`, {
    credentials: "include",
    headers: { ...adminHeaders(), ...((options.headers as Record<string, string>) ?? {}) },
    ...options,
  });
  const json = await res.json();
  return json;
}

// ── Announcements ─────────────────────────────────────────────────────────────

export function adminListAnnouncements() {
  return adminFetch<Announcement[]>("/api/admin/announcements");
}

export function adminGetAnnouncement(id: number) {
  return adminFetch<Announcement>(`/api/admin/announcements/${id}`);
}

export function adminCreateAnnouncement(data: {
  title: string;
  description: string;
  content: string;
  tags: string[];
  status: string;
  pinned: boolean;
  publish_at?: string | null;
}) {
  return adminFetch<Announcement>("/api/admin/announcements", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function adminUpdateAnnouncement(
  id: number,
  data: {
    title: string;
    description: string;
    content: string;
    tags: string[];
    status: string;
    pinned: boolean;
    publish_at?: string | null;
  }
) {
  return adminFetch<Announcement>(`/api/admin/announcements/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function adminDeleteAnnouncement(id: number) {
  return adminFetch<{ deleted: boolean }>(`/api/admin/announcements/${id}`, {
    method: "DELETE",
  });
}

export function adminArchiveAnnouncement(id: number) {
  return adminFetch<{ archived: boolean }>(`/api/admin/announcements/${id}/archive`, {
    method: "POST",
  });
}

export function adminRestoreAnnouncement(id: number) {
  return adminFetch<{ restored: boolean }>(`/api/admin/announcements/${id}/restore`, {
    method: "POST",
  });
}

// ── Trusted Domains ───────────────────────────────────────────────────────────

export function adminListDomains() {
  return adminFetch<TrustedDomain[]>("/api/admin/domains");
}

export function adminCreateDomain(data: {
  domain: string;
  environment: string;
  notes: string;
}) {
  return adminFetch<TrustedDomain>("/api/admin/domains", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function adminUpdateDomain(
  id: number,
  data: { status: string; environment: string; notes: string }
) {
  return adminFetch<TrustedDomain>(`/api/admin/domains/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function adminDeleteDomain(id: number) {
  return adminFetch<{ deleted: boolean }>(`/api/admin/domains/${id}`, {
    method: "DELETE",
  });
}

// ── Public announcements (for use in user panel / announcement bar) ────────────

export async function getPublicAnnouncements(): Promise<AnnouncementListItem[]> {
  try {
    const res = await fetch(`${getBackendUrl()}/api/v1/announcements`, {
      credentials: "omit",
      headers: adminHeaders(),
      signal: AbortSignal.timeout(5000),
    });
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}
