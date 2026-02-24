/**
 * Returns the current date in M/D/YYYY format (e.g., 2/24/2026)
 */
export function getTodayDate(): string {
  const date = new Date();
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

/**
 * Returns a future date in YYYY-MM-DD format
 * @param monthsAhead Number of months to add
 */
export function getFutureDate(monthsAhead: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsAhead);
  return date.toISOString().split("T")[0];
}
