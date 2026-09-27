"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";

type Suggestion = { id: string; address_line_1: string; address_line_2: string | null; city: string | null; postcode: string };

export function AddressAutocomplete({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const term = value.trim();
    if (term.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search-suggestions?q=${encodeURIComponent(term)}`);
        const data: Suggestion[] = await res.json();
        setSuggestions(data);
        setOpen(data.length > 0);
        setActiveIndex(-1);
      } catch {
        // network hiccup, plain form submit on Enter/Search still works
      }
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  function selectSuggestion(suggestion: Suggestion) {
    setOpen(false);
    router.push(`/property/${suggestion.id}`);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || !suggestions.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative flex-1">
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate" aria-hidden="true" />
      <input
        className="field relative"
        style={{ paddingLeft: "2.25rem" }}
        name="q"
        role="combobox"
        aria-expanded={open}
        aria-controls="address-suggestions"
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
        autoComplete="off"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => suggestions.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Enter address, postcode, or partial match"
        aria-label="Search address or postcode"
      />
      {open ? (
        <ul id="address-suggestions" role="listbox" className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-slate/15 bg-surface shadow-soft">
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.id}
              id={`suggestion-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className={`cursor-pointer px-3 py-2.5 text-sm transition-colors duration-100 ease-out ${index === activeIndex ? "bg-mist" : ""}`}
              onMouseDown={(event) => {
                event.preventDefault();
                selectSuggestion(suggestion);
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <div className="font-medium text-ink">{suggestion.address_line_1}</div>
              <div className="text-xs text-slate">{[suggestion.address_line_2, suggestion.city, suggestion.postcode].filter(Boolean).join(", ")}</div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
