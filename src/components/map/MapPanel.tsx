import { Suspense, lazy } from "react";

import { ClientOnly } from "@/components/ClientOnly";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import type { TransitMapProps } from "./TransitMap";

const TransitMap = lazy(() => import("./TransitMap"));

export function MapPanel({ className, ...props }: TransitMapProps & { className?: string }) {
  const fallback = <Skeleton className="h-full w-full rounded-2xl" />;
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border shadow-soft", className)}>
      <ClientOnly fallback={fallback}>
        <Suspense fallback={fallback}>
          <TransitMap {...props} />
        </Suspense>
      </ClientOnly>
    </div>
  );
}
