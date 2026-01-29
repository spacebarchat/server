/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2025 Spacebar and Spacebar Contributors

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

import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { BaseClassWithoutId, PrimaryIdColumn } from "./BaseClass";
import { User } from "./User";
import {
    FrecencyUserSettings,
    PreloadedUserSettings,
    PreloadedUserSettings_AppearanceSettings,
    PreloadedUserSettings_CustomStatus,
    PreloadedUserSettings_LaunchPadMode,
    PreloadedUserSettings_PrivacySettings,
    PreloadedUserSettings_StatusSettings,
    PreloadedUserSettings_SwipeRightToLeftMode,
    PreloadedUserSettings_TextAndImagesSettings,
    PreloadedUserSettings_Theme,
    PreloadedUserSettings_TimestampHourCycle,
    PreloadedUserSettings_UIDensity,
    PreloadedUserSettings_VoiceAndVideoSettings,
} from "discord-protos";
import { BoolValue, UInt32Value } from "discord-protos/dist/discord_protos/google/protobuf/wrappers";

@Entity({
    name: "user_settings_protos",
})
export class UserSettingsProtos extends BaseClassWithoutId {
    @OneToOne(() => User, {
        cascade: true,
        orphanedRowAction: "delete",
        eager: false,
    })
    @JoinColumn({ name: "user_id" })
    user: User;

    @PrimaryIdColumn({ type: "text" })
    user_id: string;

    @Column({ nullable: true, type: String, name: "userSettings" })
    _userSettings: string | undefined;

    @Column({ nullable: true, type: String, name: "frecencySettings" })
    _frecencySettings: string | undefined;

    // @Column({nullable: true, type: "simple-json"})
    // testSettings: {};

    get userSettings(): PreloadedUserSettings | undefined {
        if (!this._userSettings) return undefined;
        return PreloadedUserSettings.fromJsonString(this._userSettings);
    }

    set userSettings(value: PreloadedUserSettings | undefined) {
        if (value) {
            this._userSettings = PreloadedUserSettings.toJsonString(value);
        } else {
            this._userSettings = undefined;
        }
    }

    get frecencySettings(): FrecencyUserSettings | undefined {
        if (!this._frecencySettings) return undefined;
        return FrecencyUserSettings.fromJsonString(this._frecencySettings);
    }

    set frecencySettings(value: FrecencyUserSettings | undefined) {
        if (value) {
            this._frecencySettings = FrecencyUserSettings.toJsonString(value);
        } else {
            this._frecencySettings = undefined;
        }
    }

    static async getOrCreate(user_id: string, save: boolean = false): Promise<UserSettingsProtos> {
        if (!(await User.existsBy({ id: user_id }))) throw new Error(`User with ID ${user_id} does not exist.`);

        let userSettings = await UserSettingsProtos.findOne({
            where: { user_id },
        });

        let modified = false;
        let isNewSettings = false;
        if (!userSettings) {
            userSettings = UserSettingsProtos.create({
                user_id,
            });
            modified = true;
            isNewSettings = true;
        }

        if (!userSettings.userSettings) {
            userSettings.userSettings = PreloadedUserSettings.create({
                ads: {
                    alwaysDeliver: false,
                },
                appearance: {
                    developerMode: user.settings?.developer_mode ?? true,
                    theme: PreloadedUserSettings_Theme.DARK,
                    mobileRedesignDisabled: true,
                    launchPadMode: PreloadedUserSettings_LaunchPadMode.LAUNCH_PAD_DISABLED,
                    swipeRightToLeftMode: PreloadedUserSettings_SwipeRightToLeftMode.SWIPE_RIGHT_TO_LEFT_REPLY,
                    timestampHourCycle: PreloadedUserSettings_TimestampHourCycle.AUTO,
                    uiDensity: PreloadedUserSettings_UIDensity.UI_DENSITY_COMPACT,
                },
                versions: {
                    dataVersion: 0,
                    clientVersion: 0,
                    serverVersion: 0,
                },
            });
            modified = true;
        }

        if (!userSettings.frecencySettings) {
            userSettings.frecencySettings = FrecencyUserSettings.create({
                versions: {
                    dataVersion: 0,
                    clientVersion: 0,
                    serverVersion: 0,
                },
            });
            modified = true;
        }

        if (isNewSettings) userSettings = await this.importLegacySettings(user_id, userSettings);

        if (modified && save) userSettings = await userSettings.save();

        return userSettings;
    }

