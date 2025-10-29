import { Engine, Scene, UniversalCamera, HemisphericLight, MeshBuilder, Vector3, StandardMaterial, Color3, Mesh } from "babylonjs";
import * as Colyseus from "colyseus.js";

const app = document.getElementById("app")!;
const canvas = document.createElement("canvas");
canvas.id = "game-canvas";
canvas.style.width = "100%";
canvas.style.height = "100%";
app.appendChild(canvas);

const engine = new Engine(canvas, true);
const scene = new Scene(engine);

// Camera FPS simple
const camera = new UniversalCamera("cam", new Vector3(0, 1.7, -6), scene);
camera.attachControl(canvas, true);

// Lumière
new HemisphericLight("light", new Vector3(0, 1, 0), scene);

// Sol + cube décor
MeshBuilder.CreateGround("ground", { width: 40, height: 40 }, scene);
const box = MeshBuilder.CreateBox("box", { size: 1 }, scene);
box.position = new Vector3(0, 0.5, 0);
const mat = new StandardMaterial("m", scene);
mat.diffuseColor = new Color3(0.2, 0.6, 1);
box.material = mat;

// Joueur local (sphère)
const player = MeshBuilder.CreateSphere("me", { diameter: 1 }, scene);
player.position = new Vector3(0, 0.5, 0);

// couleur spéciale pour TOI
const myMat = new StandardMaterial("me-mat", scene);
myMat.diffuseColor = new Color3(0.1, 0.8, 0.2); // vert
player.material = myMat;


// Suivre le joueur
scene.onBeforeRenderObservable.add(() => {
  camera.position = Vector3.Lerp(camera.position, player.position.add(new Vector3(0, 1.7, -6)), 0.1);
  camera.setTarget(player.position.add(new Vector3(0, 1.2, 0)));
});

// Contrôles WASD (insensible à majuscules)
const keys = { w:false, a:false, s:false, d:false };
window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (k in keys) (keys as any)[k] = true;
});
window.addEventListener("keyup", (e) => {
  const k = e.key.toLowerCase();
  if (k in keys) (keys as any)[k] = false;
});

engine.runRenderLoop(() => {
  const dt = engine.getDeltaTime() / 1000; // secondes
  const speed = 4; // m/s
  const dir = new Vector3(
    (keys.d ? 1 : 0) - (keys.a ? 1 : 0),
    0,
    (keys.s ? 1 : 0) - (keys.w ? 1 : 0)
  );
  if (dir.lengthSquared() > 0) {
    dir.normalize();
    player.position.addInPlace(dir.scale(speed * dt));
  }
  scene.render();
});

window.addEventListener("resize", () => engine.resize());

// === Réseau: spawn/despawn/snapshot + pos ===
(async () => {
  let room: Colyseus.Room | null = null;
  try {
    const url = (location.protocol === "https:" ? "wss" : "ws") + "://" + window.location.hostname + ":2567";
    const client = new Colyseus.Client(url);
    room = await client.joinOrCreate("game");
// Envoi initial de ma position pour que les autres me voient sans attendre
if (room) {
  const p = player.position;
  room.send("pos", { x: p.x, y: p.y, z: p.z });
}

    console.log("✅ Connecté au serveur Colyseus. Room id:", room.id);
  } catch (err) {
    console.warn("⚠️ Connexion au serveur échouée (as-tu lancé le serveur ?) :", err);
  }

  const others: Record<string, Mesh> = {};

  function createPawn(id: string, pos?: {x:number;y:number;z:number}) {
    const m = MeshBuilder.CreateSphere("p-" + id, { diameter: 1 }, scene);
    m.position.set(pos?.x ?? 0, pos?.y ?? 0.5, pos?.z ?? 0);
    const mm = new StandardMaterial("m-" + id, scene);
    mm.diffuseColor = Color3.Random();
    m.material = mm;
    return m;
  }

  function ensureOther(id: string, pos?: {x:number;y:number;z:number}) {
    if (!others[id]) others[id] = createPawn(id, pos);
    return others[id];
  }

  // Snapshot: on reçoit la liste des joueurs déjà présents
  room?.onMessage("snapshot", (arr: Array<{id:string;x:number;y:number;z:number}>) => {
    console.log("📦 snapshot", arr);
    for (const it of arr) ensureOther(it.id, it);
  });

  // Un nouveau joueur apparaît
  room?.onMessage("spawn", (msg: {id:string;x:number;y:number;z:number}) => {
    console.log("✨ spawn", msg);
    if (msg.id === room?.sessionId) {
      // c'est moi (on a déjà player local visuel), pas besoin de créer un doublon
      return;
    }
    ensureOther(msg.id, msg);
  });

  // Un joueur part
  room?.onMessage("despawn", (msg: {id:string}) => {
    console.log("🗑️ despawn", msg);
    const m = others[msg.id];
    if (m) { m.dispose(); delete others[msg.id]; }
  });

  // Positions des autres (diffusées par le serveur)
  room?.onMessage("pos", (msg: {id:string;x:number;y:number;z:number}) => {
    if (msg.id === room?.sessionId) return; // ignorer nos propres updates
    const m = ensureOther(msg.id);
    m.position.set(msg.x, msg.y, msg.z);
  });

  // Envoi périodique de ma position (10 fois/sec)
  setInterval(() => {
    if (!room) return;
    const p = player.position;
    room.send("pos", { x: p.x, y: p.y, z: p.z });
  }, 100);
})();
