import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Search } from "lucide-react";
import type { JournalEntry } from "@esp/types";
import { journalHooks } from "@esp/services";
import { Badge, Input } from "@esp/ui";
import { useI18n } from "@/i18n";
import { useFormat } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { PageLoader } from "@/components/PageHeader";

export function JournalPage() {
  const { t } = useI18n();
  const { money } = useFormat();
  const navigate = useNavigate();
  const { data, isLoading } = journalHooks.useList({ pageSize: 1000 });
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const all = data?.items ?? [];
    const ql = q.trim().toLowerCase();
    return [...all]
      .filter((j) => !ql || j.code.toLowerCase().includes(ql) || (j.description ?? "").toLowerCase().includes(ql))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [data, q]);

  const columns = useMemo(
    () => [
      {
        id: "code",
        header: t("journal.code"),
        cell: ({ row }: { row: { original: JournalEntry } }) => (
          <span className="text-sm font-semibold text-primary" dir="ltr">{row.original.code}</span>
        ),
      },
      {
        id: "date",
        header: t("journal.date"),
        cell: ({ row }: { row: { original: JournalEntry } }) => (
          <span className="text-sm text-muted-foreground">{new Date(row.original.date).toLocaleDateString()}</span>
        ),
      },
      {
        id: "description",
        header: t("journal.description"),
        cell: ({ row }: { row: { original: JournalEntry } }) => (
          <span className="text-sm text-foreground">{row.original.description || "—"}</span>
        ),
      },
      {
        id: "lines",
        header: t("journal.accounts"),
        cell: ({ row }: { row: { original: JournalEntry } }) => (
          <span className="text-xs text-muted-foreground">{row.original.lines.length} × {row.original.lines.map((l) => l.accountName).join(", ")}</span>
        ),
      },
      {
        id: "total",
        header: t("journal.debit"),
        cell: ({ row }: { row: { original: JournalEntry } }) => (
          <span className="text-sm font-semibold tabular-nums">{money(row.original.lines.reduce((a, l) => a + l.debit, 0))}</span>
        ),
      },
      {
        id: "posted",
        header: t("journal.posted"),
        cell: ({ row }: { row: { original: JournalEntry } }) => (
          <Badge variant={row.original.posted ? "success" : "warning"}>
            {row.original.posted ? t("journal.posted") : t("journal.draft")}
          </Badge>
        ),
      },
    ],
    [t, money],
  );

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title={t("nav.journal")}
        description={t("accounting.journalDesc")}
        actions={<BookOpen className="size-5 text-muted-foreground" />}
      />
      <div className="relative mb-4 max-w-md">
        <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("common.search")} className="ps-9" />
      </div>
      <DataTable columns={columns} data={rows} empty={<p className="text-center text-sm text-muted-foreground">{t("common.noResults")}</p>} />
    </div>
  );
}
