import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Building, MapPin } from "lucide-react";
import type { Warehouse } from "@esp/types";
import { warehouseHooks } from "@esp/services";
import { Badge } from "@esp/ui";
import { useI18n } from "@/i18n";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { PageLoader } from "@/components/PageHeader";

export function WarehousesPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { data, isLoading } = warehouseHooks.useList({ pageSize: 100 });

  const rows = useMemo(() => data?.items ?? [], [data]);

  const columns = useMemo(
    () => [
      {
        id: "name",
        header: t("common.name"),
        cell: ({ row }: { row: { original: Warehouse } }) => (
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-warning-soft text-warning">
              <Building className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">{row.original.name}</p>
              <p className="text-xs text-muted-foreground">{row.original.nameAr || row.original.code}</p>
            </div>
          </div>
        ),
      },
      {
        id: "code",
        header: "Code",
        cell: ({ row }: { row: { original: Warehouse } }) => (
          <span className="text-sm text-muted-foreground" dir="ltr">{row.original.code}</span>
        ),
      },
      {
        id: "address",
        header: t("common.address"),
        cell: ({ row }: { row: { original: Warehouse } }) => (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5" /> {row.original.address || "—"}
          </span>
        ),
      },
      {
        id: "active",
        header: t("common.status"),
        cell: ({ row }: { row: { original: Warehouse } }) => (
          <Badge variant={row.original.active ? "success" : "neutral"}>
            {row.original.active ? t("common.active") : t("common.inactive")}
          </Badge>
        ),
      },
    ],
    [t],
  );

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader title={t("nav.warehouses")} description={t("inventory.warehousesDesc")} />
      <DataTable columns={columns} data={rows} empty={<p className="text-center text-sm text-muted-foreground">{t("common.noResults")}</p>} />
    </div>
  );
}
