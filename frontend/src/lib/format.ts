const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

/** Parse the API's "30 Jun 2026 09:00:00" format. Returns null if unparseable. */
export function parseApiDate(value: string): Date | null {
  const m = value.match(/^(\d{1,2}) (\w{3}) (\d{4})(?: (\d{2}):(\d{2}):(\d{2}))?/);
  if (!m) return null;
  const month = MONTHS[m[2]];
  if (month === undefined) return null;
  return new Date(
    Number(m[3]), month, Number(m[1]),
    Number(m[4] ?? 0), Number(m[5] ?? 0), Number(m[6] ?? 0),
  );
}

export function isUpcoming(startDate: string): boolean {
  const date = parseApiDate(startDate);
  return date !== null && date.getTime() >= Date.now();
}
