import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import * as Colyseus from "colyseus.js";
import {
  MESSAGE,
  MOVEMENT_LIMITS,
  PositionMessage,
  SnapshotMessage,
  SpawnMessage,
  DespawnMessage,
  clampPosition,
  PositionPayload,
  PLAYER_LIMITS,
  CHAT_LIMITS,
  ChatMessage,
  ChatHistoryMessage,
  sanitizePlayerName,
  sanitizeChatText,
  DEFAULT_PLAYER_NAME,
} from "@shared";

type StatusTone = "ok" | "warn" | "error";

type NameBillboard = {
  mesh: Mesh;
  setText: (text: string) => void;
  dispose: () => void;
};

type RemotePlayer = {
  mesh: Mesh;
  target: Vector3;
  label: NameBillboard;
  name: string;
};

const app = document.getElementById("app");
if (!app) {
  throw new Error("Missing #app root element");
}
Object.assign(app.style, { position: "relative" });

const canvas = document.createElement("canvas");
canvas.id = "game-canvas";
Object.assign(canvas.style, {
  width: "100%",
  height: "100%",
  display: "block",
});
app.appendChild(canvas);

const overlay = document.createElement("div");
Object.assign(overlay.style, {
  position: "absolute",
  inset: "0",
  pointerEvents: "none",
  zIndex: "10",
});
app.appendChild(overlay);

const status = document.createElement("div");
status.id = "connection-status";
Object.assign(status.style, {
  position: "absolute",
  top: "16px",
  left: "16px",
  padding: "8px 12px",
  borderRadius: "8px",
  fontFamily: "sans-serif",
  fontSize: "14px",
  color: "#111",
  background: "rgba(255, 255, 255, 0.9)",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
  pointerEvents: "none",
  transition: "background 0.3s ease",
});
overlay.appendChild(status);

const setStatus = (text: string, tone: StatusTone = "ok") => {
  status.textContent = text;
  const palette: Record<StatusTone, string> = {
    ok: "rgba(255, 255, 255, 0.9)",
    warn: "rgba(255, 219, 88, 0.9)",
    error: "rgba(255, 128, 128, 0.9)",
  };
  status.style.background = palette[tone];
};

const connectPanel = document.createElement("div");
Object.assign(connectPanel.style, {
  position: "absolute",
  top: "16px",
  right: "16px",
  padding: "12px 16px",
  borderRadius: "8px",
  background: "rgba(17, 17, 17, 0.75)",
  color: "#f0f0f0",
  fontFamily: "sans-serif",
  fontSize: "14px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  pointerEvents: "auto",
});
overlay.appendChild(connectPanel);

const nameForm = document.createElement("form");
Object.assign(nameForm.style, {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
});
connectPanel.appendChild(nameForm);

const nameLabel = document.createElement("label");
nameLabel.textContent = "Nom du héros";
nameLabel.style.fontWeight = "600";
nameForm.appendChild(nameLabel);

const nameInput = document.createElement("input");
nameInput.type = "text";
nameInput.maxLength = PLAYER_LIMITS.NAME_MAX_LENGTH;
Object.assign(nameInput.style, {
  padding: "6px 8px",
  borderRadius: "6px",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  background: "rgba(0, 0, 0, 0.4)",
  color: "#fff",
  outline: "none",
});
nameLabel.appendChild(nameInput);

const connectButton = document.createElement("button");
connectButton.type = "submit";
connectButton.textContent = "Rejoindre";
Object.assign(connectButton.style, {
  padding: "6px 8px",
  borderRadius: "6px",
  border: "none",
  background: "#27ae60",
  color: "#fff",
  fontWeight: "600",
  cursor: "pointer",
});
nameForm.appendChild(connectButton);

const connectedRow = document.createElement("div");
Object.assign(connectedRow.style, {
  display: "none",
  alignItems: "center",
  gap: "8px",
});
connectPanel.appendChild(connectedRow);

const connectedLabel = document.createElement("span");
connectedLabel.textContent = "";
connectedRow.appendChild(connectedLabel);

const disconnectButton = document.createElement("button");
disconnectButton.type = "button";
disconnectButton.textContent = "Déconnexion";
Object.assign(disconnectButton.style, {
  padding: "6px 8px",
  borderRadius: "6px",
  border: "none",
  background: "#c0392b",
  color: "#fff",
  fontWeight: "600",
  cursor: "pointer",
});
connectedRow.appendChild(disconnectButton);

const chatContainer = document.createElement("div");
Object.assign(chatContainer.style, {
  position: "absolute",
  bottom: "16px",
  left: "16px",
  width: "320px",
  padding: "12px",
  borderRadius: "8px",
  background: "rgba(17, 17, 17, 0.75)",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  fontFamily: "sans-serif",
  pointerEvents: "auto",
});
overlay.appendChild(chatContainer);

