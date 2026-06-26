export interface AnnouncementListItem {
  id: number;
  title: string;
  description: string;
  tags: string[];
  status: "draft" | "published" | "archived" | "scheduled";
  pinned: boolean;
  author_name: string;
  view_count: number;
  publish_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Announcement extends AnnouncementListItem {
  content: string;
  author_id: number;
}

export interface TrustedDomain {
  id: number;
  domain: string;
  status: "active" | "disabled";
  added_by: string;
  added_by_id: number;
  environment: "production" | "staging" | "development";
  notes: string;
  last_verified: string | null;
  created_at: string;
  updated_at: string;
}
