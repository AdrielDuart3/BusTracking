import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Bus,
  CalendarClock,
  MapPin,
  Radar,
  Route as RouteIcon,
  Search,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import { Logo } from "@/components/Logo";
import { MapPanel } from "@/components/map/MapPanel";
import { Button } from "@/components/ui/button";
import { useFleet } from "@/hooks/useFleet";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BUSTRAKING — Rastreamento de ônibus em tempo real" },
      {
        name: "description",
        content:
          "Acompanhe ônibus no mapa, consulte itinerários, horários e pontos de parada da sua cidade com o BUSTRAKING.",
      },
      { property: "og:title", content: "BUSTRAKING — Seu ônibus. Seu caminho. Em tempo real." },
      {
        property: "og:description",
        content: "Rastreamento de ônibus, itinerários, horários e pontos de parada em um só lugar.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Radar,
    title: "Rastreamento em tempo real",
    text: "Veja onde cada ônibus está no mapa, com velocidade, status e atualização contínua.",
  },
  {
    icon: RouteIcon,
    title: "Consulta de itinerários",
    text: "Todas as linhas, com origem, destino, sentido e a sequência completa de pontos.",
  },
  {
    icon: CalendarClock,
    title: "Horários dos ônibus",
    text: "Grade por linha, dia da semana e sentido, com busca e filtros rápidos.",
  },
  {
    icon: MapPin,
    title: "Localização dos pontos",
    text: "Encontre paradas próximas, endereços e as linhas que passam por cada ponto.",
  },
];

const STEPS = [
  { icon: Smartphone, title: "1. Crie sua conta", text: "Cadastro rápido com e-mail e senha." },
  { icon: Search, title: "2. Busque sua linha", text: "Pesquise por número, nome ou destino." },
  { icon: Bus, title: "3. Acompanhe no mapa", text: "Siga o ônibus e receba a previsão de chegada." },
];

function Landing() {
  const { live, stops, routes } = useFleet();
  const polylines = Array.from(routes.values()).map((r) => ({
    id: r.line.id,
    color: r.line.color,
    points: r.stops.map((s) => ({ lat: s.lat, lng: s.lng })),
  }));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <a href="#funcionalidades" className="hover:text-foreground">
              Funcionalidades
            </a>
            <a href="#mapa" className="hover:text-foreground">
              Mapa ao vivo
            </a>
            <a href="#como-funciona" className="hover:text-foreground">
              Como funciona
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth" search={{ modo: "login" }}>
                Entrar
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth" search={{ modo: "cadastro" }}>
                Criar conta
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="bg-hero text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
              <Radar className="size-3.5" /> Mobilidade urbana inteligente
            </span>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Seu ônibus. Seu caminho. Em tempo real.
            </h1>
            <p className="max-w-xl text-base text-white/80">
              Acompanhe seus ônibus, consulte itinerários e horários e tenha mais praticidade para
              planejar sua viagem.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/rastrear" search={{ q: "", filtro: "todos" }}>
                  Rastrear ônibus <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/itinerarios">Ver itinerários</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-6 pt-4 text-sm text-white/70">
              <span>{live.length} ônibus simulados</span>
              <span>{routes.size} linhas</span>
              <span>{stops.length} pontos de parada</span>
            </div>
          </div>

          <div id="mapa" className="h-[22rem] lg:h-[28rem]">
            <MapPanel
              className="h-full border-white/20"
              buses={live}
              stops={stops}
              routes={polylines}
            />
          </div>
        </div>
      </section>

      <section id="funcionalidades" className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <h2 className="text-2xl font-bold md:text-3xl">Principais funcionalidades</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Tudo o que você precisa para planejar o trajeto e chegar no horário.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card-soft p-5 transition-shadow hover:shadow-lift">
              <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="como-funciona" className="bg-secondary/50 py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="text-2xl font-bold md:text-3xl">Como funciona?</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.title} className="card-soft p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-accent/15 text-accent-foreground">
                  <s.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t bg-card">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 text-sm md:grid-cols-3 lg:px-8">
          <div className="space-y-3">
            <Logo />
            <p className="text-muted-foreground">
              Plataforma acadêmica de rastreamento e informações de transporte público urbano.
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">Navegação</p>
            <div className="flex flex-col gap-1 text-muted-foreground">
              <Link to="/rastrear" search={{ q: "", filtro: "todos" }} className="hover:text-foreground">
                Rastrear ônibus
              </Link>
              <Link to="/itinerarios" className="hover:text-foreground">
                Itinerários
              </Link>
              <Link to="/horarios" className="hover:text-foreground">
                Horários
              </Link>
              <Link to="/pontos" className="hover:text-foreground">
                Pontos de parada
              </Link>
            </div>
          </div>
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 font-semibold">
              <ShieldCheck className="size-4 text-accent" /> Aviso
            </p>
            <p className="text-muted-foreground">
              Os dados exibidos são fictícios (cidade de Nova Aurora) e servem apenas para
              demonstração. O BUSTRAKING não representa nenhuma empresa real de transporte.
            </p>
          </div>
        </div>
        <div className="border-t py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} BUSTRAKING — Projeto acadêmico de T.I.
        </div>
      </footer>
    </div>
  );
}
