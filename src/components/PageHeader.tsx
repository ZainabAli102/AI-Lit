import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, description, eyebrow, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 border-b border-[#dde3dc] pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl space-y-3">
        {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#116466]">{eyebrow}</p> : null}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-[#17211c] md:text-4xl">{title}</h1>
          {description ? <p className="text-base leading-7 text-[#66746d]">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </header>
  );
}
