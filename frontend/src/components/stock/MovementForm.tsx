"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { stockService } from "@/services/stockService";
import { MovementType, Warehouse } from "@/types/product";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const movementSchema = z
  .object({
    movement_type: z.enum(["ENTRY", "EXIT", "TRANSFER", "ADJUSTMENT"]),
    quantity: z.coerce.number().positive("A quantidade deve ser maior que zero."),
    unit_cost: z.coerce.number().min(0).optional().nullable(),
    warehouse_id: z.string().optional().nullable(),
    destination_warehouse_id: z.string().optional().nullable(),
    reason: z.string().min(3, "Informe o motivo da movimentação.").max(255),
    notes: z.string().max(1000).optional().nullable(),
  })
  .refine(
    (data) =>
      data.movement_type !== "TRANSFER" || !!data.destination_warehouse_id,
    {
      message: "Informe o almoxarifado de destino para transferência.",
      path: ["destination_warehouse_id"],
    }
  );

type MovementFormValues = z.infer<typeof movementSchema>;

interface MovementFormProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  currentStock: string | number;
  warehouses: Warehouse[];
  onSuccess: () => void;
}

const movementTypes: { value: MovementType; label: string; description: string }[] = [
  { value: "ENTRY", label: "Entrada", description: "Adiciona ao estoque (compra, devolução)" },
  { value: "EXIT", label: "Saída", description: "Remove do estoque (venda, perda)" },
  { value: "TRANSFER", label: "Transferência", description: "Entre almoxarifados" },
  { value: "ADJUSTMENT", label: "Ajuste", description: "Correção manual de quantidade" },
];

export function MovementForm({
  open,
  onClose,
  productId,
  productName,
  currentStock,
  warehouses,
  onSuccess,
}: MovementFormProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<MovementFormValues>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      movement_type: "ENTRY",
      quantity: undefined,
      unit_cost: null,
      warehouse_id: null,
      destination_warehouse_id: null,
      reason: "",
      notes: null,
    },
  });

  const movementType = form.watch("movement_type");

  const onSubmit = async (values: MovementFormValues) => {
    try {
      setSubmitting(true);
      await stockService.registerMovement({
        product_id: productId,
        movement_type: values.movement_type,
        quantity: values.quantity,
        unit_cost: values.unit_cost ?? undefined,
        warehouse_id: values.warehouse_id ?? undefined,
        destination_warehouse_id:
          values.movement_type === "TRANSFER"
            ? (values.destination_warehouse_id ?? undefined)
            : undefined,
        reason: values.reason,
        notes: values.notes ?? undefined,
      });
      toast({
        title: "Movimentação registrada",
        description: `${values.movement_type === "ENTRY" ? "Entrada" : values.movement_type === "EXIT" ? "Saída" : "Movimentação"} de ${values.quantity} unidade(s) registrada com sucesso.`,
      });
      form.reset();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Erro ao registrar movimentação.";
      toast({ title: "Erro", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar Movimentação</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {productName} — Estoque atual:{" "}
            <strong>{Number(currentStock).toFixed(3)}</strong>
          </p>
        </DialogHeader>

        <Form {...form}>
          <form
            id="movement-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {/* Type */}
            <FormField
              control={form.control}
              name="movement_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Movimentação *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger id="movement-type-select">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {movementTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          <div>
                            <p className="font-medium">{t.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {t.description}
                            </p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Quantity */}
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade *</FormLabel>
                    <FormControl>
                      <Input
                        id="movement-quantity"
                        type="number"
                        step="0.001"
                        min="0.001"
                        placeholder="0,000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Unit cost */}
              <FormField
                control={form.control}
                name="unit_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custo Unitário (R$)</FormLabel>
                    <FormControl>
                      <Input
                        id="movement-unit-cost"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? null : e.target.value
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Warehouses */}
            {warehouses.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="warehouse_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {movementType === "TRANSFER"
                          ? "Origem"
                          : "Almoxarifado"}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value ?? undefined}
                      >
                        <FormControl>
                          <SelectTrigger id="warehouse-origin-select">
                            <SelectValue placeholder="Nenhum" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {warehouses.map((w) => (
                            <SelectItem key={w.id} value={w.id}>
                              {w.name} ({w.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {movementType === "TRANSFER" && (
                  <FormField
                    control={form.control}
                    name="destination_warehouse_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destino *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value ?? undefined}
                        >
                          <FormControl>
                            <SelectTrigger id="warehouse-dest-select">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {warehouses.map((w) => (
                              <SelectItem key={w.id} value={w.id}>
                                {w.name} ({w.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo *</FormLabel>
                  <FormControl>
                    <Input
                      id="movement-reason"
                      placeholder="Ex: Recebimento NF 1234, Venda #56..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      id="movement-notes"
                      placeholder="Observações adicionais..."
                      rows={2}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value || null)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="movement-form"
            disabled={submitting}
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
