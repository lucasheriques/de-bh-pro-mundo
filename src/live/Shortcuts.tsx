import { type DeckAction, KEYMAP } from "./useDeck";

const LABELS: Record<DeckAction, string> = {
  next: "Próximo slide",
  prev: "Slide anterior",
  reveal: "Mostrar ou esconder o resultado",
  voice: "Ligar ou desligar a voz",
  captions: "Legendas no telão (só no /stage)",
  fullscreen: "Tela cheia",
  theme: "Tema claro ou escuro (cada tela guarda o seu)",
  cues: "Frase que passa o slide, no canto do telão",
};

const KEY_NAMES: Record<string, string> = {
  ArrowRight: "→",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowUp: "↑",
  PageDown: "PgDn",
  PageUp: "PgUp",
  " ": "Espaço",
};

function keysFor(action: DeckAction): string[] {
  return Object.entries(KEYMAP)
    .filter(([, mapped]) => mapped === action)
    .map(([key]) => KEY_NAMES[key] ?? key.toUpperCase());
}

/** Every keyboard shortcut of the stage and presenter, read from the live keymap. */
export function Shortcuts({ className }: { className: string }) {
  return (
    <section className={className}>
      <h2 className="eyebrow">Atalhos do teclado</h2>
      <dl className="shortcuts">
        {(Object.keys(LABELS) as DeckAction[]).map((action) => (
          <div key={action}>
            <dt>
              {keysFor(action).map((key) => (
                <kbd key={key}>{key}</kbd>
              ))}
            </dt>
            <dd>{LABELS[action]}</dd>
          </div>
        ))}
      </dl>
      <p className="muted shortcuts-note">
        Clique no telão uma vez antes, pra ele receber o teclado. Pela voz, em qualquer slide:
        "próximo slide" ou "segue em frente", "volta um" ou "slide anterior", "mostra o resultado".
      </p>
    </section>
  );
}
