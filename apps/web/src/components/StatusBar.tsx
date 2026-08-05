import { Cloud, CloudOff, RefreshCw, Wifi } from "lucide-react";
import { useOnline } from "@esp/hooks";
import { useI18n } from "@/i18n";

export function StatusBar() {
  const { t } = useI18n();
  const online = useOnline();

  return (
    <footer className="flex h-7 shrink-0 items-center gap-3 border-t border-border bg-background px-4 text-[11px] text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span className={`size-1.5 rounded-full ${online ? "bg-success" : "bg-warning"}`} />
        {online ? t("common.online") : t("common.offline")}
      </span>
      {online ? (
        <span className="hidden items-center gap-1 sm:flex">
          <Cloud className="size-3" />
          {t("statusbar.lastSync")}: {new Date().toLocaleTimeString()}
        </span>
      ) : (
        <span className="flex items-center gap-1">
          <CloudOff className="size-3" />
          {t("statusbar.offline")}
        </span>
      )}
      <span className="ms-auto hidden items-center gap-1 md:flex">
        <Wifi className="size-3" />
        {online ? t("common.synced") : t("common.queued")}
        <RefreshCw className="size-3" />
      </span>
    </footer>
  );
}
