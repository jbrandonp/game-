/**
 * Shared constants, message contracts, and helper utilities used by both the
 * client and the server. Keeping everything in one place helps ensure that both
 * sides of the wire speak the exact same protocol.
 */
export const MESSAGE = {
  SNAPSHOT: "snapshot",
  SPAWN: "spawn",
  DESPAWN: "despawn",
  POSITION: "pos",
  CHAT: "chat",
  CHAT_HISTORY: "chat-history",
} as const;

export type Message = (typeof MESSAGE)[keyof typeof MESSAGE];

export interface PositionPayload {
  x: number;
  y: number;
  z: number;
}

export interface PlayerSnapshot {
  id: string;
  name: string;
  position: PositionPayload;
}

export interface SnapshotMessage {
  players: PlayerSnapshot[];
}

export interface SpawnMessage extends PlayerSnapshot {}

export interface PositionMessage {
  id: string;
  position: PositionPayload;
}

export interface DespawnMessage {
  id: string;
}

export interface ChatPayload {
  text: string;
}

export interface ChatMessage {
  id: string | null;
  name: string;
  text: string;
  timestamp: number;
  system?: boolean;
}

export interface ChatHistoryMessage {
  history: ChatMessage[];
}

/**
 * Hard limits used for very light-weight anti-cheat / sanity checks. These are
 * intentionally generous and merely avoid the most egregious outliers.
 */
export const MOVEMENT_LIMITS = {
  /** Maximum speed (in world units / second) a client is allowed to report. */
  MAX_SPEED: 8,
  /** Minimum interval (in ms) between two consecutive position messages. */
  MIN_INTERVAL_MS: 40,
} as const;

export const WORLD_BOUNDS = {
  XZ_RADIUS: 30,
  Y_MIN: 0,
  Y_MAX: 5,
} as const;

export const PLAYER_LIMITS = {
  /** Minimum display name length after trimming. */
  NAME_MIN_LENGTH: 3,
  /** Maximum number of characters for a display name. */
  NAME_MAX_LENGTH: 16,
} as const;

export const CHAT_LIMITS = {
  /** Maximum number of characters allowed in a single chat message. */
  MESSAGE_MAX_LENGTH: 160,
  /** Maximum number of chat messages preserved in the rolling history. */
  HISTORY_LIMIT: 50,
} as const;

export const DEFAULT_PLAYER_NAME = "Wanderer";

/**
 * Runtime type check used by the server before trusting a client payload.
 */
export function isPositionPayload(value: unknown): value is PositionPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.x === "number" &&
    Number.isFinite(candidate.x) &&
    typeof candidate.y === "number" &&
    Number.isFinite(candidate.y) &&
    typeof candidate.z === "number" &&
    Number.isFinite(candidate.z)
  );
}

export function isChatPayload(value: unknown): value is ChatPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return typeof candidate.text === "string";
}

export function clampPosition(position: PositionPayload): PositionPayload {
  const { XZ_RADIUS, Y_MIN, Y_MAX } = WORLD_BOUNDS;

  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

  const clampRadius = (value: number) => clamp(value, -XZ_RADIUS, XZ_RADIUS);

  return {
    x: clampRadius(position.x),
    y: clamp(position.y, Y_MIN, Y_MAX),
    z: clampRadius(position.z),
  };
}

export function distance3d(a: PositionPayload, b: PositionPayload): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function clonePosition(position: PositionPayload): PositionPayload {
  return { x: position.x, y: position.y, z: position.z };
}

const NAME_SANITIZE_REGEX = /[^\p{L}\p{N}\s'_\-]/gu;

export function sanitizePlayerName(
  name: unknown,
  fallback: string = DEFAULT_PLAYER_NAME
): string {
  if (typeof name === "string") {
    const collapsed = name.trim().replace(/\s+/g, " ");
    const cleaned = collapsed.replace(NAME_SANITIZE_REGEX, "");
    const sliced = cleaned.slice(0, PLAYER_LIMITS.NAME_MAX_LENGTH);
    if (sliced.length >= PLAYER_LIMITS.NAME_MIN_LENGTH) {
      return sliced;
    }
  }
  return fallback;
}

export function sanitizeChatText(text: unknown): string | null {
  if (typeof text !== "string") {
    return null;
  }
  const collapsed = text.replace(/\s+/g, " ").trim();
  if (!collapsed) {
    return null;
  }
  return collapsed.slice(0, CHAT_LIMITS.MESSAGE_MAX_LENGTH);
}

export function makeChatMessage(
  id: string | null,
  name: string,
  text: string,
  system = false,
  timestamp = Date.now()
): ChatMessage {
  return { id, name, text, system, timestamp };
}
