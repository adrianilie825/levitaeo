"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import type { SearchResult, SearchSuggestion } from "@/lib/search-db";

type SearchDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function SearchDialog({ open, onClose }: SearchDialogProps) {
  const router = useRouter();
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMac, setIsMac] = useState(true);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);

  const hasQuery = query.trim().length > 0;
  const selectableResults = results;

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.platform));
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    setQuery("");
    setSelectedIndex(0);
    setResults([]);

    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    void fetch("/api/search")
      .then((response) => response.json())
      .then((data: { suggestions?: SearchSuggestion[] }) => {
        setSuggestions(data.suggestions ?? []);
      })
      .catch(() => {
        setSuggestions([]);
        setSearchError(true);
      });

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      setResults([]);
      setIsSearching(false);
      setSearchError(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);
    setSearchError(false);

    const timeout = window.setTimeout(() => {
      void fetch(`/api/search?q=${encodeURIComponent(normalizedQuery)}`, {
        signal: controller.signal,
      })
        .then((response) => response.json())
        .then((data: { results?: SearchResult[] }) => {
          setResults(data.results ?? []);
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setResults([]);
            setSearchError(true);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsSearching(false);
          }
        });
    }, 200);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [open, query]);

  const navigateToResult = useCallback(
    (result: SearchResult) => {
      if (!result.navigable) {
        return;
      }

      onClose();
      router.push(result.href);
    },
    [onClose, router],
  );

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (!hasQuery || selectableResults.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((current) =>
        current + 1 >= selectableResults.length ? 0 : current + 1,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((current) =>
        current - 1 < 0 ? selectableResults.length - 1 : current - 1,
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const selected = selectableResults[selectedIndex];
      if (selected) {
        navigateToResult(selected);
      }
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[10vh] motion-reduce:transition-none sm:px-6">
      <button
        type="button"
        aria-label="Close search"
        className="absolute inset-0 bg-[#111111]/30 motion-reduce:transition-none"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[101] w-full max-w-[720px] overflow-hidden border border-[#ECE8E2] bg-[#FAFAF8] shadow-[0_20px_60px_rgba(17,17,17,0.08)] motion-reduce:transition-none"
      >
        <h2 id={titleId} className="sr-only">
          Search Levitaeo
        </h2>

        <div className="flex items-center gap-3 border-b border-[#ECE8E2] px-4 py-3 sm:px-5">
          <label htmlFor="levitaeo-search-input" className="sr-only">
            Search editions and collections
          </label>
          <input
            ref={inputRef}
            id="levitaeo-search-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search editions and collections"
            autoComplete="off"
            aria-busy={isSearching}
            className="min-w-0 flex-1 bg-transparent text-[15px] text-[#111111] outline-none placeholder:text-neutral-400"
          />
          <span className="hidden shrink-0 rounded border border-[#ECE8E2] px-2 py-1 text-[10px] tracking-[0.08em] text-neutral-500 sm:inline">
            {isMac ? "⌘K" : "Ctrl K"}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search dialog"
            className="shrink-0 px-2 py-1 text-[18px] leading-none text-neutral-500 transition-colors hover:text-[#111111] motion-reduce:transition-none"
          >
            ×
          </button>
        </div>

        <div className="max-h-[min(60vh,520px)] overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-5">
          {!hasQuery ? (
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                Discover Levitaeo
              </p>
              <ul className="mt-4 space-y-2">
                {suggestions.map((suggestion) => (
                  <li key={suggestion.href}>
                    <Link
                      href={suggestion.href}
                      onClick={onClose}
                      className="block py-2 text-[14px] tracking-[0.04em] text-[#111111] transition-colors hover:text-neutral-600 motion-reduce:transition-none"
                    >
                      {suggestion.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : isSearching ? (
            <div className="py-8 text-center">
              <p className="text-[15px] text-neutral-600">Searching…</p>
            </div>
          ) : searchError ? (
            <div className="py-8 text-center">
              <p className="text-[15px] text-[#111111]">Search is unavailable.</p>
              <p className="mt-2 text-[13px] leading-6 text-neutral-500">
                Please try again in a moment.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-[15px] text-[#111111]">No editions found.</p>
              <p className="mt-2 text-[13px] leading-6 text-neutral-500">
                Try another title, collection, or edition number.
              </p>
            </div>
          ) : (
            <ul className="space-y-1" role="listbox" aria-label="Search results">
              {results.map((result, index) => {
                const isSelected = index === selectedIndex;
                const content = (
                  <>
                    <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-[2px] border border-[#ECE8E2] bg-[#F7F5F1]">
                      <Image
                        src={result.image}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] text-[#111111]">
                        {result.title}
                      </p>
                      <p className="mt-1 truncate text-[12px] tracking-[0.04em] text-neutral-500">
                        {result.subtitle}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-400">
                        {result.type === "collection" ? "Collection" : "Edition"}
                      </p>
                      {result.status === "coming-soon" && (
                        <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-neutral-500">
                          Coming Soon
                        </p>
                      )}
                    </div>
                  </>
                );

                if (result.navigable) {
                  return (
                    <li key={result.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => navigateToResult(result)}
                        className={`flex w-full items-center gap-3 px-3 py-3 text-left transition-colors motion-reduce:transition-none ${
                          isSelected
                            ? "bg-[#F3F1EC]"
                            : "hover:bg-[#F7F5F1]"
                        }`}
                      >
                        {content}
                      </button>
                    </li>
                  );
                }

                return (
                  <li key={result.id}>
                    <div
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled="true"
                      className={`flex cursor-default items-center gap-3 px-3 py-3 ${
                        isSelected ? "bg-[#F3F1EC]" : ""
                      }`}
                    >
                      {content}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {hasQuery && results.length > 0 && (
          <div className="border-t border-[#ECE8E2] px-4 py-3 text-[11px] tracking-[0.06em] text-neutral-500 sm:px-5">
            <span className="hidden sm:inline">↑ ↓ to navigate · </span>
            Enter to open · Esc to close
          </div>
        )}
      </div>
    </div>
  );
}
