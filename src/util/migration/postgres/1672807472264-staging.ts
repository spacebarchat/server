import { MigrationInterface, QueryRunner, Table, TableColumn } from "typeorm";

export class staging1672807472264 implements MigrationInterface {
	name = 'staging1672807472264';

	public async up(queryRunner: QueryRunner): Promise<void> {
		// Channel entity
		const channel = await queryRunner.getTable("channels") as Table;
		await queryRunner.changeColumns(channel.name, [
			{ oldColumn: channel.findColumnByName("nsfw")!, newColumn: new TableColumn({ name: "nsfw", isNullable: false, type: "bool" }) },
			{ oldColumn: channel.findColumnByName("flags")!, newColumn: new TableColumn({ name: "flags", isNullable: false, type: "int4" }) },
			{
				oldColumn: channel.findColumnByName("default_thread_rate_limit_per_user")!,
				newColumn: new TableColumn({ name: "default_thread_rate_limit_per_user", isNullable: false, type: "int4" })
			},
		]);

		// ClientRelease entity
		const clientRelease = await queryRunner.getTable("client_release") as Table;
		await queryRunner.changeColumn(
			clientRelease.name,
			clientRelease.findColumnByName("pub_date")!,
			new TableColumn({ name: "pub_date", type: "timestamp" })
		);
		await queryRunner.dropColumns(clientRelease.name, ["deb_url", "osx_url", "win_url"]);
		await queryRunner.addColumns(clientRelease.name, [
			new TableColumn({ name: "platform", type: "varchar" }),
			new TableColumn({ name: "enabled", type: "bool" })
		]);

		// EmbedCache entity
		await queryRunner.createTable(new Table({
			name: "embed_cache",
			columns: [
				new TableColumn({ name: "url", type: "varchar" }),
				new TableColumn({ name: "embed", type: "text" }),
			]
		}));

		// SecuritySettings entity
		const securitySettings = await queryRunner.getTable("security_settings");
		if (securitySettings)
			await queryRunner.changeColumns(securitySettings.name, [
				{ oldColumn: securitySettings.findColumnByName("guild_id")!, newColumn: new TableColumn({ name: "guild_id", type: "varchar" }) },
				{ oldColumn: securitySettings.findColumnByName("channel_id")!, newColumn: new TableColumn({ name: "channel_id", type: "varchar" }) },
				{ oldColumn: securitySettings.findColumnByName("encryption_permission_mask")!, newColumn: new TableColumn({ name: "encryption_permission_mask", type: "int4" }) },
				{ oldColumn: securitySettings.findColumnByName("allowed_algorithms")!, newColumn: new TableColumn({ name: "allowed_algorithms", type: "varchar" }) },
				{ oldColumn: securitySettings.findColumnByName("used_since_message")!, newColumn: new TableColumn({ name: "used_since_message", type: "varchar" }) },
			]);

		await queryRunner.dropTable("groups", true);

		// Guild entity
		const guild = await queryRunner.getTable("guilds") as Table;
		await queryRunner.changeColumns(guild.name, [
			{ oldColumn: guild.findColumnByName("primary_category_id")!, newColumn: new TableColumn({ name: "primary_category_id", type: "varchar" }) },
			{ oldColumn: guild.findColumnByName("large")!, newColumn: new TableColumn({ name: "large", type: "bool", isNullable: false }) },
			{ oldColumn: guild.findColumnByName("premium_tier")!, newColumn: new TableColumn({ name: "premium_tier", type: "int4", isNullable: false }) },
			{ oldColumn: guild.findColumnByName("unavailable")!, newColumn: new TableColumn({ name: "unavailable", type: "int4", isNullable: false }) },
			{ oldColumn: guild.findColumnByName("widget_enabled")!, newColumn: new TableColumn({ name: "widget_enabled", type: "int4", isNullable: false }) },
			{ oldColumn: guild.findColumnByName("nsfw")!, newColumn: new TableColumn({ name: "nsfw", type: "int4", isNullable: false }) },
		]);

		// Member entity
		const member = await queryRunner.getTable("members") as Table;
		await queryRunner.changeColumns(member.name, [
			{ oldColumn: member.findColumnByName("premium_since")!, newColumn: new TableColumn({ name: "premium_since", type: "bigint" }) },
		]);

		// User entity
		const user = await queryRunner.getTable("users") as Table;
		await queryRunner.changeColumns(user.name, [
			{ oldColumn: user.findColumnByName("bio")!, newColumn: new TableColumn({ name: "bio", type: "varchar", isNullable: false }) },
			{ oldColumn: user.findColumnByName("mfa_enabled")!, newColumn: new TableColumn({ name: "mfa_enabled", type: "bool", isNullable: false }) },
		]);
		await queryRunner.addColumns(user.name, [
			new TableColumn({ name: "purchased_flags", type: "int4" }),
			new TableColumn({ name: "premium_usage_flags", type: "int4" }),
		]);

		// UserSettings entity
		const userSettings = await queryRunner.getTable("user_settings") as Table;
		await queryRunner.changeColumns(userSettings.name, [
			{ oldColumn: userSettings.findColumnByName("id")!, newColumn: new TableColumn({ name: "index", type: "serial4" }) },
		]);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
	}
}
