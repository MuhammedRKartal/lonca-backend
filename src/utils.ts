/**
 * Converts a number representing a month (1-12) into a 3-character month abbreviation.
 *
 * @param num - The number representing the month (1 for January, 2 for February, etc.).
 * @returns A string containing the 3-character month abbreviation (e.g., "Jan", "Feb", "Mar").
 *          If the number is not in the range of 1 to 12, returns null.
 */
export const numberToMonth = (num: number): string | null => {
  const months: string[] = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  if (num >= 1 && num <= 12) {
    return months[num - 1];
  }

  return null;
};
