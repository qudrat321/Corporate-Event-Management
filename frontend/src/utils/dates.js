// Format event dates consistently and avoid timezone shifts for date-only values.
export function formatEventDate(value, options) {
  if (!value) return "Date to be announced";

  const dateText = String(value);
  let date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
    const [year, month, day] = dateText.split("-").map(Number);
    date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return "Date to be announced";
    }
  } else {
    date = new Date(value);
  }

  return Number.isNaN(date.getTime())
    ? "Date to be announced"
    : new Intl.DateTimeFormat("en-US", options).format(date);
}
