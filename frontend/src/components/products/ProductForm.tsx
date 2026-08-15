"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUploader } from "./ImageUploader";
import { useCategories, useBrands, useUnits } from "@/hooks/useProducts";
import { ProductCreate, ProductUpdate, Product } from "@/types/product";

// ─── Schema ──────────────────────────────────────────────────────────────

const productSchema = z.object({
  // Dados Gerais
  sku: z.string().min(1, "SKU obrigatório.").max(80),
  internal_code: z.string().max(80).optional().nullable(),
  barcode: z.string().max(60).optional().nullable(),
  name: z.string().min(1, "Nome obrigatório.").max(180),
  short_description: z.string().max(255).optional().nullable(),
  full_description: z.string().optional().nullable(),
  category_id: z.string().optional().nullable(),
  brand_id: z.string().optional().nullable(),
  unit_id: z.string().optional().nullable(),
  supplier_id: z.string().optional().nullable(),
  is_active: z.boolean().default(true),

  // Fiscal
  ncm: z.string().max(10).optional().nullable(),
  cest: z.string().max(9).optional().nullable(),
  cfop: z.string().max(5).optional().nullable(),
  origin: z.string().max(1).optional().nullable(),

  // Preço
  cost_price: z.coerce.number().min(0).default(0),
  sale_price: z.coerce.number().min(0).default(0),
  promotional_price: z.coerce.number().min(0).optional().nullable(),

  // Estoque
  minimum_stock: z.coerce.number().min(0).default(0),
  maximum_stock: z.coerce.number().min(0).optional().nullable(),
  physical_location: z.string().max(120).optional().nullable(),
  allow_negative_stock: z.boolean().default(false),
  controls_stock: z.boolean().default(true),
  allows_sale: z.boolean().default(true),

  // Dimensões
  weight: z.coerce.number().min(0).optional().nullable(),
  height: z.coerce.number().min(0).optional().nullable(),
  width: z.coerce.number().min(0).optional().nullable(),
  length: z.coerce.number().min(0).optional().nullable(),
  volume: z.coerce.number().min(0).optional().nullable(),

  // Observações
  notes: z.string().optional().nullable(),
});

type ProductFormValues = z.infer<typeof productSchema>;

// ─── Props ───────────────────────────────────────────────────────────────

interface ImageEntry {
  id: string;
  url: string;
  alt_text?: string;
  is_main: boolean;
  sort_order: number;
}

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: ProductCreate | ProductUpdate, images: ImageEntry[]) => Promise<void>;
  isSubmitting?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

const ORIGIN_OPTIONS = [
  { value: "0", label: "0 — Nacional" },
  { value: "1", label: "1 — Estrangeira (importação direta)" },
  { value: "2", label: "2 — Estrangeira (adquirida no mercado interno)" },
  { value: "3", label: "3 — Nacional com conteúdo de importação > 40%" },
  { value: "4", label: "4 — Nacional com processo produtivo básico" },
  { value: "5", label: "5 — Nacional com conteúdo de importação ≤ 40%" },
  { value: "6", label: "6 — Estrangeira (importação direta, sem similar)" },
  { value: "7", label: "7 — Estrangeira (adquirida no mercado interno, sem similar)" },
  { value: "8", label: "8 — Nacional com conteúdo > 70%" },
];

function calcMargin(cost: number, sale: number): string {
  if (!sale || sale === 0) return "0,00%";
  const margin = ((sale - cost) / sale) * 100;
  return `${margin.toFixed(2)}%`;
}

// ─── Component ────────────────────────────────────────────────────────────