const chatTitle = document.createElement("div");
chatTitle.textContent = "Tchat local";
chatTitle.style.fontWeight = "600";
chatContainer.appendChild(chatTitle);

const chatLog = document.createElement("div");
Object.assign(chatLog.style, {
  height: "160px",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  paddingRight: "4px",
});
chatContainer.appendChild(chatLog);

const chatForm = document.createElement("form");
Object.assign(chatForm.style, {
  display: "flex",
  gap: "8px",
});
chatContainer.appendChild(chatForm);

const chatInput = document.createElement("input");
chatInput.type = "text";
chatInput.placeholder = "Connectez-vous pour discuter";
chatInput.maxLength = CHAT_LIMITS.MESSAGE_MAX_LENGTH;
chatInput.disabled = true;
Object.assign(chatInput.style, {
  flex: "1",
  padding: "6px 8px",
  borderRadius: "6px",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  background: "rgba(0, 0, 0, 0.4)",
  color: "#fff",
  outline: "none",
});
chatForm.appendChild(chatInput);

const chatSendButton = document.createElement("button");
chatSendButton.type = "submit";
chatSendButton.textContent = "Envoyer";
Object.assign(chatSendButton.style, {
  padding: "6px 8px",
  borderRadius: "6px",
  border: "none",
  background: "#2980b9",
  color: "#fff",
  fontWeight: "600",
  cursor: "pointer",
});
chatForm.appendChild(chatSendButton);

const storedName = localStorage.getItem("playerName");
const fallbackName = `${DEFAULT_PLAYER_NAME} ${Math.floor(Math.random() * 900) + 100}`;
let myName = sanitizePlayerName(storedName ?? "", fallbackName);
nameInput.value = myName;

const engine = new Engine(canvas, true);
const scene = new Scene(engine);

const createNameBillboard = (owner: Mesh, initial: string): NameBillboard => {
  const texture = new DynamicTexture(`label-${owner.uniqueId}`, 256, scene, false);
  texture.hasAlpha = true;
  const material = new StandardMaterial(`label-mat-${owner.uniqueId}`, scene);
  material.diffuseTexture = texture;
  material.opacityTexture = texture;
  material.emissiveColor = new Color3(1, 1, 1);
  material.specularColor = new Color3(0, 0, 0);
  material.backFaceCulling = false;
  material.disableLighting = true;

  const plane = MeshBuilder.CreatePlane(`label-plane-${owner.uniqueId}`, { size: 2.4 }, scene);
  plane.parent = owner;
  plane.position = new Vector3(0, 1.6, 0);
  plane.billboardMode = Mesh.BILLBOARDMODE_ALL;
  plane.isPickable = false;
  plane.material = material;
  plane.scaling = new Vector3(1.4, 0.5, 1);

  const draw = (text: string) => {
    const value = text || DEFAULT_PLAYER_NAME;
    const ctx = texture.getContext() as unknown as CanvasRenderingContext2D;
    const { width, height } = texture.getSize();
    ctx.clearRect(0, 0, width, height);
    ctx.font = "600 32px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 6;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.55)";
    ctx.fillStyle = "white";
    ctx.strokeText(value, width / 2, height / 2);
    ctx.fillText(value, width / 2, height / 2);
    texture.update(false);
  };

  draw(initial);

  return {
    mesh: plane,
    setText: draw,
    dispose: () => {
      plane.dispose();
      texture.dispose();
      material.dispose();
    },
  };
};

const camera = new UniversalCamera("cam", new Vector3(0, 1.7, -6), scene);
camera.attachControl(canvas, true);
new HemisphericLight("light", new Vector3(0, 1, 0), scene);

MeshBuilder.CreateGround("ground", { width: 40, height: 40 }, scene);
const box = MeshBuilder.CreateBox("box", { size: 1 }, scene);
box.position = new Vector3(0, 0.5, 0);
const mat = new StandardMaterial("m", scene);
mat.diffuseColor = new Color3(0.2, 0.6, 1);
box.material = mat;

const player = MeshBuilder.CreateSphere("me", { diameter: 1 }, scene);
player.position = new Vector3(0, 0.5, 0);
const myMat = new StandardMaterial("me-mat", scene);
myMat.diffuseColor = new Color3(0.1, 0.8, 0.2);
player.material = myMat;

const myLabel = createNameBillboard(player, myName);

scene.onBeforeRenderObservable.add(() => {
  camera.position = Vector3.Lerp(
    camera.position,
    player.position.add(new Vector3(0, 1.7, -6)),
    0.1
  );
  camera.setTarget(player.position.add(new Vector3(0, 1.2, 0)));
});

const keys: Record<string, boolean> = { w: false, a: false, s: false, d: false };

const isTyping = () => {
  const active = document.activeElement;
  return active === nameInput || active === chatInput;
};

