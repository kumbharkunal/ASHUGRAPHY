"use client";

import { Check } from "@phosphor-icons/react/dist/ssr/Check";
import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";
import { useRef, useState, type ComponentPropsWithoutRef, type FormEvent, type ReactNode, type Ref } from "react";
import { Button } from "@/components/ui/Button";
import { DateField } from "@/components/ui/DateField";
import { FieldNotes, fieldDescribedBy } from "@/components/ui/FieldNotes";
import { Magnetic } from "@/components/ui/Magnetic";
import { booking, bookingFunctions, type BookingFunction } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { QUERIES } from "@/lib/media";
import { todayIso } from "@/lib/utils";
import { formatWeddingDate, waLink, waMessages } from "@/lib/whatsapp";

type Field = "names" | "date" | "city";

interface Values {
  names: string;
  date: string;
  city: string;
  functions: BookingFunction[];
}

type Errors = Partial<Record<Field, string>>;

const FIELDS: Field[] = ["names", "date", "city"];
const NO_FIELDS: Record<Field, boolean> = { names: false, date: false, city: false };

/** Marks where a field's value goes in the message, so the preview and the sent text never drift apart. */
const SLOT = "\u0000";

function validate(field: Field, values: Values): string | undefined {
  const { fields } = booking;
  if (field === "names") return values.names.trim().length >= 2 ? undefined : fields.names.error;
  if (field === "city") return values.city.trim().length >= 2 ? undefined : fields.city.error;
  if (!values.date) return fields.date.error;
  return values.date < todayIso() ? fields.date.pastError : undefined;
}

function composeMessage(values: Values): string {
  return waMessages.booking({
    names: values.names.trim(),
    date: formatWeddingDate(values.date),
    city: values.city.trim(),
    functions: values.functions,
  });
}

interface TextFieldProps extends Omit<ComponentPropsWithoutRef<"input">, "id"> {
  id: string;
  label: string;
  helper?: string;
  error?: string;
  inputRef: Ref<HTMLInputElement>;
}

/** Label above, helper and error below; the error is tied to the input. */
function TextField({ id, label, helper, error, inputRef, ...inputProps }: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        ref={inputRef}
        aria-invalid={error ? true : undefined}
        aria-describedby={fieldDescribedBy(id, helper, error)}
        className="field mt-2"
        {...inputProps}
      />
      <FieldNotes id={id} helper={helper} error={error} />
    </div>
  );
}

/**
 * The booking form. Errors appear when you leave a field you have typed in, and on submit (which
 * then focuses the first field that needs attention). The message preview updates as you type and
 * is exactly what opens in WhatsApp. Nothing is sent from the site itself.
 */
