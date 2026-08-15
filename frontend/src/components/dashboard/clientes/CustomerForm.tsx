"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { customerService } from "@/services/customerService";
import { Customer, CustomerCreate, CustomerUpdate } from "@/types/customer";

const customerSchema = z.object({
  person_type: z.enum(["PF", "PJ"]),
  name: z.string().min(3, "Nome é obrigatório"),
  trade_name: z.string().optional(),
  tax_id: z.string().optional(),
  state_registration: z.string().optional(),
  municipal_registration: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  whatsapp: z.string().optional(),
  contact_name: z.string().optional(),
  contact_role: z.string().optional(),
  zip_code: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  initialData?: Customer;
}

export function CustomerForm({ initialData }: CustomerFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      person_type: initialData?.person_type || "PJ",
      name: initialData?.name || "",
      trade_name: initialData?.trade_name || "",
      tax_id: initialData?.tax_id || "",
      state_registration: initialData?.state_registration || "",
      municipal_registration: initialData?.municipal_registration || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      mobile: initialData?.mobile || "",
      whatsapp: initialData?.whatsapp || "",
      contact_name: initialData?.contact_name || "",
      contact_role: initialData?.contact_role || "",
      zip_code: initialData?.zip_code || "",
      street: initialData?.street || "",
      number: initialData?.number || "",
      complement: initialData?.complement || "",
      neighborhood: initialData?.neighborhood || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      country: initialData?.country || "Brasil",
      notes: initialData?.notes || "",
      is_active: initialData !== undefined ? initialData.is_active : true,
    },
  });

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      setLoading(true);
      // Clean up empty strings to undefined
      const cleanData = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v === "" ? null : v])
      ) as unknown as CustomerCreate;
      
      if (initialData) {
        await customerService.update(initialData.id, cleanData);
        toast({ title: "Cliente atualizado com sucesso" });
      } else {
        await customerService.create(cleanData);
        toast({ title: "Cliente criado com sucesso" });
      }
      router.push("/clientes");
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar cliente",
        description: error.response?.data?.detail || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkCEP = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, "");
    if (cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          form.setValue("street", data.logradouro);
          form.setValue("neighborhood", data.bairro);
          form.setValue("city", data.localidade);
          form.setValue("state", data.uf);
        }
      } catch (err) {
        console.error("Erro ao buscar CEP", err);
      }
    }
  };

  const personType = form.watch("person_type");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <Tabs defaultValue="gerais" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="gerais">Gerais</TabsTrigger>
          <TabsTrigger value="contato">Contato</TabsTrigger>
          <TabsTrigger value="endereco">Endereço</TabsTrigger>
          <TabsTrigger value="fiscal">Fiscal</TabsTrigger>
          <TabsTrigger value="observacoes">Observações</TabsTrigger>
        </TabsList>

        <TabsContent value="gerais" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Pessoa</Label>
              <Select
                onValueChange={(val) => form.setValue("person_type", val as any)}
                defaultValue={form.watch("person_type")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                  <SelectItem value="PF">Pessoa Física</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{personType === "PJ" ? "CNPJ" : "CPF"}</Label>
              <Input {...form.register("tax_id")} placeholder="00.000.000/0000-00" />
            </div>

            <div className="space-y-2">
              <Label>{personType === "PJ" ? "Razão Social" : "Nome Completo"} *</Label>
              <Input {...form.register("name")} />
              {form.formState.errors.name && (
                <span className="text-sm text-red-500">{form.formState.errors.name.message}</span>
              )}
            </div>

            {personType === "PJ" && (
              <div className="space-y-2">
                <Label>Nome Fantasia</Label>
                <Input {...form.register("trade_name")} />
              </div>
            )}
            
            <div className="space-y-2 flex items-center mt-6">
              <Checkbox 
                id="is_active" 
                checked={form.watch("is_active")}
                onCheckedChange={(checked) => form.setValue("is_active", checked as boolean)}
              />
              <Label htmlFor="is_active" className="ml-2">Cliente Ativo</Label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contato" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <span className="text-sm text-red-500">{form.formState.errors.email.message}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label>Telefone Fixo</Label>
              <Input {...form.register("phone")} />
            </div>
            <div className="space-y-2">
              <Label>Celular</Label>
              <Input {...form.register("mobile")} />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input {...form.register("whatsapp")} />
            </div>
            <div className="space-y-2">
              <Label>Nome do Contato</Label>
              <Input {...form.register("contact_name")} />
            </div>
            <div className="space-y-2">
              <Label>Cargo do Contato</Label>
              <Input {...form.register("contact_role")} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="endereco" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-1">
              <Label>CEP</Label>
              <Input {...form.register("zip_code")} onBlur={checkCEP} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Logradouro (Rua, Av, etc)</Label>
              <Input {...form.register("street")} />
            </div>
            <div className="space-y-2">
              <Label>Número</Label>
              <Input {...form.register("number")} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Complemento</Label>
              <Input {...form.register("complement")} />
            </div>
            <div className="space-y-2">
              <Label>Bairro</Label>
              <Input {...form.register("neighborhood")} />
            </div>
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input {...form.register("city")} />
            </div>
            <div className="space-y-2">
              <Label>Estado (UF)</Label>
              <Input {...form.register("state")} maxLength={2} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="fiscal" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Inscrição Estadual</Label>
              <Input {...form.register("state_registration")} />
            </div>
            <div className="space-y-2">
              <Label>Inscrição Municipal</Label>
              <Input {...form.register("municipal_registration")} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="observacoes" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Observações Gerais</Label>
            <Textarea {...form.register("notes")} rows={6} />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/clientes")}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Cliente"}
        </Button>
      </div>
    </form>
  );
}
