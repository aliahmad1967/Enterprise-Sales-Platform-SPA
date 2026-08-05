import { useEffect, useMemo, useState } from "react";
import { Cpu, Database, Gauge, HardDrive, Wifi, WifiOff } from "lucide-react";
import { getDatabase } from "@esp/services";
import { Card, CardContent } from "@esp/ui";
import { useOnline } from "@esp/hooks";
import { useI18n } from "@/i18n";
import { PageHeader } from "@/components/PageHeader";

export function MonitoringPage() {
  const { t } = useI18n();
  const online = useOnline();
  const db = getDatabase();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const entries = await Promise.all(
        db.tables.map(async (tbl) => [tbl.name, await tbl.count()] as const),
      );
      if (!cancelled) setCounts(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, [db]);

  const totalRows = useMemo(() => Object.values(counts).reduce((a, b) => a + b, 0), [counts]);

  return (
    <div>
      <PageHeader title={t("nav.monitoring")} description={t("monitoring.title")} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Cpu className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Engine</p>
              <p className="text-lg font-bold text-foreground">React 19</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <span className="flex size-10 items-center justify-center rounded-lg bg-info-soft text-info">
              <Database className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">DB</p>
              <p className="text-lg font-bold text-foreground">Dexie v4</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <span className="flex size-10 items-center justify-center rounded-lg bg-success-soft text-success">
              {online ? <Wifi className="size-5" /> : <WifiOff className="size-5" />}
            </span>
            <div>
              <p className="text-xs text-muted-foreground">{t("common.status")}</p>
              <p className="text-lg font-bold text-foreground">{online ? t("common.online") : t("common.offline")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <span className="flex size-10 items-center justify-center rounded-lg bg-warning-soft text-warning">
              <HardDrive className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">{t("common.items")}</p>
              <p className="text-lg font-bold text-foreground">{totalRows.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <Gauge className="size-5 text-primary" />
            <h3 className="font-semibold text-foreground">Tables ({db.tables.length})</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3 lg:grid-cols-4">
            {db.tables.map((tbl) => (
              <div key={tbl.name} className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                <p className="font-medium text-foreground" dir="ltr">{tbl.name}</p>
                <p className="text-xs text-muted-foreground">{(counts[tbl.name] ?? "…").toLocaleString()} rows</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
