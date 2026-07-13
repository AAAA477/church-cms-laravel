/**
 * Hand-written types for the Laravel API (Phase 0).
 * Shapes verified against live responses; replace with generated types
 * from the OpenAPI spec (storage/api-docs/api-docs.json) later.
 */

export interface ChurchDetails {
  church_name: string;
  church_logo: string | null;
  favicon: string | null;
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
  extra_links: { label: string; url: string }[];
  theme_palette: string;
  theme_custom_colors: { primary: string; accent: string; background: string; text: string } | null;
  about_carousel: AboutSlide[];
}

export interface AboutSlide {
  image: string;
  title: string;
  text: string;
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

export interface MemberProfile {
  church_name: string;
  user_id: number;
  firstname: string;
  lastname: string;
  gender: string;
  date_of_birth: string;
  profession: string;
  address: string;
  city_name: string;
  state_name: string;
  country_name: string;
  email_id: string;
  mobile_no: string;
  membership_type: string;
  membership_start_date: string;
  marriage_status: string;
  avatar: string;
}

export interface MemberGroup {
  group_id: number;
  group_name: string;
  cover_image: string | null;
  started: string;
  group_category: string;
  group_type: string;
  group_description: string;
  user_permissions: string[];
  group_members: string[];
  role: string;
}

export interface GroupPostItem {
  id: number;
  message: string;
  attachments: string;
  status: string;
  created_at: string;
}

export type GatewayName =
  | "cash"
  | "paystack"
  | "flutterwave"
  | "mpesa"
  | "gcash"
  | "stripe"
  | "pix"
  | "telebirr";

export interface PayGateway {
  id: number;
  gatewayname: GatewayName;
  display_name: string;
  instructions: string;
  public_key: string | null;
  currency: string | null;
  is_online: boolean;
}

export interface Notification {
  id: string;
  data_message: string;
  web_message: string;
  read_at: string;
  created_at: string;
}

export interface AdminMe {
  id: number;
  name: string;
  email: string;
  usergroup_id: number;
  is_admin: boolean;
  permissions: string[];
}

export interface DashboardStats {
  members: number;
  male_members: number;
  female_members: number;
  guests: number;
  male_guests: number;
  female_guests: number;
  events: number;
  galleries: number;
  files: number;
  bulletins: number;
  groups: number;
  pending_prayers: number;
  pending_helps: number;
  total_fund: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recent_members: { id: number; name: string; email: string; city: string | null }[];
  upcoming_events: { id: number; title: string; start_date: string; location: string }[];
  pending_prayers: { id: number; text: string; name: string }[];
  pending_helps: { id: number; title: string; name: string | null }[];
  birthdays: { id: number; name: string }[];
  anniversaries: { id: number; name: string }[];
  latest_sermons: { id: number; title: string; date: string | null }[];
  offerings_chart: { label: string | number; amount: number }[];
}

export interface AdminMemberSummary {
  id: number;
  name: string;
  email: string | null;
  mobile_no: string;
  gender: string | null;
  status: string | null;
  city: string | null;
  avatar: string | null;
}

export interface AdminMemberDetail {
  id: number;
  name: string;
  email: string | null;
  mobile_no: string;
  firstname: string | null;
  lastname: string | null;
  gender: string | null;
  date_of_birth: string | null;
  profession: string | null;
  address: string | null;
  city_id: number | null;
  state_id: number | null;
  country_id: number | null;
  pincode: string | null;
  family: string | null;
  marriage_status: string | null;
  preferred_channel: string | null;
  relation: string | null;
  status: string | null;
  membership_type: string | null;
  avatar: string | null;
}

export interface AdminGuestSummary {
  id: number;
  name: string;
  email: string | null;
  mobile_no: string;
  gender: string | null;
  status: string | null;
  city: string | null;
  avatar: string | null;
}

export interface AdminGuestDetail {
  id: number;
  name: string;
  email: string | null;
  mobile_no: string;
  firstname: string | null;
  lastname: string | null;
  gender: string | null;
  date_of_birth: string | null;
  profession: string | null;
  sub_occupation: string | null;
  address: string | null;
  city_id: number | null;
  state_id: number | null;
  country_id: number | null;
  pincode: string | null;
  aadhar_number: string | null;
  notes: string | null;
  status: string | null;
  membership_type: string | null;
  avatar: string | null;
}

export interface AdminGroupSummary {
  id: number;
  name: string;
  category: string | null;
  group_type: string | null;
  cover_image: string | null;
  member_count: number;
}

export interface AdminGroupDetail {
  id: number;
  name: string;
  description: string | null;
  category_id: number | null;
  category: string | null;
  group_type: string | null;
  cover_image: string | null;
  member_count: number;
}

export interface AdminGroupCategory {
  id: number;
  name: string;
}

export interface AdminGroupMember {
  link_id: number;
  user_id: number;
  name: string;
  email: string | null;
  role: string | null;
}

export interface AdminAvailableMember {
  id: number;
  name: string;
}

export interface AdminSubAdminSummary {
  id: number;
  name: string;
  email: string | null;
  mobile_no: string;
  avatar: string | null;
  role: "admin" | "subadmin";
}

export interface AdminSubAdminDetail {
  id: number;
  name: string;
  email: string | null;
  role: "admin" | "subadmin";
  mobile_no: string;
  firstname: string | null;
  lastname: string | null;
  gender: string | null;
  date_of_birth: string | null;
  profession: string | null;
  address: string | null;
  city_id: number | null;
  state_id: number | null;
  country_id: number | null;
  pincode: string | null;
  notes: string | null;
  avatar: string | null;
}

export interface AdminPermissions {
  all: string[];
  assigned: string[];
}

export interface AdminEventSummary {
  id: number;
  title: string;
  category: string | null;
  location: string | null;
  start_date: string;
  end_date: string;
  image: string | null;
}

export interface AdminEventDetail {
  id: number;
  title: string;
  description: string | null;
  select_type: string | null;
  category: string | null;
  location: string | null;
  organised_by: string | null;
  start_date: string;
  end_date: string;
  repeats: boolean;
  freq: number | null;
  freq_term: string | null;
  publish_to_web: boolean;
  enable_gallery: boolean;
  image: string | null;
}

export interface AdminEventPhoto {
  id: number;
  path: string;
}

export interface AdminSermonSummary {
  id: number;
  title: string;
  cover_image: string | null;
  link_count: number;
}

export interface AdminSermonDetail {
  id: number;
  title: string;
  description: string | null;
  cover_image: string | null;
}

export interface AdminSermonLink {
  id: number;
  title: string | null;
  date: string;
  video_link: string | null;
  audio_link: string | null;
  pdf_link: string | null;
}

export interface AdminBulletin {
  id: number;
  name: string;
  type: "week" | "month";
  week: number | null;
  month: number | null;
  year: number;
  cover_image: string | null;
  path: string | null;
}

export interface AdminGallerySummary {
  id: number;
  name: string;
  cover_image: string | null;
  photo_count: number;
}

export interface AdminGalleryDetail {
  id: number;
  name: string;
  description: string | null;
  cover_image: string | null;
}

export interface AdminGalleryPhoto {
  id: number;
  path: string;
}

export interface AdminQuote {
  id: number;
  text: string | null;
  tamil_quotes: string | null;
  english_quotes: string | null;
  image: string | null;
  publish_on: string;
}

export interface AdminPrayerCounts {
  pending: number;
  active: number;
  answered: number;
  ended: number;
  rejected: number;
}

export interface AdminPrayerSummary {
  id: number;
  text: string | null;
  status: string;
  category: string | null;
  user: string | null;
  pinned: boolean;
  created_at: string;
}

export interface AdminPrayerDetail extends AdminPrayerSummary {
  original_text: string | null;
  rejection_reason: string | null;
  answer_testimony: string | null;
  expires_at: string | null;
  approver: string | null;
  rejector: string | null;
}

export interface AdminPrayerCategory {
  id: number;
  name: string;
  css_class: string;
  emoji: string;
  display_color: string;
  gradient_start: string;
  gradient_end: string;
  sort_order: number;
  is_active: boolean;
  description: string | null;
}

export interface AdminHelpCounts {
  pending?: number;
  approve?: number;
  reject?: number;
  close?: number;
}

export interface AdminHelp {
  id: number;
  title: string | null;
  description: string | null;
  contact_details: string | null;
  status: "pending" | "approve" | "reject" | "close";
  comments: string | null;
  expired_at: string | null;
  user: string | null;
  created_at: string;
}

export interface AdminFeedbackSummary {
  id: number;
  user: string | null;
  status: boolean;
  message_count: number;
  created_at: string;
}

export interface AdminFeedbackMessage {
  id: number;
  message: string;
  category: string;
  is_seen: string | number;
  created_at: string;
}

export interface AdminFeedbackDetail {
  id: number;
  user: string | null;
  messages: AdminFeedbackMessage[];
}

export interface AdminContact {
  id: number;
  fullname: string;
  email: string | null;
  mobile: string;
  query: string;
  date_of_submission: string;
}

export interface AdminFundSummary {
  id: number;
  name: string;
  membership: "member" | "guest";
  amount: number;
  method: string;
  status: "request" | "pending" | "deposited" | "cancel";
  created_at: string;
}

export interface AdminFundDetail extends AdminFundSummary {
  data: Record<string, string | null> | null;
  payment_details: Record<string, string | null> | null;
  comments: string | null;
}

export interface AdminFundMember {
  id: number;
  name: string;
}

export interface AdminDonation {
  id: number;
  name: string;
  email: string | null;
  amount: number;
  currency: string;
  category: string | null;
  method: string;
  status: "pending" | "completed" | "cancelled";
  note: string | null;
  donated_at: string;
}

export interface AdminPaymentGateway {
  id: number;
  gatewayname: string;
  displayname: string;
  currency: string | null;
}

export interface AdminPayaccountSummary {
  id: number;
  paymentgateway_id: number;
  gateway_name: string | null;
  gateway_display: string | null;
  status: boolean;
}

export interface AdminPayaccountDetail extends AdminPayaccountSummary {
  params: (string | null)[];
  comments: string | null;
}

export interface AdminMessageBatch {
  batch_id: string;
  subject: string | null;
  message: string;
  mode: string;
  recipients: number;
  sent_at: string;
}

export interface AdminMessageDetail {
  id: number;
  to: string | null;
  mode: string;
  subject: string | null;
  message: string;
  sent_at: string;
}

export interface AdminMessageRecipient {
  id: number;
  name: string;
}

export interface AdminMailingList {
  id: number;
  name: string;
  description: string | null;
  scope: "subscription" | "campaign" | "segment";
  is_published: boolean;
  subscriber_count: number | null;
}

export interface AdminMailingListSubscriber {
  link_id: number;
  email: string | null;
  name: string;
}

export interface AdminSubscriber {
  id: number;
  email: string;
  firstname: string | null;
  lastname: string | null;
  is_active: boolean;
  source: string | null;
}

export interface AdminCampaign {
  id: number;
  name: string;
  description: string | null;
  status: boolean;
  mailinglist_id: number | null;
  mailinglist_name: string | null;
}

export interface AdminPageCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
}

