/** Dates from the API are always YYYY-MM-DD strings; format them without
 *  constructing a local Date, which would shift the day in some timezones. */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function parts(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return { y, m, d, dow: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
}

/** "27 Aug" */
export function shortDate(date: string) {
  if (!date) return "—";
  const { m, d } = parts(date);
  return `${d} ${MONTHS[m - 1].slice(0, 3)}`;
}

/** "27 August 2026" */
export function longDate(date: string) {
  if (!date) return "—";
  const { y, m, d } = parts(date);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** "Thursday 27 August 2026" */
export function fullDate(date: string) {
  if (!date) return "—";
  const { dow } = parts(date);
  return `${DAYS[dow]} ${longDate(date)}`;
}

export function weekdayShort(date: string) {
  return DAYS[parts(date).dow].slice(0, 3).toUpperCase();
}

export function dayOfMonth(date: string) {
  return parts(date).d;
}

/** "Today", "3 days ago", "11 days ago" */
export function relativeDay(date: string | null, todayDate: string) {
  if (!date) return "Never";
  if (date === todayDate) return "Today";
  const diff = Math.round(
    (Date.parse(`${todayDate}T00:00:00Z`) - Date.parse(`${date}T00:00:00Z`)) / 86400000,
  );
  if (diff === 1) return "Yesterday";
  if (diff > 1) return `${diff} days ago`;
  return longDate(date);
}

export function slotLabel(slot: number, isBonus: boolean) {
  return isBonus ? "Bonus" : String(slot);
}

export function truncate(text: string, max = 60) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}
