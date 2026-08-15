"use client";

import { useState } from "react";
import { Plus, Filter } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KardexTable } from "@/components/stock/KardexTable";
import { MovementForm } from "@/components/stock/MovementForm";
import { useStockMovements } from "@/hooks/useStockMovements";
import { useWarehouses } from "@/hooks/useProducts";

const MOVEMENT_TYPES = [
  { value: "all", label: "Todos os tipos" },
  { value: "ENTRY", label: "Entrada" },
  { value: "EXIT", label: "Saída" },
  { value: "TRANSFER", label: "Transferência" },
  { value: "ADJUSTMENT", label: "Ajuste" },
  { value: "INVENTORY", label: "Inventário" },
];

export default function MovimentacoesPage() {
  const { warehouses } = useWarehouses();
  const [movementType, setMovementType] = useState<string | undefined>(undefined);
  const [showMovement, setShowMovement] = useState(false);

  const { movements, total, loading, currentPage, totalPages, pageSize, reload, goToPage } =
    useStockMovements({ movementType, pageSize: 30 });

  return (
    <DashboardLayout>
      <div className="mb-8 mt-4 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Movimentações de Estoque</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Histórico completo de todas as movimentações — Kardex geral
          </p>
        </div>
        <Button onClick={() => setShowMovement(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Movimentação
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select
          value={movementType ?? "all"}
          onValueChange={(v) => setMovementType(v === "all" ? undefined : v)}
        >
          <SelectTrigger id="filter-movement-type" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MOVEMENT_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {total} movimentaç{total !== 1 ? "ões" : "ão"}
        </span>
      </div>

      <KardexTable movements={movements} loading={loading} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {currentPage + 1} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => goToPage(Math.max(0, (currentPage - 1) * pageSize))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages - 1}
              onClick={() => goToPage((currentPage + 1) * pageSize)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      {showMovement && (
        <MovementForm
          open={showMovement}
          onClose={() => setShowMovement(false)}
          productId=""
          productName=""
          currentStock="0"
          warehouses={warehouses}
          onSuccess={reload}
        />
      )}
    </DashboardLayout>
  );
}
