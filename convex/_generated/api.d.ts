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
import type * as captions from "../captions.js";
import type * as displayName from "../displayName.js";
import type * as presenter from "../presenter.js";
import type * as questions from "../questions.js";
import type * as reactions from "../reactions.js";
import type * as reset from "../reset.js";
import type * as session from "../session.js";
import type * as validators from "../validators.js";
import type * as votes from "../votes.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  audience: typeof audience;
  captions: typeof captions;
  displayName: typeof displayName;
  presenter: typeof presenter;
  questions: typeof questions;
  reactions: typeof reactions;
  reset: typeof reset;
  session: typeof session;
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

export declare const components: {};
