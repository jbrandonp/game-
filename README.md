# Shared Kingdom

Shared Kingdom is a cooperative low-poly sandbox RPG built for the web. Players gather resources, craft tools, and defend a shared village together inside a persistent world. This monorepo hosts the multiplayer prototype with a Babylon.js client and a Colyseus-powered server, along with shared protocol definitions and the full game design document.

## Repository Structure

| Path | Description |
| --- | --- |
| `apps/client` | Babylon.js WebGL client rendered in the browser. |
| `apps/server` | Colyseus authoritative room and Express bootstrap code. |
| `packages/shared` | Shared TypeScript types, schemas, and constants used by both client and server. |
| `docs/Shared-Kingdom-GDD.md` | Complete v0.2 game design document outlining pillars, systems, and roadmap. |

## Quick Start

Shared Kingdom targets Node.js 18 or newer. Run each application from its own directory.

```bash
# Client (Babylon.js)
cd apps/client
npm install
npm run dev

# Server (Colyseus)
cd apps/server
npm install
npm run dev
```

The server defaults to port `2567`. Once both processes are running, open the Vite dev server URL (typically http://localhost:5173) in your browser to join the sandbox.

### Production Builds

```bash
# Client bundle (outputs to apps/client/dist)
cd apps/client
npm run build

# Type-check the server project
cd apps/server
npm run typecheck
```

## Continuous Integration

GitHub Actions automatically type-checks and builds both the client and server on every push and pull request. See [`.github/workflows/ci.yml`](.github/workflows/ci.yml) for details.

## Documentation

* [Shared Kingdom GDD](docs/Shared-Kingdom-GDD.md) — Complete design document with systems, roadmap, and appendices.
* `/packages/shared` — Protocol definitions to keep the client and server in sync.

## Contributing

We welcome pull requests! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for coding standards, branch naming, and testing expectations. By participating you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

This repository is currently distributed for evaluation and prototyping. Please contact the maintainers before distributing builds outside your organization.
