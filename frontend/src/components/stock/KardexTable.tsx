"use client";

import { StockMovement } from "@/types/product";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  SlidersHorizontal,
  ClipboardList,
} from "lucide-react";

interface KardexTableProps {
  movements: StockMovement[];
  loading: boolean;
}

const movementConfig: Record<
  string,
  { label: string; icon: React.ElementType; colorClass: string; bgClass: string }
> = {
  ENTRY: {
    label: "Entrada",
    icon: ArrowDownCircle,
    colorClass: "text-emerald-600",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  EXIT: {
    label: "Saída",
    icon: ArrowUpCircle,
    colorClass: "text-rose-600",
    bgClass: "bg-rose-50 dark:bg-rose-950/30",
  },
  TRANSFER: {
    label: "Transferência",
    icon: ArrowLeftRight,
    colorClass: "text-blue-600",
    bgClass: "bg-blue-50 dark:bg-blue-950/30",
  },
  ADJUSTMENT: {
    label: "Ajuste",
    icon: SlidersHorizontal,
    colorClass: "text-amber-600",
    bgClass: "bg-amber-50 dark:bg-amber-950/30",
  },
  INVENTORY: {
    label: "Inventário",
    icon: ClipboardList,
    colorClass: "text-purple-600",
    bgClass: "bg-purple-50 dark:bg-purple-950/30",
  },
};

function MovementBadge({ type }: { type: string }) {
  const config = movementConfig[type] ?? movementConfig.ADJUSTMENT;
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.colorClass,
        config.bgClass
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

export function KardexTable({ movements, loading }: KardexTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (movements.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
        <ClipboardList className="h-10 w-10 opacity-30" />
        <p className="text-sm">Nenhuma movimentação registrada.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Quantidade</TableHead>
            <TableHead className="text-right">Custo Unit.</TableHead>
            <TableHead className="text-right">Saldo</TableHead>
            <TableHead>Motivo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                {new Date(m.created_at).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </TableCell>
              <TableCell>
                <MovementBadge type={m.movement_type} />
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-mono font-semibold",
                  m.movement_type === "EXIT"
                    ? "text-rose-600"
                    : "text-emerald-600"
                )}
              >
                {m.movement_type === "EXIT" ? "−" : "+"}
                {Number(m.quantity).toFixed(3)}
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                {m.unit_cost
                  ? Number(m.unit_cost).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : "—"}
              </TableCell>
              <TableCell className="text-right font-mono font-semibold">
                {Number(m.balance_after).toFixed(3)}
              </TableCell>
              <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                {m.reason}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
