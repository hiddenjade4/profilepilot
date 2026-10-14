"use client";

import { useId, useState } from "react";
import { CheckIcon, PlusIcon, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string; description?: string };

// Native radio and checkbox inputs, styled as cards. Using real inputs gives
// keyboard support (Tab, arrow keys, Space) and screen-reader labels for free.

export function SingleChoice({
  name,
  options,
  value,
  onChange,
  labelledBy,
}: {
  name: string;
  options: Option[];
  value: string | undefined;
  onChange: (value: string) => void;
  labelledBy: string;
}) {
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => {
        const checked = value === option.value;
        return (
          <label
            key={option.value}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50 has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
              checked && "border-primary bg-primary/5 hover:bg-primary/5",
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span
              aria-hidden
              className={cn(
                "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                checked && "border-primary bg-primary",
              )}
            >
              {checked && <span className="size-1.5 rounded-full bg-primary-foreground" />}
            </span>
            <span className="space-y-0.5">
              <span className="block text-sm font-medium">{option.label}</span>
              {option.description && (
                <span className="block text-sm text-muted-foreground">
                  {option.description}
                </span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export function MultiChoice({
  options,
  value,
  onChange,
  labelledBy,
}: {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  labelledBy: string;
}) {
  function toggle(optionValue: string) {
    onChange(
      value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue],
    );
  }

  return (
    <div role="group" aria-labelledby={labelledBy} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const checked = value.includes(option.value);
        return (
          <label
            key={option.value}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-full border bg-card px-3.5 py-2 text-sm transition-colors hover:bg-muted/50 has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
              checked &&
                "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(option.value)}
              className="sr-only"
            />
            {checked && <CheckIcon className="size-3.5" aria-hidden />}
            {option.label}
          </label>
        );
      })}
    </div>
  );
}

export function TagInput({
  value,
  onChange,
  placeholder,
  maxItems,
  maxItemLength,
  labelledBy,
  invalid,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxItems: number;
  maxItemLength: number;
  labelledBy: string;
  invalid?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const hintId = useId();
  const full = value.length >= maxItems;

  function add() {
    const tag = draft.trim().replace(/\s+/g, " ").slice(0, maxItemLength);
    if (!tag || full) return;
    const exists = value.some((v) => v.toLowerCase() === tag.toLowerCase());
    if (!exists) onChange([...value, tag]);
    setDraft("");
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // Enter or comma adds the tag instead of submitting the step.
            if (e.key === "Enter" || e.key === ",") {
              if (draft.trim()) {
                e.preventDefault();
                add();
              }
            }
          }}
          placeholder={full ? `Maximum of ${maxItems} reached` : placeholder}
          disabled={full}
          maxLength={maxItemLength}
          aria-labelledby={labelledBy}
          aria-describedby={hintId}
          aria-invalid={invalid}
          className="h-10"
        />
        <button
          type="button"
          onClick={add}
          disabled={!draft.trim() || full}
          className="flex h-10 shrink-0 items-center gap-1 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
        >
          <PlusIcon className="size-4" aria-hidden />
          Add
        </button>
      </div>
      <p id={hintId} className="text-xs text-muted-foreground">
        {value.length} of {maxItems} added. Press Enter after each one.
      </p>
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Added skills">
          {value.map((tag) => (
            <li
              key={tag}
              className="flex items-center gap-1 rounded-full bg-secondary py-1 pr-1 pl-3 text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(value.filter((v) => v !== tag))}
                className="flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground"
                aria-label={`Remove ${tag}`}
              >
                <XIcon className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
