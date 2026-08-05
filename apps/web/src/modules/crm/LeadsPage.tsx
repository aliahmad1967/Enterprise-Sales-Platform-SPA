import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Users } from "lucide-react";
import { cn } from "@esp/utils";
import type { Lead } from "@esp/types";
import { leadHooks } from "@esp/services";
import { Badge, Button, Dialog, DialogContent, DialogHeader, DialogTitle, Input } from "@esp/ui";
import { useI18n } from "@/i18n";
import { useAuthStore } from "@/state/auth";
import { useFormat } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { PageLoader } from "@/components/PageHeader";
import { LeadForm } from "./components/LeadForm";
import { toLeadInput } from "./lib";

const stageTone: Record<Lead["stage"], "neutral" | "info" | "warning" | "success" | "danger"> = {
  new: "neutral",
  qualified: "info",
  proposal: "warning",
  negotiation: "warning",
  won: "success",
  lost: "danger",
};

export function LeadsPage() {
  const { t } = useI18n();
  const { money } = useFormat();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = leadHooks.useList();
  const create = leadHooks.useCreate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<string>("all");

  const filtered = useMemo(() => {
    const rows = data?.items ?? [];
    const ql = q.trim().toLowerCase();
    return rows.filter((l) => {
      if (stage !== "all" && l.stage !== stage) return false;
      if (!ql) return true;
      return (
        l.name.toLowerCase().includes(ql) ||
        (l.company ?? "").toLowerCase().includes(ql) ||
        (l.email ?? "").toLowerCase().includes(ql)
      );
    });
  }, [data, q, stage]);

  const columns = useMemo(
    () => [
      {
        id: "name",
        header: t("lead.name"),
        cell: ({ row }: { row: { original: Lead } }) => (
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-xs font-bold text-secondary">
              {row.original.name.charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{row.original.name}</p>
              <p className="truncate text-xs text-muted-foreground">{row.original.company || row.original.email}</p>
            </div>
          </div>
        ),
      },
      {
        id: "stage",
        header: t("lead.stage"),
        cell: ({ row }: { row: { original: Lead } }) => (
          <Badge variant={stageTone[row.original.stage]}>{t(`lead.stage.${row.original.stage}`)}</Badge>
        ),
      },
      {
        id: "value",
        header: t("lead.value"),
        cell: ({ row }: { row: { original: Lead } }) => (
          <span className="text-sm font-semibold tabular-nums">{money(row.original.value.amount)}</span>
        ),
      },
      {
        id: "probability",
        header: t("lead.probability"),
        cell: ({ row }: { row: { original: Lead } }) => (
          <span className={cn("text-sm font-medium tabular-nums", row.original.probability >= 50 ? "text-success" : "text-warning")}>
            {row.original.probability}%
          </span>
        ),
      },
      {
        id: "source",
        header: t("lead.source"),
        cell: ({ row }: { row: { original: Lead } }) => (
          <span className="text-xs text-muted-foreground">{t(`lead.source.${row.original.source}`)}</span>
        ),
      },
    ],
    [t, money],
  );

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title={t("nav.leads")}
        description={t("crm.leadsDesc")}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate("/crm/leads/pipeline")}>
              <Users className="size-4" />
              {t("lead.pipeline")}
            </Button>
            <Button onClick={() => setOpen(true)}>
              <Plus className="size-4" />
              {t("lead.new")}
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("common.search")} className="ps-9" />
        </div>
        <select
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          className="h-9 w-full appearance-none rounded-lg border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring sm:w-52"
        >
          <option value="all">{t("lead.allStages")}</option>
          {(["new", "qualified", "proposal", "negotiation", "won", "lost"] as const).map((s) => (
            <option key={s} value={s}>
              {t(`lead.stage.${s}`)}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={(row) => navigate(`/crm/leads/${row.id}`)}
        empty={<p className="text-center text-sm text-muted-foreground">{t("common.noResults")}</p>}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("lead.new")}</DialogTitle>
          </DialogHeader>
          <LeadForm
            onSubmit={async (v) => {
              if (!user) return;
              await create.mutateAsync(toLeadInput(v, user.id));
              setOpen(false);
            }}
            busy={create.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
