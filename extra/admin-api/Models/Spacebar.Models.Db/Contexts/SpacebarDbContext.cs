using Microsoft.EntityFrameworkCore;
using Spacebar.Models.Db.Models;
using Stream = Spacebar.Models.Db.Models.Stream;

namespace Spacebar.Models.Db.Contexts;

public partial class SpacebarDbContext : DbContext
{
    public SpacebarDbContext(DbContextOptions<SpacebarDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Application> Applications { get; set; }

    public virtual DbSet<ApplicationCommand> ApplicationCommands { get; set; }

    public virtual DbSet<Attachment> Attachments { get; set; }

    public virtual DbSet<AuditLog> AuditLogs { get; set; }

    public virtual DbSet<AutomodRule> AutomodRules { get; set; }

    public virtual DbSet<BackupCode> BackupCodes { get; set; }

    public virtual DbSet<Badge> Badges { get; set; }

    public virtual DbSet<Ban> Bans { get; set; }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Channel> Channels { get; set; }

    public virtual DbSet<ClientRelease> ClientReleases { get; set; }

    public virtual DbSet<CloudAttachment> CloudAttachments { get; set; }

    public virtual DbSet<Config> Configs { get; set; }

    public virtual DbSet<ConnectedAccount> ConnectedAccounts { get; set; }

    public virtual DbSet<ConnectionConfig> ConnectionConfigs { get; set; }

    public virtual DbSet<EmbedCache> EmbedCaches { get; set; }

    public virtual DbSet<Emoji> Emojis { get; set; }

    public virtual DbSet<Guild> Guilds { get; set; }

    public virtual DbSet<InstanceBan> InstanceBans { get; set; }

    public virtual DbSet<Invite> Invites { get; set; }

    public virtual DbSet<Member> Members { get; set; }

    public virtual DbSet<Message> Messages { get; set; }

    public virtual DbSet<Migration> Migrations { get; set; }

    public virtual DbSet<Note> Notes { get; set; }

    public virtual DbSet<RateLimit> RateLimits { get; set; }

    public virtual DbSet<ReadState> ReadStates { get; set; }

    public virtual DbSet<Recipient> Recipients { get; set; }

    public virtual DbSet<Relationship> Relationships { get; set; }

    public virtual DbSet<ReportMenu> ReportMenus { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<SecurityKey> SecurityKeys { get; set; }

    public virtual DbSet<SecuritySetting> SecuritySettings { get; set; }

    public virtual DbSet<Session> Sessions { get; set; }

    public virtual DbSet<Sticker> Stickers { get; set; }

    public virtual DbSet<StickerPack> StickerPacks { get; set; }

    public virtual DbSet<Stream> Streams { get; set; }

    public virtual DbSet<StreamSession> StreamSessions { get; set; }

    public virtual DbSet<Tag> Tags { get; set; }

    public virtual DbSet<Team> Teams { get; set; }

    public virtual DbSet<TeamMember> TeamMembers { get; set; }

    public virtual DbSet<Template> Templates { get; set; }

    public virtual DbSet<ThreadMember> ThreadMembers { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserSetting> UserSettings { get; set; }

    public virtual DbSet<UserSettingsProto> UserSettingsProtos { get; set; }

    public virtual DbSet<ValidRegistrationToken> ValidRegistrationTokens { get; set; }

    public virtual DbSet<VoiceState> VoiceStates { get; set; }

    public virtual DbSet<Webhook> Webhooks { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Application>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_938c0a27255637bde919591888f");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.BotUser).WithOne(p => p.ApplicationBotUser)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_application_bot_user_id");

            entity.HasOne(d => d.Guild).WithMany(p => p.Applications).HasConstraintName("FK_application_guild_id");

            entity.HasOne(d => d.Owner).WithMany(p => p.ApplicationOwners).HasConstraintName("FK_application_owner_id");

            entity.HasOne(d => d.Team).WithMany(p => p.Applications)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_application_team_id");
        });

        modelBuilder.Entity<ApplicationCommand>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_0f73c2f025989c407947e1f75fe");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.DmPermission).HasDefaultValue(true);
            entity.Property(e => e.Options).HasDefaultValueSql("'[]'::jsonb");
            entity.Property(e => e.Type).HasDefaultValue(1);
        });

        modelBuilder.Entity<Attachment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_5e1f050bcff31e3084a1d662412");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.Channel).WithMany(p => p.Attachments)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_attachment_channel_id");

            entity.HasOne(d => d.Message).WithMany(p => p.Attachments)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_attachment_message_id");
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_1bb179d048bbc581caa3b013439");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.Target).WithMany(p => p.AuditLogTargets).HasConstraintName("FK_audit_log_target_user_id");

            entity.HasOne(d => d.User).WithMany(p => p.AuditLogUsers).HasConstraintName("FK_audit_log_source_user_id");
        });

        modelBuilder.Entity<AutomodRule>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_99789ae863507f5aed9e58d7866");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.Creator).WithMany(p => p.AutomodRules)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_automod_rule_creator_id");
        });

        modelBuilder.Entity<BackupCode>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_34ab957382dbc57e8fb53f1638f");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.User).WithMany(p => p.BackupCodes)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_backup_code_user_id");
        });

        modelBuilder.Entity<Badge>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_8a651318b8de577e8e217676466");
        });

        modelBuilder.Entity<Ban>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_a4d6f261bffa4615c62d756566a");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.Executor).WithMany(p => p.BanExecutors).HasConstraintName("FK_ban_executor_id");

            entity.HasOne(d => d.Guild).WithMany(p => p.Bans)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_ban_guild_id");

            entity.HasOne(d => d.User).WithMany(p => p.BanUsers)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_ban_user_id");
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_24dbc6126a28ff948da33e97d3b");

            entity.Property(e => e.Id).ValueGeneratedNever();
        });

        modelBuilder.Entity<Channel>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_bc603823f3f741359c2339389f9");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.Guild).WithMany(p => p.Channels)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_channel_guild_id");

            entity.HasOne(d => d.Owner).WithMany(p => p.Channels).HasConstraintName("FK_channel_owner_id");

            entity.HasOne(d => d.Parent).WithMany(p => p.InverseParent).HasConstraintName("FK_channel_parent_id");
        });

        modelBuilder.Entity<ClientRelease>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_4c4ea258342d2d6ba1be0a71a43");

            entity.Property(e => e.Id).ValueGeneratedNever();
        });

        modelBuilder.Entity<CloudAttachment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_5794827a3ee7c9318612dcb70c8");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.Channel).WithMany(p => p.CloudAttachments)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_cloud_attachment_channel_id");

            entity.HasOne(d => d.User).WithMany(p => p.CloudAttachments)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_cloud_attachment_user_id");
        });

        modelBuilder.Entity<Config>(entity =>
        {
            entity.HasKey(e => e.Key).HasName("PK_26489c99ddbb4c91631ef5cc791");
        });

        modelBuilder.Entity<ConnectedAccount>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_70416f1da0be645bb31da01c774");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.User).WithMany(p => p.ConnectedAccounts)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_connected_account_user_id");
        });

        modelBuilder.Entity<ConnectionConfig>(entity =>
        {
            entity.HasKey(e => e.Key).HasName("PK_bc0554f736ad71dde346549488a");
        });

        modelBuilder.Entity<EmbedCache>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_0abb7581d4efc5a8b1361389c5e");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
        });

        modelBuilder.Entity<Emoji>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_9adb96a675f555c6169bad7ba62");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.Application).WithMany(p => p.Emojis)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_emoji_application_id");

            entity.HasOne(d => d.Guild).WithMany(p => p.Emojis)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_emoji_guild_id");

            entity.HasOne(d => d.User).WithMany(p => p.Emojis).HasConstraintName("FK_emoji_user_id");
        });

        modelBuilder.Entity<Guild>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_e7e7f2a51bd6d96a9ac2aa560f9");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.AfkChannel).WithMany(p => p.GuildAfkChannels).HasConstraintName("FK_guild_afk_channel_id");

            entity.HasOne(d => d.Owner).WithMany(p => p.Guilds).HasConstraintName("FK_guild_owner_id");

            entity.HasOne(d => d.PublicUpdatesChannel).WithMany(p => p.GuildPublicUpdatesChannels).HasConstraintName("FK_guild_public_updates_channel_id");

            entity.HasOne(d => d.RulesChannel).WithMany(p => p.GuildRulesChannels).HasConstraintName("FK_guild_rules_channel_id");

            entity.HasOne(d => d.SystemChannel).WithMany(p => p.GuildSystemChannels).HasConstraintName("FK_guild_system_channel_id");

            entity.HasOne(d => d.Template).WithMany(p => p.Guilds).HasConstraintName("FK_guild_template_id");

            entity.HasOne(d => d.WidgetChannel).WithMany(p => p.GuildWidgetChannels).HasConstraintName("FK_guild_widget_channel_id");
        });

        modelBuilder.Entity<InstanceBan>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_3aa6e80a6d325601054892b1340");

            entity.HasIndex(e => e.Fingerprint, "IDX_instance_ban_fingerprint").HasMethod("hash");

            entity.HasIndex(e => e.IpAddress, "IDX_instance_ban_ip_address").HasMethod("hash");

            entity.HasIndex(e => e.UserId, "IDX_instance_ban_user_id").HasMethod("hash");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.OriginInstanceBan).WithOne(p => p.InverseOriginInstanceBan)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_origin_instance_ban_id");
        });

        modelBuilder.Entity<Invite>(entity =>
        {
            entity.HasKey(e => e.Code).HasName("PK_33fd8a248db1cd832baa8aa25bf");

            entity.HasOne(d => d.Channel).WithMany(p => p.Invites)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_invite_channel_id");

            entity.HasOne(d => d.Guild).WithMany(p => p.Invites)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_invite_guild_id");

            entity.HasOne(d => d.Inviter).WithMany(p => p.InviteInviters)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_invite_inviter_id");

            entity.HasOne(d => d.TargetUser).WithMany(p => p.InviteTargetUsers)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_invite_target_user_id");
        });

        modelBuilder.Entity<Member>(entity =>
        {
            entity.HasKey(e => e.Index).HasName("PK_b4a6b8c2478e5df990909c6cf6a");

            entity.HasOne(d => d.Guild).WithMany(p => p.Members).HasConstraintName("FK_member_guild_id");

            entity.HasOne(d => d.IdNavigation).WithMany(p => p.Members).HasConstraintName("FK_member_user_id");

            entity.HasMany(d => d.Roles).WithMany(p => p.Indices)
                .UsingEntity<Dictionary<string, object>>(
                    "MemberRole",
                    r => r.HasOne<Role>().WithMany()
                        .HasForeignKey("RoleId")
                        .HasConstraintName("FK_member_role_role_id"),
                    l => l.HasOne<Member>().WithMany()
                        .HasForeignKey("Index")
                        .HasConstraintName("FK_member_role_member_index"),
                    j =>
                    {
                        j.HasKey("Index", "RoleId").HasName("PK_951c1d72a0fd1da8760b4a1fd66");
                        j.ToTable("member_roles");
                        j.HasIndex(new[] { "Index" }, "IDX_5d7ddc8a5f9c167f548625e772");
                        j.HasIndex(new[] { "RoleId" }, "IDX_e9080e7a7997a0170026d5139c");
                        j.IndexerProperty<int>("Index").HasColumnName("index");
                        j.IndexerProperty<long>("RoleId").HasColumnName("role_id");
                    });
        });

        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_18325f38ae6de43878487eff986");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.MessageSnapshots).HasDefaultValueSql("'[]'::jsonb");
            entity.Property(e => e.Timestamp).HasDefaultValueSql("now()");

            entity.HasOne(d => d.Application).WithMany(p => p.Messages).HasConstraintName("FK_message_application_id");

            entity.HasOne(d => d.Author).WithMany(p => p.MessageAuthors)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_message_author_id");

            entity.HasOne(d => d.Channel).WithMany(p => p.MessageChannels)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_message_channel_id");

            entity.HasOne(d => d.Guild).WithMany(p => p.Messages)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_message_guild_id");

            entity.HasOne(d => d.Member).WithMany(p => p.MessageMembers)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_message_member_id");

            entity.HasOne(d => d.MessageReferenceNavigation).WithMany(p => p.InverseMessageReferenceNavigation)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_message_message_reference_id");

            entity.HasOne(d => d.Thread).WithMany(p => p.MessageThreads)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_message_thread_id");

            entity.HasOne(d => d.Webhook).WithMany(p => p.Messages).HasConstraintName("FK_message_webhook_id");

            entity.HasMany(d => d.Channels).WithMany(p => p.Messages)
                .UsingEntity<Dictionary<string, object>>(
                    "MessageChannelMention",
                    r => r.HasOne<Channel>().WithMany()
                        .HasForeignKey("ChannelId")
                        .HasConstraintName("FK_message_channel_mentions_channel_id"),
                    l => l.HasOne<Message>().WithMany()
                        .HasForeignKey("MessageId")
                        .HasConstraintName("FK_message_channel_mentions_message_id"),
                    j =>
                    {
                        j.HasKey("MessageId", "ChannelId").HasName("PK_85cb45351497cd9d06a79ced65e");
                        j.ToTable("message_channel_mentions");
                        j.HasIndex(new[] { "ChannelId" }, "IDX_32f530caa79d0e7d295eb59f62");
                        j.HasIndex(new[] { "MessageId" }, "IDX_900f52a6d0f53bdcb2e9079017");
                        j.IndexerProperty<long>("MessageId").HasColumnName("message_id");
                        j.IndexerProperty<long>("ChannelId").HasColumnName("channel_id");
                    });

            entity.HasMany(d => d.Roles).WithMany(p => p.Messages)
                .UsingEntity<Dictionary<string, object>>(
                    "MessageRoleMention",
                    r => r.HasOne<Role>().WithMany()
                        .HasForeignKey("RoleId")
                        .HasConstraintName("FK_message_role_mentions_role_id"),
                    l => l.HasOne<Message>().WithMany()
                        .HasForeignKey("MessageId")
                        .HasConstraintName("FK_message_role_mentions_message_id"),
                    j =>
                    {
                        j.HasKey("MessageId", "RoleId").HasName("PK_74dba92cc300452a6e14b83ed44");
                        j.ToTable("message_role_mentions");
                        j.HasIndex(new[] { "MessageId" }, "IDX_30114cbe788f0affbd8b8bf1f1");
                        j.HasIndex(new[] { "RoleId" }, "IDX_ce866308ad8ddf9b6abce06b33");
                        j.IndexerProperty<long>("MessageId").HasColumnName("message_id");
                        j.IndexerProperty<long>("RoleId").HasColumnName("role_id");
                    });

            entity.HasMany(d => d.Stickers).WithMany(p => p.Messages)
                .UsingEntity<Dictionary<string, object>>(
                    "MessageSticker",
                    r => r.HasOne<Sticker>().WithMany()
                        .HasForeignKey("StickerId")
                        .HasConstraintName("FK_message_stickers_sticker_id"),
                    l => l.HasOne<Message>().WithMany()
                        .HasForeignKey("MessageId")
                        .HasConstraintName("FK_message_stickers_message_id"),
                    j =>
                    {
                        j.HasKey("MessageId", "StickerId").HasName("PK_ed820c4093d0b8cd1d2bcf66087");
                        j.ToTable("message_stickers");
                        j.HasIndex(new[] { "StickerId" }, "IDX_2b34e1145cafb79c6c5c193d12");
                        j.HasIndex(new[] { "MessageId" }, "IDX_724f8b11056c706429933bdf87");
                        j.IndexerProperty<long>("MessageId").HasColumnName("message_id");
                        j.IndexerProperty<long>("StickerId").HasColumnName("sticker_id");
                    });

            entity.HasMany(d => d.Users).WithMany(p => p.Messages)
                .UsingEntity<Dictionary<string, object>>(
                    "MessageUserMention",
                    r => r.HasOne<User>().WithMany()
                        .HasForeignKey("UserId")
                        .HasConstraintName("FK_message_mentions_user_id"),
                    l => l.HasOne<Message>().WithMany()
                        .HasForeignKey("MessageId")
                        .HasConstraintName("FK_message_mentions_message_id"),
                    j =>
                    {
                        j.HasKey("MessageId", "UserId").HasName("PK_9b9b6e245ad47a48dbd7605d4fb");
                        j.ToTable("message_user_mentions");
                        j.HasIndex(new[] { "UserId" }, "IDX_16395c9069e88c5f93cd658e9a");
                        j.HasIndex(new[] { "MessageId" }, "IDX_972e8e013af7698f8aa8bc3fc8");
                        j.IndexerProperty<long>("MessageId").HasColumnName("message_id");
                        j.IndexerProperty<long>("UserId").HasColumnName("user_id");
                    });
        });

        modelBuilder.Entity<Migration>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_8c82d7f526340ab734260ea46be");
        });

        modelBuilder.Entity<Note>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_af6206538ea96c4e77e9f400c3d");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.Owner).WithMany(p => p.NoteOwners)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_note_owner_id");

            entity.HasOne(d => d.Target).WithMany(p => p.NoteTargets)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_note_target_id");
        });

        modelBuilder.Entity<RateLimit>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_3b4449f1f5fc167d921ee619f65");

            entity.Property(e => e.Id).ValueGeneratedNever();
        });

        modelBuilder.Entity<ReadState>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_e6956a804978f01b713b1ed58e2");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.Channel).WithMany(p => p.ReadStates).HasConstraintName("FK_read_state_channel_id");

            entity.HasOne(d => d.User).WithMany(p => p.ReadStates).HasConstraintName("FK_read_state_user_id");
        });

        modelBuilder.Entity<Recipient>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_de8fc5a9c364568f294798fe1e9");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.Channel).WithMany(p => p.Recipients).HasConstraintName("FK_recipient_channel_id");

            entity.HasOne(d => d.User).WithMany(p => p.Recipients).HasConstraintName("FK_recipient_user_id");
        });

        modelBuilder.Entity<Relationship>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_ba20e2f5cf487408e08e4dcecaf");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.From).WithMany(p => p.RelationshipFroms).HasConstraintName("FK_relationship_from_id");

            entity.HasOne(d => d.To).WithMany(p => p.RelationshipTos).HasConstraintName("FK_relationship_to_id");
        });

        modelBuilder.Entity<ReportMenu>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_1b5d649a189d57579d558ace79f");

            entity.Property(e => e.Id).ValueGeneratedNever();
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_c1433d71a4838793a49dcad46ab");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.Guild).WithMany(p => p.Roles).HasConstraintName("FK_role_guild_id");
        });

        modelBuilder.Entity<SecurityKey>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_6e95cdd91779e7cca06d1fff89c");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.User).WithMany(p => p.SecurityKeys)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_security_key_user_id");
        });

        modelBuilder.Entity<SecuritySetting>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_4aec436cf81177ae97a1bcec3c7");

            entity.Property(e => e.Id).ValueGeneratedNever();
        });

        modelBuilder.Entity<Session>(entity =>
        {
            entity.HasKey(e => e.SessionId).HasName("PK_9340188c93349808f10d1db74a8");

            entity.Property(e => e.Activities).HasDefaultValueSql("'[]'::jsonb");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.User).WithMany(p => p.Sessions).HasConstraintName("FK_session_user_id");
        });

        modelBuilder.Entity<Sticker>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_e1dafa4063a5532645cc2810374");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.Guild).WithMany(p => p.Stickers)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_sticker_guild_id");

            entity.HasOne(d => d.Pack).WithMany(p => p.Stickers)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_sticker_pack_id");

            entity.HasOne(d => d.User).WithMany(p => p.Stickers)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_sticker_user_id");
        });

        modelBuilder.Entity<StickerPack>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_a27381efea0f876f5d3233af655");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.CoverStickerId1Navigation).WithMany(p => p.StickerPacks).HasConstraintName("FK_sticker_pack_cover_sticker_id");
        });

        modelBuilder.Entity<Stream>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_40440b6f569ebc02bc71c25c499");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.Channel).WithMany(p => p.Streams).HasConstraintName("FK_stream_channel_id");

            entity.HasOne(d => d.Owner).WithMany(p => p.Streams).HasConstraintName("FK_stream_owner_id");
        });

        modelBuilder.Entity<StreamSession>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_49bdc3f66394c12478f8371c546");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.Stream).WithMany(p => p.StreamSessions).HasConstraintName("FK_stream_session_stream_id");

            entity.HasOne(d => d.User).WithMany(p => p.StreamSessions).HasConstraintName("FK_stream_session_user_id");
        });

        modelBuilder.Entity<Tag>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_e7dc17249a1148a1970748eda99");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.Channel).WithMany(p => p.Tags).HasConstraintName("FK_tag_channel_id");
        });

        modelBuilder.Entity<Team>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_7e5523774a38b08a6236d322403");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.OwnerUser).WithMany(p => p.Teams).HasConstraintName("FK_team_owner_user_id");
        });

        modelBuilder.Entity<TeamMember>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_ca3eae89dcf20c9fd95bf7460aa");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.Team).WithMany(p => p.TeamMembers)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_team_member_team_id");

            entity.HasOne(d => d.User).WithMany(p => p.TeamMembers)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_team_member_user_id");
        });

        modelBuilder.Entity<Template>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_515948649ce0bbbe391de702ae5");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.Creator).WithMany(p => p.Templates).HasConstraintName("FK_template_creator_id");

            entity.HasOne(d => d.SourceGuild).WithMany(p => p.Templates)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_template_source_guild_id");
        });

        modelBuilder.Entity<ThreadMember>(entity =>
        {
            entity.HasKey(e => e.Index).HasName("PK_22232a9f7a08fb9967a9c78da53");

            entity.HasOne(d => d.IdNavigation).WithMany(p => p.ThreadMembers).HasConstraintName("FK_thread_member_channel_id");

            entity.HasOne(d => d.MemberIdxNavigation).WithMany(p => p.ThreadMembers).HasConstraintName("FK_thread_member_member_id");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_a3ffb1c0c8416b9fc6f907b7433");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.SettingsIndexNavigation).WithOne(p => p.User).HasConstraintName("FK_user_settings_index");
        });

        modelBuilder.Entity<UserSetting>(entity =>
        {
            entity.HasKey(e => e.Index).HasName("PK_e81f8bb92802737337d35c00981");
        });

        modelBuilder.Entity<UserSettingsProto>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK_8ff3d1961a48b693810c9f99853");

            entity.Property(e => e.UserId).ValueGeneratedNever();

            entity.HasOne(d => d.User).WithOne(p => p.UserSettingsProto)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_user_settings_proto_user_id");
        });

        modelBuilder.Entity<ValidRegistrationToken>(entity =>
        {
            entity.HasKey(e => e.Token).HasName("PK_e0f5c8e3fcefe3134a092c50485");
        });

        modelBuilder.Entity<VoiceState>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_ada09a50c134fad1369b510e3ce");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.Channel).WithMany(p => p.VoiceStates)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_voice_state_channel_id");

            entity.HasOne(d => d.Guild).WithMany(p => p.VoiceStates)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_voice_state_guild_id");

            entity.HasOne(d => d.User).WithMany(p => p.VoiceStates)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_voice_state_user_id");
        });

        modelBuilder.Entity<Webhook>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_9e8795cfc899ab7bdaa831e8527");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.Application).WithMany(p => p.Webhooks)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_webhook_application_id");

            entity.HasOne(d => d.Channel).WithMany(p => p.WebhookChannels)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_webhook_channel_id");

            entity.HasOne(d => d.Guild).WithMany(p => p.WebhookGuilds)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_webhook_guild_id");

            entity.HasOne(d => d.SourceChannel).WithMany(p => p.WebhookSourceChannels)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_webhook_source_channel_id");

            entity.HasOne(d => d.SourceGuild).WithMany(p => p.WebhookSourceGuilds)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_webhook_source_guild_id");

            entity.HasOne(d => d.User).WithMany(p => p.Webhooks)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_webhook_user_id");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
