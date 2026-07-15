"use client";

import { PointerEvent, useMemo, useRef, useState } from "react";
import Link from "next/link";

type SortingCard = {
  id: string;
  label: string;
  correctCategory: string;
  confidence?: string;
};

type SortingCategory = {
  id: string;
  label: string;
  sharedFeature?: string;
};

type SortingCardsSmartboardProps = {
  prompt: string;
  categories: SortingCategory[];
  cards: SortingCard[];
  targetCategory?: string;
  accessibilityNotes?: string[];
  returnHref: string;
  returnLabel: string;
};

type Assignments = Record<string, string | null>;
type DragState = {
  cardId: string;
  pointerId: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  hasMoved: boolean;
  overCategory: string | null;
};

const categoryPalettes = [
  {
    zone: "border-[#f0cf9a] bg-[#fff6e7]",
    header: "bg-[#f4d7a8] text-[#5d4217]",
    button: "bg-[#8a6a2d] text-white",
    empty: "border-[#e6c383] bg-[#fffaf0] text-[#7a602b]"
  },
  {
    zone: "border-[#a9ccea] bg-[#eef7ff]",
    header: "bg-[#cde5f7] text-[#1d4c68]",
    button: "bg-[#2f6f91] text-white",
    empty: "border-[#a9ccea] bg-[#f7fbff] text-[#43677a]"
  },
  {
    zone: "border-[#b7d9c1] bg-[#effaf2]",
    header: "bg-[#cfead6] text-[#245638]",
    button: "bg-[#3b7a52] text-white",
    empty: "border-[#b7d9c1] bg-[#f7fcf8] text-[#496d56]"
  },
  {
    zone: "border-[#cdbce8] bg-[#f7f2ff]",
    header: "bg-[#e2d6f6] text-[#514078]",
    button: "bg-[#6b5a9a] text-white",
    empty: "border-[#cdbce8] bg-[#fbf8ff] text-[#62557a]"
  },
  {
    zone: "border-[#f1b8ad] bg-[#fff3f0]",
    header: "bg-[#f8d2ca] text-[#744437]",
    button: "bg-[#9a675c] text-white",
    empty: "border-[#f1b8ad] bg-[#fff9f7] text-[#7c5c55]"
  }
];

function buildInitialAssignments(cards: SortingCard[]): Assignments {
  return Object.fromEntries(cards.map((card) => [card.id, null]));
}

function paletteForIndex(index: number) {
  return categoryPalettes[index % categoryPalettes.length];
}

function cardBaseClasses(isSelected: boolean) {
  return [
    "min-h-24 rounded-xl border-2 px-5 py-4 text-left text-2xl font-semibold shadow-sm transition",
    "focus:outline-none focus:ring-4 focus:ring-[#9ed4cb]",
    isSelected ? "border-[#116466] bg-white ring-4 ring-[#a8ddd4] shadow-lg" : "border-[#d6ded8] bg-white hover:border-[#9fc8bd]"
  ].join(" ");
}

