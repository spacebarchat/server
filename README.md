# Fosscord API Server

This repository contains the Fosscord HTTP API Server

## Bug Tracker

[Project Board](https://github.com/fosscord/fosscord-api/projects/2)

## API

We use [express](https://expressjs.com/) for the HTTP Server and
[lambert-server](https://www.npmjs.com/package/lambert-server) for route handling and body validation (customized).

## Contribution

You should be familiar with:

-   [Git](https://git-scm.com/)
-   [NodeJS](https://nodejs.org/)
-   [TypeScript](https://www.typescriptlang.org/)
-   [MongoDB/mongoose](http://mongoosejs.com/)

and the other technologies we use

### Getting Started

Clone the Repository:

```bash
git clone https://github.com/fosscord/fosscord-api
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
The Launch file configuration is in `./vscode/launch.json`,
so you can just debug the server by pressing `F5` or the `> Launch Server` button
