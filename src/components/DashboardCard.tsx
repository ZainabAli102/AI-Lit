import type { ReactNode } from "react";
import { clsx } from "clsx";

type DashboardCardProps = {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  eyebrow?: string;
};

export function DashboardCard({ title, description, children, className, eyebrow }: DashboardCardProps) {
  return (
    <section className={clsx("rounded-lg border border-[#dde3dc] bg-white p-5 shadow-sm", className)}>
      {eyebrow ? <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">{eyebrow}</p> : null}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-[#17211c]">{title}</h2>
        {description ? <p className="text-sm leading-6 text-[#66746d]">{description}</p> : null}
      </div>
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}
