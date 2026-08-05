/** Locale-aware formatting built on Intl (Arabic-first, RTL-safe). */

export type LocaleId = "ar" | "en";

const enNum = new Intl.NumberFormat("en-US");
const arNum = new Intl.NumberFormat("ar-EG", {
  numberingSystem: "latn",
});

/** Format a plain number (keeps Latin digits for consistency in the UI). */
export function formatNumber(value: number, locale: LocaleId = "en"): string {
  const fmt = locale === "ar" ? arNum : enNum;
  return fmt.format(value);
}

export function formatNumberFixed(
  value: number,
  digits = 2,
  locale: LocaleId = "en",
): string {
  const fmt =
    locale === "ar"
      ? new Intl.NumberFormat("ar-EG", {
          minimumFractionDigits: digits,
          maximumFractionDigits: digits,
          numberingSystem: "latn",
        })
      : new Intl.NumberFormat("en-US", {
          minimumFractionDigits: digits,
          maximumFractionDigits: digits,
        });
  return fmt.format(value);
}

/** Currencies that have no minor units (0 decimal places). */
const zeroDecimalCurrencies = new Set(["IQD", "JPY", "KRW", "VND"]);

function currencyDigits(currency: string): number {
  return zeroDecimalCurrencies.has(currency) ? 0 : 2;
}

/** Format money in a given currency. */
export function formatMoney(
  amount: number,
  currency = "IQD",
  locale: LocaleId = "en",
): string {
  const localeTag = locale === "ar" ? "ar-IQ" : "en-US";
  const digits = currencyDigits(currency);
  try {
    return new Intl.NumberFormat(localeTag, {
      style: "currency",
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
      numberingSystem: "latn",
    }).format(amount);
  } catch {
    return `${formatNumberFixed(amount, digits, locale)} ${currency}`;
  }
}

/** Compact money (e.g. 1.2M) for dashboards. */
export function formatMoneyCompact(
  amount: number,
  currency = "IQD",
  locale: LocaleId = "en",
): string {
  const abs = Math.abs(amount);
  let scaled = amount;
  let suffix = "";
  if (abs >= 1_000_000_000) {
    scaled = amount / 1_000_000_000;
    suffix = "B";
  } else if (abs >= 1_000_000) {
    scaled = amount / 1_000_000;
    suffix = "M";
  } else if (abs >= 1_000) {
    scaled = amount / 1_000;
    suffix = "K";
  }
  const digits = Math.abs(scaled) >= 100 ? 0 : 1;
  return `${formatNumberFixed(scaled, digits, locale)}${suffix} ${currency}`;
}

const enDate = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});
const arDate = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function formatDate(
  date: Date | string | number,
  locale: LocaleId = "en",
): string {
  const d = typeof date === "object" ? date : new Date(date);
  return (locale === "ar" ? arDate : enDate).format(d);
}

const enTime = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});
const arTime = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
  hour: "numeric",
  minute: "2-digit",
});

export function formatTime(date: Date | string | number, locale: LocaleId = "en"): string {
  const d = typeof date === "object" ? date : new Date(date);
  return (locale === "ar" ? arTime : enTime).format(d);
}

export function formatDateTime(
  date: Date | string | number,
  locale: LocaleId = "en",
): string {
  return `${formatDate(date, locale)} ${formatTime(date, locale)}`;
}

const relEn = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const relAr = new Intl.RelativeTimeFormat("ar", { numeric: "auto" });

export function relativeTime(date: Date | string | number, locale: LocaleId = "en"): string {
  const d = typeof date === "object" ? date : new Date(date);
  const diffMs = d.getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const abs = Math.abs(diffSec);
  const fmt = locale === "ar" ? relAr : relEn;
  if (abs < 60) return fmt.format(diffSec, "second");
  const diffMin = Math.round(diffMs / 60000);
  if (Math.abs(diffMin) < 60) return fmt.format(diffMin, "minute");
  const diffHour = Math.round(diffMs / 3600000);
  if (Math.abs(diffHour) < 24) return fmt.format(diffHour, "hour");
  const diffDay = Math.round(diffMs / 86400000);
  if (Math.abs(diffDay) < 30) return fmt.format(diffDay, "day");
  const diffMonth = Math.round(diffMs / 2629746000);
  if (Math.abs(diffMonth) < 12) return fmt.format(diffMonth, "month");
  return fmt.format(Math.round(diffMs / 31556952000), "year");
}

/** Format an interval in h:mm */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${m.toString().padStart(2, "0")}m` : `${m}m`;
}

/** Arabic ordinal month name (full) for calendars. */
export function monthName(index: number, locale: LocaleId = "en"): string {
  const d = new Date(2024, index, 1);
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-US", {
    month: "long",
  }).format(d);
}

export function dayName(index: number, locale: LocaleId = "en"): string {
  const d = new Date(2024, 0, 7 + index);
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-US", {
    weekday: "long",
  }).format(d);
}
