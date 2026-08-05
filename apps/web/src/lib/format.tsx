import { formatMoney, formatMoneyCompact, formatNumber, type LocaleId } from "@esp/utils";
import { useI18n } from "@/i18n";

export function useFormat() {
  const { locale } = useI18n();
  const loc = (locale === "ar" ? "ar" : "en") as LocaleId;
  return {
    money: (amount: number, currency = "IQD") => formatMoney(amount, currency, loc),
    moneyCompact: (amount: number, currency = "IQD") => formatMoneyCompact(amount, currency, loc),
    number: (value: number) => formatNumber(value, loc),
    locale: loc,
  };
}

export function useDocumentTitle(title: string) {
  return title;
}
