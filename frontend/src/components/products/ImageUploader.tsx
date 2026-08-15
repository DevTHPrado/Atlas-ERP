"use client";

import { useState } from "react";
import { X, Upload, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ImageEntry {
  id: string;
  url: string;
  alt_text?: string;
  is_main: boolean;
  sort_order: number;
}

interface ImageUploaderProps {
  images: ImageEntry[];
  onChange: (images: ImageEntry[]) => void;
  maxImages?: number;
}

export function ImageUploader({
  images,
  onChange,
  maxImages = 10,
}: ImageUploaderProps) {
  const [urlInput, setUrlInput] = useState("");
  const [altInput, setAltInput] = useState("");

  const addImage = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (images.some((img) => img.url === trimmed)) return;

    const newImage: ImageEntry = {
      id: crypto.randomUUID(),
      url: trimmed,
      alt_text: altInput.trim() || undefined,
      is_main: images.length === 0,
      sort_order: images.length,
    };

    onChange([...images, newImage]);
    setUrlInput("");
    setAltInput("");
  };

  const removeImage = (id: string) => {
    const filtered = images.filter((img) => img.id !== id);
    // Ensure at least one is_main if any images remain
    if (filtered.length > 0 && !filtered.some((img) => img.is_main)) {
      filtered[0].is_main = true;
    }
    onChange(filtered.map((img, i) => ({ ...img, sort_order: i })));
  };

  const setMain = (id: string) => {
    onChange(
      images.map((img) => ({ ...img, is_main: img.id === id }))
    );
  };

  return (
    <div className="space-y-4">
      {/* Input area */}
      {images.length < maxImages && (
        <div className="rounded-lg border border-dashed border-border p-4 space-y-3">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Adicionar imagem via URL
          </p>
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Input
                id="image-url-input"
                placeholder="https://exemplo.com/imagem.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addImage()}
              />
              <Input
                id="image-alt-input"
                placeholder="Texto alternativo (opcional)"
                value={altInput}
                onChange={(e) => setAltInput(e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addImage}
              disabled={!urlInput.trim()}
              className="self-start"
            >
              <Upload className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Estrutura preparada para armazenamento em S3 em versões futuras.
            Suporte a upload direto de arquivo será adicionado na próxima fase.
          </p>
        </div>
      )}

      {/* Gallery */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.id}
              className={cn(
                "group relative rounded-lg overflow-hidden border-2 transition-all",
                img.is_main
                  ? "border-primary shadow-md"
                  : "border-border hover:border-muted-foreground"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt_text || "Produto"}
                className="aspect-square w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%239ca3af' font-size='12'%3ESem imagem%3C/text%3E%3C/svg%3E";
                }}
              />
              {img.is_main && (
                <div className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  Principal
                </div>
              )}
              {/* Overlay actions */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                {!img.is_main && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-7 px-2 text-xs"
                    onClick={() => setMain(img.id)}
                    title="Definir como principal"
                  >
                    <Star className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="h-7 px-2 text-xs"
                  onClick={() => removeImage(img.id)}
                  title="Remover imagem"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="rounded-lg border border-dashed border-border py-10 flex flex-col items-center gap-2 text-muted-foreground">
          <Upload className="h-8 w-8 opacity-40" />
          <p className="text-sm">Nenhuma imagem adicionada</p>
          <p className="text-xs">
            A primeira imagem adicionada será a imagem principal.
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {images.length}/{maxImages} imagens
      </p>
    </div>
  );
}