window.addEventListener("keydown", (event) => {
  const k = event.key.toLowerCase();
  if (isTyping()) {
    return;
  }
  if (k in keys) {
    keys[k] = true;
  }
});

window.addEventListener("keyup", (event) => {
  const k = event.key.toLowerCase();
  if (isTyping()) {
    return;
  }
  if (k in keys) {
    keys[k] = false;
  }
});

const others: Record<string, RemotePlayer> = {};

engine.runRenderLoop(() => {
  const dt = engine.getDeltaTime() / 1000;
  const speed = 4;
  const dir = new Vector3(
    (keys.d ? 1 : 0) - (keys.a ? 1 : 0),
    0,
    (keys.s ? 1 : 0) - (keys.w ? 1 : 0)
  );
  if (dir.lengthSquared() > 0) {
    dir.normalize();
    player.position.addInPlace(dir.scale(speed * dt));
  }

  const clamped = clampPosition({
    x: player.position.x,
    y: player.position.y,
    z: player.position.z,
  });
  player.position.set(clamped.x, clamped.y, clamped.z);

  Object.values(others).forEach(({ mesh, target }) => {
    const lerpFactor = Math.min(1, dt * 8);
    const smoothed = Vector3.Lerp(mesh.position, target, lerpFactor);
    mesh.position.copyFrom(smoothed);
  });

  scene.render();
});

window.addEventListener("resize", () => engine.resize());

const clearChatLog = () => {
  chatLog.innerHTML = "";
};

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const appendChatMessage = (message: ChatMessage) => {
  const entry = document.createElement("div");
  entry.style.fontSize = "13px";
  entry.style.lineHeight = "1.4";
  entry.textContent = `[${formatTime(message.timestamp)}] ${message.name}: ${message.text}`;
  if (message.system) {
    entry.style.color = "#ffd858";
  } else if (room && message.id === room.sessionId) {
    entry.style.color = "#8be68b";
  }
  chatLog.appendChild(entry);
  while (chatLog.children.length > CHAT_LIMITS.HISTORY_LIMIT) {
    chatLog.removeChild(chatLog.firstChild!);
  }
  chatLog.scrollTop = chatLog.scrollHeight;
};

const resetRemotePlayers = () => {
  Object.values(others).forEach((other) => {
    other.label.dispose();
    other.mesh.material?.dispose();
    other.mesh.dispose();
  });
  Object.keys(others).forEach((id) => delete others[id]);
};

const ensureOther = (
  id: string,
  details: { position?: PositionPayload; name?: string } = {}
) => {
  let entry = others[id];
  if (!entry) {
    const mesh = MeshBuilder.CreateSphere(`p-${id}`, { diameter: 1 }, scene);
    mesh.position.set(
      details.position?.x ?? 0,
      details.position?.y ?? 0.5,
      details.position?.z ?? 0
    );
    const material = new StandardMaterial(`m-${id}`, scene);
    material.diffuseColor = Color3.Random();
    mesh.material = material;
    const label = createNameBillboard(mesh, details.name ?? DEFAULT_PLAYER_NAME);
    entry = others[id] = {
      mesh,
      target: mesh.position.clone(),
      label,
      name: details.name ?? DEFAULT_PLAYER_NAME,
    };
    refreshStatus();
  }
  if (details.position) {
    entry.mesh.position.set(
      details.position.x,
      details.position.y,
      details.position.z
    );
    entry.target.copyFrom(entry.mesh.position);
  }
  if (details.name && details.name !== entry.name) {
    entry.name = details.name;
    entry.label.setText(details.name);
  }
  return entry;
};

let room: Colyseus.Room | null = null;
let connecting = false;

const refreshStatus = () => {
  if (!room) {
    return;
  }
  const total = 1 + Object.keys(others).length;
  setStatus(`Connecté – ${total} joueur(s) · ${myName}`, "ok");
};

const handleDisconnect = (text: string, tone: StatusTone) => {
  if (room) {
    room = null;
  }
  connecting = false;
  resetRemotePlayers();
  chatInput.disabled = true;
  chatInput.placeholder = "Connectez-vous pour discuter";
  chatInput.value = "";
  connectButton.disabled = false;
  nameInput.disabled = false;
  nameForm.style.display = "flex";
  connectedRow.style.display = "none";
  disconnectButton.disabled = false;
  connectedLabel.textContent = "";
  setStatus(text, tone);
};

