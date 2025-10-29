import { Room, Client } from "colyseus";
import { Schema, defineTypes } from "@colyseus/schema";
import {
  MESSAGE,
  MOVEMENT_LIMITS,
  PositionMessage,
  SpawnMessage,
  SnapshotMessage,
  DespawnMessage,
  clampPosition,
  clonePosition,
  distance3d,
  isPositionPayload,
  PositionPayload,
  sanitizePlayerName,
  DEFAULT_PLAYER_NAME,
  isChatPayload,
  sanitizeChatText,
  makeChatMessage,
  ChatMessage,
  ChatHistoryMessage,
  CHAT_LIMITS,
} from "@shared";

class Vec3 extends Schema {
  x: number = 0;
  y: number = 0;
  z: number = 0;
}
defineTypes(Vec3, {
  x: "number",
  y: "number",
  z: "number",
});

class State extends Schema {}

type PlayerState = {
  position: Vec3;
  lastUpdate: number;
  name: string;
};

const toPositionPayload = (vec: Vec3): PositionPayload => ({
  x: vec.x,
  y: vec.y,
  z: vec.z,
});

type JoinOptions = {
  name?: string;
};

const SYSTEM_SENDER = "System";

export class GameRoom extends Room<State> {
  maxClients = 50;

  private players = new Map<string, PlayerState>();
  private chatHistory: ChatMessage[] = [];
  private nextNameIndex = 1;

  onCreate(_options: unknown) {
    this.setState(new State());

    this.onMessage(MESSAGE.POSITION, (client, data: unknown) => {
      const player = this.players.get(client.sessionId);
      if (!player || !isPositionPayload(data)) {
        return;
      }

      const now = Date.now();
      const elapsed = now - player.lastUpdate;
      if (elapsed < MOVEMENT_LIMITS.MIN_INTERVAL_MS) {
        return; // flood protection
      }

      const next = clampPosition(data);
      if (elapsed > 0) {
        const current = toPositionPayload(player.position);
        const speed = distance3d(current, next) / (elapsed / 1000);
        if (speed > MOVEMENT_LIMITS.MAX_SPEED) {
          console.warn(
            `Ignoring suspicious movement from ${client.sessionId} (speed=${speed.toFixed(2)})`
          );
          return;
        }
      }

      player.position.x = next.x;
      player.position.y = next.y;
      player.position.z = next.z;
      player.lastUpdate = now;

      const message: PositionMessage = {
        id: client.sessionId,
        position: clonePosition(next),
      };
      this.broadcast(MESSAGE.POSITION, message, { except: client });
    });

    this.onMessage(MESSAGE.CHAT, (client, data: unknown) => {
      const player = this.players.get(client.sessionId);
      if (!player || !isChatPayload(data)) {
        return;
      }

      const text = sanitizeChatText(data.text);
      if (!text) {
        return;
      }

      const message = makeChatMessage(client.sessionId, player.name, text);
      this.recordChatMessage(message);
    });
  }

  onJoin(client: Client, options: JoinOptions) {
    console.log("Client joined:", client.sessionId);

    const name = this.allocateName(options?.name);

    const snapshot: SnapshotMessage = {
      players: Array.from(this.players.entries()).map(([id, player]) => ({
        id,
        name: player.name,
        position: clonePosition(toPositionPayload(player.position)),
      })),
    };
    if (snapshot.players.length > 0) {
      client.send(MESSAGE.SNAPSHOT, snapshot);
    }

    const spawnPosition = this.generateSpawnPosition();
    const vec = new Vec3();
    vec.x = spawnPosition.x;
    vec.y = spawnPosition.y;
    vec.z = spawnPosition.z;

    this.players.set(client.sessionId, {
      position: vec,
      lastUpdate: Date.now(),
      name,
    });

    const spawn: SpawnMessage = {
      id: client.sessionId,
      name,
      position: clonePosition(spawnPosition),
    };

    this.broadcast(MESSAGE.SPAWN, spawn, { except: client });
    client.send(MESSAGE.SPAWN, spawn);

    if (this.chatHistory.length > 0) {
      const history: ChatHistoryMessage = { history: this.chatHistory };
      client.send(MESSAGE.CHAT_HISTORY, history);
    }

    this.recordChatMessage(
      makeChatMessage(null, SYSTEM_SENDER, `${name} entered the world.`, true)
    );
  }

  onLeave(client: Client) {
    console.log("Client left:", client.sessionId);
    const departing = this.players.get(client.sessionId);
    this.players.delete(client.sessionId);

    const despawn: DespawnMessage = { id: client.sessionId };
    this.broadcast(MESSAGE.DESPAWN, despawn);

    if (departing) {
      this.recordChatMessage(
        makeChatMessage(
          null,
          SYSTEM_SENDER,
          `${departing.name} left the world.`,
          true
        )
      );
    }
  }

  private generateSpawnPosition(): PositionPayload {
    const radius = 4;
    const x = (Math.random() * 2 - 1) * (radius / 2);
    const y = 0.5;
    const z = 2 + Math.random() * radius;
    return clampPosition({ x, y, z });
  }

  private allocateName(requested?: string): string {
    const fallback = `${DEFAULT_PLAYER_NAME} ${this.nextNameIndex++}`;
    return sanitizePlayerName(requested, fallback);
  }

  private recordChatMessage(message: ChatMessage) {
    this.chatHistory.push(message);
    if (this.chatHistory.length > CHAT_LIMITS.HISTORY_LIMIT) {
      this.chatHistory.splice(0, this.chatHistory.length - CHAT_LIMITS.HISTORY_LIMIT);
    }
    this.broadcast(MESSAGE.CHAT, message);
  }
}
