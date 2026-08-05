import { useNavigate, useParams } from "react-router-dom";
import { orderHooks } from "@esp/services";
import { useI18n } from "@/i18n";
import { PageHeader } from "@/components/PageHeader";
import { ErrorState, PageLoader } from "@/components/PageHeader";
import { DocumentDetail } from "./components/DocumentDetail";

const tone: Record<string, "neutral" | "success" | "warning" | "danger" | "info" | "outline"> = {
  draft: "neutral",
  pending: "warning",
  confirmed: "info",
  in_transit: "info",
  delivered: "success",
  cancelled: "neutral",
  returned: "danger",
};

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { data, isLoading, isError } = orderHooks.useGet(id ?? "");

  if (isLoading) return <PageLoader />;
  if (isError || !data) return <ErrorState message={t("toast.error")} onRetry={() => navigate("/sales/orders")} />;

  return (
    <div>
      <PageHeader title={data.code} description={data.customerName} />
      <DocumentDetail
        code={data.code}
        customerName={data.customerName}
        status={data.status}
        date={data.createdAt}
        dateLabel={t("order.issueDate")}
        badges={[
          { label: t(`invoice.method.${data.paymentMethod}`) },
          ...(data.deliveryDate ? [{ label: `${t("order.deliveryDate")}: ${new Date(data.deliveryDate).toLocaleDateString()}` }] : []),
        ]}
        lines={data.lines}
        totals={data.totals}
        notes={data.notes}
        toneFor={(s) => tone[s]}
        statusLabel={(s) => t(`invoice.status.${s}`)}
        onBack={() => navigate("/sales/orders")}
      />
    </div>
  );
}
