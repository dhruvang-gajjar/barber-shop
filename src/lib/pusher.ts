import Pusher from "pusher-js";

let pusherInstance: Pusher | null = null;

const DEFAULT_PUSHER_KEY = "814d6d938b19e1815c2c";
const DEFAULT_PUSHER_CLUSTER = "ap2";

/**
 * Returns a singleton Pusher client instance configured from environment variables
 * or default production credentials.
 */
export function getPusherClient(): Pusher | null {
  if (typeof window === "undefined") return null;

  const rawKey = process.env.NEXT_PUBLIC_PUSHER_KEY || DEFAULT_PUSHER_KEY;
  const rawCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || DEFAULT_PUSHER_CLUSTER;

  const key = rawKey ? rawKey.replace(/['"]/g, "").trim() : "";
  const cluster = rawCluster ? rawCluster.replace(/['"]/g, "").trim() : DEFAULT_PUSHER_CLUSTER;

  if (!key) return null;

  if (!pusherInstance) {
    pusherInstance = new Pusher(key, {
      cluster,
      forceTLS: true,
    });
  }

  return pusherInstance;
}
