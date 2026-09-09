import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bus,
  CalendarClock,
  LayoutDashboard,
  LogOut,
  Map,
  MapPin,
  Menu,
  Route as RouteIcon,
  Star,
  User,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/rastrear", label: "Rastrear ônibus", icon: Bus },
  { to: "/itinerarios", label: "Itinerários", icon: RouteIcon },
  { to: "/horarios", label: "Horários", icon: CalendarClock },
  { to: "/mapa", label: "Mapa / Rotas", icon: Map },
  { to: "/pontos", label: "Pontos de parada", icon: MapPin },
  { to: "/favoritos", label: "Favoritos", icon: Star },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/75 transition-colors",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              active && "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft",
            )}
          >
            <item.icon className="size-4.5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col gap-6 bg-sidebar p-4">
      <Link to="/" onClick={onNavigate} className="px-1 pt-1">
        <Logo inverted />
      </Link>
      <NavLinks onNavigate={onNavigate} />
      <div className="mt-auto space-y-3">
        <div className="rounded-xl bg-sidebar-accent/60 p-3">
          <p className="truncate text-sm font-semibold text-sidebar-foreground">
            {profile?.full_name || "Passageiro"}
          </p>
          <p className="truncate text-xs text-sidebar-foreground/70">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={async () => {
            await signOut();
            toast.success("Sessão encerrada");
            void navigate({ to: "/" });
          }}
        >
          <LogOut className="size-4.5" /> Sair
        </Button>
      </div>
    </div>
  );
}

export function AppShell({
  title,
  description,
  children,
  fullBleed = false,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  fullBleed?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed inset-y-0 w-64">
          <SidebarBody />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-card/85 px-4 py-3 backdrop-blur lg:px-8">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-0 p-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SidebarBody onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold">{title}</h1>
            {description ? (
              <p className="truncate text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </header>

        <main
          className={cn(
            "min-w-0 flex-1",
            fullBleed ? "flex flex-col p-0" : "space-y-6 p-4 lg:p-8",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
