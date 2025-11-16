import * as React from "react";
import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { useMatchMedia } from "../src/hooks/useMatchMedia";

type ThemeMode = "auto" | "light" | "dark";
type ResolvedTheme = "light" | "dark";
type SpoilerTheme = "system" | "light" | "dark";

/**
 * Hook to get the current resolved theme (light or dark)
 * Reads from data-theme attribute and falls back to system preference
 */
export const useTheme = (): ResolvedTheme => {
  const systemPrefersDark = useMatchMedia("(prefers-color-scheme: dark)");
  const [dataTheme, setDataTheme] = useState<string | null>(() => {
    // Initialize with current value
    return typeof document !== "undefined"
      ? document.documentElement.getAttribute("data-theme")
      : null;
  });

  useEffect(() => {
    const root = document.documentElement;

    // Watch for changes to data-theme attribute
    const observer = new MutationObserver(() => {
      const newTheme = root.getAttribute("data-theme");
      setDataTheme(newTheme);
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  // Resolve theme: data-theme overrides system preference
  if (dataTheme === "dark") return "dark";
  if (dataTheme === "light") return "light";
  return systemPrefersDark ? "dark" : "light";
};

/**
 * Hook to get the theme for Spoiler component
 * Returns "system" in auto mode, or the forced theme otherwise
 */
export const useSpoilerTheme = (): SpoilerTheme => {
  const [dataTheme, setDataTheme] = useState<string | null>(() => {
    return typeof document !== "undefined"
      ? document.documentElement.getAttribute("data-theme")
      : null;
  });

  useEffect(() => {
    const root = document.documentElement;

    const observer = new MutationObserver(() => {
      const newTheme = root.getAttribute("data-theme");
      setDataTheme(newTheme);
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  // Return the data-theme value directly, or "system" if not set
  if (dataTheme === "dark") return "dark";
  if (dataTheme === "light") return "light";
  return "system";
};

const MoonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.5163 2.04296C10.6958 2.27649 10.722 2.59345 10.5832 2.85326C9.99927 3.9469 9.66792 5.19607 9.66792 6.52485C9.66792 10.8367 13.1633 14.3321 17.4751 14.3321C18.8039 14.3321 20.0531 14.0007 21.1467 13.4168C21.4065 13.278 21.7235 13.3042 21.957 13.4837C22.1906 13.6632 22.2974 13.9627 22.2302 14.2495C21.1556 18.8349 17.0409 22.25 12.1269 22.25C6.39589 22.25 1.75 17.6041 1.75 11.8731C1.75 6.95906 5.16505 2.84445 9.7505 1.76979C10.0373 1.70258 10.3368 1.80944 10.5163 2.04296Z"
      fill="currentColor"
    />
  </svg>
);

const SunIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.25 12C6.25 8.82436 8.82436 6.25 12 6.25C15.1756 6.25 17.75 8.82436 17.75 12C17.75 15.1756 15.1756 17.75 12 17.75C8.82436 17.75 6.25 15.1756 6.25 12Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.9982 1C12.5504 1 12.9982 1.44772 12.9982 2V4C12.9982 4.55228 12.5504 5 11.9982 5C11.4459 5 10.9982 4.55228 10.9982 4V2C10.9982 1.44772 11.4459 1 11.9982 1ZM4.29289 4.29387C4.68342 3.90335 5.31658 3.90335 5.70711 4.29387L7.20613 5.79289C7.59665 6.18342 7.59665 6.81658 7.20613 7.20711C6.81561 7.59763 6.18244 7.59763 5.79192 7.20711L4.29289 5.70808C3.90237 5.31756 3.90237 4.68439 4.29289 4.29387ZM19.7052 4.29387C20.0957 4.68439 20.0957 5.31756 19.7052 5.70808L18.2061 7.20711C17.8156 7.59763 17.1825 7.59763 16.7919 7.20711C16.4014 6.81658 16.4014 6.18342 16.7919 5.79289L18.291 4.29387C18.6815 3.90335 19.3146 3.90335 19.7052 4.29387ZM1 12C1 11.4477 1.44772 11 2 11H4C4.55228 11 5 11.4477 5 12C5 12.5523 4.55228 13 4 13H2C1.44772 13 1 12.5523 1 12ZM19 12C19 11.4477 19.4477 11 20 11H22C22.5523 11 23 11.4477 23 12C23 12.5523 22.5523 13 22 13H20C19.4477 13 19 12.5523 19 12ZM7.20711 16.7929C7.59763 17.1834 7.59763 17.8166 7.20711 18.2071L5.70711 19.7071C5.31658 20.0976 4.68342 20.0976 4.29289 19.7071C3.90237 19.3166 3.90237 18.6834 4.29289 18.2929L5.79289 16.7929C6.18342 16.4024 6.81658 16.4024 7.20711 16.7929ZM16.7929 16.7939C17.1834 16.4033 17.8166 16.4033 18.2071 16.7939L19.7071 18.2939C20.0976 18.6844 20.0976 19.3176 19.7071 19.7081C19.3166 20.0986 18.6834 20.0986 18.2929 19.7081L16.7929 18.2081C16.4024 17.8176 16.4024 17.1844 16.7929 16.7939ZM11.9982 19C12.5504 19 12.9982 19.4477 12.9982 20V22C12.9982 22.5523 12.5504 23 11.9982 23C11.4459 23 10.9982 22.5523 10.9982 22V20C10.9982 19.4477 11.4459 19 11.9982 19Z"
      fill="currentColor"
    />
  </svg>
);

export const ThemeSwitcher = () => {
  const systemPrefersDark = useMatchMedia("(prefers-color-scheme: dark)");

  // Initialize with "auto", but once user interacts, switch to explicit theme
  const [themeMode, setThemeMode] = useState<ThemeMode>("auto");
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Apply theme to document based on mode
  useEffect(() => {
    const root = document.documentElement;

    // Apply data-theme attribute (auto = remove attribute, let CSS handle it)
    if (themeMode === "dark") {
      root.setAttribute("data-theme", "dark");
    } else if (themeMode === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
  }, [themeMode]);

  const cycleTheme = () => {
    setHasUserInteracted(true);
    setThemeMode((current) => {
      // If currently in auto mode, switch to opposite of system preference
      if (current === "auto") {
        return systemPrefersDark ? "light" : "dark";
      }
      // Toggle between light and dark (no auto anymore)
      return current === "dark" ? "light" : "dark";
    });
  };

  const getAriaLabel = () => {
    if (themeMode === "auto") {
      const nextTheme = systemPrefersDark ? "Light" : "Dark";
      return `Theme: Auto (click to switch to ${nextTheme})`;
    }
    if (themeMode === "dark") return "Theme: Dark (click to switch to Light)";
    return "Theme: Light (click to switch to Dark)";
  };

  // Determine which icon to show
  const showMoonIcon = themeMode === "dark" || (themeMode === "auto" && systemPrefersDark);
  const showSunIcon = themeMode === "light" || (themeMode === "auto" && !systemPrefersDark);

  return (
    <button
      onClick={cycleTheme}
      aria-label={getAriaLabel()}
      className={clsx(
        "flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl transition-all duration-150",
        themeMode === "dark" && "bg-neutral-300/35",
        themeMode === "light" && "bg-neutral-400/25",
        themeMode === "auto" &&
          (systemPrefersDark
            ? "text-neutral-300 hover:bg-neutral-400/25"
            : "text-neutral-900 hover:bg-neutral-400/25"),
      )}
    >
      {showMoonIcon && <MoonIcon />}
      {showSunIcon && <SunIcon />}
    </button>
  );
};
