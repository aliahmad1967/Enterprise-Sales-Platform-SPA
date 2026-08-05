import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Building2, Mail, Pencil, Phone, Trash2 } from "lucide-react";
import { cn } from "@esp/utils";
import { customerHooks, useActivityByEntity } from "@esp/services";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Dialog, DialogContent, DialogHeader, DialogTitle, Separator } from "@esp/ui";
import { useI18n } from "@/i18n";
import { useFormat } from "@/lib/format";
import { PageHeader, Money, ActivityFeed } from "@/components/PageHeader";
import { ErrorState, PageLoader } from "@/components/PageHeader";
import { Stats } from "@/components/Stats";
import { CustomerForm } from "./components/CustomerForm";
import { toCustomerPatch } from "./lib";

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const { money } = useFormat();
  const navigate = useNavigate();
  const { data, isLoading, isError } = customerHooks.useGet(id ?? "");
  const update = customerHooks.useUpdate();
  const remove = customerHooks.useRemove();
  const activity = useActivityByEntity("customer", id ?? "");
  const [editing, setEditing] = useState(false);

  if (isLoading) return <PageLoader />;
  if (isError || !data) return <ErrorState message={t("toast.error")} onRetry={() => navigate("/crm/customers")} />;

  const stats = [
    { label: t("customer.totalSpent"), value: money(data.totalRevenue.amount), tone: "primary" as const },
    { label: t("customer.totalInvoices"), value: `${data.totalInvoices}`, tone: "info" as const },
    { label: t("customer.balance"), value: money(data.balance.amount), tone: data.balance.amount > 0 ? ("danger" as const) : ("success" as const) },
    { label: t("customer.creditLimit"), value: money(data.creditLimit.amount), tone: "warning" as const },
  ];

  return (
    <div>
      <PageHeader
        title={data.name}
        description={data.nameAr || data.email || t("common.contact")}
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
                  navigate("/crm/customers");
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
        <Badge variant={data.tier === "gold" || data.tier === "platinum" ? "success" : "neutral"}>
          {t(`customer.tier.${data.tier}`)}
        </Badge>
        <Badge variant="outline">{data.segment}</Badge>
        <Badge variant="outline">
          <Building2 className="me-1 size-3" />
          {new Date(data.since).toLocaleDateString()}
        </Badge>
      </div>

      <Stats items={stats} />

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
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("common.createdAt")}</dt>
                <dd>{new Date(data.createdAt).toLocaleDateString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("common.updatedAt")}</dt>
                <dd>{new Date(data.updatedAt).toLocaleDateString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">VAT</dt>
                <dd dir="ltr">{data.taxNumber || "—"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("common.edit")}</DialogTitle>
          </DialogHeader>
          <CustomerForm
            initial={data}
            onSubmit={async (v) => {
              await update.mutateAsync({ id: data.id, patch: toCustomerPatch(v) });
              setEditing(false);
            }}
            busy={update.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
