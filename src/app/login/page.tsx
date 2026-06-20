import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/Button";

export default function LoginPage() {
  return (
    <main className="min-h-screen px-5 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#116466]">CONNECTED MENA</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold text-[#17211c] md:text-6xl">
              AI Literacy implementation for schools
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#66746d]">
              A calm foundation for curriculum delivery, teacher workflows, school oversight, and future student account features.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button href="/teacher" icon={<ArrowRight aria-hidden="true" className="h-4 w-4" />}>
              Enter demo
            </Button>
            <Button href="/admin" variant="secondary">
              Admin preview
            </Button>
          </div>
        </section>

        <section className="rounded-lg border border-[#dde3dc] bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-[#e6f1ed] text-[#0b4d4f]">
              <ShieldCheck aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-[#17211c]">Login placeholder</h2>
              <p className="text-sm text-[#66746d]">Supabase authentication will connect here later.</p>
            </div>
          </div>

          <form className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-[#42514a]">Email</span>
              <input
                className="mt-2 h-11 w-full rounded-md border border-[#cad6cf] bg-[#fbfcfa] px-3 text-sm outline-none transition focus:border-[#116466] focus:ring-2 focus:ring-[#c9dfd8]"
                placeholder="teacher@school.edu"
                type="email"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[#42514a]">Password</span>
              <input
                className="mt-2 h-11 w-full rounded-md border border-[#cad6cf] bg-[#fbfcfa] px-3 text-sm outline-none transition focus:border-[#116466] focus:ring-2 focus:ring-[#c9dfd8]"
                placeholder="Not active yet"
                type="password"
              />
            </label>
            <Button className="w-full" disabled type="button">
              Authentication coming later
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}
