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

import { route } from "@spacebar/api";
import { Request, Response, Router } from "express";
import { emitEvent, OrmUtils, UserSettingsProtos } from "@spacebar/util";
import { PreloadedUserSettings } from "discord-protos";
import { JsonValue } from "@protobuf-ts/runtime";
import { SettingsProtoJsonResponse, SettingsProtoResponse, SettingsProtoUpdateJsonSchema, SettingsProtoUpdateSchema } from "@spacebar/schemas";

const router: Router = Router({ mergeParams: true });

//#region Protobuf
router.get(
    "/",
    route({
        responses: {
            200: {
                body: "SettingsProtoResponse",
            },
        },
        query: {
            atomic: {
                type: "boolean",
                description: "Whether to try to apply the settings update atomically (default false)",
            },
        },
        spacebarOnly: false, // maps to /users/@me/settings-proto/1
    }),
    async (req: Request, res: Response) => {
        const userSettings = await UserSettingsProtos.getOrDefault(req.user_id);

        res.json({
            settings: PreloadedUserSettings.toBase64(userSettings.userSettings!),
        } as SettingsProtoResponse);
    },
);

router.patch(
    "/",
    route({
        requestBody: "SettingsProtoUpdateSchema",
        responses: {
            200: {
                body: "SettingsProtoUpdateResponse",
            },
        },
        spacebarOnly: false, // maps to /users/@me/settings-proto/1
    }),
    async (req: Request, res: Response) => {
        const { settings, required_data_version } = req.body as SettingsProtoUpdateSchema;
        const { atomic } = req.query;
        const updatedSettings = PreloadedUserSettings.fromBase64(settings);

        const resultObj = await patchUserSettings(req.user_id, updatedSettings, required_data_version, atomic == "true");

        res.json({
            settings: PreloadedUserSettings.toBase64(resultObj.settings),
            out_of_date: resultObj.out_of_date,
        });
    },
);

//#endregion
//#region JSON
router.get(
    "/json",
    route({
        responses: {
            200: {
                body: "SettingsProtoJsonResponse",
            },
        },
        spacebarOnly: true,
    }),
    async (req: Request, res: Response) => {
        const userSettings = await UserSettingsProtos.getOrDefault(req.user_id);

        res.json({
            settings: PreloadedUserSettings.toJson(userSettings.userSettings!),
        } as SettingsProtoJsonResponse);
    },
);

router.patch(
    "/json",
    route({
        requestBody: "SettingsProtoUpdateJsonSchema",
        responses: {
            200: {
                body: "SettingsProtoUpdateJsonResponse",
            },
        },
        query: {
            atomic: {
                type: "boolean",
                description: "Whether to try to apply the settings update atomically (default false)",
            },
        },
        spacebarOnly: true,
    }),
    async (req: Request, res: Response) => {
        const { settings, required_data_version } = req.body as SettingsProtoUpdateJsonSchema;
        const { atomic } = req.query;
        const updatedSettings = PreloadedUserSettings.fromJson(settings);

        const resultObj = await patchUserSettings(req.user_id, updatedSettings, required_data_version, atomic == "true");

        res.json({
            settings: PreloadedUserSettings.toJson(resultObj.settings),
            out_of_date: resultObj.out_of_date,
        });
    },
);

//#endregion

async function patchUserSettings(userId: string, updatedSettings: PreloadedUserSettings, required_data_version: number | undefined, atomic: boolean = false) {
    const userSettings = await UserSettingsProtos.getOrDefault(userId);
    let settings = userSettings.userSettings!;

    if (required_data_version && settings.versions && settings.versions.dataVersion > required_data_version) {
        return {
            settings: settings,
            out_of_date: true,
        };
    }

    if ((process.env.LOG_PROTO_UPDATES || process.env.LOG_PROTO_SETTINGS_UPDATES) && process.env.LOG_PROTO_SETTINGS_UPDATES !== "false")
        console.log(`Updating user settings for user ${userId} with atomic=${atomic}:`, updatedSettings);

    if (!atomic) {
        settings = PreloadedUserSettings.fromJson(
            Object.assign(PreloadedUserSettings.toJson(settings) as object, PreloadedUserSettings.toJson(updatedSettings) as object) as JsonValue,
        );
    } else {
        settings = PreloadedUserSettings.fromJson(
            OrmUtils.mergeDeep(PreloadedUserSettings.toJson(settings) as object, PreloadedUserSettings.toJson(updatedSettings) as object) as JsonValue,
        );
    }

    settings.versions = {
        clientVersion: updatedSettings.versions?.clientVersion ?? settings.versions?.clientVersion ?? 0,
        serverVersion: settings.versions?.serverVersion ?? 0,
        dataVersion: (settings.versions?.dataVersion ?? 0) + 1,
    };
    userSettings.userSettings = settings;
    await userSettings.save();

    await emitEvent({
        user_id: userId,
        event: "USER_SETTINGS_PROTO_UPDATE",
        data: {
            settings: {
                proto: PreloadedUserSettings.toBase64(settings),
                type: 1,
            },
            json_settings: {
                proto: PreloadedUserSettings.toJson(settings),
                type: "user_settings",
            },
            partial: false, // Unsure how this should behave
        },
    });
    // This should also send a USER_SETTINGS_UPDATE event, but that isn't sent
    // when using the USER_SETTINGS_PROTOS capability, so we ignore it for now.

    return {
        settings: settings,
        out_of_date: false,
    };
}

export default router;
