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

import { route } from "@spacebar/api";
import { ClaimedQuestsResponseSchema, QuestAssignmentMethod, QuestEventType, QuestFeature, QuestPlatformType, QuestRewardType, QuestSharePolicy } from "@spacebar/schemas";
import { QuestsResponseSchema } from "@spacebar/schemas/responses";
import { Request, Response, Router } from "express";
const router = Router({ mergeParams: true });

router.get(
    "/",
    route({
        description: "Returns information on the current quests for the current user.",
        responses: {
            200: {
                body: "QuestsResponseSchema",
            },
        },
    }),
    async (req: Request, res: Response) => {
        // TODO: pull quests from config

        console.debug("GET /quests/@me is incomplete");

        res.json({
            excluded_quests: [],
            quest_enrollment_blocked_until: null,
            quests: [
                {
                    id: "1333839522189938740",
                    config: {
                        id: "1333839522189938740",
                        config_version: 2,
                        starts_at: "2025-07-14T14:00:00+00:00",
                        expires_at: "2099-08-15T23:00:00+00:00",
                        features: [
                            QuestFeature.QUEST_BAR_V2,
                            QuestFeature.REWARD_HIGHLIGHTING,
                            QuestFeature.DISMISSAL_SURVEY,
                            QuestFeature.QUESTS_CDN,
                            QuestFeature.PACING_CONTROLLER,
                        ],
                        application: {
                            link: "https://spacebar.chat",
                            id: "545364944258990091",
                            name: "Spacebar",
                        },
                        colors: {
                            primary: "#5865F2",
                            secondary: "#000000",
                        },
                        assets: {
                            hero: "quests/1333839522189938740/orbs_quest_card_banner_4.jpeg",
                            hero_video: null,
                            quest_bar_hero: "quests/1333839522189938740/orbs_quest_bar.png",
                            quest_bar_hero_video: null,
                            game_tile: "discord_game_tile.png",
                            logotype: "discord_logo.png",
                            game_tile_light: "quests/1333839522189938740/1417603112168067182.png",
                            game_tile_dark: "quests/1333839522189938740/1417603112742551603.png",
                            logotype_light: "quests/1333839522189938740/1417603113304719540.png",
                            logotype_dark: "quests/1333839522189938740/1417603113791131668.png",
                        },
                        messages: {
                            quest_name: "Spacebar Bars Intro",
                            game_title: "Spacebar",
                            game_publisher: "Spacebar",
                        },
                        task_config_v2: {
                            tasks: {
                                [QuestEventType.WATCH_VIDEO]: {
                                    type: QuestEventType.WATCH_VIDEO,
                                    target: 31,
                                    assets: {
                                        video: {
                                            url: "quests/1410358070831480904/1420884840815005717_1080.mp4",
                                            width: 1080,
                                            height: 1920,
                                            thumbnail: "quests/1410358070831480904/1421253196549984267.png",
                                            caption: "quests/1410358070831480904/1410370389451866112.vtt",
                                            transcript: "quests/1410358070831480904/1410370413032374293.txt",
                                        },
                                        video_low_res: {
                                            url: "quests/1410358070831480904/1420884840815005717_720.mp4",
                                            width: 1080,
                                            height: 1920,
                                            thumbnail: "quests/1410358070831480904/1421253196549984267.png",
                                            caption: "quests/1410358070831480904/1410370389451866112.vtt",
                                            transcript: "quests/1410358070831480904/1410370413032374293.txt",
                                        },
                                        video_hls: {
                                            url: "quests/1410358070831480904/1420884840815005717.m3u8",
                                            width: 1080,
                                            height: 1920,
                                            thumbnail: "quests/1410358070831480904/1421253196549984267.png",
                                            caption: "quests/1410358070831480904/1410370389451866112.vtt",
                                            transcript: "quests/1410358070831480904/1410370413032374293.txt",
                                        },
                                    },
                                    messages: {
                                        video_title: "Intro to Spacebar Bars",
                                        // video_end_cta_title: "Learn more about Bars",
                                        // video_end_cta_subtitle: "Head to our Help Center for more information.",
                                    },
                                },
                            },
                            join_operator: "or",
                        },
                        rewards_config: {
                            assignment_method: QuestAssignmentMethod.ALL,
                            rewards: [
                                {
                                    type: QuestRewardType.VIRTUAL_CURRENCY,
                                    sku_id: "1287881739531976815",
                                    messages: {
                                        name: "150 Bars",
                                        name_with_article: "150 Bars",
                                        redemption_instructions_by_platform: {
                                            [QuestPlatformType.CROSS_PLATFORM]: "Default",
                                        },
                                    },
                                    orb_quantity: 150,
                                },
                            ],
                            rewards_expire_at: "2099-02-01T00:00:27+00:00",
                            platforms: [QuestPlatformType.CROSS_PLATFORM],
                        },
                        share_policy: QuestSharePolicy.SHAREABLE_EVERYWHERE,
                        cta_config: {
                            link: "https://spacebar.chat",
                            button_label: "Learn More",
                            subtitle: "Head to our Help Center for more information.",
                        },
                    },
                    // user_status: {
                    //     user_id: "498989696412549120",
                    //     quest_id: "1333839522189938740",
                    //     enrolled_at: "2025-07-14T21:20:04.640772+00:00",
                    //     completed_at: "2025-07-14T21:21:05.941315+00:00",
                    //     claimed_at: "2025-07-14T21:21:26.983570+00:00",
                    //     claimed_tier: null,
                    //     last_stream_heartbeat_at: null,
                    //     stream_progress_seconds: 0,
                    //     dismissed_quest_content: 0,
                    //     progress: {
                    //         WATCH_VIDEO: {
                    //             value: 31,
                    //             event_name: "WATCH_VIDEO",
                    //             updated_at: "2025-07-14T21:21:05.941317+00:00",
                    //             completed_at: "2025-07-14T21:21:05.941315+00:00",
                    //             heartbeat: null,
                    //         },
                    //     },
                    // },
                    user_status: null,
                },
                {
                    id: "1410358070831480904",
                    config: {
                        id: "1410358070831480904",
                        config_version: 2,
                        starts_at: "2025-11-17T16:30:27+00:00",
                        expires_at: "2099-01-02T00:00:27+00:00",
                        features: [
                            QuestFeature.QUEST_BAR_V2,
                            QuestFeature.REWARD_HIGHLIGHTING,
                            QuestFeature.DISMISSAL_SURVEY,
                            QuestFeature.MOBILE_QUEST_DOCK,
                            QuestFeature.QUESTS_CDN,
                            QuestFeature.PACING_CONTROLLER,
                            QuestFeature.VIDEO_QUEST_FORCE_HLS_VIDEO,
                            QuestFeature.VIDEO_QUEST_FORCE_END_CARD_CTA_SWAP,
                            QuestFeature.MOBILE_ONLY_QUEST_PUSH_TO_MOBILE,
                        ],
                        application: {
                            link: "https://spacebar.chat",
                            id: "545364944258990091",
                            name: "Spacebar",
                        },
                        assets: {
                            hero: "quests/1410358070831480904/1440427094801911919.jpg",
                            hero_video: null,
                            quest_bar_hero: "quests/1410358070831480904/1440368088196579358.jpg",
                            quest_bar_hero_video: null,
                            game_tile: "687100d5-5958-43aa-b221-dfe4f2b79e14.png",
                            logotype: "0c58c77e-4ab4-482e-b784-ea4646b992ca.png",
                            game_tile_light: "quests/1410358070831480904/1417602409018163210.png",
                            game_tile_dark: "quests/1410358070831480904/1417602409668153406.png",
                            logotype_light: "quests/1410358070831480904/1417602410142105680.png",
                            logotype_dark: "quests/1410358070831480904/1417602410733375498.png",
                        },
                        colors: {
                            primary: "#4752C4",
                            secondary: "#000000",
                        },
                        messages: {
                            quest_name: "Mobile Bars Intro",
                            game_title: "Earn from Quests. Spend in Shop. Reward Your Play.",
                            game_publisher: "Spacebar",
                        },
                        // task_config: {
                        //     type: 1,
                        //     join_operator: "or",
                        //     tasks: {
                        //         WATCH_VIDEO_ON_MOBILE: {
                        //             event_name: "WATCH_VIDEO_ON_MOBILE",
                        //             target: 31,
                        //             external_ids: [],
                        //         },
                        //     },
                        // },
                        task_config_v2: {
                            tasks: {
                                [QuestEventType.WATCH_VIDEO_ON_MOBILE]: {
                                    type: QuestEventType.WATCH_VIDEO_ON_MOBILE,
                                    target: 31,
                                    assets: {
                                        video: {
                                            url: "quests/1410358070831480904/1420884840815005717_1080.mp4",
                                            width: 1080,
                                            height: 1920,
                                            thumbnail: "quests/1410358070831480904/1421253196549984267.png",
                                            caption: "quests/1410358070831480904/1410370389451866112.vtt",
                                            transcript: "quests/1410358070831480904/1410370413032374293.txt",
                                        },
                                        video_low_res: {
                                            url: "quests/1410358070831480904/1420884840815005717_720.mp4",
                                            width: 1080,
                                            height: 1920,
                                            thumbnail: "quests/1410358070831480904/1421253196549984267.png",
                                            caption: "quests/1410358070831480904/1410370389451866112.vtt",
                                            transcript: "quests/1410358070831480904/1410370413032374293.txt",
                                        },
                                        video_hls: {
                                            url: "quests/1410358070831480904/1420884840815005717.m3u8",
                                            width: 1080,
                                            height: 1920,
                                            thumbnail: "quests/1410358070831480904/1421253196549984267.png",
                                            caption: "quests/1410358070831480904/1410370389451866112.vtt",
                                            transcript: "quests/1410358070831480904/1410370413032374293.txt",
                                        },
                                    },
                                    messages: {
                                        video_title: "Intro to Spacebar Bars",
                                        // video_end_cta_title: "Learn more about Bars",
                                        // video_end_cta_subtitle: "Head to our Help Center for more information.",
                                    },
                                },
                            },
                            join_operator: "or",
                        },
                        rewards_config: {
                            assignment_method: QuestAssignmentMethod.ALL,
                            rewards: [
                                {
                                    type: QuestRewardType.VIRTUAL_CURRENCY,
                                    sku_id: "1287881739531976815",
                                    messages: {
                                        name: "150 Bars",
                                        name_with_article: "150 Bars",
                                        redemption_instructions_by_platform: {
                                            [QuestPlatformType.CROSS_PLATFORM]: "Default",
                                        },
                                    },
                                    orb_quantity: 150,
                                },
                            ],
                            rewards_expire_at: "2099-02-01T00:00:27+00:00",
                            platforms: [QuestPlatformType.CROSS_PLATFORM],
                        },
                        share_policy: QuestSharePolicy.SHAREABLE_EVERYWHERE,
                        cta_config: {
                            link: "https://spacebar.chat",
                            button_label: "Learn More",
                            subtitle: "Head to our Help Center for more information.",
                        },
                    },
                    // user_status: {
                    //     user_id: "498989696412549120",
                    //     quest_id: "1410358070831480904",
                    //     enrolled_at: "2025-11-19T04:17:07.950593+00:00",
                    //     completed_at: "2025-11-19T04:17:45.920547+00:00",
                    //     claimed_at: "2025-11-19T04:17:51.972621+00:00",
                    //     claimed_tier: null,
                    //     last_stream_heartbeat_at: null,
                    //     stream_progress_seconds: 0,
                    //     dismissed_quest_content: 0,
                    //     progress: {
                    //         WATCH_VIDEO_ON_MOBILE: {
                    //             value: 31,
                    //             event_name: "WATCH_VIDEO_ON_MOBILE",
                    //             updated_at: "2025-11-19T04:17:45.920548+00:00",
                    //             completed_at: "2025-11-19T04:17:45.920547+00:00",
                    //             heartbeat: null,
                    //         },
                    //     },
                    // },
                    user_status: null,
                    targeted_content: [],
                    preview: false,
                },
            ],
        } as QuestsResponseSchema);
    },
);

router.get(
    "/claimed",
    route({
        description: "Returns information on the claimed quests for the current user.",
        responses: {
            200: {
                body: "ClaimedQuestsResponseSchema",
            },
        },
    }),
    async (req: Request, res: Response) => {
        // TODO: implement
        res.json({
            quests: [],
        } as ClaimedQuestsResponseSchema);
    },
);

export default router;
