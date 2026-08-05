import { useMemo, useState } from "react";
import { Mail, Phone, Plus, Search, User } from "lucide-react";
import type { Contact } from "@esp/types";
import { contactHooks } from "@esp/services";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, Input } from "@esp/ui";
import { useI18n } from "@/i18n";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { PageLoader } from "@/components/PageHeader";

export function ContactsPage() {
  const { t } = useI18n();
  const { data, isLoading } = contactHooks.useList();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const rows = data?.items ?? [];
    const ql = q.trim().toLowerCase();
    if (!ql) return rows;
    return rows.filter(
      (c) =>
        c.name.toLowerCase().includes(ql) ||
        (c.email ?? "").toLowerCase().includes(ql) ||
        (c.role ?? "").toLowerCase().includes(ql),
    );
  }, [data, q]);

  const columns = useMemo(
    () => [
      {
        id: "name",
        header: t("common.name"),
        cell: ({ row }: { row: { original: Contact } }) => (
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-info-soft text-info">
              <User className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">{row.original.name}</p>
              <p className="text-xs text-muted-foreground">{row.original.role || "—"}</p>
            </div>
          </div>
        ),
      },
      {
        id: "email",
        header: t("common.email"),
        cell: ({ row }: { row: { original: Contact } }) => (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground" dir="ltr">
            <Mail className="size-3.5" /> {row.original.email || "—"}
          </span>
        ),
      },
      {
        id: "phone",
        header: t("common.phone"),
        cell: ({ row }: { row: { original: Contact } }) => (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground" dir="ltr">
            <Phone className="size-3.5" /> {row.original.phone || "—"}
          </span>
        ),
      },
      {
        id: "primary",
        header: t("contact.primary"),
        cell: ({ row }: { row: { original: Contact } }) => (
          <span className={row.original.isPrimary ? "font-semibold text-primary" : "text-muted-foreground"}>
            {row.original.isPrimary ? "●" : "○"}
          </span>
        ),
      },
    ],
    [t],
  );

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title={t("nav.contacts")}
        description={t("crm.contactsDesc")}
        actions={
          <Button onClick={() => undefined} disabled title={t("contact.addFromCustomer")}>
            <Plus className="size-4" />
            {t("contact.new")}
          </Button>
        }
      />
      <div className="relative mb-4 max-w-md">
        <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("common.search")} className="ps-9" />
      </div>
      <DataTable
        columns={columns}
        data={filtered}
        empty={<p className="text-center text-sm text-muted-foreground">{t("common.noResults")}</p>}
      />
    </div>
  );
}