export interface AdminPageSummary {
  id: number;
  page_name: string;
  category_id: number;
  category: string | null;
  description: string;
  cover_image: string | null;
  status: boolean;
}

export interface AdminPageDetail extends AdminPageSummary {
  slug: string;
  menu_text: string | null;
  menu_order: number;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  og_image: string | null;
  content: unknown;
  layout_template: string;
}

export interface AdminPageVersion {
  id: number;
  version_number: number;
  saved_by: string;
  created_at: string;
}

export interface AdminPostCategory {
  id: number;
  name: string;
  description: string | null;
}

export interface AdminPost {
  id: number;
  title: string | null;
  description: string;
  category_id: number | null;
  category: string | null;
  status: string;
  is_posted: boolean;
  posted_at: string | null;
  created_at: string;
}

export interface AdminFaqCategory {
  id: number;
  name: string;
  status: boolean;
}

export interface AdminFaq {
  id: number;
  faq_category_id: number;
  category: string | null;
  question: string;
  answer: string;
  order: string | null;
}

export interface AdminWidget {
  id: number;
  page: string;
  position: "top" | "bottom" | null;
  display_order: number;
  content: string;
}

export interface AdminChurchSettings {
  [key: string]: string | null;
}

export interface AdminActivityLogEntry {
  id: number;
  description: string;
  log_name: string;
  created_at: string;
}

export interface IdCard {
  name: string;
  member_id: number;
  phone: string;
  address: string;
  membership_type: string | null;
  membership_year: string;
  avatar: string | null;
  church_name: string | null;
  church_logo: string | null;
  qr_code: string;
}

export interface Donation {
  id: number;
  amount: string;
  currency: string;
  category: string;
  method: string;
  status: "pending" | "completed" | "cancelled";
  note: string | null;
  donated_at: string;
}

export interface MemberEvent {
  event_id: number;
  title: string;
  description: string;
  location: string;
  image: string | null;
  start_date: string;
  end_date: string;
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
  custom_css: string | null;
  layout_template: "left-sidebar" | "right-sidebar" | "no-sidebar";
  cover_image: string | null;
}
