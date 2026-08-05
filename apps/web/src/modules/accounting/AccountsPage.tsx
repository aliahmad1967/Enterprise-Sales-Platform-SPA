import { useMemo } from "react";
import { Wallet } from "lucide-react";
import { journalHooks } from "@esp/services";
import { cn } from "@esp/utils";
import { useI18n } from "@/i18n";
import { useFormat } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@esp/ui";
import { PageLoader } from "@/components/PageHeader";

type AccountRow = {
  code: string;
  name: string;
  type: string;
  debit: number;
  credit: number;
  balance: number;
};

export function AccountsPage() {
  const { t } = useI18n();
  const { money } = useFormat();
  const { data, isLoading } = journalHooks.useList({ pageSize: 2000 });

  const accounts = useMemo(() => {
    const map = new Map<string, AccountRow>();
    for (const j of data?.items ?? []) {
      for (const l of j.lines) {
        const key = `${l.accountName}`;
        const row = map.get(key) ?? { code: "", name: l.accountName, type: "unknown", debit: 0, credit: 0, balance: 0 };
        row.debit += l.debit;
        row.credit += l.credit;
        map.set(key, row);
      }
    }
    const rows = [...map.values()].sort((a, b) => b.balance - a.balance);
    const totals = {
      debit: rows.reduce((a, r) => a + r.debit, 0),
      credit: rows.reduce((a, r) => a + r.credit, 0),
      balance: rows.reduce((a, r) => a + r.balance, 0),
    };
    return { rows, totals };
  }, [data]);

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader title={t("nav.accounts")} description={t("accounting.accountsDesc")} />

      <div className="mb-4 grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{t("journal.debit")}</p>
            <p className="text-lg font-bold tabular-nums text-foreground">{money(accounts.totals.debit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{t("journal.credit")}</p>
            <p className="text-lg font-bold tabular-nums text-foreground">{money(accounts.totals.credit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{t("journal.netBalance")}</p>
            <p className={cn("text-lg font-bold tabular-nums", accounts.totals.balance >= 0 ? "text-success" : "text-danger")}>
              {money(accounts.totals.balance)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-start font-medium">{t("journal.account")}</th>
                <th className="px-3 py-2 text-end font-medium">{t("journal.debit")}</th>
                <th className="px-3 py-2 text-end font-medium">{t("journal.credit")}</th>
                <th className="px-4 py-2 text-end font-medium">{t("journal.netBalance")}</th>
              </tr>
            </thead>
            <tbody>
              {accounts.rows.map((r) => (
                <tr key={r.name} className="border-t border-border">
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-foreground">{r.name}</p>
                  </td>
                  <td className="px-3 py-2.5 text-end tabular-nums">{money(r.debit)}</td>
                  <td className="px-3 py-2.5 text-end tabular-nums">{money(r.credit)}</td>
                  <td className={cn("px-4 py-2.5 text-end font-semibold tabular-nums", r.balance >= 0 ? "text-success" : "text-danger")}>
                    {money(r.balance)}
                  </td>
                </tr>
              ))}
              {accounts.rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    <Wallet className="mx-auto mb-2 size-6" />
                    {t("common.noResults")}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
