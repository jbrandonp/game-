import { Room, Client } from "colyseus";
import { Schema, defineTypes } from "@colyseus/schema";

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

class State extends Schema {} // pas utilisé pour l’instant

export class GameRoom extends Room<State> {
  maxClients = 50;

  // Mémoire volatile des positions
  private players = new Map<string, Vec3>(); // sessionId -> position

  onCreate(_options: any) {
    this.setState(new State());

    // Réception des positions: maj mémoire + broadcast aux autres
    this.onMessage("pos", (client, data: { x:number; y:number; z:number }) => {
      const p = this.players.get(client.sessionId);
      if (p) { p.x = data.x; p.y = data.y; p.z = data.z; }
      this.broadcast("pos", { id: client.sessionId, x: data.x, y: data.y, z: data.z }, { except: client });
    });
  }

onJoin(client: Client) {
  console.log("Client joined:", client.sessionId);

  // 1) Envoyer au nouveau un snapshot des joueurs déjà présents
  const snapshot = [...this.players.entries()].map(([id, pos]) => ({ id, x: pos.x, y: pos.y, z: pos.z }));
  if (snapshot.length > 0) client.send("snapshot", snapshot);

  // 2) Position de départ aléatoire mais visible : on restreint l'axe X et on force l'axe Z positif
  const start = new Vec3();
  const R = 4;
  // X dans [−R/2, R/2] pour rester dans le champ latéral, Y fixe à 0.5
  start.x = (Math.random() * 2 - 1) * (R / 2);
  start.y = 0.5;
  // Z entre 2 et R+2 (2 à 6) toujours devant la caméra
  start.z = 2 + Math.random() * R;
  this.players.set(client.sessionId, start);

  // 3) Annoncer le spawn : aux autres (sauf moi) et à moi‑même
  this.broadcast("spawn", { id: client.sessionId, x: start.x, y: start.y, z: start.z }, { except: client });
  client.send("spawn", { id: client.sessionId, x: start.x, y: start.y, z: start.z });

  } // fin de onJoin

  onLeave(client: Client) {
    console.log("Client left:", client.sessionId);
    this.players.delete(client.sessionId);
    this.broadcast("despawn", { id: client.sessionId });
  }
} // fin de classe GameRoom

