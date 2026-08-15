import { DashboardLayout } from "@/layouts/DashboardLayout";
import { EmptyState } from "@/components/ui/empty-state";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between space-y-2 mb-8 mt-4">
        <h2 className="text-3xl font-bold tracking-tight">Configurações Gerais</h2>
      </div>
      <EmptyState
        title="Módulo em Desenvolvimento"
        description="A gestão de empresa, usuários, papéis, integrações e backup estará disponível na próxima fase."
      />
    </DashboardLayout>
  );
}
