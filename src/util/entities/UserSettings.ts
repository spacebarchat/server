import { Column, Entity, JoinColumn } from "typeorm";
import { BaseClassWithoutId, PrimaryIdColumn } from ".";

@Entity("user_settings")
export class UserSettings extends BaseClassWithoutId {
    @PrimaryIdColumn()
	id: string;

	@Column({ nullable: true })
    afk_timeout: number = 3600;

	@Column({ nullable: true })
    allow_accessibility_detection: boolean = true;
	
    @Column({ nullable: true })
    animate_emoji: boolean = true;
	
    @Column({ nullable: true })
    animate_stickers: number = 0;
	
    @Column({ nullable: true })
    contact_sync_enabled: boolean = false;
	
    @Column({ nullable: true })
    convert_emoticons: boolean = false;
	
    @Column({ nullable: true, type: "simple-json" })
    custom_status: CustomStatus | null = null;
	
    @Column({ nullable: true })
    default_guilds_restricted: boolean = false;
	
    @Column({ nullable: true })
    detect_platform_accounts: boolean = false;
	
    @Column({ nullable: true })
    developer_mode: boolean = true;
	
    @Column({ nullable: true })
    disable_games_tab: boolean = true;
	
    @Column({ nullable: true })
    enable_tts_command: boolean = false;
	
    @Column({ nullable: true })
    explicit_content_filter: number = 0;
	
    @Column({ nullable: true, type: "simple-json" })
    friend_source_flags: FriendSourceFlags = { all: true };
	
    @Column({ nullable: true })
    gateway_connected: boolean = false;
	
    @Column({ nullable: true })
    gif_auto_play: boolean = false;
	
    @Column({ nullable: true, type: "simple-json" })
    guild_folders: GuildFolder[] = []; // every top guild is displayed as a "folder"
	
    @Column({ nullable: true, type: "simple-json" })
    guild_positions: string[] = []; // guild ids ordered by position
	
    @Column({ nullable: true })
    inline_attachment_media: boolean = true;
	
    @Column({ nullable: true })
    inline_embed_media: boolean = true;
	
    @Column({ nullable: true })
    locale: string = "en-US"; // en_US
	
    @Column({ nullable: true })
    message_display_compact: boolean = false;
	
    @Column({ nullable: true })
    native_phone_integration_enabled: boolean = true;
	
    @Column({ nullable: true })
    render_embeds: boolean = true;
	
    @Column({ nullable: true })
    render_reactions: boolean = true;
	
    @Column({ nullable: true, type: "simple-json" })
    restricted_guilds: string[] = [];
	
    @Column({ nullable: true })
    show_current_game: boolean = true;
	
    @Column({ nullable: true })
    status: "online" | "offline" | "dnd" | "idle" | "invisible" = "online";
	
    @Column({ nullable: true })
    stream_notifications_enabled: boolean = false;
	
    @Column({ nullable: true })
    theme: "dark" | "white" = "dark"; // dark
	
    @Column({ nullable: true })
    timezone_offset: number = 0; // e.g -60
}

interface CustomStatus {
    emoji_id?: string;
    emoji_name?: string;
    expires_at?: number;
    text?: string;
}

interface GuildFolder {
    color: number;
    guild_ids: string[];
    id: number;
    name: string;
}

interface FriendSourceFlags { 
    all: boolean
}