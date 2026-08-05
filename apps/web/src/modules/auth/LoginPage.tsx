import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, LogIn, User } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@esp/ui";
import { toast } from "@esp/ui";
import { useI18n } from "@/i18n";
import { useAuthStore } from "@/state/auth";
import { AppLogo } from "@/components/AppLogo";

const demoAccounts = [
  { username: "admin", role: "Administrator" },
  { username: "khalid", role: "Sales Manager" },
  { username: "sara", role: "Sales Rep" },
  { username: "fahad", role: "Cashier" },
];

export function LoginPage() {
  const { t, locale, setLocale } = useI18n();
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await login(username, password);
    setBusy(false);
    if (res.ok) {
      toast("success", t("dashboard.greeting", { name: username }));
      navigate("/", { replace: true });
    } else {
      setError(res.error ?? "toast.error");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(60rem 30rem at 80% -10%, var(--primary-soft), transparent 60%), radial-gradient(40rem 24rem at 10% 110%, var(--secondary-soft), transparent 60%)",
        }}
        aria-hidden
      />
      <Card className="relative w-full max-w-md shadow-lg">
        <CardHeader className="items-center text-center">
          <AppLogo dark={false} />
          <CardTitle className="mt-3 text-xl">{t("app.name")}</CardTitle>
          <CardDescription>{t("app.tagline")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="username">{t("admin.users")}</Label>
              <div className="relative">
                <User className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  autoComplete="username"
                  className="ps-9"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="px-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Toggle password"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error ? (
              <p className="text-sm text-danger" role="alert">
                {t("toast.error")} — Invalid credentials
              </p>
            ) : null}

            <Button type="submit" className="w-full" size="lg" disabled={busy || !username || !password}>
              <LogIn className="size-4" />
              {busy ? t("common.loading") : t("common.submit")}
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-border bg-muted/50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Demo accounts — password = username
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {demoAccounts.map((a) => (
                <button
                  key={a.username}
                  type="button"
                  onClick={() => {
                    setUsername(a.username);
                    setPassword(a.username);
                  }}
                  className="rounded-lg border border-border bg-surface px-2 py-1.5 text-start text-xs transition-colors hover:border-primary"
                >
                  <span className="font-semibold text-foreground">{a.username}</span>
                  <span className="block text-muted-foreground">{a.role}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
              className="text-sm font-medium text-primary hover:underline"
            >
              {locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
