import { Badge } from "@esp/ui";
import type { DocumentStatus } from "@esp/types";
import { useI18n, type ArKey } from "@/i18n";

const STATUS_KEYS: Record<DocumentStatus, ArKey> = {
  draft: "status.draft",
  pending: "status.pending",
  approved: "status.approved",
  confirmed: "status.confirmed",
  in_transit: "status.in_transit",
  delivered: "status.delivered",
  partially_paid: "status.partially_paid",
  paid: "status.paid",
  overdue: "status.overdue",
  cancelled: "status.cancelled",
  returned: "status.returned",
  rejected: "status.rejected",
};

const STATUS_VARIANT: Record<DocumentStatus, "neutral" | "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "outline"> = {
  draft: "neutral",
  pending: "warning",
  approved: "info",
  confirmed: "primary",
  in_transit: "secondary",
  delivered: "primary",
  partially_paid: "warning",
  paid: "success",
  overdue: "danger",
  cancelled: "neutral",
  returned: "secondary",
  rejected: "danger",
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const { t } = useI18n();
  return (
    <Badge variant={STATUS_VARIANT[status]} dot>
      {t(STATUS_KEYS[status])}
    </Badge>
  );
}

export function TierBadge({ tier }: { tier: "bronze" | "silver" | "gold" | "platinum" }) {
  const { t } = useI18n();
  const map = {
    bronze: "warning" as const,
    silver: "neutral" as const,
    gold: "warning" as const,
    platinum: "primary" as const,
  };
  return <Badge variant={map[tier]}>{t(`customer.tier.${tier}` as ArKey)}</Badge>;
}

export function StageBadge({ stage }: { stage: string }) {
  const { t } = useI18n();
  const map: Record<string, { variant: "warning" | "info" | "primary" | "success" | "danger" | "neutral"; key: ArKey }> = {
    new: { variant: "neutral", key: "lead.stage.new" },
    qualified: { variant: "info", key: "lead.stage.qualified" },
    proposal: { variant: "warning", key: "lead.stage.proposal" },
    negotiation: { variant: "primary", key: "lead.stage.negotiation" },
    won: { variant: "success", key: "lead.stage.won" },
    lost: { variant: "danger", key: "lead.stage.lost" },
  };
  const cfg = map[stage] ?? { variant: "neutral" as const, key: "common.none" as ArKey };
  return (
    <Badge variant={cfg.variant} dot>
      {t(cfg.key)}
    </Badge>
  );
}
