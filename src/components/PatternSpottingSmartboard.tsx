"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type PatternRenderMode = "color_swatches" | "shapes";

export type PatternRound = {
  id: string;
  sequence: string[];
  options: string[];
  next: string;
  repeatingUnit?: string[];
};

type PatternSpottingSmartboardProps = {
  prompt: string;
  renderMode: PatternRenderMode;
  pairWithLabel: boolean;
  shapeSet: string[];
  rounds: PatternRound[];
  returnHref: string;
  returnLabel: string;
};

const colorStyles: Record<string, string> = {
  red: "border-[#e7a09a] bg-[#fde2df] text-[#74372f]",
  blue: "border-[#9fc8ea] bg-[#e4f2ff] text-[#1d4c68]",
  green: "border-[#a9d9b7] bg-[#e7f8ec] text-[#245638]",
  yellow: "border-[#ecd087] bg-[#fff5c7] text-[#6d5415]",
  purple: "border-[#cdbce8] bg-[#f0e9ff] text-[#514078]",
  orange: "border-[#efbd8d] bg-[#ffe9d1] text-[#744437]",
  pink: "border-[#efb4cf] bg-[#fde7f1] text-[#733b58]",
  black: "border-[#8f9691] bg-[#e8ece9] text-[#17211c]",
  white: "border-[#b8c3bd] bg-white text-[#17211c]",
  grey: "border-[#aeb8b2] bg-[#edf0ee] text-[#3c4741]",
  gray: "border-[#aeb8b2] bg-[#edf0ee] text-[#3c4741]"
};

const shapeStyles: Record<string, string> = {
  circle: "rounded-full",
  square: "rounded-md",
  triangle: "",
  star: "",
  rectangle: "rounded-md",
  diamond: "rotate-45 rounded-sm"
};

const shapeFillStyles = [
  "bg-[#e4f2ff] border-[#9fc8ea]",
  "bg-[#e7f8ec] border-[#a9d9b7]",
  "bg-[#f0e9ff] border-[#cdbce8]",
  "bg-[#fff5c7] border-[#ecd087]",
  "bg-[#ffe9d1] border-[#efbd8d]"
];

