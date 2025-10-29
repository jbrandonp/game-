import { createServer } from "http";
import express from "express";
import cors from "cors";
import { Server } from "colyseus";
import { GameRoom } from "./rooms/GameRoom";

const app = express();
app.use(cors());
app.get("/", (_req, res) => res.send("Shared Kingdom server running"));

const httpServer = createServer(app);
const gameServer = new Server({ server: httpServer });

gameServer.define("game", GameRoom);

const PORT = Number(process.env.PORT) || 2567;
httpServer.listen(PORT, () => console.log(`✅ Server listening on ${PORT}`));