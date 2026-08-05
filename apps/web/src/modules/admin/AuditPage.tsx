import { useMemo } from "react";
import { FileClock } from "lucide-react";
import type { AuditLog } from "@esp/types";
import { auditHooks } from "@esp/services";
import { Badge } from "@esp/ui";
import { useI18n } from "@/i18n";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { PageLoader } from "@/components/PageHeader";

const actionTone: Record<string, "neutral" | "success" | "warning" | "danger" | "info" | "outline"> = {
  create: "success",
  update: "info",
  delete: "danger",
  login: "info",
  approve: "success",
  reject: "danger",
  export: "neutral",
};

export function AuditPage() {
  const { t } = useI18n();
  const { data, isLoading } = auditHooks.useList({ pageSize: 1000 });

  const rows = useMemo(
    () => [...(data?.items ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [data],
  );

  const columns = useMemo(
    () => [
      {
        id: "actor",
        header: t("audit.actor"),
        cell: ({ row }: { row: { original: AuditLog } }) => (
          <span className="text-sm font-medium text-foreground">{row.original.actorName}</span>
        ),
      },
      {
        id: "action",
        header: t("audit.action"),
        cell: ({ row }: { row: { original: AuditLog } }) => (
          <Badge variant={actionTone[row.original.action] ?? "neutral"}>{row.original.action}</Badge>
        ),
      },
      {
        id: "resource",
        header: t("audit.resource"),
        cell: ({ row }: { row: { original: AuditLog } }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.resource}
            {row.original.resourceId ? (
              <span className="ms-1 text-xs" dir="ltr">· {row.original.resourceId.slice(0, 8)}</span>
            ) : null}
          </span>
        ),
      },
      {
        id: "time",
        header: t("journal.date"),
        cell: ({ row }: { row: { original: AuditLog } }) => (
          <span className="text-sm text-muted-foreground">{new Date(row.original.createdAt).toLocaleString()}</span>
        ),
      },
      {
        id: "ip",
        header: "IP",
        cell: ({ row }: { row: { original: AuditLog } }) => (
          <span className="text-xs text-muted-foreground" dir="ltr">{row.original.ip || "—"}</span>
        ),
      },
    ],
    [t],
  );

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title={t("nav.audit")}
        description={t("admin.auditDesc")}
        actions={<FileClock className="size-5 text-muted-foreground" />}
      />
      <DataTable columns={columns} data={rows} empty={<p className="text-center text-sm text-muted-foreground">{t("common.noResults")}</p>} />
    </div>
  );
}
