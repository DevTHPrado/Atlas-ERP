"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Package,
  SlidersHorizontal,
  BarChart3,
  ArrowDownCircle,
  TrendingUp,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  MinusCircle,
  DollarSign,
  Boxes,
} from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useProducts, useStockSummary, useCategories, useBrands } from "@/hooks/useProducts";
import { useWarehouses } from "@/hooks/useProducts";
import { productService } from "@/services/productService";
import { StockBadge } from "@/components/products/StockBadge";
import { MovementForm } from "@/components/stock/MovementForm";
import { ProductListItem } from "@/types/product";

function KpiCard({
  title,
  value,
  icon: Icon,
  colorClass = "",
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorClass?: string;
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${colorClass || "text-muted-foreground"}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function ProdutosPage() {
  const { toast } = useToast();
  const { categories } = useCategories();
  const { brands } = useBrands();
  const { warehouses } = useWarehouses();
  const { summary, loading: summaryLoading } = useStockSummary();

  const {
    products,
    total,
    loading,
    filters,
    currentPage,
    totalPages,
    pageSize,
    updateFilter,
    clearFilters,
    reload,
    goToPage,
  } = useProducts({ pageSize: 20 });

  const [movementProduct, setMovementProduct] = useState<ProductListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await productService.delete(deleteTarget.id);
      toast({ title: "Produto excluído", description: `"${deleteTarget.name}" foi excluído.` });
      reload();
    } catch {
      toast({ title: "Erro", description: "Não foi possível excluir.", variant: "destructive" });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const formatCurrency = (v: string | number) =>
    Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <DashboardLayout>
      {/* Page header */}
      <div className="mb-8 mt-4 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Produtos</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Catálogo completo de produtos e gestão de estoque
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/produtos/categorias">
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Categorias
            </Button>
          </Link>
          <Link href="/produtos/marcas">
            <Button variant="outline" size="sm">
              <BarChart3 className="mr-2 h-4 w-4" />
              Marcas
            </Button>
          </Link>
          <Link href="/produtos/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {summaryLoading ? (
          Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))
        ) : (
          <>
            <KpiCard title="Total de Produtos" value={summary?.total_products ?? 0} icon={Boxes} />
            <KpiCard title="Ativos" value={summary?.active_products ?? 0} icon={CheckCircle2} colorClass="text-emerald-500" />
            <KpiCard title="Inativos" value={summary?.inactive_products ?? 0} icon={MinusCircle} colorClass="text-slate-400" />
            <KpiCard title="Sem Estoque" value={summary?.out_of_stock ?? 0} icon={XCircle} colorClass="text-rose-500" />
            <KpiCard title="Estoque Baixo" value={summary?.low_stock ?? 0} icon={AlertTriangle} colorClass="text-amber-500" />
            <KpiCard
              title="Valor Total"
              value={formatCurrency(summary?.total_stock_value ?? 0)}
              icon={DollarSign}
              colorClass="text-primary"
            />
            <KpiCard
              title="Itens em Estoque"
              value={Number(summary?.total_items_in_stock ?? 0).toFixed(0)}
              icon={TrendingUp}
            />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="products-search"
            placeholder="Buscar por nome, SKU, código de barras..."
            className="pl-8"
            value={filters.search ?? ""}
            onChange={(e) => updateFilter("search", e.target.value || undefined)}
          />
        </div>

        <Select
          value={filters.category_id ?? "all"}
          onValueChange={(v) => updateFilter("category_id", v === "all" ? undefined : v)}
        >
          <SelectTrigger id="filter-category" className="w-40">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.brand_id ?? "all"}
          onValueChange={(v) => updateFilter("brand_id", v === "all" ? undefined : v)}
        >
          <SelectTrigger id="filter-brand" className="w-36">
            <SelectValue placeholder="Marca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as marcas</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={
            filters.is_active === true
              ? "active"
              : filters.is_active === false
              ? "inactive"
              : "all"
          }
          onValueChange={(v) =>
            updateFilter(
              "is_active",
              v === "all" ? undefined : v === "active"
            )
          }
        >
          <SelectTrigger id="filter-status" className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Button
            variant={filters.low_stock_only ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("low_stock_only", !filters.low_stock_only)}
          >
            Estoque Baixo
          </Button>
          <Button
            variant={filters.out_of_stock_only ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("out_of_stock_only", !filters.out_of_stock_only)}
          >
            Sem Estoque
          </Button>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Limpar
          </Button>
        </div>

        <div className="ml-auto text-sm text-muted-foreground">
          {total} produto{total !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Img</TableHead>
              <TableHead>Nome / SKU</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead className="text-right">Custo</TableHead>
              <TableHead className="text-right">Venda</TableHead>
              <TableHead className="text-right">Margem</TableHead>
              <TableHead className="text-center">Estoque</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 10 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Package className="h-8 w-8 opacity-30" />
                    <p>Nenhum produto encontrado.</p>
                    <Link href="/produtos/novo">
                      <Button size="sm" variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Criar primeiro produto
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow
                  key={product.id}
                  className="group transition-colors hover:bg-muted/40"
                >
                  <TableCell>
                    {product.main_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.main_image_url}
                        alt={product.name}
                        className="h-9 w-9 rounded-md object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36'%3E%3Crect width='36' height='36' fill='%23f3f4f6' rx='4'/%3E%3C/svg%3E";
                        }}
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium leading-tight">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.sku}
                        {product.barcode && ` · ${product.barcode}`}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {product.category?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {product.brand?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatCurrency(product.cost_price)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold">
                    {formatCurrency(product.sale_price)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        Number(product.margin) >= 30
                          ? "text-emerald-600 font-semibold"
                          : Number(product.margin) >= 10
                          ? "text-amber-600"
                          : "text-rose-600"
                      }
                    >
                      {Number(product.margin).toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <StockBadge
                      stockQuantity={product.stock_quantity}
                      minimumStock={product.minimum_stock}
                      isOutOfStock={product.is_out_of_stock}
                      isLowStock={product.is_low_stock}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={product.is_active ? "default" : "secondary"}>
                      {product.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <Link href={`/produtos/${product.id}`}>
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem
                          onClick={() => setMovementProduct(product)}
                        >
                          <ArrowDownCircle className="mr-2 h-4 w-4" />
                          Movimentar Estoque
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteTarget(product)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {currentPage + 1} de {totalPages} · {total} produtos
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(Math.max(0, (currentPage - 1) * pageSize))}
              disabled={currentPage === 0}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage((currentPage + 1) * pageSize)}
              disabled={currentPage >= totalPages - 1}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      {/* Movement dialog */}
      {movementProduct && (
        <MovementForm
          open={!!movementProduct}
          onClose={() => setMovementProduct(null)}
          productId={movementProduct.id}
          productName={movementProduct.name}
          currentStock={movementProduct.stock_quantity}
          warehouses={warehouses}
          onSuccess={reload}
        />
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir{" "}
              <strong>&quot;{deleteTarget?.name}&quot;</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
