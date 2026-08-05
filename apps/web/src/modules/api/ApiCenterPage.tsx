import { Activity, Database, Globe, KeyRound, Plug, Server } from "lucide-react";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@esp/ui";
import { useI18n } from "@/i18n";
import { PageHeader } from "@/components/PageHeader";
import { useOnline } from "@esp/hooks";

const endpoints = [
  { method: "GET", path: "/api/v1/dashboard/summary", desc: "Dashboard summary" },
  { method: "GET", path: "/api/v1/customers", desc: "List customers" },
  { method: "POST", path: "/api/v1/customers", desc: "Create customer" },
  { method: "GET", path: "/api/v1/products", desc: "List products" },
  { method: "GET", path: "/api/v1/invoices", desc: "List invoices" },
  { method: "POST", path: "/api/v1/invoices", desc: "Create invoice" },
  { method: "GET", path: "/api/v1/reports/sales", desc: "Sales reports" },
  { method: "POST", path: "/api/v1/auth/login", desc: "JWT login" },
];

const methodTone: Record<string, "success" | "info" | "warning" | "danger"> = {
  GET: "success",
  POST: "info",
  PUT: "warning",
  DELETE: "danger",
};

export function ApiCenterPage() {
  const { t } = useI18n();
  const online = useOnline();

  return (
    <div>
      <PageHeader title={t("nav.apiCenter")} description={t("api.title")} />

      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <span className="flex size-10 items-center justify-center rounded-lg bg-success-soft text-success">
              <Database className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">{t("common.online")}</p>
              <p className="text-lg font-bold text-foreground">{online ? "IndexedDB" : "Offline"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <span className="flex size-10 items-center justify-center rounded-lg bg-info-soft text-info">
              <Server className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">API</p>
              <p className="text-lg font-bold text-foreground">{online ? "Pending" : "Offline"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <span className="flex size-10 items-center justify-center rounded-lg bg-warning-soft text-warning">
              <KeyRound className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">JWT</p>
              <p className="text-lg font-bold text-foreground">{online ? "Demo" : "Local"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Activity className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">{t("common.synced")}</p>
              <p className="text-lg font-bold text-foreground">100%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="size-5 text-primary" />
            REST Endpoints (ASP.NET Core 9 — contract-first)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-start font-medium">Method</th>
                <th className="px-3 py-2 text-start font-medium">Path</th>
                <th className="px-4 py-2 text-start font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map((e) => (
                <tr key={`${e.method}${e.path}`} className="border-t border-border">
                  <td className="px-4 py-2">
                    <Badge variant={methodTone[e.method]}>{e.method}</Badge>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-foreground" dir="ltr">{e.path}</td>
                  <td className="px-4 py-2 text-muted-foreground">{e.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="flex items-center gap-2 border-t border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            <Globe className="size-3.5" />
            {t("statusbar.offline")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
