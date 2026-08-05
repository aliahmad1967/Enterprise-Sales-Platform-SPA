import { useMemo, useState } from "react";
import { Search, Shield, User } from "lucide-react";
import type { User as UserEntity } from "@esp/types";
import { userHooks } from "@esp/services";
import { Badge, Input, Switch } from "@esp/ui";
import { useI18n } from "@/i18n";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { PageLoader } from "@/components/PageHeader";

export function UsersPage() {
  const { t } = useI18n();
  const { data, isLoading } = userHooks.useList({ pageSize: 500 });
  const update = userHooks.useUpdate();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const all = data?.items ?? [];
    const ql = q.trim().toLowerCase();
    if (!ql) return all;
    return all.filter((u) => u.name.toLowerCase().includes(ql) || u.email.toLowerCase().includes(ql) || u.username.includes(ql));
  }, [data, q]);

  const columns = useMemo(
    () => [
      {
        id: "name",
        header: t("common.name"),
        cell: ({ row }: { row: { original: UserEntity } }) => (
          <div className="flex items-center gap-3">
            <span
              className="flex size-9 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: row.original.avatarColor || "var(--primary)" }}
            >
              {row.original.name.charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{row.original.name}</p>
              <p className="truncate text-xs text-muted-foreground">{row.original.nameAr || row.original.email}</p>
            </div>
          </div>
        ),
      },
      {
        id: "username",
        header: t("user.username"),
        cell: ({ row }: { row: { original: UserEntity } }) => (
          <span className="text-sm text-muted-foreground" dir="ltr">@{row.original.username}</span>
        ),
      },
      {
        id: "role",
        header: t("user.role"),
        cell: ({ row }: { row: { original: UserEntity } }) => (
          <Badge variant="outline" className="gap-1">
            <Shield className="size-3" /> {row.original.roleName}
          </Badge>
        ),
      },
      {
        id: "branches",
        header: t("common.branch"),
        cell: ({ row }: { row: { original: UserEntity } }) => (
          <span className="text-xs text-muted-foreground">{row.original.branchIds.length}</span>
        ),
      },
      {
        id: "active",
        header: t("common.status"),
        cell: ({ row }: { row: { original: UserEntity } }) => (
          <Switch
            checked={row.original.active}
            onCheckedChange={(v) => update.mutate({ id: row.original.id, patch: { active: v } })}
          />
        ),
      },
    ],
    [t, update],
  );

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader title={t("nav.users")} description={t("admin.usersDesc")} />
      <div className="relative mb-4 max-w-md">
        <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("common.search")} className="ps-9" />
      </div>
      <DataTable columns={columns} data={filtered} empty={<p className="text-center text-sm text-muted-foreground">{t("common.noResults")}</p>} />
    </div>
  );
}
