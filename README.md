<p align="center">
  <img width="100" src="https://raw.githubusercontent.com/fosscord/fosscord/master/assets-rebrand/svg/Fosscord-Icon-Rounded-Subtract.svg" />
</p>
<h1 align="center">Fosscord Server</h1>

<p align="center">
  <a href="https://discord.gg/ZrnGQP6p3d">
    <img src="https://img.shields.io/discord/806142446094385153?color=7489d5&logo=discord&logoColor=ffffff" />
  </a>
  <img src="https://img.shields.io/static/v1?label=Status&message=Development&color=blue">
  <a title="Crowdin" target="_blank" href="https://translate.fosscord.com/"><img src="https://badges.crowdin.net/fosscord/localized.svg"></a>
   <a href="https://opencollective.com/fosscord">
    <img src="https://opencollective.com/fosscord/tiers/badge.svg">
  </a>
</p>

# Install
Setup fosscord-server as normal ( existing installations are fine, if you run voice on the same server on port `3004` you don't need to edit the `regions_available_0_endpoint` record of `config` )

Note: currently everything about webrtc is commented out ( because I was lazy )
If you want to test that, you're gonna have to do some fiddling, shouldn't be toooo difficult ( check `SelectProtocols.ts`, `Identify.ts` and theres probably smth in `Server.ts` I forgot about ). Also also make sure you set the `listenIps` in `Identify.ts` properly because otherwise the transport won't start 

```sh
cd webrtc
ts-node src/start.ts # don't think the build script works lol
```

# Current problems / setup / etc:
* Webrtc DTLS fails to properly connect with browser voice. The handshake completes and is labeled completed by chrome://webrtc-internals, however mediasoup drops all RTP packets as the 'handshake is not completed' yet.

* After the desktop client updates it's VoiceState to join a voice channel, upon leaving the VoiceState will not update to match, and the client is prevented from joining any new voice channels. The client also continuously plays the voice disconnected notification sound. [Video demo](https://who-the-fuck-pinged.me/6dlya82Z)
* Desktop client cannot properly connect to voice/media servers due to the above, but also because somewhere in my signalling there is a problem. I haven't looked much into it.
* When the client does magically decide to try to connect, it connects to signalling but then [throws an error client-side about `this.conn.setSelfMute` not being a function](https://media.discordapp.net/attachments/903790443052036117/951099310370615306/unknown.png)

* I have instead been testing voice using [a fork](https://github.com/tenable/DiscordClient) of the reverse engineered client from [this article](https://medium.com/tenable-techblog/lets-reverse-engineer-discord-1976773f4626), with some slight modifications ( I think it was just changing the email field the client uses to login from `email` -> `login`. Todo: these could be aliases in `fosscord-server`? )
* This client can join a channel, connect to signalling, and does send packets to the UDP server. However, I can't seem to get decrpytion to work. As far as I know, I'm using the same key I'm sending. It turns out the client converts the `secret_key: Number[]` received into a string, but doing the same on the server-side before passing to the decrpyt method still just complains about a key mismatch.

# Resources:
* [Mediasoup docs](https://mediasoup.org/documentation/v3/), or more specifically the [API docs](https://mediasoup.org/documentation/v3/mediasoup/api/)
* * [Mediasoup SFU video demo](https://github.com/Dirvann/mediasoup-sfu-webrtc-video-rooms)
* [The fork of the reverse engineered voice client](https://github.com/edisionnano/DiscordClient)
* * [discord_voice.node stubs for logging client actions](https://github.com/edisionnano/discord_voice-stub/blob/main/discord_voice.js)
* [Discord.com docs: connecting to voice](https://discord.com/developers/docs/topics/voice-connections#connecting-to-voice)
* [Anatomy of a WebRTC SDP](https://webrtchacks.com/sdp-anatomy/)
* [WebRTC Glossary](https://webrtcglossary.com/)
* * [What is an SFU/MCU](https://webrtcglossary.com/sfu/)
* * [How SDP, how to send DTLS fingerprints](https://blog.actorsfit.com/a?ID=00001-8ebd39ca-2d57-41bc-9743-635373e77167)