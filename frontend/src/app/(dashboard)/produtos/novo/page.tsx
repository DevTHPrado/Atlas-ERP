"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/products/ProductForm";
import { productService } from "@/services/productService";
import { useToast } from "@/hooks/use-toast";
import { ProductCreate, ProductUpdate } from "@/types/product";

interface ImageEntry {
  id: string;
  url: string;
  alt_text?: string;
  is_main: boolean;
  sort_order: number;
}

export default function NovoProdutoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ProductCreate | ProductUpdate, images: ImageEntry[]) => {
    try {
      setIsSubmitting(true);
      const product = await productService.create(data as ProductCreate);

      // Upload images that aren't already reflected in main_image_url
      const extraImages = images.filter(
        (img) => img.url !== (data as ProductCreate).main_image_url
      );
      for (const img of extraImages) {
        await productService.addImage(product.id, {
          url: img.url,
          alt_text: img.alt_text,
          sort_order: img.sort_order,
          is_main: img.is_main,
        });
      }

      toast({
        title: "Produto criado",
        description: `"${product.name}" foi criado com sucesso.`,
      });
      router.push("/produtos");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Erro ao criar produto.";
      toast({ title: "Erro", description: msg, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 mt-4 flex items-center gap-4">
        <Link href="/produtos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Novo Produto</h2>
          <p className="text-sm text-muted-foreground">
            Preencha os dados para cadastrar um novo produto no catálogo.
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <ProductForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </DashboardLayout>
  );
}
