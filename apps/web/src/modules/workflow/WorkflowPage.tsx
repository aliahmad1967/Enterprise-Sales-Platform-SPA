import { useMemo } from "react";
import { Workflow } from "lucide-react";
import type { WorkflowDef } from "@esp/types";
import { workflowHooks } from "@esp/services";
import { Badge, Card, CardContent, Switch } from "@esp/ui";
import { useI18n } from "@/i18n";
import { PageHeader } from "@/components/PageHeader";
import { PageLoader } from "@/components/PageHeader";

export function WorkflowPage() {
  const { t } = useI18n();
  const { data, isLoading } = workflowHooks.useList({ pageSize: 200 });
  const update = workflowHooks.useUpdate();

  const flows = useMemo(() => data?.items ?? [], [data]);

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader title={t("nav.workflow")} description={t("approval.title")} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {flows.map((w) => (
          <Card key={w.id}>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-secondary-soft text-secondary">
                    <Workflow className="size-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">{w.name}</p>
                    <p className="text-xs text-muted-foreground">{w.nameAr || w.code}</p>
                  </div>
                </div>
                <Switch
                  checked={w.enabled}
                  onCheckedChange={(v) => update.mutate({ id: w.id, patch: { enabled: v } })}
                />
              </div>
              <div className="mb-2 flex items-center gap-2 text-xs">
                <Badge variant="outline" dir="ltr">{w.trigger}</Badge>
                <Badge variant="neutral">{w.actions.length} {t("role.permissions")}</Badge>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {w.conditions.map((c, i) => (
                  <Badge key={i} variant="neutral">
                    {c.field} {c.op} {String(c.value)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
