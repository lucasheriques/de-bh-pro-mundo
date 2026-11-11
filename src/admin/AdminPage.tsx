import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { forgetPresenterKey, presenterKey, savePresenterKey } from "../live/env";
import { Roster } from "../live/Roster";
import { Shortcuts } from "../live/Shortcuts";
import { pollIdOf, useDeck } from "../live/useDeck";
import { slides } from "../talk/slides";

const polls = slides.flatMap((slide) => {
  const pollId = pollIdOf(slide);
  const question =
    slide.interaction && "question" in slide.interaction ? slide.interaction.question : slide.id;
  return pollId ? [{ pollId, question }] : [];
});

const surfaces = [
  { path: "/stage", label: "Telão", hint: "Abra no projetor e aperte F" },
  { path: "/presenter", label: "Apresentador", hint: "Notas, timer e voz" },
  { path: "/overview", label: "Todos os slides", hint: "Clique pra pular o telão" },
  { path: "/remote", label: "Controle remoto", hint: "Abra no seu celular pra passar os slides" },
  { path: "/editor", label: "Editar slides", hint: "Texto de qualquer slide, salva na hora" },
] as const;

const absolute = (path: string) => `${window.location.origin}${path}`;

function PollCount({ pollId, question }: { pollId: string; question: string }) {
  const tally = useQuery(api.votes.tally, { pollId }) ?? [];
  return (
    <li>
      <span>{question}</span>
      <span className="mono">{tally.length}</span>
    </li>
  );
}

function RoomStats() {
  const audience = useQuery(api.presence.onlineCount) ?? 0;
  const questions = useQuery(api.questions.list, {}) ?? [];
  return (
    <section className="admin-card">
      <h2>Sala agora</h2>
      <ul className="admin-stats">
        <li>
          <span>Pessoas conectadas</span>
          <span className="mono">{audience}</span>
        </li>
        <li>
          <span>Perguntas</span>
          <span className="mono">{questions.length}</span>
        </li>
        {polls.map((poll) => (
          <PollCount key={poll.pollId} {...poll} />
        ))}
      </ul>
    </section>
  );
}

function NewSession() {
  const resetAll = useMutation(api.reset.all);
  const [status, setStatus] = useState<string | null>(null);
  const start = () => {
    const ok = window.confirm(
      "Começar uma sessão nova? Isso apaga plateia, votos, perguntas, reações e legendas, e volta pro slide 1.",
    );
    if (!ok) return;
    setStatus("Zerando...");
    resetAll({ key: presenterKey }).then(
      () => setStatus("Sessão nova pronta. Sala zerada."),
      () => setStatus("Não deu pra zerar. Confira a chave e a conexão."),
    );
  };
  return (
    <section className="admin-card">
      <h2>Sessão</h2>
      <p className="muted">Use depois do ensaio e logo antes da talk.</p>
      <button type="button" className="primary" onClick={start}>
        Nova sessão
      </button>
      {status ? (
        <p className="muted" role="status">
          {status}
        </p>
      ) : null}
    </section>
  );
}

function Links() {
  return (
    <section className="admin-card">
      <h2>Links</h2>
      <ul className="admin-links">
        {surfaces.map((surface) => (
          <li key={surface.path}>
            <a href={absolute(surface.path)} target="_blank" rel="noreferrer">
              {surface.label}
            </a>
            <span className="muted">{surface.hint}</span>
          </li>
        ))}
        <li>
          <a href={`${window.location.origin}/`} target="_blank" rel="noreferrer">
            Plateia
          </a>
          <span className="muted">O link do QR, sem chave</span>
        </li>
      </ul>
    </section>
  );
}

function KeyForm({ invalid }: { invalid: boolean }) {
  const [draft, setDraft] = useState("");
  return (
    <form
      className="admin-card"
      onSubmit={(event) => {
        event.preventDefault();
        if (draft.trim()) savePresenterKey(draft);
      }}
    >
      <h2>Entrar</h2>
      <p className="muted">
        {invalid ? "Chave inválida." : "Cole a chave da talk. Ela fica salva só neste navegador."}
      </p>
      <input
        className="admin-input"
        type="password"
        autoComplete="off"
        aria-label="Chave da talk"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />
      <button type="submit" className="primary" disabled={!draft.trim()}>
        Entrar
      </button>
    </form>
  );
}

export function AdminPage() {
  const { keyValid } = useDeck();
  if (keyValid !== true) {
    return (
      <main className="admin">
        <h1>Admin</h1>
        <KeyForm invalid={keyValid === false && presenterKey.length > 0} />
      </main>
    );
  }
  return (
    <main className="admin">
      <h1>Admin</h1>
      <NewSession />
      <RoomStats />
      <Roster />
      <Links />
      <Shortcuts className="admin-card" />
      <button type="button" className="ghost" onClick={forgetPresenterKey}>
        Sair deste navegador
      </button>
    </main>
  );
}