export function SortingCardsSmartboard({ accessibilityNotes = [], prompt, categories, cards, returnHref, returnLabel, targetCategory }: SortingCardsSmartboardProps) {
  const [assignments, setAssignments] = useState<Assignments>(() => buildInitialAssignments(cards));
  const [selectedCardId, setSelectedCardId] = useState<string | null>(cards[0]?.id ?? null);
  const [checked, setChecked] = useState(false);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const categoryRefs = useRef(new Map<string, HTMLElement>());

  const cardsByCategory = useMemo(
    () =>
      categories.map((category) => ({
        category,
        cards: cards.filter((card) => assignments[card.id] === category.id)
      })),
    [assignments, cards, categories]
  );
  const unsortedCards = cards.filter((card) => assignments[card.id] === null);
  const selectedCard = cards.find((card) => card.id === selectedCardId) ?? null;
  const draggingCard = dragState ? cards.find((card) => card.id === dragState.cardId) ?? null : null;
  const assignedCount = cards.length - unsortedCards.length;
  const allAssigned = cards.length > 0 && assignedCount === cards.length;
  const allCorrect = allAssigned && cards.every((card) => assignments[card.id] === card.correctCategory);

  function moveSelectedCard(category: string | null) {
    if (!selectedCardId) {
      return;
    }

    setAssignments((current) => ({
      ...current,
      [selectedCardId]: category
    }));
    setChecked(false);
  }

  function resetActivity() {
    setAssignments(buildInitialAssignments(cards));
    setSelectedCardId(cards[0]?.id ?? null);
    setChecked(false);
    setDragState(null);
  }

  function cardFeedback(card: SortingCard) {
    if (!checked || !assignments[card.id]) {
      return "";
    }

    return assignments[card.id] === card.correctCategory ? "border-[#5d9f73] bg-[#edf8f1]" : "border-[#d7b46d] bg-[#fff8e8]";
  }

  function categoryAtPoint(x: number, y: number) {
    for (const category of categories) {
      const element = categoryRefs.current.get(category.id);

      if (!element) {
        continue;
      }

      const rect = element.getBoundingClientRect();

      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return category.id;
      }
    }

    return null;
  }

  function startDrag(event: PointerEvent<HTMLButtonElement>, cardId: string) {
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
    setSelectedCardId(cardId);
    setDragState({
      cardId,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
      hasMoved: false,
      overCategory: categoryAtPoint(event.clientX, event.clientY)
    });
  }

  function updateDrag(event: PointerEvent<HTMLButtonElement>) {
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    const distance = Math.hypot(event.clientX - dragState.startX, event.clientY - dragState.startY);
    setDragState({
      ...dragState,
      x: event.clientX,
      y: event.clientY,
      hasMoved: dragState.hasMoved || distance > 8,
      overCategory: categoryAtPoint(event.clientX, event.clientY)
    });
  }

  function finishDrag(event: PointerEvent<HTMLButtonElement>) {
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    const targetCategory = categoryAtPoint(event.clientX, event.clientY);

    if (dragState.hasMoved) {
      setAssignments((current) => ({
        ...current,
        [dragState.cardId]: targetCategory
      }));
      setChecked(false);
    }

    setDragState(null);
  }

  function renderCard(card: SortingCard) {
    const isSelected = selectedCardId === card.id;
    const isDragging = dragState?.cardId === card.id;

    return (
      <button
        className={`${cardBaseClasses(isSelected)} ${!isSelected ? cardFeedback(card) : ""} touch-none cursor-grab select-none active:cursor-grabbing ${
          isDragging ? "opacity-45" : ""
        }`}
        key={card.id}
        onClick={() => setSelectedCardId(card.id)}
        onPointerCancel={finishDrag}
        onPointerDown={(event) => startDrag(event, card.id)}
        onPointerMove={updateDrag}
        onPointerUp={finishDrag}
        type="button"
      >
        {card.label}
        {checked && assignments[card.id] ? (
          <span className="mt-2 block text-base font-semibold text-[#66746d]">
            {assignments[card.id] === card.correctCategory ? "Looks right" : "Review together"}
          </span>
        ) : null}
        {!checked && card.confidence ? <span className="mt-2 block text-base font-semibold text-[#66746d]">Confidence: {card.confidence}</span> : null}
      </button>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef5f1] px-6 py-6 text-[#17211c]">
      <main className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-2xl border border-[#d6ded8] bg-white p-7 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#116466]">Smartboard Activity</p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">Sort the cards</h1>
            </div>
            <Link className="min-h-14 rounded-xl border border-[#cad6cf] bg-[#fbfcfa] px-6 py-4 text-lg font-semibold text-[#42514a] shadow-sm" href={returnHref}>
              {returnLabel}
            </Link>
          </div>
          <p className="mt-4 max-w-4xl text-2xl leading-9 text-[#42514a]">{prompt}</p>
          {targetCategory ? <p className="mt-3 text-lg font-semibold text-[#116466]">Focus: {targetCategory}</p> : null}
        </section>

        {accessibilityNotes.length > 0 ? (
          <section className="rounded-2xl border border-[#cfe0d8] bg-[#f8fcfa] p-4 text-lg leading-7 text-[#42514a]">
            <span className="font-semibold text-[#17211c]">Teacher support:</span> {accessibilityNotes.join(" ")}
          </section>
        ) : null}

        <section className="grid gap-4 rounded-2xl border border-[#d6ded8] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#116466]">Selected card</p>
              <p className="mt-1 text-2xl font-semibold">{selectedCard?.label ?? "Choose a card"}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="min-h-14 rounded-xl border border-[#cad6cf] bg-white px-6 text-lg font-semibold text-[#42514a] shadow-sm"
                onClick={resetActivity}
                type="button"
              >
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
            <div className={`rounded-xl border px-5 py-4 text-2xl font-semibold ${allCorrect ? "border-[#5d9f73] bg-[#edf8f1] text-[#0b4d4f]" : "border-[#d7c49a] bg-[#fff8e8] text-[#6d4c11]"}`}>
              {allCorrect ? "Great sorting. Every card is in the best category." : "A few cards need another look. Discuss the choices, then try again."}
            </div>
          ) : (
            <p className="text-lg text-[#66746d]">
              Drag each card into a category. You can also tap a card, then tap a category button. {assignedCount} of {cards.length} sorted.
            </p>
          )}
        </section>

        <section className="grid gap-5 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <div className="rounded-2xl border border-[#d6ded8] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold">Cards</h2>
              {selectedCardId ? (
                <button className="rounded-xl border border-[#cad6cf] px-4 py-3 text-base font-semibold text-[#42514a]" onClick={() => moveSelectedCard(null)} type="button">
                  Return selected
                </button>
              ) : null}
            </div>
            <div className="mt-4 grid gap-3">
              {unsortedCards.length > 0 ? (
                unsortedCards.map((card) => renderCard(card))
              ) : (
                <p className="rounded-xl border border-dashed border-[#cad6cf] p-4 text-lg text-[#66746d]">All cards have been placed.</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {cardsByCategory.map(({ category, cards: categoryCards }, index) => {
              const palette = paletteForIndex(index);
              const isDragTarget = dragState?.overCategory === category.id;

              return (
              <section
                className={`flex min-h-80 flex-col rounded-2xl border-2 p-5 shadow-sm transition ${palette.zone} ${
                  isDragTarget ? "scale-[1.015] ring-4 ring-[#116466]/25" : ""
                }`}
                key={category.id}
                ref={(element) => {
                  if (element) {
                    categoryRefs.current.set(category.id, element);
                  } else {
                    categoryRefs.current.delete(category.id);
                  }
                }}
              >
                <button
                  className={`min-h-16 rounded-xl px-4 text-xl font-semibold shadow-sm disabled:cursor-not-allowed disabled:opacity-45 ${palette.button}`}
                  disabled={!selectedCardId}
                  onClick={() => moveSelectedCard(category.id)}
                  type="button"
                >
                  Move selected to {category.label}
                </button>
                <div className={`mt-5 rounded-xl px-4 py-3 ${palette.header}`}>
                  <h2 className="text-3xl font-semibold">{category.label}</h2>
                  {category.sharedFeature ? <p className="mt-2 text-base font-semibold opacity-90">Shared feature: {category.sharedFeature}</p> : null}
                </div>
                <div className="mt-4 grid flex-1 content-start gap-3">
                  {categoryCards.length > 0 ? (
                    categoryCards.map((card) => renderCard(card))
                  ) : (
                    <p className={`rounded-xl border border-dashed p-4 text-lg ${palette.empty}`}>Place cards here.</p>
                  )}
                </div>
              </section>
              );
            })}
          </div>
        </section>
      </main>
      {draggingCard ? (
        <div
          className="pointer-events-none fixed z-50 min-h-24 max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 border-[#116466] bg-white px-5 py-4 text-left text-2xl font-semibold text-[#17211c] shadow-2xl ring-4 ring-[#a8ddd4]"
          style={{ left: dragState?.x ?? 0, top: dragState?.y ?? 0 }}
        >
          {draggingCard.label}
        </div>
      ) : null}
    </div>
  );
}
