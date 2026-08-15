"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductForm } from "@/components/products/ProductForm";
import { KardexTable } from "@/components/stock/KardexTable";
import { MovementForm } from "@/components/stock/MovementForm";
import { productService } from "@/services/productService";
import { useToast } from "@/hooks/use-toast";
import { useKardex } from "@/hooks/useStockMovements";
import { useWarehouses } from "@/hooks/useProducts";
import { Product, ProductUpdate } from "@/types/product";

interface ImageEntry {
  id: string;
  url: string;
  alt_text?: string;
  is_main: boolean;
  sort_order: number;
}

export default function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMovement, setShowMovement] = useState(false);
  const { warehouses } = useWarehouses();

  const { movements, loading: kardexLoading, reload: reloadKardex } = useKardex(
    id
  );

  useEffect(() => {
    productService
      .get(id)
      .then(setProduct)
      .catch(() => {
        toast({
          title: "Produto não encontrado",
          variant: "destructive",
        });
        router.push("/produtos");
      })
      .finally(() => setLoadingProduct(false));
  }, [id, router, toast]);

  const handleSubmit = async (data: ProductUpdate, images: ImageEntry[]) => {
    if (!product) return;
    try {
      setIsSubmitting(true);
      await productService.update(product.id, data);

      // Add only new images (those not in original product)
      const newImages = images.filter(
        (img) => img.id !== "existing-main" && img.url !== product.main_image_url
      );
      for (const img of newImages) {
        await productService.addImage(product.id, {
          url: img.url,
          alt_text: img.alt_text,
          sort_order: img.sort_order,
          is_main: img.is_main,
        });
      }

      toast({
        title: "Produto atualizado",
        description: `"${data.name ?? product.name}" foi salvo.`,
      });
      // Refresh product data
      const updated = await productService.get(product.id);
      setProduct(updated);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Erro ao atualizar produto.";
      toast({ title: "Erro", description: msg, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingProduct) {
    return (
      <DashboardLayout>
        <div className="space-y-4 mt-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!product) return null;

  return (
    <DashboardLayout>
      <div className="mb-6 mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/produtos">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{product.name}</h2>
            <p className="text-sm text-muted-foreground">
              SKU: {product.sku}
              {product.barcode && ` · Barcode: ${product.barcode}`}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setShowMovement(true)}>
          <ClipboardList className="mr-2 h-4 w-4" />
          Movimentar Estoque
        </Button>
      </div>

      {/* Form */}
      <div className="rounded-lg border bg-card p-6 shadow-sm mb-6">
        <ProductForm
          initialData={product}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* Kardex */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Kardex do Produto</h3>
          <p className="text-sm text-muted-foreground">
            Histórico completo de movimentações
          </p>
        </div>
        <KardexTable movements={movements} loading={kardexLoading} />
      </div>

      {/* Movement dialog */}
      <MovementForm
        open={showMovement}
        onClose={() => setShowMovement(false)}
        productId={product.id}
        productName={product.name}
        currentStock={product.stock_quantity}
        warehouses={warehouses}
        onSuccess={() => {
          reloadKardex();
          productService.get(product.id).then(setProduct);
        }}
      />
    </DashboardLayout>
  );
}
