import { useSession } from "./useDeck";

/**
 * Live captions are off unless turned on in /admin: in a room full of voices the transcript
 * picks up the audience. Scribe still listens either way, as a backup for slide commands.
 */
export function useCaptionsEnabled(): boolean {
  return useSession().captionsEnabled ?? false;
}
