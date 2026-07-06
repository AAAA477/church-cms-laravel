export const EVENT_CATEGORY_OPTIONS = [
  { value: "prayer", label: "Prayer" },
  { value: "education", label: "Education" },
  { value: "meeting", label: "Meeting" },
  { value: "culturals", label: "Culturals" },
  { value: "sermon", label: "Sermon" },
] as const;

export const EVENT_SELECT_TYPE_OPTIONS = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
  { value: "online", label: "Online" },
] as const;

export const EVENT_FREQ_TERM_OPTIONS = [
  { value: "day", label: "Day(s)" },
  { value: "week", label: "Week(s)" },
  { value: "month", label: "Month(s)" },
  { value: "year", label: "Year(s)" },
] as const;
