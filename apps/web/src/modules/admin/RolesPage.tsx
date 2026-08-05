import { useMemo } from "react";
import { ShieldCheck } from "lucide-react";
import type { Role } from "@esp/types";
import { roleHooks } from "@esp/services";
import { Badge } from "@esp/ui";
import { useI18n } from "@/i18n";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@esp/ui";
import { PageLoader } from "@/components/PageHeader";

export function RolesPage() {
  const { t } = useI18n();
  const { data, isLoading } = roleHooks.useList({ pageSize: 100 });

  const roles = useMemo(() => data?.items ?? [], [data]);

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader title={t("nav.roles")} description={t("admin.rolesDesc")} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <ShieldCheck className="size-5" />
                </span>
                <div>
                  <p className="font-semibold text-foreground">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.nameAr || `${r.permissions.length} ${t("role.permissions")}`}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {r.permissions.slice(0, 8).map((p, i) => (
                  <Badge key={i} variant="neutral" className="text-[11px]">
                    {p.resource}:{p.action}
                  </Badge>
                ))}
                {r.permissions.length > 8 ? (
                  <Badge variant="outline" className="text-[11px]">
                    +{r.permissions.length - 8}
                  </Badge>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
