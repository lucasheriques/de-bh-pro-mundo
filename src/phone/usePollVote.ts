import { useMutation, useQuery } from "convex/react";
import { useMemo } from "react";
import { api } from "../../convex/_generated/api";
import { clientId } from "../live/env";
import { useSession } from "../live/useDeck";

type VoteValue = string | number;

/** The room's tally with this phone's vote moved from `previous` to `next`. */
export function retally(
  tally: readonly VoteValue[],
  previous: VoteValue | null | undefined,
  next: VoteValue,
): VoteValue[] {
  const values = [...tally];
  const old = previous === null || previous === undefined ? -1 : values.indexOf(previous);
  if (old >= 0) values.splice(old, 1);
  values.push(next);
  return values;
}

export function usePollVote(pollId: string) {
  const mine = useQuery(api.votes.mine, { pollId, clientId });
  const tally = useQuery(api.votes.tally, { pollId }) ?? [];
  const revealed = useSession().revealed[pollId] ?? false;
  const rawCast = useMutation(api.votes.cast);
  const cast = useMemo(
    () =>
      rawCast.withOptimisticUpdate((store, args) => {
        const mineArgs = { pollId: args.pollId, clientId: args.clientId };
        const previous = store.getQuery(api.votes.mine, mineArgs);
        store.setQuery(api.votes.mine, mineArgs, args.value);
        const current = store.getQuery(api.votes.tally, { pollId: args.pollId });
        if (current)
          store.setQuery(
            api.votes.tally,
            { pollId: args.pollId },
            retally(current, previous, args.value),
          );
      }),
    [rawCast],
  );
  return {
    mine,
    tally,
    revealed,
    vote: (value: string | number) => cast({ pollId, clientId, value }).catch(() => undefined),
  };
}
