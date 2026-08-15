"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { CustomerForm } from "@/components/dashboard/clientes/CustomerForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { customerService } from "@/services/customerService";
import { Customer } from "@/types/customer";
import { useToast } from "@/hooks/use-toast";

export default function EditarClientePage() {
  const params = useParams();
  const { toast } = useToast();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const data = await customerService.get(params.id as string);
        setCustomer(data);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar o cliente.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCustomer();
    }
  }, [params.id, toast]);

  return (
    <DashboardLayout>
      <div className="flex items-center space-x-4 mb-8 mt-4">
        <Link href="/clientes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Editar Cliente</h2>
      </div>

      <div className="bg-card border rounded-md p-6">
        {loading ? (
          <div>Carregando...</div>
        ) : customer ? (
          <CustomerForm initialData={customer} />
        ) : (
          <div>Cliente não encontrado.</div>
        )}
      </div>
    </DashboardLayout>
  );
}
