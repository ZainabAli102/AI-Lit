"use client";

import { useState } from "react";
import Link from "next/link";

export type ScenarioRevealRound = {
  id: string;
  scenario: string;
  prompt: string;
  reveal: string;
  discussion?: string;
  confidence?: string;
};

type ScenarioRevealSmartboardProps = {
  prompt: string;
  rounds: ScenarioRevealRound[];
  accessibilityNotes: string[];
  returnHref: string;
  returnLabel: string;
};

export function ScenarioRevealSmartboard({ accessibilityNotes, prompt, returnHref, returnLabel, rounds }: ScenarioRevealSmartboardProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const currentRound = rounds[roundIndex] ?? rounds[0];
  const isLastRound = roundIndex >= rounds.length - 1;

  function resetActivity() {
    setRoundIndex(0);
    setRevealed(false);
  }

  function nextRound() {
    if (isLastRound) {
      return;
    }

    setRoundIndex((current) => current + 1);
    setRevealed(false);
  }

  return (
    <div className="min-h-screen bg-[#eef5f1] px-6 py-6 text-[#17211c]">
      <main className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="rounded-2xl border border-[#d6ded8] bg-white p-7 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#116466]">Smartboard Activity</p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">Predict, observe, reveal</h1>
            </div>
            <Link className="min-h-14 rounded-xl border border-[#cad6cf] bg-[#fbfcfa] px-6 py-4 text-lg font-semibold text-[#42514a] shadow-sm" href={returnHref}>
              {returnLabel}
            </Link>
          </div>
          <p className="mt-4 max-w-4xl text-2xl leading-9 text-[#42514a]">{prompt}</p>
          <p className="mt-3 text-lg font-semibold text-[#116466]">
            Round {roundIndex + 1} of {rounds.length}
          </p>
        </section>

        {accessibilityNotes.length > 0 ? (
          <section className="rounded-2xl border border-[#cfe0d8] bg-[#f8fcfa] p-4 text-lg leading-7 text-[#42514a]">
            <span className="font-semibold text-[#17211c]">Teacher support:</span> {accessibilityNotes.join(" ")}
          </section>
        ) : null}

        <section className="grid gap-5 rounded-2xl border border-[#d6ded8] bg-white p-6 shadow-sm">
          <div className="rounded-2xl bg-[#f7faf8] p-6">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#116466]">Scenario</p>
            <p className="mt-3 text-3xl font-semibold leading-tight">{currentRound.scenario}</p>
          </div>

          <div className="rounded-2xl border border-[#d6ded8] bg-[#fffdf8] p-6">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#8a6a2d]">Predict</p>
            <p className="mt-3 text-2xl leading-9 text-[#42514a]">{currentRound.prompt}</p>
            {currentRound.confidence ? <p className="mt-3 text-lg font-semibold text-[#66746d]">Confidence: {currentRound.confidence}</p> : null}
          </div>

          {revealed ? (
            <div className="rounded-2xl border border-[#b9d8c8] bg-[#edf8f1] p-6">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#116466]">Reveal</p>
              <p className="mt-3 text-3xl font-semibold leading-tight text-[#0b4d4f]">{currentRound.reveal}</p>
              {currentRound.discussion ? (
                <p className="mt-4 rounded-xl bg-white/80 p-4 text-xl leading-8 text-[#42514a]">
                  <span className="font-semibold text-[#17211c]">Discuss:</span> {currentRound.discussion}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-[#cad6cf] bg-[#fbfcfa] p-6 text-xl leading-8 text-[#66746d]">
              Invite predictions first, then reveal what happens.
            </p>
          )}
        </section>

        <section className="flex flex-wrap gap-3 rounded-2xl border border-[#d6ded8] bg-white p-5 shadow-sm">
          <button className="min-h-14 rounded-xl bg-[#116466] px-6 text-lg font-semibold text-white shadow-sm" onClick={() => setRevealed(true)} type="button">
            Reveal
          </button>
          <button
            className="min-h-14 rounded-xl border border-[#cad6cf] bg-white px-6 text-lg font-semibold text-[#42514a] shadow-sm disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!revealed || isLastRound}
            onClick={nextRound}
            type="button"
          >
            Next round
          </button>
          <button className="min-h-14 rounded-xl border border-[#cad6cf] bg-white px-6 text-lg font-semibold text-[#42514a] shadow-sm" onClick={resetActivity} type="button">
            Reset activity
          </button>
        </section>
      </main>
    </div>
  );
}
