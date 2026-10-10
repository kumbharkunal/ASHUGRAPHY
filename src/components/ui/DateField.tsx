"use client";

import { CalendarBlank } from "@phosphor-icons/react/dist/ssr/CalendarBlank";
import { AnimatePresence } from "motion/react";
import dynamic from "next/dynamic";
import { useState, type KeyboardEvent, type RefObject } from "react";
import { formatFieldDate } from "@/lib/dates";
import { todayIso } from "@/lib/utils";
import type { DatePickerCopy } from "./DatePicker";
import { FieldNotes, fieldDescribedBy } from "./FieldNotes";

const DatePicker = dynamic(() => import("./DatePicker"), { ssr: false });

/** Fetches the calendar as soon as the field is approached, so it opens without a wait. */
function preload() {
  void import("./DatePicker");
}

/** How many years ahead a date can be chosen (to the end of that year). */
const YEARS_AHEAD = 5;

interface DateFieldProps {
  id: string;
  label: string;
  placeholder: string;
  helper?: string;
  error?: string;
  /** YYYY-MM-DD, or empty. */
  value: string;
  copy: DatePickerCopy;
  triggerRef: RefObject<HTMLButtonElement | null>;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

/**
 * A date field that opens the site's own calendar instead of the browser's: a popover under the
 * field on larger screens, a bottom sheet on phones. Days before today cannot be chosen.
 */
export function DateField({ id, label, placeholder, helper, error, value, copy, triggerRef, onChange, onBlur }: DateFieldProps) {
  const [range, setRange] = useState<{ min: string; max: string } | null>(null);

  // The page is static, so today is only known in the browser, when the calendar opens.
  const open = () => {
    const min = todayIso();
    setRange({ min, max: `${Number(min.slice(0, 4)) + YEARS_AHEAD}-12-31` });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    open();
  };

  return (
    <div>
      <label id={`${id}-label`} htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {/* A select-only combobox (WAI-ARIA date picker pattern): the label names it, the shown date
          is its value, and unlike a plain button it can be marked invalid. */}
      <button
        id={id}
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="dialog"
        aria-expanded={range !== null}
        aria-controls={range ? `${id}-calendar` : undefined}
        aria-labelledby={`${id}-label`}
        aria-describedby={fieldDescribedBy(id, helper, error)}
        aria-invalid={error ? true : undefined}
        data-empty={value ? undefined : true}
        className="field date-trigger mt-2"
        onClick={open}
        onKeyDown={onKeyDown}
        onPointerEnter={preload}
        onFocus={preload}
        onBlur={onBlur}
      >
        <span className="date-trigger__value">
          {value ? formatFieldDate(value) : placeholder}
        </span>
        <span aria-hidden="true" className="date-trigger__icon">
          <CalendarBlank weight="light" className="size-5" />
        </span>
      </button>
      <FieldNotes id={id} helper={helper} error={error} />

      <AnimatePresence>
        {range ? (
          <DatePicker
            key="date-picker"
            id={`${id}-calendar`}
            anchorRef={triggerRef}
            value={value}
            min={range.min}
            max={range.max}
            copy={copy}
            note={helper}
            onSelect={onChange}
            onClose={() => setRange(null)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
