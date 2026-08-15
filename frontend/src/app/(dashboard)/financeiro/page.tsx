import { DashboardLayout } from "@/layouts/DashboardLayout";
import { EmptyState } from "@/components/ui/empty-state";

export default function FinanceiroPage() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between space-y-2 mb-8 mt-4">
        <h2 className="text-3xl font-bold tracking-tight">Financeiro</h2>
      </div>
      <EmptyState
        title="Módulo em Desenvolvimento"
        description="O controle financeiro (contas a pagar/receber e fluxo de caixa) estará disponível na próxima fase."
      />
    </DashboardLayout>
  );
}
