import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { checkDisplayName, NAME_MAX_LENGTH } from "../../convex/displayName";
import { clientId } from "../live/env";

export function useMyName(): string | null | undefined {
  return useQuery(api.audience.me, { clientId });
}

export function NameChip({
  name,
  onEdit,
}: {
  name: string | null | undefined;
  onEdit: () => void;
}) {
  return (
    <button type="button" className="name-chip" onClick={onEdit} aria-label="Mudar seu nome">
      <span className="name-chip-text">{name ? `Oi, ${name}` : "Seu nome"}</span>
    </button>
  );
}

function errorText(cause: unknown): string {
  const data = (cause as { data?: unknown })?.data;
  return typeof data === "string" ? data : "Não deu pra salvar. Tenta de novo.";
}

export function NameForm({
  current,
  onDone,
}: {
  current: string | null | undefined;
  onDone: () => void;
}) {
  const setName = useMutation(api.audience.setName);
  const [draft, setDraft] = useState(current ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const check = checkDisplayName(draft);
  const hint = draft.trim() && !check.ok ? check.reason : null;

  const save = async () => {
    if (!check.ok || saving) return;
    setSaving(true);
    try {
      await setName({ clientId, name: check.name });
      onDone();
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      className="name-card"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <label className="name-label" htmlFor="display-name">
        Como você quer aparecer nas perguntas?
      </label>
      <input
        id="display-name"
        className="name-input"
        // biome-ignore lint/a11y/noAutofocus: the form only opens when the person is about to type their name
        autoFocus
        value={draft}
        maxLength={NAME_MAX_LENGTH}
        autoComplete="given-name"
        autoCapitalize="words"
        enterKeyHint="done"
        placeholder="Seu primeiro nome"
        onChange={(event) => {
          setDraft(event.target.value);
          setError(null);
        }}
      />
      <p className="name-hint" role="status">
        {error ?? hint ?? "Opcional. Só o primeiro nome já basta."}
      </p>
      <div className="name-actions">
        <button type="button" className="ghost" onClick={onDone}>
          {current ? "Cancelar" : "Pular"}
        </button>
        <button type="submit" className="primary" disabled={!check.ok || saving}>
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