function titleCase(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function colorClass(value: string) {
  return colorStyles[value.toLowerCase()] ?? "border-[#cad6cf] bg-white text-[#17211c]";
}

function shapePalette(value: string, shapeSet: string[]) {
  const index = Math.max(0, shapeSet.indexOf(value));
  return shapeFillStyles[index % shapeFillStyles.length];
}

function ShapeIcon({ value, shapeSet }: { value: string; shapeSet: string[] }) {
  const shape = value.toLowerCase();
  const palette = shapePalette(shape, shapeSet);

  if (shape === "triangle") {
    return <span className={`block h-16 w-16 ${palette}`} style={{ clipPath: "polygon(50% 6%, 8% 92%, 92% 92%)" }} aria-hidden="true" />;
  }

  if (shape === "star") {
    return (
      <span
        className={`block h-16 w-16 ${palette}`}
        style={{ clipPath: "polygon(50% 4%, 62% 35%, 95% 36%, 68% 56%, 78% 88%, 50% 69%, 22% 88%, 32% 56%, 5% 36%, 38% 35%)" }}
        aria-hidden="true"
      />
    );
  }

  if (shape === "diamond") {
    return <span className={`block h-14 w-14 rotate-45 rounded-sm border-4 ${palette}`} aria-hidden="true" />;
  }

  if (shape === "rectangle") {
    return <span className={`block h-12 w-20 rounded-md border-4 ${palette}`} aria-hidden="true" />;
  }

  return <span className={`block h-16 w-16 border-4 ${palette} ${shapeStyles[shape] ?? "rounded-xl"}`} aria-hidden="true" />;
}

function PatternItem({
  value,
  renderMode,
  pairWithLabel,
  shapeSet,
  highlight,
  muted
}: {
  value: string;
  renderMode: PatternRenderMode;
  pairWithLabel: boolean;
  shapeSet: string[];
  highlight?: boolean;
  muted?: boolean;
}) {
  const label = titleCase(value);

  if (renderMode === "shapes") {
    return (
      <div
        className={`flex min-h-32 min-w-32 flex-col items-center justify-center gap-3 rounded-2xl border-2 bg-white p-4 shadow-sm transition ${
          highlight ? "border-[#116466] ring-4 ring-[#a8ddd4]" : "border-[#d6ded8]"
        } ${muted ? "opacity-55" : ""}`}
      >
        <ShapeIcon shapeSet={shapeSet} value={value} />
        <span className="text-xl font-semibold text-[#17211c]">{label}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-32 min-w-32 flex-col items-center justify-center gap-3 rounded-2xl border-2 p-4 shadow-sm transition ${colorClass(value)} ${
        highlight ? "ring-4 ring-[#a8ddd4]" : ""
      } ${muted ? "opacity-55" : ""}`}
    >
      <span className="h-14 w-14 rounded-full border-2 border-white/80 bg-current opacity-70 shadow-inner" aria-hidden="true" />
      {pairWithLabel ? <span className="text-xl font-semibold">{label}</span> : null}
    </div>
  );
}

function EmptySlot() {
  return (
    <div className="flex min-h-32 min-w-32 items-center justify-center rounded-2xl border-4 border-dashed border-[#9fc8bd] bg-[#f7fbf8] p-4 text-5xl font-semibold text-[#116466] shadow-inner">
      ?
    </div>
  );
}

export function PatternSpottingSmartboard({ prompt, renderMode, pairWithLabel, shapeSet, rounds, returnHref, returnLabel }: PatternSpottingSmartboardProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const currentRound = rounds[roundIndex] ?? rounds[0];
  const repeatingUnit = useMemo(() => currentRound?.repeatingUnit ?? [], [currentRound]);
  const isCorrect = Boolean(selectedOption && currentRound && selectedOption === currentRound.next);
  const isLastRound = roundIndex >= rounds.length - 1;

  function resetRound() {
    setSelectedOption(null);
    setChecked(false);
  }

  function resetActivity() {
    setRoundIndex(0);
    setSelectedOption(null);
    setChecked(false);
  }

  function nextRound() {
    setRoundIndex((current) => Math.min(current + 1, rounds.length - 1));
    setSelectedOption(null);
    setChecked(false);
  }

  if (!currentRound) {
    return (
      <div className="min-h-screen bg-[#eef5f1] px-6 py-6 text-[#17211c]">
        <main className="mx-auto max-w-5xl rounded-2xl border border-[#d6ded8] bg-white p-8 shadow-sm">
          <h1 className="text-4xl font-semibold">Activity content unavailable</h1>
          <p className="mt-4 text-xl text-[#42514a]">This pattern activity does not have any rounds yet.</p>
          <Link className="mt-6 inline-flex min-h-14 items-center rounded-xl border border-[#cad6cf] bg-[#fbfcfa] px-6 text-lg font-semibold text-[#42514a]" href={returnHref}>
            {returnLabel}
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef5f1] px-6 py-6 text-[#17211c]">
      <main className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-2xl border border-[#d6ded8] bg-white p-7 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#116466]">Smartboard Activity</p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">Spot the pattern</h1>
            </div>
            <Link className="min-h-14 rounded-xl border border-[#cad6cf] bg-[#fbfcfa] px-6 py-4 text-lg font-semibold text-[#42514a] shadow-sm" href={returnHref}>
              {returnLabel}
            </Link>
          </div>
          <p className="mt-4 max-w-4xl text-2xl leading-9 text-[#42514a]">{prompt}</p>
        </section>

        <section className="rounded-2xl border border-[#d6ded8] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xl font-semibold text-[#42514a]">
                Round {roundIndex + 1} of {rounds.length}
              </p>
              <h2 className="mt-2 text-4xl font-semibold">What comes next?</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="min-h-14 rounded-xl border border-[#cad6cf] bg-white px-6 text-lg font-semibold text-[#42514a] shadow-sm" onClick={resetActivity} type="button">
                Reset activity
              </button>
              <button
                className="min-h-14 rounded-xl bg-[#116466] px-6 text-lg font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-[#a8b8b0]"
                disabled={!selectedOption}
                onClick={() => setChecked(true)}
                type="button"
              >
                Check answer
              </button>
              {checked && !isLastRound ? (
                <button className="min-h-14 rounded-xl bg-[#2f6f91] px-6 text-lg font-semibold text-white shadow-sm" onClick={nextRound} type="button">
                  Next round
                </button>
              ) : null}
            </div>
          </div>

          {checked ? (
            <div className={`mt-5 rounded-xl border px-5 py-4 text-2xl font-semibold ${isCorrect ? "border-[#5d9f73] bg-[#edf8f1] text-[#0b4d4f]" : "border-[#d7c49a] bg-[#fff8e8] text-[#6d4c11]"}`}>
              {isCorrect ? "Yes, the pattern repeats." : "Look again. What repeats?"}
            </div>
          ) : selectedOption ? (
            <p className="mt-5 rounded-xl border border-[#cde5f7] bg-[#eef7ff] px-5 py-4 text-2xl font-semibold text-[#1d4c68]">
              You chose {titleCase(selectedOption)}. Check when the class is ready.
            </p>
          ) : (
            <p className="mt-5 rounded-xl border border-[#d6ded8] bg-[#fbfcfa] px-5 py-4 text-2xl font-semibold text-[#42514a]">Choose one answer to place in the empty slot.</p>
          )}
        </section>

        <section className="rounded-2xl border border-[#d6ded8] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            {currentRound.sequence.map((item, index) => {
              const unitIndex = repeatingUnit.length > 0 ? index % repeatingUnit.length : -1;
              const shouldHighlight = checked && repeatingUnit.length > 0 && repeatingUnit[unitIndex] === item && index < repeatingUnit.length * 2;

              return <PatternItem highlight={shouldHighlight} key={`${currentRound.id}-${item}-${index}`} pairWithLabel={pairWithLabel} renderMode={renderMode} shapeSet={shapeSet} value={item} />;
            })}
            <div aria-label="Next pattern slot">{checked ? <PatternItem highlight pairWithLabel={pairWithLabel} renderMode={renderMode} shapeSet={shapeSet} value={currentRound.next} /> : <EmptySlot />}</div>
          </div>
          {checked && repeatingUnit.length > 0 ? (
            <div className="mt-5 rounded-xl border border-[#b9d8c8] bg-[#edf8f1] p-4">
              <p className="text-lg font-semibold text-[#0b4d4f]">Repeating part</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {repeatingUnit.map((item, index) => (
                  <PatternItem key={`${currentRound.id}-unit-${item}-${index}`} pairWithLabel={pairWithLabel} renderMode={renderMode} shapeSet={shapeSet} value={item} />
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-[#d6ded8] bg-white p-6 shadow-sm">
          <h2 className="text-3xl font-semibold">Answer choices</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {currentRound.options.map((option) => {
              const isSelected = selectedOption === option;

              return (
                <button
                  className={`touch-manipulation rounded-2xl border-4 p-3 text-left transition ${
                    isSelected ? "border-[#116466] bg-[#edf8f1] ring-4 ring-[#a8ddd4]" : "border-transparent bg-[#fbfcfa] hover:border-[#9fc8bd]"
                  }`}
                  key={`${currentRound.id}-option-${option}`}
                  onClick={() => {
                    setSelectedOption(option);
                    setChecked(false);
                  }}
                  type="button"
                >
                  <PatternItem muted={checked && option !== currentRound.next} pairWithLabel={pairWithLabel} renderMode={renderMode} shapeSet={shapeSet} value={option} />
                </button>
              );
            })}
          </div>
          {checked ? (
            <button className="mt-5 min-h-14 rounded-xl border border-[#cad6cf] bg-white px-6 text-lg font-semibold text-[#42514a] shadow-sm" onClick={resetRound} type="button">
              Try this round again
            </button>
          ) : null}
        </section>
      </main>
    </div>
  );
}
