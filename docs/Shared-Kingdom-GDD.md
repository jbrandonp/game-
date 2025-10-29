# Shared Kingdom — GDD (3D Web Social Sandbox RPG Game)

**Version:** v0.2 (revision and clean formatting)  
**Date:** October 29, 2025  
**Author:** Brandon (Design)

> **Version v0.2 Notes** — Typographical/accent cleanup, Word-friendly formatting (titles, tables), additions: Monetization & Compliance, Security/Moderation, Analytics & KPIs, Playtests/QA, Art & Audio Pipeline, DevOps & Deployment, "Project Setup" Appendix (beginner → MVP).

## Table of Contents

1. [Pitch & Objectives](#1-pitch--objectives)  
2. [Target Audience & Platforms](#2-target-audience--platforms)  
3. [World & Atmosphere](#3-world--atmosphere)  
4. [Core Gameplay](#4-core-gameplay)  
5. [Economy & Market](#5-economy--market)  
6. [Live Systems & Community](#6-live-systems--community)  
7. [UX / UI](#7-ux--ui)  
8. [Technical Architecture](#8-technical-architecture)  
9. [Data Model (SQL — example)](#9-data-model-sql--example)  
10. [Roadmap & Sprints (indicative)](#10-roadmap--sprints-indicative)  
11. [Team & Roles (MVP)](#11-team--roles-mvp)  
12. [Costs & Hosting (order of magnitude)](#12-costs--hosting-order-of-magnitude)  
13. [Risks & Mitigation](#13-risks--mitigation)  
14. [Accessibility & Localization](#14-accessibility--localization)  
15. [Monetization & Compliance](#15-monetization--compliance)  
16. [Security, Anti-cheat & Moderation](#16-security-anti-cheat--moderation)  
17. [Analytics & KPIs](#17-analytics--kpis)  
18. [Playtests & QA](#18-playtests--qa)  
19. [Art & Audio Pipeline](#19-art--audio-pipeline)  
20. [DevOps & Deployment](#20-devops--deployment)  
21. [Appendices (network messages, JSON items/recipes, project setup)](#21-appendices--network-messages-json-itemsrecipes-project-setup)

## 1. Pitch & Objectives

### 1.1 Pitch
Create a **cooperative and social RPG** in **low-poly 3D** playable **in the browser**, where players build, trade, and defend a **shared village**. A **sandbox** world (construction/demolition), **persistent**, that **encourages cooperation** through complementary professions and an organized economy.

### 1.2 MVP Objectives

- **Village-hub** + **1 playable biome**
- **Gathering, crafting, building/demolishing**
- **Multiplayer** **30–60 players / zone**
- **NPC shop** → **P2P** → **order book market** (progression)

### 1.3 Design Principles

- **Web accessibility** (PC & recent mobile), **low-poly graphics**
- **Cooperation first**: complementary roles, common objectives
- **Smooth progression** (player + village), **15–45 min sessions**
- **Stable economy** (NPC anchor + order book market + sinks)
- **Anti-grief security**: plot rights, rollback, reputation

## 2. Target Audience & Platforms

- **Audience**: PC (and recent mobile) players who enjoy **cooperation + building**
- **Platform**: **Web browser** (WebGL2)

## 3. World & Atmosphere

### 3.1 Narrative Setting
A **broken kingdom** is being rebuilt. Survivors found a village in a forgotten valley and **rebuild together**.

### 3.2 Starting Map

- **Central village** (forge, sawmill, market, tavern)
- **Forest** (wood, hunting, herbs)
- **Mine** (ores, danger)
- **Ruins** (quests, mysteries)
- **River** (fishing, transport)

### 3.3 Visual Style
Low-poly, natural colors, **high readability**. Simple lightmaps/shadows, **"low graphics" mode**.

## 4. Core Gameplay

### 4.1 Roles / Professions

| Role | Function |
| --- | --- |
| **Lumberjack** | Collects wood, supplies the sawmill |
| **Blacksmith** | Tools, weapons, **productivity boost** |
| **Hunter** | Food, leather, control of aggressive wildlife |
| **Healer** | Healing, potions, expedition support |
| **Builder** | Place blocks/structures, repairs, urban planning |
| **Merchant** | Manages the market, contracts, prices, logistics |

### 4.2 Gathering & Crafting

- **Gathering**: trees, rocks, deposits
- **Stations**: sawmill / forge / alchemy
- **Recipes**: ingredients + **crafting time**

### 4.3 Construction & Destruction (sandbox)

- **Option A: Voxel (chunks)** — break/place blocks anywhere
- **Option B: Modular** — predefined foundations/walls/roofs
- **Structure HP**, fire, **simplified collapse (server)**
- **Land rights** & **action logs** (anti-grief)

### 4.4 Combat & Defense

- Simple **lock-on**, **2–3 types of enemies** (wolves, bandits)
- **Raid events** on the village
- **Durability** + **repairs** (**sink**)

### 4.5 Social

- Global/local **chat**, **emotes**
- **Reputation** (help, trade, defense)
- **Village council** (votes, taxes)

### 4.6 Progression

- **Individual XP per profession**
- **Village levels** (unlocking buildings/recipes)
- **Daily cooperative quests**

## 5. Economy & Market

### 5.1 Main Resources

| Resource | Tier | Usage |
| --- | --- | --- |
| **Wood** | Basic | Light construction, fuel |
| **Stone** | Basic | Walls, foundations, defenses |
| **Iron Ore** | Intermediate | Ingots, tools, weapons |
| **Plants/Herbs** | Basic | Potions, dyes |
| **Food** | Basic | Survival, temporary bonuses |
| **Fabric/Leather** | Intermediate | Light armor, bags |
| **Gold (coins)** | Currency | Exchanges, Taxes, Repairs |

### 5.2 Recipes (examples)

| Item | Inputs | Outputs | Station | Time |
| --- | --- | --- | --- | --- |
| **Wooden Plank** | Wood×2 | Plank×1 | Sawmill | 10 s |
| **Iron Ingot** | Ore×3 + Coal×1 | Ingot×1 | Forge | 30 s |
| **Simple Bow** | Wood×3+ Rope × 1 | Bow × 1 | Workshop | 45 s |
| **Minor Potion** | Herbs × 2 + Water × 1 | Potion × 1 | Alchemy Table | 25 s |

### 5.3 Trading Channels

- **Direct Trade (P2P)** — no tax, **limited slots**
- **NPC (floor/ceiling price)** — **economic anchor**
- **Order Book Market (BUY/SELL)** — **4% tax**, **1 coin listing fee**, **24-hour history**

### 5.4 Dynamic Pricing (NPC) — Guideline

\(P_{buy} = \text{clamp}(P_0 \times (1 − k \times \text{surplus\_ratio}),\; \text{floor})\)  
\(P_{sell} = \text{clamp}(P_0 \times (1 + k \times \text{shortage\_ratio}),\; \text{ceiling})\)

### 5.5 Monetary Sinks

- **Market tax (4%)** and **listing fee (1 coin)**
- **Repairs** of tools/weapons based on wear and tear
- **Maintenance** of plots & public buildings
- **Fast travel**, NPC services (cosmetics, titles)

### 5.6 Anti-exploit / Anti-grief

- **Market tax + listing fee**
- **Temporary min/max prices**
- **Cooldown** before market access
- **Plot rights**, **signed logs**, **rollback**

## 6. Live Systems & Community

### 6.1 Events

- **Village Defense** (wolf/bandit raid)
- **Weekly Market** (trading bonus)
- **Community Project** (bridge/wall/tower) through item donations
- **Solstice Festival** (temporary buffs, mini-games)

### 6.2 Governance

**Elected Village Council** (via reputation): votes on **taxes**, **expansions**, **local laws**.

## 7. UX / UI

- **Screens**: Menu, HUD, Inventory, Marketplace, Map
- **Controls**: keyboard/mouse (PC), touch buttons (mobile)
- **Accessibility**: font size, color blindness, **low graphics mode**

## 8. Technical Architecture

### 8.1 Client Stack

- **TypeScript + Vite**
- **Babylon.js** (or Three.js) — **3D WebGL2** rendering
- **Zustand** (UI state), **Colyseus.js** (networking)
- **glTF** + Draco/meshopt, **KTX2 (Basis) textures**

### 8.2 Server Stack

- **Node.js + Colyseus** (authoritative rooms)
- **PostgreSQL** (via Prisma) **or** **Supabase** (DB + Auth)
- **cannon-es** (lightweight physics), **schedulers/ticks 15–20 Hz**
- Persistent storage (chunks/voxel or modular pieces)

### 8.3 Network & Performance

- **< 300 draw calls / frame**
- **< 500k triangles**
- **Compressed textures < 30–50 MB** (streaming)
- **Snapshots 2–5 Hz** (compact diffs), **server tick 15–20 Hz**
- **30–60 players per zone** (shards otherwise)

### 8.4 World & Persistence

World divided into **zones/shards**. **Voxel** option (chunks **16×16×256**) or **modular pieces**. **DB persistence** + incremental storage of modifications.

## 9. Data Model (SQL — example)

```sql
-- Items
CREATE TABLE item (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tier INT DEFAULT 1,
  base_price INT NOT NULL,
  tradeable BOOLEAN DEFAULT TRUE
);

-- Inventory
CREATE TABLE inventory (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  item_id TEXT NOT NULL REFERENCES item(id),
  qty INT NOT NULL CHECK (qty >= 0)
);

-- Market Orders
CREATE TABLE market_order (
  id TEXT PRIMARY KEY,
  village_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  item_id TEXT NOT NULL REFERENCES item(id),
  type TEXT CHECK (type IN ('BUY','SELL')) NOT NULL,
  price INT NOT NULL CHECK (price > 0),
  qty INT NOT NULL CHECK (qty > 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP,
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN','FILLED','CANCELLED','EXPIRED'))
);

-- Transactions
CREATE TABLE trade (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES market_order(id),
  buyer_id TEXT NOT NULL,
  seller_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  qty INT NOT NULL,
  price INT NOT NULL,
  tax INT NOT NULL,
  ts TIMESTAMP NOT NULL DEFAULT NOW()
);

-- NPC Stocks (anchor prices)
CREATE TABLE npc_stock (
  village_id TEXT,
  item_id TEXT REFERENCES item(id),
  stock INT NOT NULL,
  buy_price INT NOT NULL,
  sell_price INT NOT NULL,
  PRIMARY KEY (village_id, item_id)
);
```

## 10. Roadmap & Sprints (indicative)

### S1 — Prototype (2 weeks)

- Low-poly 3D scene + TPS avatar + collisions
- Basic multiplayer (spawn, movement, chat)
- Resource gathering (wood/stone) + local inventory
- Construction (simple voxels **or** modular pieces)
- NPC shop (fixed prices P0)

**Acceptance criteria:** 60 FPS on average PC, 30+ local CCU, local client session save

### S2 — Persistence & Crafting (2–3 weeks)

- Player and world saving (chunks/structures)
- Stations (sawmill, forge), initial recipes
- Inventory/crafting UI, weight/stacking

**Criteria:** Robust DB persistence, < 0.1% network message loss under local load

### S3 — Economy (2–3 weeks)

- P2P trading + dynamic anchored NPC prices
- Order book market (BUY/SELL), **4%** tax, listing fee
- **24-hour** history (minimum)

**Criteria:** 1k orders/day without CPU usage exceeding 60%

### S4 — Social & Defense (2–3 weeks)

- Social reputation, land rights, logs
- Events (wolf raid), repairs, durability

**Criteria:** Operational anti-grief system (rollback < 5 min)

### S5 — Content & Optimization (3–4 weeks)

- New biomes, recipes, co-op quests
- LOD, instancing, fog / **low-spec mode** graphics

**Criteria:** < 300 draw calls, < 500k tris, textures 30–50 MB

## 11. Team & Roles (MVP)

- **Product Owner** (vision, priorities): Brandon
- **Tech Lead** (client/server)
- **Gameplay Developer** (client)
- **Network/Server Developer**
- **Low-poly 3D Artist** (glTF)
- **Game Designer** (balancing)
- **QA/Playtests, Community**

## 12. Costs & Hosting (order of magnitude)

| Phase | Monthly Cost |
| --- | --- |
| **Proto** | **€0–20 / month** (Free Vercel + Render) |
| **Private Alpha** | **€50–150 / month** (server + DB) |
| **Public Server** | **€200–600 / month** (concurrent players) |

## 13. Risks & Mitigation

| Risk | Mitigation |
| --- | --- |
| **Web Performance** | Limit draw calls, LOD/instancing, streaming, disable shadows in *potato* mode |
| **Griefing/Cheating** | Authoritative server, per-parcel permissions, logs, rollback, market cooldown |
| **Inflation** | Sinks (taxes, repairs), NPC price caps/floors, limited order slots |
| **Scope creep** | Strict roadmap, prioritized MVP, features frozen before Alpha |

## 14. Accessibility & Localization

- **Adjustable font size**, **colorblind** options
- **Key remapping** and **contextual help**
- **Localization**: FR (source) → EN (priority), + JSON language files
- **Readable UI**: contrasts, auditory/haptic feedback (mobile)

## 15. Monetization & Compliance

- **Model**: **free-to-play**, **cosmetics only** (skins, emotes, titles)
- **Optional Battle Pass** (co-op challenges, non-pay-to-win rewards)
- **Direct purchase**: premium **cosmetic** currency (no gameplay impact)
- **Compliance**: **GDPR** (opt-in analytics, right to be forgotten), **legal notices**, **moderation & reporting** policy
- **Age**: 13+ (parental controls as needed)

## 16. Security, Anti-cheat & Moderation

- **Authoritative server**, server validation of critical actions
- API **rate limits**, message **signatures**, **timestamping**
- **Detection**: abnormal speeds, crafting/duplication, markets (wash trading)
- **Moderation**: in-game **reporting**, logs, progressive **mute/kick/ban**, appeal process
- Community **roles** (moderators), clear **Terms of Service**

## 17. Analytics & KPIs

- **Tech**: client→server→storage events (DB/ETL)
- **Alpha KPIs**: **DAU/MAU**, **Retention D1/D7/D30**, **peak CCU**, **session duration**, **crafting rate**, **raid participation rate**, **market order volume**, **cosmetic ARPU** (if enabled)

## 18. Playtests & QA

- **Weekly playtests** (co-op scenarios), short **questionnaires**
- **Test plan**: performance (FPS/CCU), stability (crash rate), economy (inflation), anti-grief (rollback time)
- **Triage**: P0 (blocking), P1 (major), P2 (minor), P3 (cosmetic)

## 19. Art & Audio Pipeline

- **Low-poly guidelines**: **< 500k tris / scene**, legible silhouettes, limited palettes
- **Formats**: **glTF** (mesh/anim), **KTX2** (textures), **audio**: .ogg
- **Scales**: 1 unit = 1 m, grid *snap* for modular assets
- **Audio**: ambient music (day/night), clear SFX (harvesting, crafting, combat)

## 20. DevOps & Deployment

- **Branches**: *main* (prod), *dev* (integration), *feature/*
- **CI/CD**: lint + tests + build + deployment (Vercel/Render/Fly)
- **Environments**: dev / staging / prod
- **Releases**: semver, changelog, *feature flags*

## 21. Appendices — Network Messages (examples)

### Client → Server

- `join_room({name, skin})`
- `input({axes, jump, interact})`
- `gather({nodeId})`
- `build({pieceId, at})`
- `demolish({targetId})`
- `craft({recipeId})`
- `market:create({type, itemId, price, qty, duration})`
- `market:fill({orderId, qty})`
- `trade:direct:init({targetPlayerId})`
- `chat({text})`

### Server → Client

- `world_state({players, nodes, buildings})` **[2–5 Hz]**
- `patch({ops: [...]})` (compact diffs)
- `event({type, payload})`
- `market:update({orders:[...]})`, `trade:executed({summary})`
- `error({code, message})`

### 22. Appendices — Items/Recipes (Initial JSON)

```json
{
  "items": [
    { "id": "wood", "name": "Wood", "tier": 1, "base_price": 5, "tradeable": true },
    { "id": "stone", "name": "Stone", "tier": 1, "base_price": 4, "tradeable": true },
    { "id": "iron_ore", "name": "Iron Ore", "tier": 2, "base_price": 12, "tradeable": true },
    { "id": "herb", "name": "Herb", "tier": 1, "base_price": 6, "tradeable": true },
    { "id": "plank", "name": "Plank", "tier": 1, "base_price": 9, "tradeable": true },
    { "id": "iron_ingot", "name": "Iron Ingot", "tier": 2, "base_price": 28, "tradeable": true }
  ],
  "recipes": [
    {
      "id": "plank",
      "inputs": [{ "item": "wood", "qty": 2 }],
      "outputs": [{ "item": "plank", "qty": 1 }],
      "station": "sawmill",
      "time_s": 10
    },
    {
      "id": "iron_ingot",
      "inputs": [
        { "item": "iron_ore", "qty": 3 },
        { "item": "wood", "qty": 1 }
      ],
      "outputs": [{ "item": "iron_ingot", "qty": 1 }],
      "station": "forge",
      "time_s": 30
    }
  ]
}
```

### 23. Appendix — Project Setup (Beginner → MVP)

#### 23.1 Prerequisites

- **Node.js LTS** + **pnpm** or **yarn**
- **VS Code** + TypeScript, ESLint, Prettier extensions
- **GitHub**, **Vercel** (client), **Render/Fly** (server) accounts

#### 23.2 Client (Babylon.js + Vite)

```bash
# Create project
pnpm create vite@latest shared-kingdom-client -- --template vanilla-ts
cd shared-kingdom-client
pnpm add babylonjs @babylonjs/loaders zustand colyseus.js
pnpm add -D eslint prettier vite-tsconfig-paths
```

- `main.ts` entry point: initialize canvas, scene, TPS camera, game loop
- Enable **KTX2** and **meshopt** for assets

#### 23.3 Server (Colyseus)

```bash
mkdir shared-kingdom-server && cd $_
npm init -y
pnpm add colyseus express uWebSockets.js pg prisma zod
pnpm add -D typescript ts-node nodemon @types/express
```

- Create authoritative `GameRoom` (tick **15–20 Hz**)
- Zod schemas to validate messages
- **PostgreSQL** connection (Prisma) for persistence

#### 23.4 Monorepo (optional)

- **pnpm workspaces**: `apps/client`, `apps/server`, `packages/shared` (types)
- **CI/CD**: build/test, automatic deployment **dev → staging → prod**

#### 23.5 MVP Checklist

- [ ] Smooth network movement (interpolation/extrapolation)
- [ ] Wood/stone gathering + inventory
- [ ] Modular **or** limited voxel building
- [ ] NPC shop (fixed prices)
- [ ] Player + world save
- [ ] 1 simple raid event
- [ ] P2P market → orders (4% tax)
- [ ] "Low graphics" mode (LOD/fog/shadows off)

---

**End of document v0.2** — Copy/Export Word Recommended (H1/H2/H3 headings supported).
