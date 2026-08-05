import { ArrowLeft, Printer } from "lucide-react";
import type { DocumentStatus } from "@esp/types";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Separator } from "@esp/ui";
import { useI18n } from "@/i18n";
import { useFormat } from "@/lib/format";

export function DocumentDetail({
  code,
  customerName,
  status,
  date,
  dateLabel,
  badges,
  lines,
  totals,
  notes,
  toneFor,
  statusLabel,
  onBack,
}: {
  code: string;
  customerName: string;
  status: DocumentStatus;
  date: string;
  dateLabel: string;
  badges?: { label: string; variant?: "outline" | "neutral" | "success" | "warning" | "danger" | "info" }[];
  lines: Array<{ id: string; name: string; sku: string; qty: number; unitPrice: number; discountPct: number }>;
  totals: { subtotal: number; discount: number; tax: number; total: number };
  notes?: string;
  toneFor: (status: DocumentStatus) => "neutral" | "success" | "warning" | "danger" | "info" | "outline" | undefined;
  statusLabel: (status: DocumentStatus) => string;
  onBack: () => void;
}) {
  const { t } = useI18n();
  const { money } = useFormat();

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={toneFor(status)}>{statusLabel(status)}</Badge>
          {badges?.map((b, i) => (
            <Badge key={i} variant={b.variant ?? "outline"}>
              {b.label}
            </Badge>
          ))}
        </div>
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="size-4" />
          {t("common.back")}
        </Button>
      </div>

      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-foreground" dir="ltr">{code}</p>
            <p className="text-sm text-muted-foreground">{customerName}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {dateLabel}: <span className="font-medium text-foreground">{new Date(date).toLocaleDateString()}</span>
          </p>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="size-4" />
            {t("invoice.print")}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("invoice.items")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-start font-medium">{t("common.product")}</th>
                  <th className="px-3 py-2 text-center font-medium">{t("common.qty")}</th>
                  <th className="px-3 py-2 text-end font-medium">{t("invoice.price")}</th>
                  <th className="px-3 py-2 text-end font-medium">{t("invoice.amount")}</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => (
                  <tr key={l.id} className="border-t border-border">
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-foreground">{l.name}</p>
                      <p className="text-xs text-muted-foreground" dir="ltr">{l.sku}</p>
                    </td>
                    <td className="px-3 py-2.5 text-center tabular-nums">{l.qty}</td>
                    <td className="px-3 py-2.5 text-end tabular-nums">{money(l.unitPrice)}</td>
                    <td className="px-3 py-2.5 text-end font-semibold tabular-nums">
                      {money(l.qty * l.unitPrice * (1 - l.discountPct / 100))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("invoice.summary")}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("invoice.subtotal")}</dt>
                <dd className="tabular-nums">{money(totals.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("invoice.discount")}</dt>
                <dd className="tabular-nums text-danger">−{money(totals.discount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("invoice.vat")}</dt>
                <dd className="tabular-nums">{money(totals.tax)}</dd>
              </div>
              <Separator />
              <div className="flex justify-between text-base">
                <dt className="font-semibold text-foreground">{t("invoice.total")}</dt>
                <dd className="font-bold tabular-nums text-primary">{money(totals.total)}</dd>
              </div>
            </dl>
            {notes ? <p className="mt-4 rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">{notes}</p> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
