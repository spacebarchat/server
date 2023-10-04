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

	public async down(): Promise<void> {
		// don't care actually, sorry.
	}
}
