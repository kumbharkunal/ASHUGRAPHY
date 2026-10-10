"use client";

import { CaretDown } from "@phosphor-icons/react/dist/ssr/CaretDown";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr/CaretLeft";
import { CaretRight } from "@phosphor-icons/react/dist/ssr/CaretRight";
import { X } from "@phosphor-icons/react/dist/ssr/X";
import { AnimatePresence, useIsPresent, type PanInfo } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useLayoutEffect, useRef, useState, type ComponentProps, type KeyboardEvent, type RefObject } from "react";
import {
  addDays,
  addMonths,
  clampDate,
  dayOf,
  daysInMonth,
  formatFullDate,
  isoDate,
  monthKey,
  monthNames,
  monthOf,
  weekdayOf,
  weekdays,
  yearOf,
} from "@/lib/dates";
import { useMediaQuery } from "@/lib/media";
import { lockScroll, unlockScroll } from "@/lib/scroll";
import { pad2 } from "@/lib/utils";

export interface DatePickerCopy {
  title: string;
  previousMonth: string;
  nextMonth: string;
  previousYear: string;
  nextYear: string;
  showMonths: string;
  showDays: string;
  close: string;
}

interface DatePickerProps {
  /** The dialog's id, which the field points at while it is open. */
  id: string;
  /** The field that opened the calendar: the popover sits under it, and focus returns to it. */
  anchorRef: RefObject<HTMLElement | null>;
  /** YYYY-MM-DD, or empty. */
  value: string;
  /** Today: the earliest day that can be chosen, marked with a dot. */
  min: string;
  max: string;
  copy: DatePickerCopy;
  note?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

type View = "days" | "months";

/** Tailwind's sm breakpoint: a popover under the field from here up, a bottom sheet below. */
const POPOVER_QUERY = "(min-width: 640px)";
const GAP = 8;
const EDGE = 12;
const EASE_CINEMATIC = [0.16, 1, 0.3, 1] as const;
const EASE_UI = [0.32, 0.72, 0, 1] as const;
const EASE_EXIT = [0.5, 0, 0.75, 0] as const;

/** Months and years slide in from the side they come from. */
const slide = {
  enter: (direction: number) => ({ x: direction * 28, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction * -28, opacity: 0 }),
};

/** The weeks of a month as rows of seven, Sunday first; days outside the month are empty. */
function weeksOf(key: string): (string | null)[][] {
  const year = Number(key.slice(0, 4));
  const month = Number(key.slice(5, 7)) - 1;
  const lead = weekdayOf(isoDate(year, month, 1));
  const count = daysInMonth(year, month);
  const weeks: (string | null)[][] = [];
  for (let start = 1 - lead; start <= count; start += 7) {
    weeks.push(
      Array.from({ length: 7 }, (_, offset) => {
        const day = start + offset;
        return day >= 1 && day <= count ? isoDate(year, month, day) : null;
      }),
    );
  }
  return weeks;
}

/** A sliding pane. While it leaves it is hidden from assistive technology and cannot take focus. */
function Pane(props: ComponentProps<typeof m.div>) {
  const present = useIsPresent();
  return <m.div {...props} aria-hidden={present ? undefined : true} inert={!present} />;
}

/**
 * The wedding date calendar. A native modal dialog (the page goes inert and holds still, Escape or
 * a click outside closes it). Arrow keys move by day and week, Home and End to the week's edges,
 * Page Up and Page Down by month (with Shift, by year). The month title opens a month grid for
 * jumping ahead. Loaded on first use.
 */
export default function DatePicker({ id, anchorRef, value, min, max, copy, note, onSelect, onClose }: DatePickerProps) {
  const titleId = `${id}-title`;
  const monthLabelId = `${id}-month`;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  /** Move keyboard focus to the focused day after the next render (on open and on keyboard moves). */
  const moveFocus = useRef(true);
  const closeTimer = useRef(0);
  const popover = useMediaQuery(POPOVER_QUERY, true);
  const [focused, setFocused] = useState(() => clampDate(value || min, min, max));
  const [view, setView] = useState<View>("days");
  const [direction, setDirection] = useState(0);

  const year = yearOf(focused);
  const month = monthOf(focused);
  const shownMonth = monthKey(focused);
  const monthLabel = `${monthNames[month].long} ${year}`;
  const atStart = view === "days" ? shownMonth <= monthKey(min) : year <= yearOf(min);
  const atEnd = view === "days" ? shownMonth >= monthKey(max) : year >= yearOf(max);

  // Open as a modal, hold the page still, and sit under the field (or above it when there is more
  // room there). On phones the CSS turns the box into a bottom sheet and ignores the position.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const box = boxRef.current;
    if (!dialog || !box) return;
    if (!dialog.open) dialog.showModal();
    lockScroll();

    const place = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight;
      const { offsetWidth: width, offsetHeight: height } = box;
      const below = viewportHeight - rect.bottom - GAP - EDGE;
      const above = rect.top - GAP - EDGE;
      const downwards = below >= height || below >= above;
      const top = downwards
        ? Math.min(rect.bottom + GAP, viewportHeight - EDGE - height)
        : Math.max(EDGE, rect.top - GAP - height);
      const left = Math.min(Math.max(EDGE, rect.left), viewportWidth - EDGE - width);
      box.style.setProperty("--picker-top", `${Math.round(Math.max(EDGE, top))}px`);
      box.style.setProperty("--picker-left", `${Math.round(left)}px`);
      box.style.setProperty("--picker-origin", downwards ? "top left" : "bottom left");
    };

