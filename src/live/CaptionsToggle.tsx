import { useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import { presenterKey } from "./env";
import { useCaptionsEnabled } from "./features";

/** The room-wide captions switch, stored in Convex so every phone and stage follows it live. */
export function CaptionsToggle() {
  const on = useCaptionsEnabled();
  // Optimistic: the box flips on click, every screen follows when Convex confirms.
  const setCaptions = useMutation(api.session.setCaptions).withOptimisticUpdate(
    (store, { captionsEnabled }) => {
      const session = store.getQuery(api.session.get, {});
      if (session) store.setQuery(api.session.get, {}, { ...session, captionsEnabled });
    },
  );
  return (
    <div className="captions-controls">
      <label className="captions-toggle-row">
        <input
          type="checkbox"
          checked={on}
          onChange={(event) =>
            void setCaptions({ key: presenterKey, captionsEnabled: event.target.checked })
          }
        />
        <span>
          Mostrar legendas ao vivo
          <small className="muted">
            {on ? "Nos celulares e no telão (C)." : "Desligadas. A voz continua passando slides."}
          </small>
        </span>
      </label>
      <ClearCaptions />
    </div>
  );
}

const CLEAR_STATE_MS = 3000;

/** Wipes the caption history (two clicks: the first asks, the second deletes). */
function ClearCaptions() {
  const clear = useMutation(api.captions.clear);
  const [state, setState] = useState<"idle" | "confirm" | "done">("idle");
  useEffect(() => {
    if (state === "idle") return;
    const timer = setTimeout(() => setState("idle"), CLEAR_STATE_MS);
    return () => clearTimeout(timer);
  }, [state]);
  const onClick = () => {
    if (state !== "confirm") {
      setState("confirm");
      return;
    }
    void clear({ key: presenterKey }).then(() => setState("done"));
  };
  return (
    <button type="button" className="ghost captions-clear" onClick={onClick}>
      {state === "confirm"
        ? "Clique de novo pra apagar"
        : state === "done"
          ? "Legendas apagadas"
          : "Apagar legendas"}
    </button>
  );
}
