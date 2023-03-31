/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { ChannelPermissionOverwrite } from "./Channel";
import { User } from "./User";

export enum AuditLogEvents {
	// guild level
	GUILD_UPDATE = 1,
	GUILD_IMPORT = 2,
	GUILD_EXPORTED = 3,
	GUILD_ARCHIVE = 4,
	GUILD_UNARCHIVE = 5,
	// join-leave
	USER_JOIN = 6,
	USER_LEAVE = 7,
	// channels
	CHANNEL_CREATE = 10,
	CHANNEL_UPDATE = 11,
	CHANNEL_DELETE = 12,
	// permission overrides
	CHANNEL_OVERWRITE_CREATE = 13,
	CHANNEL_OVERWRITE_UPDATE = 14,
	CHANNEL_OVERWRITE_DELETE = 15,
	// kick and ban
	MEMBER_KICK = 20,
	MEMBER_PRUNE = 21,
	MEMBER_BAN_ADD = 22,
	MEMBER_BAN_REMOVE = 23,
	// member updates
	MEMBER_UPDATE = 24,
	MEMBER_ROLE_UPDATE = 25,
	MEMBER_MOVE = 26,
	MEMBER_DISCONNECT = 27,
	BOT_ADD = 28,
	// roles
	ROLE_CREATE = 30,
	ROLE_UPDATE = 31,
	ROLE_DELETE = 32,
	ROLE_SWAP = 33,
	// invites
	INVITE_CREATE = 40,
	INVITE_UPDATE = 41,
	INVITE_DELETE = 42,
	// webhooks
	WEBHOOK_CREATE = 50,
	WEBHOOK_UPDATE = 51,
	WEBHOOK_DELETE = 52,
	WEBHOOK_SWAP = 53,
	// custom emojis
	EMOJI_CREATE = 60,
	EMOJI_UPDATE = 61,
	EMOJI_DELETE = 62,
	EMOJI_SWAP = 63,
	// deletion
	MESSAGE_CREATE = 70, // messages sent using non-primary seat of the user only
	MESSAGE_EDIT = 71, // non-self edits only
	MESSAGE_DELETE = 72,
	MESSAGE_BULK_DELETE = 73,
	// pinning
	MESSAGE_PIN = 74,
	MESSAGE_UNPIN = 75,
	// integrations
	INTEGRATION_CREATE = 80,
	INTEGRATION_UPDATE = 81,
	INTEGRATION_DELETE = 82,
	// stage actions
	STAGE_INSTANCE_CREATE = 83,
	STAGE_INSTANCE_UPDATE = 84,
	STAGE_INSTANCE_DELETE = 85,
	// stickers
	STICKER_CREATE = 90,
	STICKER_UPDATE = 91,
	STICKER_DELETE = 92,
	STICKER_SWAP = 93,
	// threads
	THREAD_CREATE = 110,
	THREAD_UPDATE = 111,
	THREAD_DELETE = 112,
	// application commands
	APPLICATION_COMMAND_PERMISSION_UPDATE = 121,
	// automod
	POLICY_CREATE = 140,
	POLICY_UPDATE = 141,
	POLICY_DELETE = 142,
	MESSAGE_BLOCKED_BY_POLICIES = 143, // in fosscord, blocked messages are stealth-dropped
	// instance policies affecting the guild
	GUILD_AFFECTED_BY_POLICIES = 216,
	// message moves
	IN_GUILD_MESSAGE_MOVE = 223,
	CROSS_GUILD_MESSAGE_MOVE = 224,
	// message routing
	ROUTE_CREATE = 225,
	ROUTE_UPDATE = 226,
}

@Entity("audit_logs")
export class AuditLog extends BaseClass {
	@JoinColumn({ name: "target_id" })
	@ManyToOne(() => User)
	target?: User;

	@Column({ nullable: true })
	@RelationId((auditlog: AuditLog) => auditlog.user)
	user_id: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User, (user: User) => user.id)
	user: User;

	@Column({ type: "int" })
	action_type: AuditLogEvents;

	@Column({ type: "simple-json", nullable: true })
	options?: {
		delete_member_days?: string;
		members_removed?: string;
		channel_id?: string;
		messaged_id?: string;
		count?: string;
		id?: string;
		type?: string;
		role_name?: string;
	};

	@Column()
	@Column({ type: "simple-json" })
	changes: AuditLogChange[];

	@Column({ nullable: true })
	reason?: string;
}

export interface AuditLogChange {
	new_value?: AuditLogChangeValue;
	old_value?: AuditLogChangeValue;
	key: string;
}

export interface AuditLogChangeValue {
	name?: string;
	description?: string;
	icon_hash?: string;
	splash_hash?: string;
	discovery_splash_hash?: string;
	banner_hash?: string;
	owner_id?: string;
	region?: string;
	preferred_locale?: string;
	afk_channel_id?: string;
	afk_timeout?: number;
	rules_channel_id?: string;
	public_updates_channel_id?: string;
	mfa_level?: number;
	verification_level?: number;
	explicit_content_filter?: number;
	default_message_notifications?: number;
	vanity_url_code?: string;
	$add?: object[]; // TODO: These types are bad.
	$remove?: object[];
	prune_delete_days?: number;
	widget_enabled?: boolean;
	widget_channel_id?: string;
	system_channel_id?: string;
	position?: number;
	topic?: string;
	bitrate?: number;
	permission_overwrites?: ChannelPermissionOverwrite[];
	nsfw?: boolean;
	application_id?: string;
	rate_limit_per_user?: number;
	permissions?: string;
	color?: number;
	hoist?: boolean;
	mentionable?: boolean;
	allow?: string;
	deny?: string;
	code?: string;
	channel_id?: string;
	inviter_id?: string;
	max_uses?: number;
	uses?: number;
	max_age?: number;
	temporary?: boolean;
	deaf?: boolean;
	mute?: boolean;
	nick?: string;
	avatar_hash?: string;
	id?: string;
	type?: number;
	enable_emoticons?: boolean;
	expire_behavior?: number;
	expire_grace_period?: number;
	user_limit?: number;
}
