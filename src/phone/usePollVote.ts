import { useMutation, useQuery } from "convex/react";
import { useMemo } from "react";
import { api } from "../../convex/_generated/api";
import { clientId } from "../live/env";
import { useSession } from "../live/useDeck";

export function usePollVote(pollId: string) {
  const mine = useQuery(api.votes.mine, { pollId, clientId });
  const tally = useQuery(api.votes.tally, { pollId }) ?? [];
  const revealed = useSession().revealed[pollId] ?? false;
  const rawCast = useMutation(api.votes.cast);
  const cast = useMemo(
    () =>
      rawCast.withOptimisticUpdate((store, args) => {
        store.setQuery(
          api.votes.mine,
          { pollId: args.pollId, clientId: args.clientId },
          args.value,
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
