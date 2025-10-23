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
import { emitEvent, EnvConfig, OrmUtils, UserSettingsProtos } from "@spacebar/util";
import { FrecencyUserSettings } from "discord-protos";
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
	}),
	async (req: Request, res: Response) => {
		const userSettings = await UserSettingsProtos.getOrDefault(req.user_id);

		res.json({
			settings: FrecencyUserSettings.toBase64(userSettings.frecencySettings!),
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
	}),
	async (req: Request, res: Response) => {
		const { settings, required_data_version } = req.body as SettingsProtoUpdateSchema;
		const { atomic } = req.query;
		const updatedSettings = FrecencyUserSettings.fromBase64(settings);

		const resultObj = await patchUserSettings(req.user_id, updatedSettings, required_data_version, atomic == "true");

		res.json({
			settings: FrecencyUserSettings.toBase64(resultObj.settings),
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
	}),
	async (req: Request, res: Response) => {
		const userSettings = await UserSettingsProtos.getOrDefault(req.user_id);

		res.json({
			settings: FrecencyUserSettings.toJson(userSettings.frecencySettings!),
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
	}),
	async (req: Request, res: Response) => {
		const { settings, required_data_version } = req.body as SettingsProtoUpdateJsonSchema;
		const { atomic } = req.query;
		const updatedSettings = FrecencyUserSettings.fromJson(settings);

		const resultObj = await patchUserSettings(req.user_id, updatedSettings, required_data_version, atomic == "true");

		res.json({
			settings: FrecencyUserSettings.toJson(resultObj.settings),
			out_of_date: resultObj.out_of_date,
		});
	},
);

//#endregion

async function patchUserSettings(userId: string, updatedSettings: FrecencyUserSettings, required_data_version: number | undefined, atomic: boolean = false) {
	const userSettings = await UserSettingsProtos.getOrDefault(userId);
	let settings = userSettings.frecencySettings!;

	if (required_data_version && settings.versions && settings.versions.dataVersion > required_data_version) {
		return {
			settings: settings,
			out_of_date: true,
		};
	}

	if (EnvConfig.get().logging.logProtoUpdates.includes("FRECENCY"))
		console.log(`Updating frecency settings for user ${userId} with atomic=${atomic}:`, updatedSettings);

	if (!atomic) {
		settings = FrecencyUserSettings.fromJson(
			Object.assign(FrecencyUserSettings.toJson(settings) as object, FrecencyUserSettings.toJson(updatedSettings) as object) as JsonValue,
		);
	} else {
		settings = FrecencyUserSettings.fromJson(
			OrmUtils.mergeDeep(FrecencyUserSettings.toJson(settings) as object, FrecencyUserSettings.toJson(updatedSettings) as object) as JsonValue,
		);
	}

	settings.versions = {
		clientVersion: updatedSettings.versions?.clientVersion ?? settings.versions?.clientVersion ?? 0,
		serverVersion: settings.versions?.serverVersion ?? 0,
		dataVersion: (settings.versions?.dataVersion ?? 0) + 1,
	};
	userSettings.frecencySettings = settings;
	await userSettings.save();

	await emitEvent({
		user_id: userId,
		event: "USER_SETTINGS_PROTO_UPDATE",
		data: {
			settings: {
				proto: FrecencyUserSettings.toBase64(settings),
				type: 2,
			},
			json_settings: {
				proto: FrecencyUserSettings.toJson(settings),
				type: "frecency_settings",
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
