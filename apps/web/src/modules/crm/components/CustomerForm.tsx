import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Customer } from "@esp/types";
import { Button, FormField, Input, Select, Textarea } from "@esp/ui";
import { useI18n } from "@/i18n";

const schema = z.object({
  name: z.string().min(2),
  nameAr: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  taxNumber: z.string().optional(),
  tier: z.enum(["bronze", "silver", "gold", "platinum"]),
  segment: z.string().optional(),
  creditLimit: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof schema>;

export function CustomerForm({
  initial,
  onSubmit,
  busy,
}: {
  initial?: Customer;
  onSubmit: (values: CustomerFormValues) => Promise<void> | void;
  busy?: boolean;
}) {
  const { t } = useI18n();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof schema>, any, CustomerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? "",
      nameAr: initial?.nameAr ?? "",
      email: initial?.email ?? "",
      phone: initial?.phone ?? "",
      taxNumber: initial?.taxNumber ?? "",
      tier: initial?.tier ?? "silver",
      segment: initial?.segment ?? "retail",
      creditLimit: initial?.creditLimit.amount ?? 0,
      notes: initial?.notes ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit((values) => void onSubmit(values))} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormField label={t("common.name")} required error={errors.name?.message}>
        <Input {...register("name")} autoFocus />
      </FormField>
      <FormField label={`${t("common.name")} (عربي)`} hint={t("common.optional")}>
        <Input {...register("nameAr")} />
      </FormField>
      <FormField label={t("common.email")} error={errors.email?.message}>
        <Input type="email" dir="ltr" {...register("email")} />
      </FormField>
      <FormField label={t("common.phone")}>
        <Input dir="ltr" {...register("phone")} />
      </FormField>
      <FormField label={t("customer.tier")} required>
        <Select {...register("tier")}>
          {(["bronze", "silver", "gold", "platinum"] as const).map((tr) => (
            <option key={tr} value={tr}>
              {t(`customer.tier.${tr}`)}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Segment">
        <Select {...register("segment")}>
          <option value="retail">Retail</option>
          <option value="wholesale">Wholesale</option>
          <option value="government">Government</option>
          <option value="corporate">Corporate</option>
        </Select>
      </FormField>
      <FormField label={`${t("customer.creditLimit")} (IQD)`}>
        <Input type="number" min={0} {...register("creditLimit")} />
      </FormField>
      <FormField label="VAT / Tax No.">
        <Input dir="ltr" {...register("taxNumber")} />
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
