import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Lead } from "@esp/types";
import { Button, FormField, Input, Select, Textarea } from "@esp/ui";
import { useI18n } from "@/i18n";

const schema = z.object({
  name: z.string().min(2),
  company: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  source: z.enum(["walk_in", "website", "referral", "campaign", "social", "other"]),
  stage: z.enum(["new", "qualified", "proposal", "negotiation", "won", "lost"]),
  value: z.coerce.number().min(0).default(0),
  probability: z.coerce.number().min(0).max(100).default(20),
  notes: z.string().optional(),
});

export type LeadFormValues = z.infer<typeof schema>;

export function LeadForm({
  initial,
  onSubmit,
  busy,
}: {
  initial?: Lead;
  onSubmit: (values: LeadFormValues) => Promise<void> | void;
  busy?: boolean;
}) {
  const { t } = useI18n();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof schema>, any, LeadFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? "",
      company: initial?.company ?? "",
      email: initial?.email ?? "",
      phone: initial?.phone ?? "",
      source: initial?.source ?? "walk_in",
      stage: initial?.stage ?? "new",
      value: initial?.value.amount ?? 0,
      probability: initial?.probability ?? 20,
      notes: initial?.notes ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit((values) => void onSubmit(values))} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormField label={t("common.name")} required error={errors.name?.message}>
        <Input {...register("name")} autoFocus />
      </FormField>
      <FormField label={t("lead.company")}>
        <Input {...register("company")} />
      </FormField>
      <FormField label={t("common.email")} error={errors.email?.message}>
        <Input type="email" dir="ltr" {...register("email")} />
      </FormField>
      <FormField label={t("common.phone")}>
        <Input dir="ltr" {...register("phone")} />
      </FormField>
      <FormField label={t("lead.source")}>
        <Select {...register("source")}>
          {(["walk_in", "website", "referral", "campaign", "social", "other"] as const).map((s) => (
            <option key={s} value={s}>
              {t(`lead.source.${s}`)}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label={t("lead.stage")}>
        <Select {...register("stage")}>
          {(["new", "qualified", "proposal", "negotiation", "won", "lost"] as const).map((s) => (
            <option key={s} value={s}>
              {t(`lead.stage.${s}`)}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label={`${t("lead.value")} (IQD)`}>
        <Input type="number" min={0} {...register("value")} />
      </FormField>
      <FormField label={`${t("lead.probability")} (%)`}>
        <Input type="number" min={0} max={100} {...register("probability")} />
      </FormField>
      <FormField label={t("common.notes")} className="sm:col-span-2">
        <Textarea {...register("notes")} />
      </FormField>
      <div className="sm:col-span-2 flex justify-end gap-2">
        <Button type="submit" disabled={busy}>
          {busy ? t("common.loading") : t("common.save")}
        </Button>
      </div>
    </form>
  );
}