const attachRoomHandlers = (activeRoom: Colyseus.Room) => {
  activeRoom.onMessage(MESSAGE.SNAPSHOT, (snapshot: SnapshotMessage) => {
    snapshot.players.forEach((playerSnapshot) => {
      if (playerSnapshot.id === activeRoom.sessionId) {
        return;
      }
      ensureOther(playerSnapshot.id, {
        position: playerSnapshot.position,
        name: playerSnapshot.name,
      });
    });
  });

  activeRoom.onMessage(MESSAGE.SPAWN, (msg: SpawnMessage) => {
    if (msg.id === activeRoom.sessionId) {
      myName = msg.name;
      myLabel.setText(msg.name);
      connectedLabel.textContent = `Connecté en tant que ${msg.name}`;
      nameInput.value = msg.name;
      localStorage.setItem("playerName", msg.name);
      refreshStatus();
      return;
    }
    ensureOther(msg.id, { position: msg.position, name: msg.name });
  });

  activeRoom.onMessage(MESSAGE.DESPAWN, (msg: DespawnMessage) => {
    const other = others[msg.id];
    if (other) {
      other.label.dispose();
      other.mesh.material?.dispose();
      other.mesh.dispose();
      delete others[msg.id];
      refreshStatus();
    }
  });

  activeRoom.onMessage(MESSAGE.POSITION, (msg: PositionMessage) => {
    if (msg.id === activeRoom.sessionId) {
      return;
    }
    const other = ensureOther(msg.id);
    other.target.set(msg.position.x, msg.position.y, msg.position.z);
  });

  activeRoom.onMessage(MESSAGE.CHAT_HISTORY, (history: ChatHistoryMessage) => {
    clearChatLog();
    history.history.forEach((entry) => appendChatMessage(entry));
  });

  activeRoom.onMessage(MESSAGE.CHAT, (msg: ChatMessage) => {
    appendChatMessage(msg);
  });

  activeRoom.onLeave(() => {
    handleDisconnect("Déconnecté du serveur", "warn");
  });

  activeRoom.onError((_code, message) => {
    setStatus(`Erreur réseau: ${message ?? "inconnue"}`, "error");
  });
};

const connect = async (requestedName: string) => {
  if (connecting) {
    return;
  }
  const fallback = `${DEFAULT_PLAYER_NAME} ${Math.floor(Math.random() * 900) + 100}`;
  const desiredName = sanitizePlayerName(requestedName, fallback);
  nameInput.value = desiredName;
  connecting = true;
  connectButton.disabled = true;
  nameInput.disabled = true;
  setStatus("Connexion au serveur…", "warn");

  try {
    const protocol = location.protocol === "https:" ? "wss" : "ws";
    const endpoint = `${protocol}://${window.location.hostname}:2567`;
    const client = new Colyseus.Client(endpoint);
    const joinedRoom = await client.joinOrCreate("game", { name: desiredName });
    room = joinedRoom;
    myName = desiredName;
    myLabel.setText(myName);
    connectedLabel.textContent = `Connecté en tant que ${myName}`;
    localStorage.setItem("playerName", myName);
    clearChatLog();
    resetRemotePlayers();
    chatInput.disabled = false;
    chatInput.placeholder = "Tapez un message et appuyez sur Entrée";
    chatInput.value = "";
    connectedRow.style.display = "flex";
    nameForm.style.display = "none";
    disconnectButton.disabled = false;
    attachRoomHandlers(joinedRoom);

    const initialPosition = {
      x: player.position.x,
      y: player.position.y,
      z: player.position.z,
    };
    joinedRoom.send(MESSAGE.POSITION, initialPosition);

    console.log("✅ Connecté au serveur Colyseus. Room id:", joinedRoom.id);
    refreshStatus();
  } catch (err) {
    console.warn("⚠️ Connexion au serveur échouée :", err);
    setStatus("Connexion impossible au serveur", "error");
    connectButton.disabled = false;
    nameInput.disabled = false;
  } finally {
    connecting = false;
  }
};

nameForm.addEventListener("submit", (event) => {
  event.preventDefault();
  connect(nameInput.value.trim() || myName);
});

disconnectButton.addEventListener("click", () => {
  if (!room) {
    nameForm.style.display = "flex";
    connectedRow.style.display = "none";
    return;
  }
  disconnectButton.disabled = true;
  setStatus("Déconnexion…", "warn");
  room.leave();
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!room) {
    return;
  }
  const sanitized = sanitizeChatText(chatInput.value);
  if (!sanitized) {
    chatInput.value = "";
    return;
  }
  room.send(MESSAGE.CHAT, { text: sanitized });
  chatInput.value = "";
});

chatInput.addEventListener("keydown", (event) => event.stopPropagation());
nameInput.addEventListener("keydown", (event) => event.stopPropagation());

setStatus("Hors ligne – choisissez un nom et rejoignez la partie", "warn");
nameInput.focus();

setInterval(() => {
  if (!room) {
    return;
  }
  const p = player.position;
  room.send(MESSAGE.POSITION, { x: p.x, y: p.y, z: p.z });
}, Math.max(100, MOVEMENT_LIMITS.MIN_INTERVAL_MS));