    static async importLegacySettings(user_id: string, settings: UserSettingsProtos): Promise<UserSettingsProtos> {
        const user = await User.findOneOrFail({
            where: { id: user_id },
            select: { settings: true },
        });
        if (!user) throw new Error(`User with ID ${user_id} does not exist.`);

        const legacySettings = user.settings;
        const { frecencySettings, userSettings } = settings;

        if (userSettings === undefined) {
            throw new Error("UserSettingsProtos.userSettings is undefined, this should not happen.");
        }
        if (frecencySettings === undefined) {
            throw new Error("UserSettingsProtos.frecencySettings is undefined, this should not happen.");
        }

        if (legacySettings) {
            if (legacySettings.afk_timeout !== null && legacySettings.afk_timeout !== undefined) {
                userSettings.voiceAndVideo ??= PreloadedUserSettings_VoiceAndVideoSettings.create();
                userSettings.voiceAndVideo.afkTimeout = UInt32Value.fromJson(legacySettings.afk_timeout);
            }

            if (legacySettings.allow_accessibility_detection !== null && legacySettings.allow_accessibility_detection !== undefined) {
                userSettings.privacy ??= PreloadedUserSettings_PrivacySettings.create();
                userSettings.privacy.allowAccessibilityDetection = legacySettings.allow_accessibility_detection;
            }

            if (legacySettings.animate_emoji !== null && legacySettings.animate_emoji !== undefined) {
                userSettings.textAndImages ??= PreloadedUserSettings_TextAndImagesSettings.create();
                userSettings.textAndImages.animateEmoji = BoolValue.fromJson(legacySettings.animate_emoji);
            }

            if (legacySettings.animate_stickers !== null && legacySettings.animate_stickers !== undefined) {
                userSettings.textAndImages ??= PreloadedUserSettings_TextAndImagesSettings.create();
                userSettings.textAndImages.animateStickers = UInt32Value.fromJson(legacySettings.animate_stickers);
            }

            if (legacySettings.contact_sync_enabled !== null && legacySettings.contact_sync_enabled !== undefined) {
                userSettings.privacy ??= PreloadedUserSettings_PrivacySettings.create();
                userSettings.privacy.contactSyncEnabled = BoolValue.fromJson(legacySettings.contact_sync_enabled);
            }

            if (legacySettings.convert_emoticons !== null && legacySettings.convert_emoticons !== undefined) {
                userSettings.textAndImages ??= PreloadedUserSettings_TextAndImagesSettings.create();
                userSettings.textAndImages.convertEmoticons = BoolValue.fromJson(legacySettings.convert_emoticons);
            }

            if (legacySettings.custom_status !== null && legacySettings.custom_status !== undefined) {
                userSettings.status ??= PreloadedUserSettings_StatusSettings.create();
                userSettings.status.customStatus = PreloadedUserSettings_CustomStatus.create({
                    emojiId: legacySettings.custom_status.emoji_id === undefined ? undefined : (BigInt(legacySettings.custom_status.emoji_id) as bigint),
                    emojiName: legacySettings.custom_status.emoji_name,
                    expiresAtMs: legacySettings.custom_status.expires_at === undefined ? undefined : (BigInt(legacySettings.custom_status.expires_at) as bigint),
                    text: legacySettings.custom_status.text,
                    createdAtMs: BigInt(Date.now()) as bigint,
                });
            }
        }

        return settings;
    }
}
