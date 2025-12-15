import { MigrationInterface, QueryRunner } from "typeorm";

export class guildChannelOrdering1696420827239 implements MigrationInterface {
	name = "guildChannelOrdering1696420827239";

	public async up(queryRunner: QueryRunner): Promise<void> {
		const guilds = await queryRunner.query(
			`SELECT id FROM guilds`,
			undefined,
			true,
		);

		await queryRunner.query(
			`ALTER TABLE guilds ADD channel_ordering text NOT NULL DEFAULT '[]'`,
		);

		for (const guild_id of guilds.records.map((x) => x.id)) {
			const channels: Array<{ position: number; id: string }> = (
				await queryRunner.query(
					`SELECT id, position FROM channels WHERE guild_id = $1`,
					[guild_id],
					true,
				)
			).records;

			channels.sort((a, b) => a.position - b.position);

			await queryRunner.query(
				`UPDATE guilds SET channel_ordering = $1 WHERE id = $2`,
				[JSON.stringify(channels.map((x) => x.id)), guild_id],
			);
		}

		await queryRunner.query(`ALTER TABLE channels DROP COLUMN position`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE channels ADD position integer NOT NULL DEFAULT 0`);

		const guilds = await queryRunner.query(
			`SELECT id, channel_ordering FROM guilds`,
			undefined,
			true,
		);

		for (const guild of guilds.records) {
			const channel_ordering: string[] = JSON.parse(guild.channel_ordering);

			for (let i = 0; i < channel_ordering.length; i++) {
				const channel_id = channel_ordering[i];
				await queryRunner.query(
					`UPDATE channels SET position = $1 WHERE id = $2`,
					[i, channel_id],
				);
			}
		}

		await queryRunner.query(
			`ALTER TABLE guilds DROP COLUMN channel_ordering`,
		);
	}
}
