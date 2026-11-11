import { useMutation } from "convex/react";
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
  );
}
