import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, GripVertical, Phone } from "lucide-react";
import { cn } from "@esp/utils";
import type { Lead } from "@esp/types";
import { leadHooks } from "@esp/services";
import { useI18n } from "@/i18n";
import { useFormat } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { PageLoader } from "@/components/PageHeader";

const stages = ["new", "qualified", "proposal", "negotiation", "won", "lost"] as const;
const stageMeta: Record<(typeof stages)[number], { tone: string; dot: string }> = {
  new: { tone: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  qualified: { tone: "bg-info-soft text-info", dot: "bg-info" },
  proposal: { tone: "bg-warning-soft text-warning", dot: "bg-warning" },
  negotiation: { tone: "bg-secondary-soft text-secondary", dot: "bg-secondary" },
  won: { tone: "bg-success-soft text-success", dot: "bg-success" },
  lost: { tone: "bg-danger-soft text-danger", dot: "bg-danger" },
};

export function LeadPipelinePage() {
  const { t } = useI18n();
  const { money } = useFormat();
  const navigate = useNavigate();
  const { data, isLoading } = leadHooks.useList();
  const update = leadHooks.useUpdate();
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);

  const byStage = useMemo(() => {
    const map: Record<string, Lead[]> = { new: [], qualified: [], proposal: [], negotiation: [], won: [], lost: [] };
    for (const l of data?.items ?? []) {
      const bucket = map[l.stage];
      if (bucket) bucket.push(l);
    }
    return map;
  }, [data]);

  if (isLoading) return <PageLoader />;

  const totals = stages.reduce((acc, s) => acc + ((byStage[s]?.length) ?? 0), 0);

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={t("lead.pipeline")}
        description={`${totals} ${t("lead.total")}`}
        actions={
          <button
            onClick={() => navigate("/crm/leads")}
            className="text-sm font-medium text-primary hover:underline"
          >
            {t("lead.backToList")}
          </button>
        }
      />

      <div className="grid flex-1 grid-cols-1 gap-3 overflow-x-auto md:grid-cols-3 xl:grid-cols-6">
        {stages.map((stage) => {
          const leads = byStage[stage] ?? [];
          const meta = stageMeta[stage];
          return (
            <div
              key={stage}
              className={cn(
                "flex flex-col rounded-xl border bg-muted/30 p-2",
                over === stage && "border-primary ring-1 ring-primary/30",
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(stage);
              }}
              onDragLeave={() => setOver((s) => (s === stage ? null : s))}
              onDrop={async (e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/plain");
                setOver(null);
                setDragging(null);
                if (!id) return;
                const lead = (data?.items ?? []).find((l) => l.id === id);
                if (lead && lead.stage !== stage) {
                  await update.mutateAsync({ id, patch: { stage } });
                }
              }}
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <span className={cn("size-2 rounded-full", meta.dot)} />
                  {t(`lead.stage.${stage}`)}
                </span>
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", meta.tone)}>
                  {leads.length}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", lead.id);
                      e.dataTransfer.effectAllowed = "move";
                      setDragging(lead.id);
                    }}
                    onDragEnd={() => setDragging(null)}
                    onClick={() => navigate(`/crm/leads/${lead.id}`)}
                    className={cn(
                      "group cursor-pointer rounded-lg border border-border bg-surface p-3 shadow-sm transition-shadow hover:shadow-md",
                      dragging === lead.id && "opacity-40",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{lead.name}</p>
                      <GripVertical className="size-3.5 shrink-0 text-muted-foreground/60" />
                    </div>
                    {lead.company ? (
                      <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <Building2 className="size-3" /> {lead.company}
                      </p>
                    ) : null}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-bold tabular-nums text-foreground">{money(lead.value.amount)}</span>
                      <span className="text-[11px] font-medium text-warning">{lead.probability}%</span>
                    </div>
                  </div>
                ))}
                {leads.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                    {t("lead.dropHere")}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
