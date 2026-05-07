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

import { MigrationInterface, QueryRunner } from "typeorm";

export class webauthn1675044825710 implements MigrationInterface {
    name = "webauthn1675044825710";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DO $$
            DECLARE
                users_id_type text;
            BEGIN
                SELECT format_type(a.atttypid, a.atttypmod)
                INTO users_id_type
                FROM pg_attribute a
                WHERE a.attrelid = '"users"'::regclass
                AND a.attname = 'id'
                AND NOT a.attisdropped;

                IF users_id_type IS NULL THEN
                    RAISE EXCEPTION 'users.id column does not exist';
                END IF;

                IF to_regclass('security_keys') IS NULL THEN
                    EXECUTE format(
                        'CREATE TABLE "security_keys" ("id" %s NOT NULL, "user_id" %s, "key_id" character varying NOT NULL, "public_key" character varying NOT NULL, "counter" integer NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_6e95cdd91779e7cca06d1fff89c" PRIMARY KEY ("id"))',
                        users_id_type,
                        users_id_type
                    );
                ELSE
                    ALTER TABLE "security_keys" DROP CONSTRAINT IF EXISTS "FK_24c97d0771cafedce6d7163eaad";

                    IF NOT EXISTS (
                        SELECT 1
                        FROM pg_attribute
                        WHERE attrelid = '"security_keys"'::regclass
                        AND attname = 'id'
                        AND NOT attisdropped
                    ) THEN
                        EXECUTE format('ALTER TABLE "security_keys" ADD COLUMN "id" %s', users_id_type);
                    END IF;

                    IF NOT EXISTS (
                        SELECT 1
                        FROM pg_attribute
                        WHERE attrelid = '"security_keys"'::regclass
                        AND attname = 'user_id'
                        AND NOT attisdropped
                    ) THEN
                        EXECUTE format('ALTER TABLE "security_keys" ADD COLUMN "user_id" %s', users_id_type);
                    END IF;

                    IF EXISTS (
                        SELECT 1
                        FROM pg_attribute
                        WHERE attrelid = '"security_keys"'::regclass
                        AND attname = 'id'
                        AND NOT attisdropped
                        AND format_type(atttypid, atttypmod) <> users_id_type
                    ) THEN
                        EXECUTE format('ALTER TABLE "security_keys" ALTER COLUMN "id" TYPE %s USING "id"::text::%s', users_id_type, users_id_type);
                    END IF;

                    IF EXISTS (
                        SELECT 1
                        FROM pg_attribute
                        WHERE attrelid = '"security_keys"'::regclass
                        AND attname = 'user_id'
                        AND NOT attisdropped
                        AND format_type(atttypid, atttypmod) <> users_id_type
                    ) THEN
                        EXECUTE format('ALTER TABLE "security_keys" ALTER COLUMN "user_id" TYPE %s USING "user_id"::text::%s', users_id_type, users_id_type);
                    END IF;

                    IF NOT EXISTS (
                        SELECT 1
                        FROM pg_constraint
                        WHERE conrelid = '"security_keys"'::regclass
                        AND contype = 'p'
                    ) THEN
                        ALTER TABLE "security_keys" ADD CONSTRAINT "PK_6e95cdd91779e7cca06d1fff89c" PRIMARY KEY ("id");
                    END IF;
                END IF;
            END $$;`,
        );
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "webauthn_enabled" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(
            `DO $$ BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_constraint
                    WHERE conname = 'FK_24c97d0771cafedce6d7163eaad'
                    AND conrelid = '"security_keys"'::regclass
                ) THEN
                    ALTER TABLE "security_keys" ADD CONSTRAINT "FK_24c97d0771cafedce6d7163eaad" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
                END IF;
            END $$;`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DO $$ BEGIN
                IF to_regclass('security_keys') IS NOT NULL THEN
                    ALTER TABLE "security_keys" DROP CONSTRAINT IF EXISTS "FK_24c97d0771cafedce6d7163eaad";
                END IF;
            END $$;`,
        );
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "webauthn_enabled"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "security_keys"`);
    }
}
