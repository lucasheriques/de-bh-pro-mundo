import { MINUTE, RateLimiter, SECOND } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

/**
 * Per-phone limits stop one person from spamming; room limits cap what any number of
 * fake phones can push onto the projector.
 */
export const rateLimiter = new RateLimiter(components.rateLimiter, {
  question: { kind: "token bucket", rate: 3, period: MINUTE, capacity: 3 },
  questionRoom: { kind: "token bucket", rate: 40, period: MINUTE, capacity: 20 },
  vote: { kind: "token bucket", rate: 30, period: MINUTE, capacity: 10 },
  name: { kind: "token bucket", rate: 6, period: MINUTE, capacity: 3 },
  reactionRoom: { kind: "token bucket", rate: 6, period: SECOND, capacity: 12 },
  questionVote: { kind: "token bucket", rate: 30, period: MINUTE, capacity: 10 },
});
