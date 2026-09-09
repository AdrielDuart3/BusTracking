import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CalendarDays, Loader2, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil — BUSTRAKING" },
      { name: "description", content: "Gerencie seus dados de conta no BUSTRAKING." },
      { property: "og:title", content: "Perfil — BUSTRAKING" },
      { property: "og:description", content: "Edite seu nome, avatar e senha." },
    ],
  }),
  component: Perfil,
});

function Perfil() {
  const { profile, user, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    setName(profile?.full_name ?? "");
    setAvatar(profile?.avatar_url ?? "");
  }, [profile]);

  const initials = (profile?.full_name || user?.email || "BT")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    if (name.trim().length < 3) {
      toast.error("Informe seu nome completo.");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name.trim(), avatar_url: avatar.trim() || null })
      .eq("id", user!.id);
    setSaving(false);
    if (error) {
      toast.error("Não foi possível salvar suas informações.");
      return;
    }
    await refreshProfile();
    toast.success("Perfil atualizado com sucesso!");
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 6) {
      toast.error("A nova senha deve ter ao menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setChanging(true);
    const { error } = await supabase.auth.updateUser({ password });
    setChanging(false);
    if (error) {
      toast.error("Não foi possível alterar a senha.");
      return;
    }
    setPassword("");
    setConfirm("");
    toast.success("Senha alterada com sucesso!");
  }

  return (
    <AppShell title="Perfil" description="Seus dados de conta">
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card-soft flex flex-col items-center gap-3 p-6 text-center">
          <Avatar className="size-20">
            {avatar ? <AvatarImage src={avatar} alt={name} /> : null}
            <AvatarFallback className="bg-primary text-lg text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{profile?.full_name || "Passageiro"}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" />
            Cadastrado em{" "}
            {profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString("pt-BR")
              : "—"}
          </p>
          <Button
            variant="outline"
            className="mt-2 w-full"
            onClick={async () => {
              await signOut();
              toast.success("Sessão encerrada");
              void navigate({ to: "/" });
            }}
          >
            <LogOut className="size-4" /> Sair da conta
          </Button>
        </section>

        <form onSubmit={saveProfile} className="card-soft space-y-4 p-6 lg:col-span-2">
          <h2 className="font-semibold">Editar dados</h2>
          <div className="space-y-2">
            <Label htmlFor="p-name">Nome completo</Label>
            <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-email">E-mail</Label>
            <Input id="p-email" value={user?.email ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-avatar">URL do avatar</Label>
            <Input
              id="p-avatar"
              value={avatar}
              placeholder="https://..."
              onChange={(e) => setAvatar(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : null} Salvar alterações
          </Button>
        </form>

        <form onSubmit={changePassword} className="card-soft space-y-4 p-6 lg:col-span-3">
          <h2 className="font-semibold">Alterar senha</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="p-pass">Nova senha</Label>
              <Input
                id="p-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-confirm">Confirmar nova senha</Label>
              <Input
                id="p-confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" variant="secondary" disabled={changing}>
            {changing ? <Loader2 className="size-4 animate-spin" /> : null} Alterar senha
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
