import type { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="px-5 py-6 lg:ml-72 lg:px-8 lg:py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-7">{children}</div>
      </main>
    </div>
  );
}
