// Promotion pricing rules — ported from complisk-backend/utils/calculatePrice.js.
//
// Rules summary:
//   Online store (online-ecommerce):
//     base $10 (includes 1 state) + extra states $10 each
//     timezones $30 each (Eastern: $50 + $30 per non-Eastern)
//   Physical (small/medium/large):
//     no states selected → starter $10 (includes 2 cities)
//     states selected → $20 per state (no base)
//     timezones $60 each (Eastern: $100 + $60 per non-Eastern)
//
// Cities are free in both modes (covered by subscription).

export function calculatePrice({
  months = 1,
  cities = [],
  states = [],
  timezones = [],
  businessType = "small",
} = {}) {
  const isOnline = businessType === "online-ecommerce";
  const hasEastern = timezones.some((tz) =>
    String(tz).toLowerCase().includes("eastern")
  );
  const nonEasternCount = timezones.filter(
    (tz) => !String(tz).toLowerCase().includes("eastern")
  ).length;

  let baseCost = 0;
  let stateCost = 0;
  let timezoneCost = 0;

  if (isOnline) {
    baseCost = 10;
    if (states.length > 1) stateCost = (states.length - 1) * 10;

    if (timezones.length > 0) {
      timezoneCost = hasEastern
        ? nonEasternCount * 30 + 50
        : timezones.length * 30;
    }
  } else {
    if (states.length > 0) {
      stateCost = states.length * 20;
    } else {
      baseCost = 10;
    }

    if (timezones.length > 0) {
      timezoneCost = hasEastern
        ? nonEasternCount * 60 + 100
        : timezones.length * 60;
    }
  }

  const subtotal = baseCost + stateCost + timezoneCost;
  const total = subtotal * (months || 1);

  return {
    subtotal,
    total,
    months: months || 1,
    breakdown: {
      baseCost,
      stateCost,
      timezoneCost,
      stateCount: states.length,
      timezoneCount: timezones.length,
      hasEasternTimezone: hasEastern,
    },
  };
}

// Subscription-aware pricing: cities are free up to subscription's freeCities,
// states free up to freeStates, timezones free up to freeTimezones, and the
// rest is priced as add-ons on top.
export function calculateAddOnPrice({
  states = [],
  timezones = [],
  businessType = "small",
  subscription,
} = {}) {
  const isOnline = businessType === "online-ecommerce";
  const freeStates = subscription?.freeStates ?? 0;
  const freeTimezones = subscription?.freeTimezones ?? 0;

  const extraStates = Math.max(0, states.length - freeStates);
  const extraTimezones = Math.max(0, timezones.length - freeTimezones);

  let stateCost = 0;
  let timezoneCost = 0;

  if (extraStates > 0) {
    stateCost = isOnline ? extraStates * 10 : extraStates * 20;
  }

  if (extraTimezones > 0) {
    const hasEastern = timezones.some((tz) =>
      String(tz).toLowerCase().includes("eastern")
    );
    const nonEasternCount = timezones.filter(
      (tz) => !String(tz).toLowerCase().includes("eastern")
    ).length;

    if (hasEastern) {
      timezoneCost = isOnline
        ? nonEasternCount * 30 + 50
        : nonEasternCount * 60 + 100;
    } else {
      timezoneCost = isOnline
        ? extraTimezones * 30
        : extraTimezones * 60;
    }
  }

  return {
    total: stateCost + timezoneCost,
    breakdown: { stateCost, timezoneCost, extraStates, extraTimezones },
  };
}
