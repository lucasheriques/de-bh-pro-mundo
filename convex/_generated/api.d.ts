/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as audience from "../audience.js";
import type * as captionPolish from "../captionPolish.js";
import type * as captions from "../captions.js";
import type * as displayName from "../displayName.js";
import type * as moderation from "../moderation.js";
import type * as pollRules from "../pollRules.js";
import type * as presence from "../presence.js";
import type * as presenter from "../presenter.js";
import type * as questions from "../questions.js";
import type * as rateLimits from "../rateLimits.js";
import type * as reactions from "../reactions.js";
import type * as reset from "../reset.js";
import type * as session from "../session.js";
import type * as slideEdits from "../slideEdits.js";
import type * as validators from "../validators.js";
import type * as votes from "../votes.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  audience: typeof audience;
  captionPolish: typeof captionPolish;
  captions: typeof captions;
  displayName: typeof displayName;
  moderation: typeof moderation;
  pollRules: typeof pollRules;
  presence: typeof presence;
  presenter: typeof presenter;
  questions: typeof questions;
  rateLimits: typeof rateLimits;
  reactions: typeof reactions;
  reset: typeof reset;
  session: typeof session;
  slideEdits: typeof slideEdits;
  validators: typeof validators;
  votes: typeof votes;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  presence: import("@convex-dev/presence/_generated/component.js").ComponentApi<"presence">;
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
};
