"use client";

import { useState } from "react";
import {
  Plus,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { inventoryService } from "@/services/productService";
import { useWarehouses } from "@/hooks/useProducts";
import { InventoryAdjustment, InventoryAdjustmentCreate } from "@/types/product";
import { useEffect } from "react";

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  PENDING: { label: "Pendente", icon: Clock, variant: "outline" },
  APPROVED: { label: "Aprovado", icon: CheckCircle2, variant: "default" },
  CANCELLED: { label: "Cancelado", icon: XCircle, variant: "destructive" },
};

export default function InventarioPage() {
  const { toast } = useToast();
  const { warehouses } = useWarehouses();
  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<InventoryAdjustmentCreate>({
    product_id: "",
    warehouse_id: null,
    expected_quantity: 0,
    actual_quantity: 0,
    unit_cost: null,
    reason: null,
  });

  const load = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.list(0, 30);
      setAdjustments(data.items);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!formData.product_id.trim()) return;
    try {
      setSaving(true);
      await inventoryService.create(formData);
      toast({ title: "Ajuste criado", description: "Aguardando aprovação." });
      setShowForm(false);
      load();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Erro ao criar ajuste.";
      toast({ title: "Erro", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm("Confirmar aprovação do ajuste? O estoque será atualizado.")) return;
    try {
      await inventoryService.approve(id);
      toast({ title: "Ajuste aprovado", description: "Estoque atualizado com sucesso." });
      load();
    } catch {
      toast({ title: "Erro", description: "Não foi possível aprovar.", variant: "destructive" });
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancelar este ajuste?")) return;
    try {
      await inventoryService.cancel(id);
      toast({ title: "Ajuste cancelado" });
      load();
    } catch {
      toast({ title: "Erro", description: "Não foi possível cancelar.", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 mt-4 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventário</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Ajustes de inventário com fluxo de aprovação em duas etapas
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Ajuste
        </Button>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Almoxarifado</TableHead>
              <TableHead className="text-right">Esperado</TableHead>
              <TableHead className="text-right">Real</TableHead>
              <TableHead className="text-right">Diferença</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : adjustments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <ClipboardList className="h-8 w-8 opacity-30" />
                    <p>Nenhum ajuste de inventário registrado.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              adjustments.map((adj) => {
                const diff = Number(adj.difference);
                const statusCfg = STATUS_CONFIG[adj.status] ?? STATUS_CONFIG.PENDING;
                const StatusIcon = statusCfg.icon;

                return (
                  <TableRow key={adj.id}>
                    <TableCell className="font-medium">
                      {adj.product?.name ?? adj.product_id}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {warehouses.find((w) => w.id === adj.warehouse_id)?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {Number(adj.expected_quantity).toFixed(3)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {Number(adj.actual_quantity).toFixed(3)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-mono font-semibold ${
                        diff > 0
                          ? "text-emerald-600"
                          : diff < 0
                          ? "text-rose-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {diff > 0 ? "+" : ""}
                      {diff.toFixed(3)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={statusCfg.variant}
                        className="gap-1"
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusCfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(adj.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      {adj.status === "PENDING" && (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                            onClick={() => handleApprove(adj.id)}
                          >
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                            Aprovar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-rose-600 border-rose-300 hover:bg-rose-50"
                            onClick={() => handleCancel(adj.id)}
                          >
                            <XCircle className="mr-1 h-3.5 w-3.5" />
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Adjustment Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Ajuste de Inventário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="adj-product-id">ID do Produto *</Label>
              <Input
                id="adj-product-id"
                placeholder="UUID do produto"
                value={formData.product_id}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, product_id: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Informe o UUID do produto. Busca por nome estará disponível na próxima fase.
              </p>
            </div>

            {warehouses.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="adj-warehouse">Almoxarifado</Label>
                <Select
                  value={formData.warehouse_id ?? "none"}
                  onValueChange={(v) =>
                    setFormData((p) => ({
                      ...p,
                      warehouse_id: v === "none" ? null : v,
                    }))
                  }
                >
                  <SelectTrigger id="adj-warehouse">
                    <SelectValue placeholder="Nenhum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adj-expected">Qtd. Esperada (sistema)</Label>
                <Input
                  id="adj-expected"
                  type="number"
                  step="0.001"
                  min="0"
                  value={formData.expected_quantity}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      expected_quantity: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adj-actual">Qtd. Real (contagem)</Label>
                <Input
                  id="adj-actual"
                  type="number"
                  step="0.001"
                  min="0"
                  value={formData.actual_quantity}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      actual_quantity: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adj-reason">Motivo</Label>
              <Textarea
                id="adj-reason"
                placeholder="Motivo do ajuste de inventário..."
                rows={3}
                value={formData.reason ?? ""}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    reason: e.target.value || null,
                  }))
                }
              />
            </div>

            {/* Preview difference */}
            <div className="rounded-md border bg-muted/40 p-3 text-sm">
              <span className="text-muted-foreground">Diferença: </span>
              <span
                className={`font-semibold ${
                  Number(formData.actual_quantity) - Number(formData.expected_quantity) > 0
                    ? "text-emerald-600"
                    : Number(formData.actual_quantity) - Number(formData.expected_quantity) < 0
                    ? "text-rose-600"
                    : ""
                }`}
              >
                {(Number(formData.actual_quantity) - Number(formData.expected_quantity)) >= 0 ? "+" : ""}
                {(Number(formData.actual_quantity) - Number(formData.expected_quantity)).toFixed(3)}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={saving || !formData.product_id.trim()}
            >
              {saving ? "Criando..." : "Criar Ajuste"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
