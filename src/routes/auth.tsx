import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";

type Modo = "login" | "cadastro";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { modo: Modo } => ({
    modo: search["modo"] === "cadastro" ? "cadastro" : "login",
  }),
  head: () => ({
    meta: [
      { title: "Entrar ou criar conta — BUSTRAKING" },
      {
        name: "description",
        content: "Acesse sua conta BUSTRAKING para rastrear ônibus, salvar linhas e ver horários.",
      },
      { property: "og:title", content: "Entrar no BUSTRAKING" },
      { property: "og:description", content: "Login e cadastro da plataforma BUSTRAKING." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { modo } = Route.useSearch();
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) void navigate({ to: "/dashboard" });
  }, [session, navigate]);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-hero p-10 text-white lg:flex">
        <Link to="/">
          <Logo inverted />
        </Link>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Seu ônibus. Seu caminho. Em tempo real.</h2>
          <p className="max-w-md text-white/75">
            Entre para acompanhar linhas favoritas, ver previsão de chegada e planejar sua viagem
            com antecedência.
          </p>
        </div>
        <p className="text-xs text-white/60">Dados fictícios — projeto acadêmico.</p>
      </div>

      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden">
            <Link to="/">
              <Logo />
            </Link>
          </div>
          <Tabs
            value={modo}
            onValueChange={(value) =>
              navigate({ to: "/auth", search: { modo: value as Modo } })
            }
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="cadastro">Criar conta</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            <TabsContent value="cadastro">
              <SignUpForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function GoogleButton() {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        const result = await lovable.auth.signInWithOAuth("google", {
          redirect_uri: window.location.origin,
        });
        if (result.error) {
          setLoading(false);
          toast.error("Não foi possível entrar com o Google.");
          return;
        }
        if (result.redirected) return;
        window.location.href = "/dashboard";
      }}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : null} Continuar com Google
    </Button>
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  placeholder = "••••••••",
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="pr-10"
      />
      <button
        type="button"
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted-foreground hover:text-foreground"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next["email"] = "Informe um e-mail válido.";
    if (password.length < 6) next["password"] = "A senha deve ter ao menos 6 caracteres.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(
        error.message.includes("Invalid login")
          ? "E-mail ou senha incorretos."
          : "Não foi possível entrar. Tente novamente.",
      );
      return;
    }
    toast.success("Bem-vindo de volta!");
    void navigate({ to: "/dashboard" });
  }

  return (
    <form onSubmit={onSubmit} className="card-soft mt-4 space-y-4 p-6">
      <div>
        <h1 className="text-xl font-bold">Entrar</h1>
        <p className="text-sm text-muted-foreground">Acesse o painel do BUSTRAKING.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-email">E-mail</Label>
        <Input
          id="login-email"
          type="email"
          value={email}
          placeholder="voce@email.com"
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors["email"] ? <p className="text-xs text-destructive">{errors["email"]}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Senha</Label>
        <PasswordInput id="login-password" value={password} onChange={setPassword} />
        {errors["password"] ? (
          <p className="text-xs text-destructive">{errors["password"]}</p>
        ) : null}
      </div>
      <button
        type="button"
        className="text-sm text-primary hover:underline"
        onClick={async () => {
          if (!/^\S+@\S+\.\S+$/.test(email)) {
            toast.error("Informe seu e-mail acima para recuperar a senha.");
            return;
          }
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/perfil`,
          });
          if (error) toast.error("Não foi possível enviar o e-mail de recuperação.");
          else toast.success("Enviamos um link de recuperação para o seu e-mail.");
        }}
      >
        Esqueci minha senha
      </button>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : null} Entrar
      </Button>
      <div className="relative py-1 text-center text-xs text-muted-foreground">
        <span className="bg-card px-2">ou</span>
        <span className="absolute inset-x-0 top-1/2 -z-10 block border-t" />
      </div>
      <GoogleButton />
      <p className="text-center text-sm text-muted-foreground">
        Ainda não possui uma conta?{" "}
        <Link to="/auth" search={{ modo: "cadastro" }} className="text-primary hover:underline">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}

function SignUpForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 3) next["name"] = "Informe seu nome completo.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next["email"] = "Informe um e-mail válido.";
    if (form.password.length < 6) next["password"] = "A senha deve ter ao menos 6 caracteres.";
    if (form.password !== form.confirm) next["confirm"] = "As senhas não coincidem.";
    if (!terms) next["terms"] = "É necessário aceitar os termos de uso.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: form.name },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(
        error.message.includes("already registered")
          ? "Este e-mail já possui cadastro."
          : "Não foi possível criar a conta. Tente novamente.",
      );
      return;
    }
    toast.success("Conta criada com sucesso!");
    void navigate({ to: "/dashboard" });
  }

  return (
    <form onSubmit={onSubmit} className="card-soft mt-4 space-y-4 p-6">
      <div>
        <h1 className="text-xl font-bold">Criar conta</h1>
        <p className="text-sm text-muted-foreground">Leva menos de um minuto.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="su-name">Nome completo</Label>
        <Input
          id="su-name"
          value={form.name}
          placeholder="Maria da Silva"
          onChange={(e) => set("name")(e.target.value)}
        />
        {errors["name"] ? <p className="text-xs text-destructive">{errors["name"]}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="su-email">E-mail</Label>
        <Input
          id="su-email"
          type="email"
          value={form.email}
          placeholder="voce@email.com"
          onChange={(e) => set("email")(e.target.value)}
        />
        {errors["email"] ? <p className="text-xs text-destructive">{errors["email"]}</p> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="su-pass">Senha</Label>
          <PasswordInput id="su-pass" value={form.password} onChange={set("password")} />
          {errors["password"] ? (
            <p className="text-xs text-destructive">{errors["password"]}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="su-confirm">Confirmar senha</Label>
          <PasswordInput id="su-confirm" value={form.confirm} onChange={set("confirm")} />
          {errors["confirm"] ? (
            <p className="text-xs text-destructive">{errors["confirm"]}</p>
          ) : null}
        </div>
      </div>
      <div className="flex items-start gap-2">
        <Checkbox
          id="su-terms"
          checked={terms}
          onCheckedChange={(checked) => setTerms(checked === true)}
        />
        <Label htmlFor="su-terms" className="text-sm font-normal leading-snug">
          Li e aceito os termos de uso e a política de privacidade do BUSTRAKING.
        </Label>
      </div>
      {errors["terms"] ? <p className="text-xs text-destructive">{errors["terms"]}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : null} Criar conta
      </Button>
      <GoogleButton />
    </form>
  );
}
