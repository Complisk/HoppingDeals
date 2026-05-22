// Date helpers ported from hopping-deals-backend/utils/dateUtils.js.

export function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isValidDateRange(startDate, endDate) {
  return new Date(startDate) <= new Date(endDate);
}

// Counts how many month boundaries fit between start and end.
// Any extra day past a boundary rounds up. Minimum 1.
export function calculateMonthsFromDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (start > end) return 0;

  const addMonths = (d, months) => {
    const nd = new Date(d.getTime());
    const day = nd.getDate();
    nd.setMonth(nd.getMonth() + months);
    if (nd.getDate() < day) nd.setDate(0);
    return nd;
  };

  let months = 0;
  while (addMonths(start, months + 1) <= end) months += 1;

  const lastBoundary = addMonths(start, months);
  if (end > lastBoundary) months += 1;

  return Math.max(1, months);
}
