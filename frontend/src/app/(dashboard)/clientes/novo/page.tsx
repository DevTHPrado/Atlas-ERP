import { DashboardLayout } from "@/layouts/DashboardLayout";
import { CustomerForm } from "@/components/dashboard/clientes/CustomerForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NovoClientePage() {
  return (
    <DashboardLayout>
      <div className="flex items-center space-x-4 mb-8 mt-4">
        <Link href="/clientes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Novo Cliente</h2>
      </div>

      <div className="bg-card border rounded-md p-6">
        <CustomerForm />
      </div>
    </DashboardLayout>
  );
}
