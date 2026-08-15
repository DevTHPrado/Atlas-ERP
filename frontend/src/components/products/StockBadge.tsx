"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface StockBadgeProps {
  stockQuantity: string | number;
  minimumStock: string | number;
  isOutOfStock: boolean;
  isLowStock: boolean;
  className?: string;
}

export function StockBadge({
  stockQuantity,
  minimumStock,
  isOutOfStock,
  isLowStock,
  className,
}: StockBadgeProps) {
  const qty = Number(stockQuantity);
  const min = Number(minimumStock);

  if (isOutOfStock) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="destructive"
              className={cn("gap-1 cursor-default", className)}
            >
              <XCircle className="h-3 w-3" />
              Sem estoque
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Quantidade disponível: {qty}</p>
            <p>Estoque mínimo: {min}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (isLowStock) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={cn(
                "gap-1 border-amber-500 text-amber-600 cursor-default",
                className
              )}
            >
              <AlertTriangle className="h-3 w-3" />
              Estoque baixo
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Quantidade: {qty}</p>
            <p>Mínimo: {min}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 border-emerald-500 text-emerald-600 cursor-default",
        className
      )}
    >
      <CheckCircle2 className="h-3 w-3" />
      {qty}
    </Badge>
  );
}