export function BookingForm({ submitIcon }: { submitIcon: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const namesRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLButtonElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const edited = useRef<Record<Field, boolean>>({ ...NO_FIELDS });
  const [values, setValues] = useState<Values>({ names: "", date: "", city: "", functions: [] });
  const [live, setLive] = useState<Record<Field, boolean>>({ ...NO_FIELDS });
  const [errors, setErrors] = useState<Errors>({});
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);
  const [opened, setOpened] = useState(false);
  const { fields } = booking;

  useGSAP(
    () => {
      const root = rootRef.current;
      const card = root?.querySelector<HTMLElement>("[data-booking-card]");
      const chips = root?.querySelectorAll<HTMLElement>("[data-chip]");
      if (!card || !chips) return;
      const mm = gsap.matchMedia();
      mm.add(QUERIES.motion, () => {
        gsap
          .timeline({ scrollTrigger: { trigger: card, start: "top 82%", once: true } })
          .fromTo(
            card,
            { autoAlpha: 1, clipPath: "inset(0% 0% 100% 0% round 22px)" },
            { clipPath: "inset(0% 0% 0% 0% round 22px)", duration: 0.9, ease: "cinematic", clearProps: "clipPath" },
          )
          .fromTo(
            chips,
            { autoAlpha: 0, y: 10 },
            { autoAlpha: 1, y: 0, duration: 0.5, ease: "power4.out", stagger: 0.04 },
            0.35,
          );
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  const change = (field: Field, value: string) => {
    edited.current[field] = true;
    const next = { ...values, [field]: value };
    setValues(next);
    // A date comes from the calendar complete, so it is checked straight away; typed fields
    // wait until you leave them.
    const checkNow = live[field] || field === "date";
    if (field === "date" && checkNow && !live.date) setLive((current) => ({ ...current, date: true }));
    if (checkNow) setErrors((current) => ({ ...current, [field]: validate(field, next) }));
  };

  const leave = (field: Field) => {
    if (!edited.current[field]) return;
    setLive((current) => ({ ...current, [field]: true }));
    setErrors((current) => ({ ...current, [field]: validate(field, values) }));
  };

  const toggleFunction = (name: BookingFunction) => {
    setValues((current) => {
      const chosen = new Set(current.functions);
      if (chosen.has(name)) chosen.delete(name);
      else chosen.add(name);
      return { ...current, functions: bookingFunctions.filter((item) => chosen.has(item)) };
    });
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Errors = {};
    for (const field of FIELDS) nextErrors[field] = validate(field, values);
    setErrors(nextErrors);
    setLive({ names: true, date: true, city: true });

    const firstInvalid = FIELDS.find((field) => nextErrors[field]);
    if (firstInvalid) {
      const target = { names: namesRef, date: dateRef, city: cityRef }[firstInvalid];
      target.current?.focus();
      return;
    }

    const url = waLink(composeMessage(values));
    const opened = window.open(url, "_blank");
    if (opened) {
      // The new tab is still on about:blank here, so cutting the link back to this page is allowed.
      try {
        opened.opener = null;
      } catch {
        // Already navigated cross-origin; nothing to cut.
      }
      setFallbackUrl(null);
      setOpened(true);
    } else {
      setOpened(false);
      setFallbackUrl(url);
    }
  };

  // Preview: the real message with each empty field shown as a soft placeholder.
  const preview = waMessages
    .booking({
      names: `${SLOT}names${SLOT}`,
      date: `${SLOT}date${SLOT}`,
      city: `${SLOT}city${SLOT}`,
      functions: values.functions,
    })
    .split(SLOT)
    .map((part, index) => {
      if (index % 2 === 0) return <span key={index}>{part}</span>;
      const field = part as Field;
      const filled = field === "date" ? (values.date ? formatWeddingDate(values.date) : "") : values[field].trim();
      return filled ? (
        <span key={index} className="font-medium">
          {filled}
        </span>
      ) : (
        <span key={index} className="preview-token">
          {booking.preview.tokens[field]}
        </span>
      );
    });

  return (
    <div ref={rootRef}>
      <div data-booking-card data-reveal className="rounded-card bg-paper/70 p-1.5 shadow-card ring-1 ring-line">
        <form
          noValidate
          onSubmit={submit}
          aria-labelledby="book-title"
          className="rounded-card-inner bg-ivory px-5 py-7 shadow-[inset_0_1px_0_rgb(255_255_255/0.6)] sm:px-8 sm:py-9 lg:px-10 lg:py-11"
        >
          <div className="grid gap-6">
            <TextField
              id="book-names"
              label={fields.names.label}
              placeholder={fields.names.placeholder}
              autoComplete="name"
              required
              value={values.names}
              error={errors.names}
              inputRef={namesRef}
              onChange={(event) => change("names", event.target.value)}
              onBlur={() => leave("names")}
            />
            <div className="grid gap-6 sm:grid-cols-2 sm:gap-5">
              <DateField
                id="book-date"
                label={fields.date.label}
                placeholder={fields.date.placeholder}
                helper={fields.date.helper}
                value={values.date}
                error={errors.date}
                copy={fields.date.picker}
                triggerRef={dateRef}
                onChange={(value) => change("date", value)}
                onBlur={() => leave("date")}
              />
              <TextField
                id="book-city"
                label={fields.city.label}
                placeholder={fields.city.placeholder}
                autoComplete="address-level2"
                required
                value={values.city}
                error={errors.city}
                inputRef={cityRef}
                onChange={(event) => change("city", event.target.value)}
                onBlur={() => leave("city")}
              />
            </div>

            <fieldset aria-describedby="book-functions-helper">
              <legend className="text-sm font-medium text-ink">{fields.functions.legend}</legend>
              <p id="book-functions-helper" className="mt-1 text-sm text-ink-soft">
                {fields.functions.helper}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {bookingFunctions.map((name) => (
                  <label key={name} data-chip className="relative">
                    <input
                      type="checkbox"
                      name="functions"
                      value={name}
                      checked={values.functions.includes(name)}
                      onChange={() => toggleFunction(name)}
                      className="chip-input sr-only"
                    />
                    <span className="chip">
                      <span aria-hidden="true" className="chip-icon">
                        <Plus weight="regular" className="chip-plus size-3.5" />
                        <Check weight="bold" className="chip-check size-3.5" />
                      </span>
                      {name}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <p id="book-preview-label" className="font-mono text-caption text-ink-soft">
                {booking.preview.label}
              </p>
              <output
                htmlFor="book-names book-date book-city"
                aria-labelledby="book-preview-label"
                aria-live="off"
                className="preview-bubble mt-3 block"
              >
                {preview}
              </output>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-start gap-4">
            <Magnetic className="flex w-full sm:inline-flex sm:w-auto">
              <Button
                type="submit"
                label={booking.submit}
                icon={submitIcon}
                fullWidth
                wrap
                className="sm:w-auto sm:justify-center"
              />
            </Magnetic>
            <p className="text-sm text-ink-soft">{booking.note}</p>
            <div role="status" className="text-sm text-ink">
              {opened ? <p>{booking.opened}</p> : null}
              {fallbackUrl ? (
                <p>
                  {booking.popupBlocked}{" "}
                  <a
                    href={fallbackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-sindoor underline underline-offset-4"
                  >
                    {booking.openLink}
                  </a>
                </p>
              ) : null}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
