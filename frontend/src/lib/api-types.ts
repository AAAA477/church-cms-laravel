/**
 * Hand-written types for the Laravel API (Phase 0).
 * Shapes verified against live responses; replace with generated types
 * from the OpenAPI spec (storage/api-docs/api-docs.json) later.
 */

export interface ChurchDetails {
  church_name: string;
  church_logo: string | null;
  short_summary: string | null;
  long_summary: string | null;
  quotes: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  website: string | null;
  facebook: string | null;
  twitter: string | null;
  instagram: string | null;
}

export interface SocialMedia {
  website: string | null;
  facebook: string | null;
  twitter: string | null;
  instagram: string | null;
}

export interface PrayerRequest {
  id: number;
  requested_person: string;
  requested_person_avatar: string | null;
  category: string | null;
  text: string;
  status: string;
  total_prayers: number;
  date: string;
}

export interface LiftResponse {
  success: boolean;
  message?: string;
  error?: string;
  code?: "PRAYER_INACTIVE" | "DUPLICATE_PARTICIPATION";
  participant_count?: number;
  participant_breakdown?: {
    total: number;
    members: number;
    guests: number;
    anonymous: number;
  };
}

export interface Event {
  id: number;
  select_type: string;
  title: string;
  description: string;
  repeats: number;
  freq: string | null;
  freq_term: string | null;
  location: string;
  category: string | null;
  image: string | null;
  start_date: string;
  end_date: string;
}

export interface Sermon {
  sermon_id: number;
  author: string;
  title: string;
  description: string;
  cover_image: string | null;
  total_likes: number;
  total_unlikes: number;
  date: string;
  audio_count: number;
  video_count: number;
  file_count: number;
}

export interface Gallery {
  id: number;
  church_id: number;
  name: string;
  path: string | null;
  "no.of.photos": number;
  photos: unknown[];
}

export interface Photo {
  id: number;
  path: string;
}

export interface Bulletin {
  id: number;
  church_id: number;
  name: string;
  type: string;
  week: number | null;
  month: number | null;
  year: number;
  cover_image: string | null;
  path: string | null;
}

export interface SermonLink {
  sermons_id: number;
  title: string;
  type: string; // "audio" | "video" | "file" | external link types
  location: string | null;
  url: string;
}

export interface ContactPayload {
  church_id: string;
  fullname: string;
  email: string;
  mobile: string;
  query_message: string;
}

export interface Paginated<T> {
  data: T[];
  links: { first: string; last: string; prev: string | null; next: string | null };
  meta: { current_page: number; from: number | null; last_page: number; total?: number };
}

export interface Post {
  id: number;
  title: string;
  description: string;
  category: { id: number; name: string } | null;
  tags: string[];
  cover: string | null;
  attachments: { id: number; path: string; original_path: string }[];
  like_count: number;
  date: string | null;
}

export interface FaqCategory {
  id: number;
  name: string;
  faqs: { id: number; question: string; answer: string }[];
}

export interface PageNavGroup {
  category: string;
  category_slug: string | null;
  pages: { id: number; name: string; slug: string }[];
}

export interface CmsPage {
  id: number;
  name: string;
  slug: string;
  category: string | null;
  category_slug: string | null;
  description: string | null;
  cover_image: string | null;
}
