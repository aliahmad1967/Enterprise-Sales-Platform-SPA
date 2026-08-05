import { useNavigate, useParams } from "react-router-dom";
import { quotationHooks } from "@esp/services";
import { useI18n } from "@/i18n";
import { PageHeader } from "@/components/PageHeader";
import { ErrorState, PageLoader } from "@/components/PageHeader";
import { DocumentDetail } from "./components/DocumentDetail";

const tone: Record<string, "neutral" | "success" | "warning" | "danger" | "info" | "outline"> = {
  draft: "neutral",
  pending: "warning",
  approved: "success",
  rejected: "danger",
  cancelled: "neutral",
};

export function QuotationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { data, isLoading, isError } = quotationHooks.useGet(id ?? "");

  if (isLoading) return <PageLoader />;
  if (isError || !data) return <ErrorState message={t("toast.error")} onRetry={() => navigate("/sales/quotations")} />;

  return (
    <div>
      <PageHeader title={data.code} description={data.customerName} />
      <DocumentDetail
        code={data.code}
        customerName={data.customerName}
        status={data.status}
        date={data.createdAt}
        dateLabel={t("quotation.issueDate")}
        badges={[
          ...(data.validUntil
            ? [{ label: `${t("quotation.validUntil")}: ${new Date(data.validUntil).toLocaleDateString()}` }]
            : []),
        ]}
        lines={data.lines}
        totals={data.totals}
        notes={data.notes}
        toneFor={(s) => tone[s]}
        statusLabel={(s) => t(`invoice.status.${s}`)}
        onBack={() => navigate("/sales/quotations")}
      />
    </div>
  );
}
