# Spacebar Activitypub

## Activitypub Specification

-   [Activitystreams vocab](https://www.w3.org/TR/activitystreams-vocabulary)
-   [Activitystreams](https://www.w3.org/TR/activitystreams-core)
-   [Activitypub spec](https://www.w3.org/TR/activitypub/)

## Additional resources

-   [Activitypub as it has been understood](https://flak.tedunangst.com/post/ActivityPub-as-it-has-been-understood)
-   [Guide for new ActivityPub implementers](https://socialhub.activitypub.rocks/t/guide-for-new-activitypub-implementers/479)
-   Understanding activitypub
    [part 1](https://seb.jambor.dev/posts/understanding-activitypub/),
    [part 2](https://seb.jambor.dev/posts/understanding-activitypub-part-2-lemmy/),
    [part 3](https://seb.jambor.dev/posts/understanding-activitypub-part-3-the-state-of-mastodon/)
-   [Nodejs Express Activitypub sample implementation](https://github.com/dariusk/express-activitypub)
-   [Reading Activitypub](https://tinysubversions.com/notes/reading-activitypub/#the-ultimate-tl-dr)

# Spacebar Activitypub Docs

Incomplete documentation.

## Supported Types

| Spacebar object | Activitypub                                                                        |
| --------------- | ---------------------------------------------------------------------------------- |
| Message         | [Note](https://www.w3.org/TR/activitystreams-vocabulary/#dfn-note)                 |
| Channel         | [Group](https://www.w3.org/TR/activitystreams-vocabulary/#dfn-group)               |
| Guild           | [Organisation](https://www.w3.org/TR/activitystreams-vocabulary/#dfn-organization) |
| User            | [Person](https://www.w3.org/TR/activitystreams-vocabulary/#dfn-person)             |
| Role            | Spacebar extension: [Role](#role-federation)                                       |

## Message Federation

A message sent by a user. Sent to channels, or directly to users (a DM channel is created on Spacebar instances).

### Supported Activities

| Activity   | Action                                               |
| ---------- | ---------------------------------------------------- |
| `Create`   | Transformed from a Note to a Message and saved to db |
| `Delete`   | Removes a message from db                            |
| `Update`   | Updates a message and saves to db.                   |
| `Announce` | Used by Channels to forward to members.              |

### Properties Used

| Property               | Description                                                                  |
| ---------------------- | ---------------------------------------------------------------------------- |
| `type`                 | Must be `"Note"`                                                             |
| `content`              | Message content                                                              |
| `name`                 | Used as message content if `content` not provided                            |
| `inReplyTo`            | Reference a previous Message in this guild                                   |
| `published`            | Timestamp of this Message                                                    |
| `attributedTo`         | Message author                                                               |
| `to`                   | The Channel this Message is a part of                                        |
| `tag`                  | Mentions                                                                     |
| `tag[].type`           | Must be `Mention`                                                            |
| `tag[].name`           | Plain-type Webfinger address of a Profile within this Guild OR `@everyone`   |
| `attachment`           | Message attachments                                                          |
| `attachment[].url`     | The URL of this media attachment                                             |
| `attachment[].summary` | The content warning for this media attachment                                |
| `replies`              | For compatibility with other software: The replies to this message           |
| `sbType`               | Spacebar extension. Describes the real MessageType. i.e. `GUILD_MEMBER_JOIN` |
| `embeds`               | Spacebar extension. Describes the attached Embeds                            |
| `flags`                | Spacebar extension. Message flags as bitfield                                |
| TODO: reactions        | How does plemora/akkoma/misskey/etc handle reactions?                        |
| TODO: components       |                                                                              |
| TODO: stickers         |                                                                              |

## Channel Federation

An automated actor. Users can send messages to it, which the channel forwards to it's followers in an `Announce`.
Follows/is followed by it's corresponding Guild, if applicable.

### Supported Activities

| Activity       | Action                                                |
| -------------- | ----------------------------------------------------- |
| `Create`       | Transformed from a Group to a Channel and saved to db |
| `Delete`       | Removes a channel from db                             |
| `Update`       | Updates channel details                               |
| `Add`/`Remove` | Manage pinned Messages for this Channel               |

### Properties Used

| Property       | Description                                                           |
| -------------- | --------------------------------------------------------------------- |
| `type`         | Must be `"Group"`                                                     |
| `name`         | The Channel name                                                      |
| `published`    | Creation timestamp of this Channel                                    |
| `attributedTo` | The Guild this Channel is a part of                                   |
| `featured`     | Mastodon extension. The pinned Messages in this Channel               |
| `publicKey`    | The public key used to verify signatures from this actor              |
| `sbType`       | Spacebar extension. Describes the real ChannelType. i.e. `GUILD_TEXT` |

## Guild Federation

An automated actor. Follows its Channels. Is followed by guild members.
Also contains a collection of [roles](#role-federation).

### Supported Activities

| Activity | Action                                                             |
| -------- | ------------------------------------------------------------------ |
| `Follow` | Join a guild. Must provide an invite code. Automatically accepted. |
| `Delete` | Delete a guild.                                                    |
| `Update` | Update guild details.                                              |

### Properties Used

-   attributed to is owner

## User Federation

A person. Sends messages to Channels. May also create, modify, or moderate guilds, channels, or roles.
Is a partOf a [Role](#role-federation)

### Supported Activities

| Activity          | Action                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| `Follow`          | Send a friend request                                                                          |
| `Accept`/`Reject` | Accept or reject a friend request                                                              |
| `Undo`            | Unfriend                                                                                       |
| `Delete`          | Delete a user from the database along with all their messages.                                 |
| `Block`           | Signal to the remote server that they should hide your profile from that user. Not guaranteed. |
| `Update`          | Update user details.                                                                           |

## Role Federation

Is a [Collection](https://www.w3.org/TR/activitystreams-vocabulary/#dfn-collection) of Users within this role.

## S2S endpoints

Base url: `/federation`

-   `/.well-known/webfinger?resource=acct@domain` - Returns webfinger response i.e. https://docs.joinmastodon.org/spec/webfinger/
-   -   Webfinger resources include users, channels, guilds, as well as invite codes which returns a the corresponding guild
-   `/.well-known/host-meta` - Returns location of webfinger? Why is this neccessary?

-   `/channels/:channel_id` - Returns specified Channel as AP object ( Group )
-   `/channels/:channel_id/inbox` - The inbox for this Channel
-   `/channels/:channel_id/outbox` - The outbox for this Channel
-   `/channels/:channel_id/followers` - The Users that have access to this Channel

-   `/channels/:channel_id/messages/:message_id` - Returns specified Message in Channel as AP object ( Announce Note )
-
-   `/messages/:message_id` - Returns specified Message in Channel as AP object ( Announce Note )

-   `/activities/:activity_id` - Returns the specified activitypub activity. E.g. Announce, Follow, etc.
-   `/activities/inbox` - Shared inbox.

-   `/users/:user_id` - Returns specified User as AP object (Person)
-   `/users/:user_id/inbox` - The inbox of this User. POSTing creates a DM channel if it does not exist.

-   `/guilds/:guild_id` - Returns specified Guild as AP object (Organisation)

## notes

-   activitypub responses should be returned if the Accept header is `application/ld+json; profile="https://www.w3.org/ns/activitystreams"` OR `application/activity+json`
