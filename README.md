<p align="center">
  <img width="100" src="https://raw.githubusercontent.com/spacebarchat/spacebarchat/master/branding/png/Spacebar__Icon-Rounded-Subtract.png" />
</p>
<h1 align="center">Spacebar Server</h1>

<p align="center">
  <a href="https://matrix.to/#/#spacebar:rory.gay">
    <img src="https://img.shields.io/matrix/spacebar%3Arory.gay?server_fqdn=matrix.rory.gay&fetchMode=summary&logo=matrix&logoColor=fffffff&label=Matrix" />
  </a>
  <a href="https://fermi.chat/invite/NAa7zJ?instance=https%3A%2F%2Fspacebar.chat">
    <img src="https://api.old.server.spacebar.chat/api/guilds/1006649183970562092/shield.svg" />
  </a>
  <a href="https://discord.gg/ZrnGQP6p3d">
    <img src="https://img.shields.io/discord/806142446094385153?color=7489d5&logo=discord&logoColor=ffffff&label=Discord" />
  </a>
  <img src="https://img.shields.io/static/v1?label=Status&message=Development&color=blue">
  <a title="Crowdin" target="_blank" href="https://translate.spacebar.chat/"><img src="https://badges.crowdin.net/fosscord/localized.svg"></a>
   <a href="https://opencollective.com/spacebar">
    <img src="https://opencollective.com/spacebar/tiers/badge.svg">
  </a>
</p>

## [About](https://spacebar.chat)

Spacebar/server is a Discord backend re-implementation and extension.
We aim to reverse engineer and add additional features to the Discord backend, while remaining completely backwards compatible with existing bots, applications, and clients.

This repository contains:

- [API Request/Response Types](/src/schemas)
- [Spacebar HTTP API Server](/src/api)
- [WebSocket Gateway Server](/src/gateway)
- [HTTP CDN Server](/src/cdn)
- [WebRTC Server](/src/webrtc)
- [Utility and Database Models](/src/util)
- [Spacebar Admin API (C#)](/extra/admin-api) (Emma [it/its]@Rory& was here)

## [Documentation](https://docs.spacebar.chat)

And with documentation on how to set up your own server [here](https://docs.spacebar.chat/setup/server), docs to set up either client [here](https://docs.spacebar.chat/setup/clients/), and docs about bots [here](https://docs.spacebar.chat/setup/bots/)

## [Contributing](https://docs.spacebar.chat/contributing/)

## Clients

You _should_ be able to use any client designed for Discord.com to connect to a Spacebar instance.
However, some incompatibilities still exist between Spacebar and Discord. For this reason, not every client will connect.  
We recommend using [Fermi](https://fermi.chat/login?instance=https%3A%2F%2Fspacebar.chat) as a solid starting point on your adventure in the SpaceBar!
