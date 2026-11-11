import { useAudienceTheme } from "./audienceTheme";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
    </svg>
  );
}

export function ThemeToggle() {
  const [theme, toggle] = useAudienceTheme();
  const toLight = theme === "dark";
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={toLight ? "Usar tema claro" : "Usar tema escuro"}
      onClick={toggle}
    >
      {toLight ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
