"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";

type MatchItem = {
  id: string;
  label: string;
};

type MatchPair = {
  leftId: string;
  rightId: string;
};

type MatchingCardsSmartboardProps = {
  prompt: string;
  leftItems: MatchItem[];
  rightItems: MatchItem[];
  matches: MatchPair[];
  returnHref: string;
  returnLabel: string;
};

type Assignments = Record<string, string | null>;

type LinkLine = {
  leftId: string;
  rightId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

const linkPalettes = [
  {
    zone: "border-[#a9ccea] bg-[#eef7ff]",
    selected: "border-[#2f6f91] bg-[#dff0fb]",
    line: "#5fa8d3"
  },
  {
    zone: "border-[#b7d9c1] bg-[#effaf2]",
    selected: "border-[#3b7a52] bg-[#e1f4e7]",
    line: "#72b983"
  },
  {
    zone: "border-[#cdbce8] bg-[#f7f2ff]",
    selected: "border-[#6b5a9a] bg-[#ece3fb]",
    line: "#9b83d3"
  },
  {
    zone: "border-[#f0cf9a] bg-[#fff6e7]",
    selected: "border-[#8a6a2d] bg-[#ffedc9]",
    line: "#d8a852"
  }
];

const defaultLinkPalette = linkPalettes[0];

function buildInitialAssignments(leftItems: MatchItem[]): Assignments {
  return Object.fromEntries(leftItems.map((item) => [item.id, null]));
}

function paletteForIndex(index: number) {
  if (!Number.isInteger(index) || index < 0) {
    return defaultLinkPalette;
  }

  return linkPalettes[index % linkPalettes.length] ?? defaultLinkPalette;
}

export function MatchingCardsSmartboard({ prompt, leftItems, rightItems, matches, returnHref, returnLabel }: MatchingCardsSmartboardProps) {
  const [assignments, setAssignments] = useState<Assignments>(() => buildInitialAssignments(leftItems));
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(leftItems[0]?.id ?? null);
  const [checked, setChecked] = useState(false);
  const [linkLines, setLinkLines] = useState<LinkLine[]>([]);
  const boardRef = useRef<HTMLElement | null>(null);
  const leftRefs = useRef(new Map<string, HTMLButtonElement>());
  const rightRefs = useRef(new Map<string, HTMLElement>());

  const selectedLeft = leftItems.find((item) => item.id === selectedLeftId) ?? null;
  const linkedPairs = leftItems
    .map((leftItem) => {
      const rightItem = rightItems.find((item) => item.id === assignments[leftItem.id]) ?? null;
      return rightItem ? { leftItem, rightItem } : null;
    })
    .filter((pair): pair is { leftItem: MatchItem; rightItem: MatchItem } => pair !== null);
  const assignedCount = Object.values(assignments).filter(Boolean).length;
  const allAssigned = leftItems.length > 0 && assignedCount === leftItems.length;
  const allLinksLookGood = allAssigned && matches.every((match) => assignments[match.leftId] === match.rightId);
  const classroomPrompt = prompt
    .replace(/\bMatch\b/g, "Connect")
    .replace(/\bmatch\b/g, "connect")
    .replace(/\bmatching\b/g, "connecting");

  useLayoutEffect(() => {
    function updateLines() {
      const board = boardRef.current;

      if (!board) {
        return;
      }

      const boardRect = board.getBoundingClientRect();
      const nextLines = linkedPairs.flatMap((pair) => {
        const leftElement = leftRefs.current.get(pair.leftItem.id);
        const rightElement = rightRefs.current.get(pair.rightItem.id);

        if (!leftElement || !rightElement) {
          return [];
        }

        const leftRect = leftElement.getBoundingClientRect();
        const rightRect = rightElement.getBoundingClientRect();

        return [
          {
            leftId: pair.leftItem.id,
            rightId: pair.rightItem.id,
            x1: leftRect.right - boardRect.left,
            y1: leftRect.top + leftRect.height / 2 - boardRect.top,
            x2: rightRect.left - boardRect.left,
            y2: rightRect.top + rightRect.height / 2 - boardRect.top
          }
        ];
      });

      setLinkLines(nextLines);
    }

    updateLines();
    window.addEventListener("resize", updateLines);

    return () => window.removeEventListener("resize", updateLines);
  }, [assignments, leftItems, rightItems]);

  function expectedRightId(leftId: string) {
    return matches.find((match) => match.leftId === leftId)?.rightId ?? null;
  }

  function assignedLeftForRight(rightId: string) {
    return leftItems.find((item) => assignments[item.id] === rightId) ?? null;
  }

  function linkIndexForLeft(leftId: string) {
    return linkedPairs.findIndex((pair) => pair.leftItem.id === leftId);
  }

  function linkIndexForRight(rightId: string) {
    return linkedPairs.findIndex((pair) => pair.rightItem.id === rightId);
  }

  function linkPalette(index: number) {
    return index >= 0 ? paletteForIndex(index) : null;
  }

  function assignLink(leftId: string, rightId: string | null) {
    setAssignments((current) => {
      const next = { ...current, [leftId]: rightId };

      if (rightId) {
        leftItems.forEach((item) => {
          if (item.id !== leftId && next[item.id] === rightId) {
            next[item.id] = null;
          }
        });
      }

      return next;
    });
    setSelectedLeftId(leftId);
    setChecked(false);
  }

  function selectLeftCard(leftId: string) {
    setSelectedLeftId(leftId);

    if (checked) {
      setChecked(false);
    }
  }

  function chooseRightCard(rightId: string) {
    if (!selectedLeftId) {
      return;
    }

    assignLink(selectedLeftId, rightId);
  }

  function resetActivity() {
    setAssignments(buildInitialAssignments(leftItems));
    setSelectedLeftId(leftItems[0]?.id ?? null);
    setChecked(false);
  }

  function leftFeedback(leftId: string) {
    if (!checked || !assignments[leftId]) {
      return "";
    }

    return assignments[leftId] === expectedRightId(leftId) ? "border-[#5d9f73] bg-[#edf8f1]" : "border-[#d7b46d] bg-[#fff8e8]";
  }

  function rightFeedback(rightId: string) {
    if (!checked) {
      return "";
    }

    const leftItem = assignedLeftForRight(rightId);

    if (!leftItem) {
      return "";
    }

    return assignments[leftItem.id] === expectedRightId(leftItem.id) ? "ring-4 ring-[#8dc6a0]" : "ring-4 ring-[#ead08a]";
  }

  function leftCardState(leftId: string, isSelected: boolean) {
    if (isSelected) {
      return "border-[#116466] bg-[#edf8f1] ring-4 ring-[#a8ddd4]";
    }

    if (checked && assignments[leftId]) {
      return leftFeedback(leftId);
    }

    const linkIndex = linkIndexForLeft(leftId);

    if (linkIndex >= 0) {
      const palette = linkPalette(linkIndex);
      return palette ? `${palette.zone} border-2` : "border-[#8dc6a0] bg-[#f1faef]";
    }

    return "border-[#d6ded8] bg-white hover:border-[#9fc8bd]";
  }

  function rightCardState(rightId: string, isActive: boolean) {
    if (checked) {
      return rightFeedback(rightId);
    }

    const linkIndex = linkIndexForRight(rightId);

    if (linkIndex >= 0) {
      return "ring-4 ring-[#c5dfca]";
    }

    if (isActive) {
      return "ring-4 ring-[#116466]/25";
    }

    return "";
  }

  return (
    <div className="min-h-screen bg-[#eef5f1] px-6 py-6 text-[#17211c]">
      <main className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-2xl border border-[#d6ded8] bg-white p-7 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#116466]">Smartboard Activity</p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">Connect the cards</h1>
            </div>
            <Link className="min-h-14 rounded-xl border border-[#cad6cf] bg-[#fbfcfa] px-6 py-4 text-lg font-semibold text-[#42514a] shadow-sm" href={returnHref}>
              {returnLabel}
            </Link>
          </div>
          <p className="mt-4 max-w-4xl text-2xl leading-9 text-[#42514a]">{classroomPrompt}</p>
        </section>

        <section className="grid gap-5 rounded-2xl border border-[#d6ded8] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xl font-semibold text-[#42514a]">
                {allAssigned ? "All links made. Check your answers." : `Links made: ${assignedCount} of ${leftItems.length}.`}
              </p>
              <p className="mt-2 text-2xl font-semibold text-[#17211c]">
                {selectedLeft ? `Selected: ${selectedLeft.label}` : "Choose a card"}
              </p>
              <p className="mt-1 text-lg text-[#66746d]">
                {selectedLeft ? "Now choose a card on the right." : "Choose a card, then connect it to the best partner."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="min-h-14 rounded-xl border border-[#cad6cf] bg-white px-6 text-lg font-semibold text-[#42514a] shadow-sm" onClick={resetActivity} type="button">
                Reset activity
              </button>
              <button
                className="min-h-14 rounded-xl bg-[#116466] px-6 text-lg font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-[#a8b8b0]"
                disabled={!allAssigned}
                onClick={() => setChecked(true)}
                type="button"
              >
                Check answers
              </button>
            </div>
          </div>
          {checked ? (
            <div className={`rounded-xl border px-5 py-4 text-2xl font-semibold ${allLinksLookGood ? "border-[#5d9f73] bg-[#edf8f1] text-[#0b4d4f]" : "border-[#d7c49a] bg-[#fff8e8] text-[#6d4c11]"}`}>
              {allLinksLookGood ? "All links look good." : "Some links need another look. Discuss and try again."}
            </div>
          ) : null}
        </section>

        <section className="relative grid gap-5 lg:grid-cols-2" ref={boardRef}>
          <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full" aria-hidden="true">
            {linkLines.map((line) => {
              const linkIndex = linkIndexForLeft(line.leftId);
              const leftItemExists = leftItems.some((item) => item.id === line.leftId);
              const rightItemExists = rightItems.some((item) => item.id === line.rightId);

              if (linkIndex < 0 || !leftItemExists || !rightItemExists) {
                return null;
              }

              const palette = paletteForIndex(linkIndex);
              const isSelected = selectedLeftId === line.leftId;
              const controlX = line.x1 + (line.x2 - line.x1) / 2;

              return (
                <path
                  d={`M ${line.x1} ${line.y1} C ${controlX} ${line.y1}, ${controlX} ${line.y2}, ${line.x2} ${line.y2}`}
                  fill="none"
                  key={`${line.leftId}-${line.rightId}`}
                  stroke={palette.line}
                  strokeLinecap="round"
                  strokeWidth={isSelected ? 8 : 6}
                  opacity={isSelected ? 0.95 : 0.7}
                />
              );
            })}
          </svg>
          <div className="rounded-2xl border border-[#d6ded8] bg-white p-5 shadow-sm">
            <h2 className="text-3xl font-semibold">Choose a card</h2>
            <div className="mt-5 grid gap-4">
              {leftItems.map((item) => {
                const isSelected = selectedLeftId === item.id;
                const linkIndex = linkIndexForLeft(item.id);

                return (
                  <button
                    className={`relative z-20 min-h-28 touch-manipulation rounded-xl border-2 px-5 py-4 text-left shadow-sm transition ${
                      leftCardState(item.id, isSelected)
                    } ${linkIndex >= 0 && isSelected ? "scale-[1.015]" : ""}`}
                    key={item.id}
                    onClick={() => selectLeftCard(item.id)}
                    ref={(element) => {
                      if (element) {
                        leftRefs.current.set(item.id, element);
                      } else {
                        leftRefs.current.delete(item.id);
                      }
                    }}
                    type="button"
                  >
                    <span className="block text-2xl font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[#d6ded8] bg-white p-5 shadow-sm">
            <h2 className="text-3xl font-semibold">Connect it to</h2>
            <div className="mt-5 grid gap-4">
              {rightItems.map((item, index) => {
                const palette = paletteForIndex(index);
                const linkIndex = linkIndexForRight(item.id);
                const linkColor = linkPalette(linkIndex);

                return (
                  <section
                    className={`relative z-20 rounded-2xl border-2 p-4 shadow-sm transition ${linkColor?.zone ?? palette.zone} ${rightCardState(item.id, false)}`}
                    key={item.id}
                    ref={(element) => {
                      if (element) {
                        rightRefs.current.set(item.id, element);
                      } else {
                        rightRefs.current.delete(item.id);
                      }
                    }}
                  >
                    <button
                      className={`min-h-24 w-full rounded-xl border-2 px-5 py-4 text-left text-2xl font-semibold transition ${
                        linkIndex >= 0 ? "border-[#8dc6a0] bg-white" : selectedLeftId ? palette.selected : "border-[#d6ded8] bg-white"
                      }`}
                      disabled={!selectedLeftId}
                      onClick={() => chooseRightCard(item.id)}
                      type="button"
                    >
                      {item.label}
                    </button>
                  </section>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

