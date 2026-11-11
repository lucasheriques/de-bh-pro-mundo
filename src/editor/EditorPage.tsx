import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { presenterKey } from "../live/env";
import { useDeck } from "../live/useDeck";
import { Scaled } from "../stage/Scaled";
import { SlideCanvas } from "../stage/SlideCanvas";
import { pristineSlide } from "../talk/LiveSlides";
import { editableFields } from "../talk/slideEdits";
import { slides } from "../talk/slides";
import type { Slide } from "../talk/types";

const LEAF_LABEL: Record<string, string> = {
  title: "Título",
  subtitle: "Subtítulo",
  text: "Texto",
  sub: "Linha de apoio",
  eyebrow: "Sobretítulo",
  value: "Número em destaque",
  label: "Legenda",
  display: "Valor mostrado",
  source: "Fonte",
  body: "Texto",
  name: "Nome",
  question: "Pergunta",
  notes: "Notas (só você vê)",
  highlight: "Destaque",
};

const GROUP_LABEL: Record<string, string> = {
  items: "Item",
  bars: "Barra",
  options: "Opção",
  rows: "Linha",
  companies: "Empresa",
  cues: "Frase de voz",
  left: "Coluna esquerda",
  right: "Coluna direita",
};

export function fieldLabel(path: string): string {
  const parts = path.split(".").filter((part) => part !== "visual" && part !== "interaction");
  const words: string[] = [];
  parts.forEach((part, i) => {
    if (/^\d+$/.test(part)) {
      const previous = words.pop() ?? "";
      words.push(`${previous} ${Number(part) + 1}`.trim());
    } else if (i === parts.length - 1 && LEAF_LABEL[part]) words.push(LEAF_LABEL[part]);
    else words.push(GROUP_LABEL[part] ?? part);
  });
  return words.join(" · ");
}

function Field({
  slideId,
  path,
  value,
  original,
}: {
  slideId: string;
  path: string;
  value: string;
  original: string | undefined;
}) {
  const save = useMutation(api.slideEdits.set);
  const clear = useMutation(api.slideEdits.clear);
  const [draft, setDraft] = useState(value);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const edited = original !== undefined && value !== original;

  const commit = () => {
    if (draft === value) return;
    setStatus("saving");
    const request =
      draft === original
        ? clear({ key: presenterKey, slideId, path })
        : save({ key: presenterKey, slideId, path, value: draft });
    request.then(
      () => setStatus("saved"),
      () => setStatus("error"),
    );
  };

  return (
    <label className={`editor-field ${edited ? "is-edited" : ""}`}>
      <span className="editor-label">
        {fieldLabel(path)}
        {status === "saving" ? " · salvando..." : status === "saved" ? " · salvo" : ""}
        {status === "error" ? " · não salvou" : ""}
      </span>
      <textarea
        value={draft}
        rows={Math.min(6, Math.max(1, Math.ceil(draft.length / 70)))}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
      />
      {edited ? (
        <button
          type="button"
          className="ghost editor-revert"
          onClick={() => {
            setDraft(original ?? "");
            void clear({ key: presenterKey, slideId, path }).then(() => setStatus("saved"));
          }}
        >
          Voltar ao original
        </button>
      ) : null}
    </label>
  );
}

function SlideEditor({ slide, index }: { slide: Slide; index: number }) {
  const original = new Map(
    editableFields(pristineSlide(slide.id) ?? slide).map((field) => [field.path, field.value]),
  );
  return (
    <section className="editor-slide" id={slide.id}>
      <header className="editor-slide-head">
        <p className="mono muted">
          {String(index + 1).padStart(2, "0")} · {slide.section ?? "Sem seção"} · {slide.id}
        </p>
      </header>
      <div className="editor-slide-grid">
        <Scaled theme="dark" className="thumb editor-thumb">
          <SlideCanvas slide={slide} />
        </Scaled>
        <div className="editor-fields">
          {editableFields(slide).map((field) => (
            <Field
              key={`${slide.id}:${field.path}:${field.value}`}
              slideId={slide.id}
              path={field.path}
              value={field.value}
              original={original.get(field.path)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function EditorPage() {
  const { keyValid } = useDeck();
  if (keyValid !== true) {
    return (
      <main className="editor">
        <h1>Editor</h1>
        <p className="muted">Entre pelo /admin com a chave da talk para editar os slides.</p>
      </main>
    );
  }
  return (
    <main className="editor">
      <header className="editor-head">
        <h1>Editar slides</h1>
        <p className="muted">
          Salva ao sair de cada campo e aparece na hora no telão e nos celulares. Campos editados
          ficam marcados e podem voltar ao original.
        </p>
      </header>
      {slides.map((slide, index) => (
        <SlideEditor key={slide.id} slide={slide} index={index} />
      ))}
    </main>
  );
}
