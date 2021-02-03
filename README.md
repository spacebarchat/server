# Discord Open Source Server
This repository contains the HTTP API Server and the WebSocket Gateway Server

## Bug Tracker
[Project Board](https://github.com/discord-open-source/discord-server/projects/4)

## API
[Project Board](https://github.com/discord-open-source/discord-server/projects/3)

For the WebSocket we use [ws](https://www.npmjs.com/package/ws) and we'll write our own packet handler for the individual opcodes and events.

## Gateway
[Project Board](https://github.com/discord-open-source/discord-server/projects/6)

We use [express](https://expressjs.com/) for the HTTP Server and 
[lambert-server](https://www.npmjs.com/package/lambert-server) for route handling and body validation (customized).

## Contribution
You should be familiar with:
- [Git](https://git-scm.com/)
- [NodeJS](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Lambert-DB](https://www.npmjs.com/package/lambert-db) (easy database abstraction wrapper)

and the technologies we use for Gateway/API

### Getting Started
Clone the Repository:
```bash
git clone https://github.com/discord-open-source/discord-server
cd discord-server
```
#### Install (dev)dependencies:
```bash
npm install
npm install --only=dev
```
#### Starting:
```
npm start
```
#### Debugging:
**Vscode:**
The Launch file configuration is in ``./vscode/launch.json``,
so you can just debug the server by pressing ``F5`` or the ``> Launch Server`` button
