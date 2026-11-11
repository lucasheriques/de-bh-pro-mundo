import { useConvexConnectionState } from "convex/react";

export function ConnectionDot({ className = "" }: { className?: string }) {
  const state = useConvexConnectionState();
  const online = state.isWebSocketConnected;
  const label = online ? "Ao vivo" : state.hasEverConnected ? "Reconectando..." : "Conectando...";
  return (
    <span
      className={`connection ${online ? "is-online" : "is-offline"} ${className}`}
      role="status"
    >
      <span className="connection-dot" aria-hidden />
      {label}
      {state.inflightMutations > 0 && !online ? ` · ${state.inflightMutations} na fila` : null}
    </span>
  );
}
