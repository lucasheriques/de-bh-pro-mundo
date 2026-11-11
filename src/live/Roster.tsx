import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { presenterKey } from "./env";

export function Roster() {
  const roster = useQuery(api.audience.roster, { key: presenterKey });
  if (!roster) return null;
  const unnamed = roster.count - roster.names.length;
  return (
    <section className="presenter-card roster">
      <p className="eyebrow">Na sala · {roster.count}</p>
      {roster.names.length > 0 ? (
        <ul className="roster-names">
          {roster.names.map((name, i) => (
            <li key={`${name}-${i}`}>{name}</li>
          ))}
        </ul>
      ) : null}
      <p className="muted">{unnamed === 1 ? "1 pessoa sem nome" : `${unnamed} pessoas sem nome`}</p>
    </section>
  );
}
