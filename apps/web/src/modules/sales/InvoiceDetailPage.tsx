import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { invoiceHooks } from "@esp/services";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Separator } from "@esp/ui";
import { useI18n } from "@/i18n";
import { useFormat } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { ErrorState, PageLoader } from "@/components/PageHeader";
import { invoiceStatusTone } from "./lib";

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const { money } = useFormat();
  const navigate = useNavigate();
  const { data, isLoading, isError } = invoiceHooks.useGet(id ?? "");

  if (isLoading) return <PageLoader />;
  if (isError || !data) return <ErrorState message={t("toast.error")} onRetry={() => navigate("/sales/invoices")} />;

  const qrPayload = JSON.stringify({
    code: data.code,
    uuid: data.id,
    total: data.totals.total,
    tax: data.totals.tax,
    date: data.issueDate,
    vat: "IQD",
  });

  return (
    <div>
      <PageHeader
        title={data.code}
        description={`${data.customerName} · ${new Date(data.issueDate).toLocaleDateString()}`}
        actions={
          <>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="size-4" />
              {t("invoice.print")}
            </Button>
            <Button variant="ghost" onClick={() => navigate("/sales/invoices")}>
              <ArrowLeft className="size-4" />
              {t("common.back")}
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant={invoiceStatusTone[data.status]}>{t(`invoice.status.${data.status}`)}</Badge>
        <Badge variant="outline">{t(`invoice.method.${data.paymentMethod}`)}</Badge>
        <Badge variant="outline">{t("invoice.dueDate")}: {new Date(data.dueDate).toLocaleDateString()}</Badge>
      </div>

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
                {data.lines.map((l) => (
                  <tr key={l.id} className="border-t border-border">
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-foreground">{l.name}</p>
                      <p className="text-xs text-muted-foreground" dir="ltr">{l.sku}</p>
                    </td>
                    <td className="px-3 py-2.5 text-center tabular-nums">{l.qty}</td>
                    <td className="px-3 py-2.5 text-end tabular-nums">{money(l.unitPrice)}</td>
                    <td className="px-3 py-2.5 text-end font-semibold tabular-nums">{money(l.qty * l.unitPrice * (1 - l.discountPct / 100))}</td>
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
                <dd className="tabular-nums">{money(data.totals.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("invoice.discount")}</dt>
                <dd className="tabular-nums text-danger">−{money(data.totals.discount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("invoice.vat")}</dt>
                <dd className="tabular-nums">{money(data.totals.tax)}</dd>
              </div>
              <Separator />
              <div className="flex justify-between text-base">
                <dt className="font-semibold text-foreground">{t("invoice.total")}</dt>
                <dd className="font-bold tabular-nums text-primary">{money(data.totals.total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("invoice.paid")}</dt>
                <dd className="tabular-nums text-success">{money(data.paidAmount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("invoice.remaining")}</dt>
                <dd className="tabular-nums text-danger">{money(Math.max(0, data.totals.total - data.paidAmount))}</dd>
              </div>
            </dl>
            {data.notes ? <p className="mt-4 rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">{data.notes}</p> : null}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4 flex flex-col items-center gap-2 p-6 text-center">
        <QRCodeSVG value={qrPayload} size={128} bgColor="transparent" fgColor="var(--foreground)" />
        <p className="text-xs text-muted-foreground">{t("invoice.einvoice")}</p>
      </Card>
    </div>
  );
}
