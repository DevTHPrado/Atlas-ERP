"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Package,
  AlertTriangle,
  XCircle,
  DollarSign,
  ArrowDownCircle,
  ArrowUpCircle,
  ClipboardList,
  TrendingUp,
  Plus,
} from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { KardexTable } from "@/components/stock/KardexTable";
import { MovementForm } from "@/components/stock/MovementForm";
import { useStockSummary } from "@/hooks/useProducts";
import { useStockMovements } from "@/hooks/useStockMovements";
import { useWarehouses } from "@/hooks/useProducts";

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorClass = "text-muted-foreground",
  bgClass = "bg-card",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  colorClass?: string;
  bgClass?: string;
}) {
  return (
    <Card className={`transition-shadow hover:shadow-md ${bgClass}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${colorClass}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

export default function EstoquePage() {
  const { summary, loading: summaryLoading } = useStockSummary();
  const { warehouses } = useWarehouses();
  const {
    movements: latestMovements,
    loading: movementsLoading,
    reload: reloadMovements,
  } = useStockMovements({ pageSize: 10 });

  const [showMovement, setShowMovement] = useState(false);

  const formatCurrency = (v: string | number) =>
    Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <DashboardLayout>
      <div className="mb-8 mt-4 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Estoque</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Controle de inventário, movimentações e Kardex
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/estoque/inventario">
            <Button variant="outline">
              <ClipboardList className="mr-2 h-4 w-4" />
              Inventário
            </Button>
          </Link>
          <Link href="/estoque/movimentacoes">
            <Button variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              Movimentações
            </Button>
          </Link>
          <Button onClick={() => setShowMovement(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Movimentação
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
        {summaryLoading ? (
          Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))
        ) : (
          <>
            <KpiCard
              title="Total de Produtos"
              value={summary?.total_products ?? 0}
              icon={Package}
            />
            <KpiCard
              title="Ativos"
              value={summary?.active_products ?? 0}
              icon={Package}
              colorClass="text-emerald-500"
            />
            <KpiCard
              title="Inativos"
              value={summary?.inactive_products ?? 0}
              icon={Package}
              colorClass="text-slate-400"
            />
            <KpiCard
              title="Sem Estoque"
              value={summary?.out_of_stock ?? 0}
              icon={XCircle}
              colorClass="text-rose-500"
            />
            <KpiCard
              title="Estoque Baixo"
              value={summary?.low_stock ?? 0}
              icon={AlertTriangle}
              colorClass="text-amber-500"
            />
            <KpiCard
              title="Valor Total"
              value={formatCurrency(summary?.total_stock_value ?? 0)}
              subtitle="Preço médio × quantidade"
              icon={DollarSign}
              colorClass="text-primary"
            />
            <KpiCard
              title="Itens em Estoque"
              value={Number(summary?.total_items_in_stock ?? 0).toFixed(0)}
              subtitle="Soma de todas as quantidades"
              icon={Package}
            />
          </>
        )}
      </div>

      {/* Recent Movements */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Últimas Movimentações</h3>
          <Link href="/estoque/movimentacoes">
            <Button variant="ghost" size="sm">
              Ver todas
            </Button>
          </Link>
        </div>
        <KardexTable movements={latestMovements} loading={movementsLoading} />
      </div>

      {/* Movement Form (no product pre-selected — user picks via product_id) */}
      {showMovement && (
        <MovementForm
          open={showMovement}
          onClose={() => setShowMovement(false)}
          productId=""
          productName="(selecionar produto)"
          currentStock="0"
          warehouses={warehouses}
          onSuccess={reloadMovements}
        />
      )}
    </DashboardLayout>
  );
}
