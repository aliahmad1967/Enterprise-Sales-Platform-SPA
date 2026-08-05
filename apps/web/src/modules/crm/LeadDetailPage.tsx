import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Building2, Mail, Pencil, Phone, Trash2 } from "lucide-react";
import { cn } from "@esp/utils";
import { leadHooks, useActivityByEntity } from "@esp/services";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Dialog, DialogContent, DialogHeader, DialogTitle, Progress, Separator } from "@esp/ui";
import { useI18n } from "@/i18n";
import { useFormat } from "@/lib/format";
import { ActivityFeed, PageHeader } from "@/components/PageHeader";
import { ErrorState, PageLoader } from "@/components/PageHeader";
import { Stats } from "@/components/Stats";
import { LeadForm } from "./components/LeadForm";
import { toLeadPatch } from "./lib";

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const { money } = useFormat();
  const navigate = useNavigate();
  const { data, isLoading, isError } = leadHooks.useGet(id ?? "");
  const update = leadHooks.useUpdate();
  const remove = leadHooks.useRemove();
  const activity = useActivityByEntity("lead", id ?? "");
  const [editing, setEditing] = useState(false);

  if (isLoading) return <PageLoader />;
  if (isError || !data) return <ErrorState message={t("toast.error")} onRetry={() => navigate("/crm/leads")} />;

  const stageTone: Record<string, "neutral" | "info" | "warning" | "success" | "danger"> = {
    new: "neutral",
    qualified: "info",
    proposal: "warning",
    negotiation: "warning",
    won: "success",
    lost: "danger",
  };

  const stats = [
    { label: t("lead.value"), value: money(data.value.amount), tone: "primary" as const },
    { label: t("lead.probability"), value: `${data.probability}%`, tone: data.probability >= 50 ? ("success" as const) : ("warning" as const) },
    { label: t("lead.source"), value: t(`lead.source.${data.source}`), tone: "info" as const },
    { label: t("common.createdAt"), value: new Date(data.createdAt).toLocaleDateString(), tone: "warning" as const },
  ];

  return (
    <div>
      <PageHeader
        title={data.name}
        description={data.company || t("lead.name")}
        actions={
          <>
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Pencil className="size-4" />
              {t("common.edit")}
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                if (confirm(t("common.deleteConfirm"))) {
                  await remove.mutateAsync(data.id);
                  navigate("/crm/leads");
                }
              }}
            >
              <Trash2 className="size-4" />
              {t("common.delete")}
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant={stageTone[data.stage]}>{t(`lead.stage.${data.stage}`)}</Badge>
        <Badge variant="outline">{t(`lead.source.${data.source}`)}</Badge>
        <Badge variant="outline">
          <Building2 className="me-1 size-3" />
          {data.assignee || data.ownerId.slice(0, 8)}
        </Badge>
      </div>

      <Stats items={stats} />

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{t("lead.progress")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={data.probability} className="h-2.5" />
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>{t("lead.stage.new")}</span>
            <span className={cn("font-semibold", data.probability >= 50 ? "text-success" : "text-warning")}>
              {data.probability}% {t("lead.winChance")}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("customer.activity")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed
              items={(activity.data ?? []).map((a) => ({
                id: a.id,
                title: a.title,
                meta: a.description,
                kind: a.type,
                time: Date.parse(a.createdAt),
              }))}
              empty={t("common.noResults")}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("common.details")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="size-4 text-muted-foreground" />
              <span dir="ltr">{data.phone || "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" />
              <span dir="ltr">{data.email || "—"}</span>
            </div>
            <Separator />
            {data.notes ? <p className="text-sm text-muted-foreground">{data.notes}</p> : null}
          </CardContent>
        </Card>
      </div>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("common.edit")}</DialogTitle>
          </DialogHeader>
          <LeadForm
            initial={data}
            onSubmit={async (v) => {
              await update.mutateAsync({ id: data.id, patch: toLeadPatch(v) });
              setEditing(false);
            }}
            busy={update.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
