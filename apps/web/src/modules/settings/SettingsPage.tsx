import { Building2, Globe, Moon, Sun, UserCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Select } from "@esp/ui";
import { useI18n } from "@/i18n";
import { useThemeStore } from "@/state/theme";
import { useAuthStore } from "@/state/auth";
import { PageHeader } from "@/components/PageHeader";

export function SettingsPage() {
  const { t, locale, setLocale } = useI18n();
  const { mode, setMode } = useThemeStore();
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <PageHeader title={t("nav.settings")} description={t("settings.title")} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle2 className="size-5 text-primary" />
              {t("settings.profile")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span
                className="flex size-12 items-center justify-center rounded-full text-lg font-bold text-white"
                style={{ background: user?.avatarColor || "var(--primary)" }}
              >
                {(user?.name ?? "?").charAt(0)}
              </span>
              <div>
                <p className="font-semibold text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.roleName} · @{user?.username}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground" dir="ltr">{user?.email}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="size-5 text-primary" />
              {t("settings.language")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={locale} onChange={(e) => setLocale(e.target.value as "ar" | "en")}>
              <option value="ar">العربية (RTL)</option>
              <option value="en">English (LTR)</option>
            </Select>
            <p className="text-xs text-muted-foreground">
              {locale === "ar" ? "سيتم تطبيق اتجاه RTL تلقائياً" : "RTL/LTR applied automatically"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {mode === "dark" ? <Moon className="size-5 text-primary" /> : <Sun className="size-5 text-primary" />}
              {t("settings.theme")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={mode} onChange={(e) => setMode(e.target.value as "light" | "dark")}>
              <option value="light">{t("theme.light")}</option>
              <option value="dark">{t("theme.dark")}</option>
            </Select>
            <p className="text-xs text-muted-foreground">{t("statusbar.ready")}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-5 text-primary" />
            {t("settings.currency")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">IQD — Iraqi Dinar</p>
        </CardContent>
      </Card>
    </div>
  );
}
