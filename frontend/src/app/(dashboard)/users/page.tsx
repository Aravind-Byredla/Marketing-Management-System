"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Loader2, X, UserCheck, UserX } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService, UserFilters } from "@/services/users.service";
import { DataTable, Column } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { Pagination } from "@/components/common/Pagination";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate, getInitials } from "@/lib/utils";
import { User } from "@/types";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER", "TEAM_MEMBER"];

const createSchema = z.object({
  full_name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "MANAGER", "TEAM_MEMBER"]),
  password: z.string().min(8, "Minimum 8 characters"),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, { message: "Passwords do not match", path: ["confirm_password"] });

type CreateForm = z.infer<typeof createSchema>;

export default function UsersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["users", page, search, roleFilter],
    queryFn: () => usersService.list({ page, search: search || undefined, role: roleFilter || undefined }),
  });

  const toggleActive = useMutation({
    mutationFn: (id: string) => usersService.toggleActive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  const createUser = useMutation({
    mutationFn: (payload: CreateForm) => usersService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully.");
      setShowCreate(false);
      reset();
    },
    onError: () => toast.error("Failed to create user."),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { role: "TEAM_MEMBER" },
  });

  const columns: Column<User>[] = [
    {
      header: "User",
      accessor: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-bold shrink-0">
            {getInitials(u.full_name)}
          </div>
          <div>
            <p className="font-medium text-sm">{u.full_name}</p>
            <p className="text-xs text-muted-foreground">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      accessor: (u) => (
        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-md">
          {u.role.replace(/_/g, " ")}
        </span>
      ),
    },
    { header: "Company", accessor: (u) => u.company_detail?.name ?? "—" },
    { header: "Branch", accessor: (u) => u.branch_detail?.name ?? "—" },
    {
      header: "Status",
      accessor: (u) => (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${u.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {u.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    { header: "Joined", accessor: (u) => formatDate(u.created_at) },
    {
      header: "Actions",
      accessor: (u) => (
        <button
          onClick={(e) => { e.stopPropagation(); toggleActive.mutate(u.id); }}
          className="p-1.5 hover:bg-accent rounded-lg transition"
          title={u.is_active ? "Deactivate" : "Activate"}
        >
          {u.is_active ? <UserX className="w-4 h-4 text-red-500" /> : <UserCheck className="w-4 h-4 text-green-500" />}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Users"
        description="Manage platform users and their roles"
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="text-sm bg-muted border border-border rounded-lg px-3 py-1.5 outline-none text-foreground"
        >
          <option value="">All Roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.results ?? []}
        isLoading={isLoading}
        rowKey={(u) => u.id}
        emptyMessage="No users found."
      />
      {data && (
        <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>{data.count} users</span>
          <Pagination currentPage={page} totalPages={data.total_pages} onPageChange={setPage} />
        </div>
      )}

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-2xl border border-border p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">Add New User</h2>
                <button onClick={() => setShowCreate(false)} className="p-1.5 hover:bg-accent rounded-lg transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSubmit((d) => createUser.mutate(d))} className="space-y-4">
                {[
                  { name: "full_name" as const, label: "Full Name", type: "text" },
                  { name: "email" as const, label: "Email", type: "email" },
                  { name: "password" as const, label: "Password", type: "password" },
                  { name: "confirm_password" as const, label: "Confirm Password", type: "password" },
                ].map(({ name, label, type }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium mb-1">{label}</label>
                    <input
                      {...register(name)}
                      type={type}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    {errors[name] && <p className="text-xs text-destructive mt-1">{errors[name]?.message}</p>}
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    {...register("role")}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowCreate(false); reset(); }} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent transition">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createUser.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60"
                  >
                    {createUser.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Create User
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
