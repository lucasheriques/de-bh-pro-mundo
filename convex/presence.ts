import { Presence } from "@convex-dev/presence";
import { ConvexError, v } from "convex/values";
import { components } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { PRESENCE_ROOM, parseClientId } from "./validators";

export const ROOM = PRESENCE_ROOM;
const ONLINE_LIMIT = 2000;

export const presence = new Presence(components.presence);

export const heartbeat = mutation({
  args: { roomId: v.string(), userId: v.string(), sessionId: v.string(), interval: v.number() },
  handler: async (ctx, { roomId, userId, sessionId, interval }) => {
    if (roomId !== ROOM) throw new ConvexError("Sala inválida");
    return await presence.heartbeat(ctx, roomId, parseClientId(userId), sessionId, interval);
  },
});

export const list = query({
  args: { roomToken: v.string() },
  handler: async (ctx, { roomToken }) => await presence.list(ctx, roomToken),
});

export const disconnect = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => await presence.disconnect(ctx, sessionToken),
});

export const onlineCount = query({
  args: {},
  handler: async (ctx) => (await presence.listRoom(ctx, ROOM, true, ONLINE_LIMIT)).length,
});
