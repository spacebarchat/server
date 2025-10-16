// import { MigrationInterface, QueryRunner } from "typeorm";
//
// export class ApplicationCommands1760622755598 implements MigrationInterface {
//     name = 'ApplicationCommands1760622755598'
//
//     public async up(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.query(`ALTER TABLE "webhooks" DROP CONSTRAINT "fk_d64f38834fa676f6caa4786ddd6"`);
//         await queryRunner.query(`ALTER TABLE "webhooks" DROP COLUMN "source_channel_id"`);
//         await queryRunner.query(`ALTER TABLE "webhooks" ADD "source_channel_id" character varying`);
//         await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "username"`);
//         await queryRunner.query(`ALTER TABLE "messages" ADD "username" character varying`);
//         await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "avatar"`);
//         await queryRunner.query(`ALTER TABLE "messages" ADD "avatar" character varying`);
//         await queryRunner.query(`ALTER TABLE "channels" ALTER COLUMN "default_thread_rate_limit_per_user" DROP NOT NULL`);
//         await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "client_status" SET NOT NULL`);
//         await queryRunner.query(`ALTER TABLE "user_settings" ALTER COLUMN "friend_discovery_flags" DROP DEFAULT`);
//         await queryRunner.query(`ALTER TABLE "user_settings" ALTER COLUMN "view_nsfw_guilds" DROP DEFAULT`);
//         await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "flags"`);
//         await queryRunner.query(`ALTER TABLE "users" ADD "flags" integer NOT NULL`);
//         await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "public_flags"`);
//         await queryRunner.query(`ALTER TABLE "users" ADD "public_flags" integer NOT NULL`);
//         await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "purchased_flags"`);
//         await queryRunner.query(`ALTER TABLE "users" ADD "purchased_flags" integer NOT NULL`);
//         await queryRunner.query(`ALTER TABLE "team_members" DROP COLUMN "role"`);
//         await queryRunner.query(`ALTER TABLE "team_members" ADD "role" character varying NOT NULL`);
//         await queryRunner.query(`ALTER TABLE "applications" DROP COLUMN "guild_id"`);
//         await queryRunner.query(`ALTER TABLE "applications" ADD "guild_id" character varying`);
//         await queryRunner.query(`ALTER TABLE "applications" DROP COLUMN "custom_install_url"`);
//         await queryRunner.query(`ALTER TABLE "applications" ADD "custom_install_url" character varying`);
//         await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "icon"`);
//         await queryRunner.query(`ALTER TABLE "categories" ADD "icon" character varying`);
//         await queryRunner.query(`ALTER TABLE "user_settings_protos" DROP COLUMN "userSettings"`);
//         await queryRunner.query(`ALTER TABLE "user_settings_protos" ADD "userSettings" character varying`);
//         await queryRunner.query(`ALTER TABLE "user_settings_protos" DROP COLUMN "frecencySettings"`);
//         await queryRunner.query(`ALTER TABLE "user_settings_protos" ADD "frecencySettings" character varying`);
//         await queryRunner.query(`ALTER TABLE "webhooks" ADD CONSTRAINT "FK_4495b7032a33c6b8b605d030398" FOREIGN KEY ("source_channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
//         await queryRunner.query(`ALTER TABLE "applications" ADD CONSTRAINT "FK_e5bf78cdbbe9ba91062d74c5aba" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
//     }
//
//     public async down(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.query(`ALTER TABLE "applications" DROP CONSTRAINT "FK_e5bf78cdbbe9ba91062d74c5aba"`);
//         await queryRunner.query(`ALTER TABLE "webhooks" DROP CONSTRAINT "FK_4495b7032a33c6b8b605d030398"`);
//         await queryRunner.query(`ALTER TABLE "user_settings_protos" DROP COLUMN "frecencySettings"`);
//         await queryRunner.query(`ALTER TABLE "user_settings_protos" ADD "frecencySettings" text`);
//         await queryRunner.query(`ALTER TABLE "user_settings_protos" DROP COLUMN "userSettings"`);
//         await queryRunner.query(`ALTER TABLE "user_settings_protos" ADD "userSettings" text`);
//         await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "icon"`);
//         await queryRunner.query(`ALTER TABLE "categories" ADD "icon" text`);
//         await queryRunner.query(`ALTER TABLE "applications" DROP COLUMN "custom_install_url"`);
//         await queryRunner.query(`ALTER TABLE "applications" ADD "custom_install_url" text`);
//         await queryRunner.query(`ALTER TABLE "applications" DROP COLUMN "guild_id"`);
//         await queryRunner.query(`ALTER TABLE "applications" ADD "guild_id" text`);
//         await queryRunner.query(`ALTER TABLE "team_members" DROP COLUMN "role"`);
//         await queryRunner.query(`ALTER TABLE "team_members" ADD "role" text NOT NULL`);
//         await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "purchased_flags"`);
//         await queryRunner.query(`ALTER TABLE "users" ADD "purchased_flags" bigint NOT NULL`);
//         await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "public_flags"`);
//         await queryRunner.query(`ALTER TABLE "users" ADD "public_flags" bigint NOT NULL`);
//         await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "flags"`);
//         await queryRunner.query(`ALTER TABLE "users" ADD "flags" bigint NOT NULL`);
//         await queryRunner.query(`ALTER TABLE "user_settings" ALTER COLUMN "view_nsfw_guilds" SET DEFAULT true`);
//         await queryRunner.query(`ALTER TABLE "user_settings" ALTER COLUMN "friend_discovery_flags" SET DEFAULT '0'`);
//         await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "client_status" DROP NOT NULL`);
//         await queryRunner.query(`ALTER TABLE "channels" ALTER COLUMN "default_thread_rate_limit_per_user" SET NOT NULL`);
//         await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "avatar"`);
//         await queryRunner.query(`ALTER TABLE "messages" ADD "avatar" text`);
//         await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "username"`);
//         await queryRunner.query(`ALTER TABLE "messages" ADD "username" text`);
//         await queryRunner.query(`ALTER TABLE "webhooks" DROP COLUMN "source_channel_id"`);
//         await queryRunner.query(`ALTER TABLE "webhooks" ADD "source_channel_id" character varying(255) DEFAULT NULL`);
//         await queryRunner.query(`ALTER TABLE "webhooks" ADD CONSTRAINT "fk_d64f38834fa676f6caa4786ddd6" FOREIGN KEY ("source_channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
//     }
//
// }