export function ProductForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: ProductFormProps) {
  const { categories } = useCategories();
  const { brands } = useBrands();
  const { units } = useUnits();

  const [images, setImages] = useState<ImageEntry[]>(() => {
    if (initialData?.main_image_url) {
      return [
        {
          id: "existing-main",
          url: initialData.main_image_url,
          is_main: true,
          sort_order: 0,
        },
      ];
    }
    return [];
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: initialData?.sku ?? "",
      internal_code: initialData?.internal_code ?? null,
      barcode: initialData?.barcode ?? null,
      name: initialData?.name ?? "",
      short_description: initialData?.short_description ?? null,
      full_description: initialData?.full_description ?? null,
      category_id: initialData?.category_id ?? null,
      brand_id: initialData?.brand_id ?? null,
      unit_id: initialData?.unit_id ?? null,
      supplier_id: initialData?.supplier_id ?? null,
      is_active: initialData?.is_active ?? true,
      ncm: initialData?.ncm ?? null,
      cest: initialData?.cest ?? null,
      cfop: initialData?.cfop ?? null,
      origin: initialData?.origin ?? null,
      cost_price: Number(initialData?.cost_price ?? 0),
      sale_price: Number(initialData?.sale_price ?? 0),
      promotional_price: initialData?.promotional_price
        ? Number(initialData.promotional_price)
        : null,
      minimum_stock: Number(initialData?.minimum_stock ?? 0),
      maximum_stock: initialData?.maximum_stock
        ? Number(initialData.maximum_stock)
        : null,
      physical_location: initialData?.physical_location ?? null,
      allow_negative_stock: initialData?.allow_negative_stock ?? false,
      controls_stock: initialData?.controls_stock ?? true,
      allows_sale: initialData?.allows_sale ?? true,
      weight: initialData?.weight ? Number(initialData.weight) : null,
      height: initialData?.height ? Number(initialData.height) : null,
      width: initialData?.width ? Number(initialData.width) : null,
      length: initialData?.length ? Number(initialData.length) : null,
      volume: initialData?.volume ? Number(initialData.volume) : null,
      notes: initialData?.notes ?? null,
    },
  });

  const costPrice = form.watch("cost_price");
  const salePrice = form.watch("sale_price");
  const margin = calcMargin(Number(costPrice), Number(salePrice));

  const handleSubmit = async (values: ProductFormValues) => {
    // Set main image url from images array
    const mainImage = images.find((img) => img.is_main);
    const data = {
      ...values,
      main_image_url: mainImage?.url ?? null,
    };
    await onSubmit(data, images);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="geral">Dados Gerais</TabsTrigger>
            <TabsTrigger value="fiscal">Fiscal</TabsTrigger>
            <TabsTrigger value="preco">Preço</TabsTrigger>
            <TabsTrigger value="estoque">Estoque</TabsTrigger>
            <TabsTrigger value="dimensoes">Dimensões</TabsTrigger>
            <TabsTrigger value="imagens">Imagens</TabsTrigger>
            <TabsTrigger value="observacoes">Observações</TabsTrigger>
          </TabsList>

          {/* ── Tab: Dados Gerais ─────────────────────────────────── */}
          <TabsContent value="geral" className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU *</FormLabel>
                    <FormControl>
                      <Input id="product-sku" placeholder="SKU-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="internal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código Interno</FormLabel>
                    <FormControl>
                      <Input
                        id="product-internal-code"
                        placeholder="INT-001"
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
              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código de Barras</FormLabel>
                    <FormControl>
                      <Input
                        id="product-barcode"
                        placeholder="7891234567890"
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
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto *</FormLabel>
                  <FormControl>
                    <Input
                      id="product-name"
                      placeholder="Nome completo do produto"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="short_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição Curta</FormLabel>
                  <FormControl>
                    <Input
                      id="product-short-desc"
                      placeholder="Resumo do produto (exibido na listagem)"
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

            <FormField
              control={form.control}
              name="full_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição Completa</FormLabel>
                  <FormControl>
                    <Textarea
                      id="product-full-desc"
                      placeholder="Descrição detalhada do produto..."
                      rows={4}
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger id="product-category">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brand_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger id="product-brand">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {brands.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger id="product-unit">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {units.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name} ({u.abbreviation})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <input
                        id="product-is-active"
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-input accent-primary"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0 cursor-pointer">
                      Produto ativo
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          {/* ── Tab: Fiscal ───────────────────────────────────────── */}
          <TabsContent value="fiscal" className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FormField
                control={form.control}
                name="ncm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NCM</FormLabel>
                    <FormControl>
                      <Input
                        id="product-ncm"
                        placeholder="00000000"
                        maxLength={10}
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
              <FormField
                control={form.control}
                name="cest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEST</FormLabel>
                    <FormControl>
                      <Input
                        id="product-cest"
                        placeholder="0000000"
                        maxLength={9}
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
              <FormField
                control={form.control}
                name="cfop"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CFOP</FormLabel>
                    <FormControl>
                      <Input
                        id="product-cfop"
                        placeholder="5102"
                        maxLength={5}
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
              <FormField
                control={form.control}
                name="origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origem</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger id="product-origin">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ORIGIN_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          {/* ── Tab: Preço ────────────────────────────────────────── */}
          <TabsContent value="preco" className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="cost_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço de Custo (R$) *</FormLabel>
                    <FormControl>
                      <Input
                        id="product-cost-price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sale_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço de Venda (R$) *</FormLabel>
                    <FormControl>
                      <Input
                        id="product-sale-price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="promotional_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Promocional (R$)</FormLabel>
                    <FormControl>
                      <Input
                        id="product-promo-price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value === "" ? null : e.target.value)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Margin indicator */}
            <div className="rounded-lg border bg-muted/40 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Margem calculada</p>
                  <p className="text-xs text-muted-foreground">
                    ((Venda − Custo) / Venda) × 100
                  </p>
                </div>
                <span className="text-2xl font-bold text-primary">{margin}</span>
              </div>
              {initialData?.average_price && (
                <div className="mt-3 border-t pt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Preço Médio (calculado)</span>
                  <span className="font-semibold">
                    {Number(initialData.average_price).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Tab: Estoque ──────────────────────────────────────── */}
          <TabsContent value="estoque" className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FormField
                control={form.control}
                name="minimum_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Mínimo</FormLabel>
                    <FormControl>
                      <Input
                        id="product-min-stock"
                        type="number"
                        step="0.001"
                        min="0"
                        placeholder="0,000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maximum_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Máximo</FormLabel>
                    <FormControl>
                      <Input
                        id="product-max-stock"
                        type="number"
                        step="0.001"
                        min="0"
                        placeholder="0,000"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value === "" ? null : e.target.value)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="physical_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localização Física</FormLabel>
                    <FormControl>
                      <Input
                        id="product-location"
                        placeholder="Ex: Corredor A, Prateleira 3"
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
            </div>

            <div className="flex flex-wrap gap-6">
              <FormField
                control={form.control}
                name="allow_negative_stock"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <input
                        id="product-allow-negative"
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-input accent-primary"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0 cursor-pointer">
                      Permitir estoque negativo
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="controls_stock"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <input
                        id="product-controls-stock"
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-input accent-primary"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0 cursor-pointer">
                      Controla estoque
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="allows_sale"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <input
                        id="product-allows-sale"
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-input accent-primary"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0 cursor-pointer">
                      Permite venda
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>


            {initialData && (
              <div className="rounded-lg border bg-muted/40 p-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Quantidade Atual</p>
                  <p className="text-xl font-bold">{Number(initialData.stock_quantity).toFixed(3)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Reservado</p>
                  <p className="text-xl font-bold">{Number(initialData.reserved_quantity).toFixed(3)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Disponível</p>
                  <p className="text-xl font-bold text-primary">{Number(initialData.available_quantity).toFixed(3)}</p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── Tab: Dimensões ────────────────────────────────────── */}
          <TabsContent value="dimensoes" className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {(
                [
                  { name: "weight", label: "Peso (kg)" },
                  { name: "height", label: "Altura (cm)" },
                  { name: "width", label: "Largura (cm)" },
                  { name: "length", label: "Comprimento (cm)" },
                  { name: "volume", label: "Volume (m³)" },
                ] as const
              ).map(({ name, label }) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <Input
                          id={`product-${name}`}
                          type="number"
                          step="0.0001"
                          min="0"
                          placeholder="0,0000"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value === "" ? null : e.target.value)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </TabsContent>

          {/* ── Tab: Imagens ──────────────────────────────────────── */}
          <TabsContent value="imagens" className="mt-6">
            <ImageUploader images={images} onChange={setImages} />
          </TabsContent>

          {/* ── Tab: Observações ──────────────────────────────────── */}
          <TabsContent value="observacoes" className="mt-6">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações Internas</FormLabel>
                  <FormControl>
                    <Textarea
                      id="product-notes"
                      placeholder="Observações para uso interno (não visível ao cliente)..."
                      rows={8}
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
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t pt-4">
          <Button type="submit" disabled={isSubmitting} className="min-w-32">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Produto"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
