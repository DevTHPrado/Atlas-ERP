"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Bell,
  Boxes,
  Building2,
  ChartNoAxesCombined,
  CircleDollarSign,
  Moon,
  PackageSearch,
  LogOut,
  Search,
  Settings,
  Sun,
  Users,
  WalletCards,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/format";
import { getDashboard } from "@/services/dashboard.service";
import { useSessionStore } from "@/stores/session-store";

const navigation = [
  { label: "Dashboard", icon: ChartNoAxesCombined },
  { label: "Clientes", icon: Users },
  { label: "Produtos", icon: Boxes },
  { label: "Financeiro", icon: WalletCards },
  { label: "Configuracoes", icon: Settings },
];

export function DashboardShell() {
  const { setTheme, resolvedTheme } = useTheme();
  const { user, signOut } = useSessionStore();
  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboard });
  const dashboard = data;

  const kpis = [
    { label: "Receita", value: formatCurrency(dashboard?.kpis.revenue ?? 0), icon: CircleDollarSign },
    { label: "Lucro", value: formatCurrency(dashboard?.kpis.profit ?? 0), icon: ChartNoAxesCombined },
    { label: "Clientes ativos", value: dashboard?.kpis.active_customers ?? 0, icon: Users },
    { label: "Contas vencidas", value: formatCurrency(dashboard?.kpis.overdue_accounts ?? 0), icon: Bell },
    { label: "Contas futuras", value: formatCurrency(dashboard?.kpis.upcoming_accounts ?? 0), icon: WalletCards },
    { label: "Sem estoque", value: dashboard?.kpis.out_of_stock_products ?? 0, icon: PackageSearch },
  ];

  return (
    <main className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-card lg:block">
        <div className="flex h-16 items-center gap-2 border-b px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Building2 size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold">ERP Empresas</p>
            <p className="text-xs text-muted-foreground">Operacao comercial</p>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {navigation.map((item) => (
            <button
              key={item.label}
              className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <item.icon size={17} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur md:px-8">
          <div>
            <h1 className="text-lg font-semibold md:text-xl">Dashboard Executivo</h1>
            <p className="text-xs text-muted-foreground md:text-sm">Receita, estoque, clientes e fluxo de caixa</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden text-right md:block">
              <p className="text-sm font-medium">{user?.full_name ?? "Usuario"}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <div className="hidden h-9 items-center gap-2 rounded-md border px-3 text-sm text-muted-foreground md:flex">
              <Search size={16} />
              Buscar
            </div>
            <Button
              variant="outline"
              aria-label="Alternar tema"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            >
              {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
            <Button variant="outline" aria-label="Sair" onClick={signOut}>
              <LogOut size={16} />
            </Button>
          </div>
        </header>

        <div className="space-y-6 p-4 md:p-8">
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {kpis.map((kpi) => (
              <article key={kpi.label} className="rounded-lg border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <kpi.icon size={18} className="text-primary" />
                </div>
                <p className="mt-3 text-2xl font-semibold">{kpi.value}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Fluxo de caixa</h2>
                <Button variant="outline">Filtros</Button>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboard?.cash_flow ?? []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip formatter={(value) => formatCurrency(String(value))} />
                    <Area type="monotone" dataKey="value" stroke="#0f9f8f" fill="#0f9f8f" fillOpacity={0.18} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold">Produtos mais vendidos</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboard?.top_products ?? []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickLine={false} axisLine={false} />
                    <YAxis dataKey="label" type="category" width={110} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#f2a71b" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
