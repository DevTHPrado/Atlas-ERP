"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Building2, Loader2, LockKeyhole, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { login } from "@/services/auth.service";
import { useSessionStore } from "@/stores/session-store";

const loginSchema = z.object({
  username: z.string().min(1, "Informe seu usuario."),
  password: z.string().min(8, "Informe sua senha."),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginScreen() {
  const signIn = useSessionStore((state) => state.signIn);
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: LoginForm) => login(values.username, values.password),
    onSuccess: (session) => {
      signIn(session.access_token, session.user);
    },
  });

  return (
    <main className="flex min-h-screen bg-background">
      <section className="hidden flex-1 border-r bg-card px-10 py-12 lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Building2 size={21} />
          </div>
          <div>
            <p className="font-semibold">ERP Empresas</p>
            <p className="text-sm text-muted-foreground">Operacao comercial</p>
          </div>
        </div>

        <div className="max-w-xl">
          <p className="text-sm font-medium text-primary">Gestao empresarial</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal text-foreground">
            Controle vendas, estoque, financeiro e clientes em uma unica operacao.
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Acesso seguro ao painel executivo com permissoes, auditoria e indicadores para
            tomada de decisao.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm text-muted-foreground">
          <div className="rounded-lg border p-4">RBAC</div>
          <div className="rounded-lg border p-4">JWT</div>
          <div className="rounded-lg border p-4">Auditoria</div>
        </div>
      </section>

      <section className="flex min-h-screen w-full items-center justify-center px-4 py-10 lg:w-[480px]">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Building2 size={21} />
            </div>
            <h1 className="mt-5 text-2xl font-semibold">ERP Empresas</h1>
            <p className="mt-1 text-sm text-muted-foreground">Acesse sua conta para continuar</p>
          </div>

          <div className="mb-7 hidden lg:block">
            <h2 className="text-2xl font-semibold">Entrar no ERP</h2>
            <p className="mt-1 text-sm text-muted-foreground">Use seu usuario e senha corporativos.</p>
          </div>

          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          >
            <label className="block">
              <span className="text-sm font-medium">Usuario</span>
              <div className="mt-2 flex h-11 items-center gap-2 rounded-md border bg-background px-3">
                <Mail size={17} className="text-muted-foreground" />
                <input
                  className="h-full flex-1 bg-transparent text-sm outline-none"
                  type="text"
                  autoComplete="username"
                  {...form.register("username")}
                />
              </div>
              {form.formState.errors.username ? (
                <span className="mt-1 block text-xs text-destructive">
                  {form.formState.errors.username.message}
                </span>
              ) : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium">Senha</span>
              <div className="mt-2 flex h-11 items-center gap-2 rounded-md border bg-background px-3">
                <LockKeyhole size={17} className="text-muted-foreground" />
                <input
                  className="h-full flex-1 bg-transparent text-sm outline-none"
                  type="password"
                  autoComplete="current-password"
                  {...form.register("password")}
                />
              </div>
              {form.formState.errors.password ? (
                <span className="mt-1 block text-xs text-destructive">
                  {form.formState.errors.password.message}
                </span>
              ) : null}
            </label>

            {mutation.isError ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                Usuario ou senha invalidos.
              </div>
            ) : null}

            <Button className="h-11 w-full" type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
              Entrar
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