    place();
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("resize", place);
      unlockScroll();
    };
  }, [anchorRef]);

  // Focus goes back to the field once the dialog has gone (the page is inert until then).
  useEffect(() => {
    const anchor = anchorRef.current;
    return () => anchor?.focus({ preventScroll: true });
  }, [anchorRef]);

  useEffect(() => {
    if (!moveFocus.current || view !== "days") return;
    moveFocus.current = false;
    panelRef.current
      ?.querySelector<HTMLButtonElement>(`[data-month="${monthKey(focused)}"] [data-date="${focused}"]`)
      ?.focus();
  }, [focused, view]);

  const goTo = (target: string, { focusDay }: { focusDay: boolean }) => {
    const next = clampDate(target, min, max);
    if (next === focused) return;
    const unit = (iso: string) => (view === "days" ? monthKey(iso) : iso.slice(0, 4));
    if (unit(next) !== unit(focused)) setDirection(unit(next) > unit(focused) ? 1 : -1);
    moveFocus.current = focusDay;
    setFocused(next);
  };

  const step = (delta: number) => {
    if (delta < 0 ? atStart : atEnd) return;
    goTo(addMonths(focused, view === "days" ? delta : delta * 12), { focusDay: false });
  };

  const onGridKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, () => string> = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      Home: () => addDays(focused, -weekdayOf(focused)),
      End: () => addDays(focused, 6 - weekdayOf(focused)),
      PageUp: () => addMonths(focused, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focused, event.shiftKey ? 12 : 1),
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    goTo(move(), { focusDay: true });
  };

  // The choice shows at once (the disc glides to the new day), then the calendar closes.
  const pick = (iso: string) => {
    setFocused(iso);
    onSelect(iso);
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(onClose, 220);
  };

  const pickMonth = (key: string) => {
    const pickedYear = Number(key.slice(0, 4));
    const pickedMonth = Number(key.slice(5, 7)) - 1;
    const day = Math.min(dayOf(focused), daysInMonth(pickedYear, pickedMonth));
    const next = clampDate(isoDate(pickedYear, pickedMonth, day), min, max);
    setDirection(next === focused ? 0 : next > focused ? 1 : -1);
    moveFocus.current = true;
    setFocused(next);
    setView("days");
  };

  const toggleView = () => {
    setDirection(0);
    setView((current) => (current === "days" ? "months" : "days"));
  };

  const onDragEnd = (_event: unknown, info: PanInfo) => {
    if (info.offset.y > 96 || info.velocity.y > 600) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      id={id}
      aria-labelledby={titleId}
      className="date-picker"
      data-lenis-prevent
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
    >
      <m.div
        aria-hidden="true"
        className="date-picker__scrim"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: EASE_UI }}
      />
      <div ref={boxRef} className="date-picker__box">
        <m.div
          ref={panelRef}
          className="date-panel"
          initial={popover ? { opacity: 0, scale: 0.96 } : { y: "100%" }}
          animate={
            popover
              ? { opacity: 1, scale: 1, transition: { duration: 0.32, ease: EASE_CINEMATIC } }
              : { y: 0, transition: { type: "spring", stiffness: 380, damping: 38 } }
          }
          exit={
            popover
              ? { opacity: 0, scale: 0.97, transition: { duration: 0.18, ease: EASE_UI } }
              : { y: "100%", transition: { duration: 0.26, ease: EASE_EXIT } }
          }
          drag={popover ? false : "y"}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.5 }}
          onDragEnd={onDragEnd}
        >
          <div className="date-panel__inner">
            <div className="sm:hidden">
              <span aria-hidden="true" className="date-grabber" />
              <div className="mb-3 flex items-center justify-between gap-4">
                <h2 id={titleId} className="text-base font-medium text-ink">
                  {copy.title}
                </h2>
                <button type="button" onClick={onClose} aria-label={copy.close} className="date-nav size-11">
                  <X weight="light" className="size-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                className="date-title"
                aria-label={view === "days" ? `${monthLabel}, ${copy.showMonths}` : `${year}, ${copy.showDays}`}
                onClick={toggleView}
              >
                <m.span
                  key={view === "days" ? shownMonth : `year-${year}`}
                  className="whitespace-nowrap"
                  initial={{ opacity: 0, x: direction * 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: EASE_CINEMATIC }}
                >
                  {view === "days" ? (
                    <>
                      {monthNames[month].long} <span className="text-ink-soft">{year}</span>
                    </>
                  ) : (
                    year
                  )}
                </m.span>
                <CaretDown
                  weight="regular"
                  aria-hidden="true"
                  className="date-title__caret"
                  data-open={view === "months" ? true : undefined}
                />
              </button>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="date-nav size-10"
                  aria-label={view === "days" ? copy.previousMonth : copy.previousYear}
                  aria-disabled={atStart ? true : undefined}
                  onClick={() => step(-1)}
                >
                  <CaretLeft weight="regular" className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="date-nav size-10"
                  aria-label={view === "days" ? copy.nextMonth : copy.nextYear}
                  aria-disabled={atEnd ? true : undefined}
                  onClick={() => step(1)}
                >
                  <CaretRight weight="regular" className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="date-views">
              <AnimatePresence initial={false}>
                {view === "days" ? (
                  <Pane
                    key="days"
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.22, ease: EASE_UI }}
                  >
                    <p id={monthLabelId} className="sr-only" aria-live="polite">
                      {monthLabel}
                    </p>
                    <div role="grid" aria-labelledby={monthLabelId}>
                      <div role="row" className="date-row">
                        {weekdays.map((weekday) => (
                          <span key={weekday.long} role="columnheader" aria-label={weekday.long} className="date-weekday">
                            <span aria-hidden="true">{weekday.short}</span>
                          </span>
                        ))}
                      </div>
                      <div className="date-weeks" onKeyDown={onGridKey}>
                        <AnimatePresence initial={false} custom={direction}>
                          <Pane
                            key={shownMonth}
                            role="rowgroup"
                            data-month={shownMonth}
                            className="date-weeks__month"
                            custom={direction}
                            variants={slide}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.34, ease: EASE_CINEMATIC }}
                          >
                            {weeksOf(shownMonth).map((week) => (
                              <div key={week.find(Boolean)} role="row" className="date-row">
                                {week.map((iso, column) => {
                                  const selected = iso !== null && iso === value;
                                  return (
                                    <div key={iso ?? `empty-${column}`} role="gridcell" aria-selected={iso ? selected : undefined}>
                                      {iso ? (
                                        <button
                                          type="button"
                                          data-date={iso}
                                          data-selected={selected ? true : undefined}
                                          tabIndex={iso === focused ? 0 : -1}
                                          disabled={iso < min || iso > max}
                                          aria-label={formatFullDate(iso)}
                                          aria-current={iso === min ? "date" : undefined}
                                          className="date-day"
                                          onClick={() => pick(iso)}
                                        >
                                          {selected ? (
                                            <m.span
                                              layoutId={`${id}-selected`}
                                              aria-hidden="true"
                                              className="date-day__disc"
                                              transition={{ type: "spring", stiffness: 420, damping: 34 }}
                                            />
                                          ) : null}
                                          {dayOf(iso)}
                                        </button>
                                      ) : null}
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </Pane>
                        </AnimatePresence>
                      </div>
                    </div>
                  </Pane>
                ) : (
                  <Pane
                    key="months"
                    className="absolute inset-0 overflow-hidden"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.22, ease: EASE_UI }}
                  >
                    <AnimatePresence initial={false} custom={direction}>
                      <Pane
                        key={year}
                        role="group"
                        aria-label={String(year)}
                        className="date-months"
                        custom={direction}
                        variants={slide}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.34, ease: EASE_CINEMATIC }}
                      >
                        {monthNames.map((name, index) => {
                          const key = `${year}-${pad2(index + 1)}`;
                          return (
                            <button
                              key={key}
                              type="button"
                              data-option={key}
                              data-selected={value && monthKey(value) === key ? true : undefined}
                              data-current={key === monthKey(min) ? true : undefined}
                              disabled={key < monthKey(min) || key > monthKey(max)}
                              aria-label={`${name.long} ${year}`}
                              className="date-month"
                              onClick={() => pickMonth(key)}
                            >
                              {name.short}
                            </button>
                          );
                        })}
                      </Pane>
                    </AnimatePresence>
                  </Pane>
                )}
              </AnimatePresence>
            </div>

            {note ? <p className="date-note">{note}</p> : null}
          </div>
        </m.div>
      </div>
    </dialog>
  );
}
