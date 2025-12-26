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

export enum SKUGenre {
    /**
     * Action
     *
     * Value: 1
     * Name: ACTION
     */
    ACTION = 1,
    /**
     * Action RPG
     *
     * Value: 2
     * Name: ACTION_RPG
     */
    ACTION_RPG = 2,
    /**
     * Brawler
     *
     * Value: 3
     * Name: BRAWLER
     */
    BRAWLER = 3,
    /**
     * Hack and Slash
     *
     * Value: 4
     * Name: HACK_AND_SLASH
     */
    HACK_AND_SLASH = 4,
    /**
     * Platformer
     *
     * Value: 5
     * Name: PLATFORMER
     */
    PLATFORMER = 5,
    /**
     * Stealth
     *
     * Value: 6
     * Name: STEALTH
     */
    STEALTH = 6,
    /**
     * Survival
     *
     * Value: 7
     * Name: SURVIVAL
     */
    SURVIVAL = 7,
    /**
     * Adventure
     *
     * Value: 8
     * Name: ADVENTURE
     */
    ADVENTURE = 8,
    /**
     * Action Adventure
     *
     * Value: 9
     * Name: ACTION_ADVENTURE
     */
    ACTION_ADVENTURE = 9,
    /**
     * Metroidvania
     *
     * Value: 10
     * Name: METROIDVANIA
     */
    METROIDVANIA = 10,
    /**
     * Open World
     *
     * Value: 11
     * Name: OPEN_WORLD
     */
    OPEN_WORLD = 11,
    /**
     * Psychological Horror
     *
     * Value: 12
     * Name: PSYCHOLOGICAL_HORROR
     */
    PSYCHOLOGICAL_HORROR = 12,
    /**
     * Sandbox
     *
     * Value: 13
     * Name: SANDBOX
     */
    SANDBOX = 13,
    /**
     * Survival Horror
     *
     * Value: 14
     * Name: SURVIVAL_HORROR
     */
    SURVIVAL_HORROR = 14,
    /**
     * Visual Novel
     *
     * Value: 15
     * Name: VISUAL_NOVEL
     */
    VISUAL_NOVEL = 15,
    /**
     * Driving / Racing
     *
     * Value: 16
     * Name: DRIVING_RACING
     */
    DRIVING_RACING = 16,
    /**
     * Vehicular Combat
     *
     * Value: 17
     * Name: VEHICULAR_COMBAT
     */
    VEHICULAR_COMBAT = 17,
    /**
     * Massively Multiplayer
     *
     * Value: 18
     * Name: MASSIVELY_MULTIPLAYER
     */
    MASSIVELY_MULTIPLAYER = 18,
    /**
     * MMORPG
     *
     * Value: 19
     * Name: MMORPG
     */
    MMORPG = 19,
    /**
     * Role-Playing
     *
     * Value: 20
     * Name: ROLE_PLAYING
     */
    ROLE_PLAYING = 20,
    /**
     * Dungeon Crawler
     *
     * Value: 21
     * Name: DUNGEON_CRAWLER
     */
    DUNGEON_CRAWLER = 21,
    /**
     * Roguelike
     *
     * Value: 22
     * Name: ROGUELIKE
     */
    ROGUELIKE = 22,
    /**
     * Shooter
     *
     * Value: 23
     * Name: SHOOTER
     */
    SHOOTER = 23,
    /**
     * Light Gun
     *
     * Value: 24
     * Name: LIGHT_GUN
     */
    LIGHT_GUN = 24,
    /**
     * Shoot 'Em Up
     *
     * Value: 25
     * Name: SHOOT_EM_UP
     */
    SHOOT_EM_UP = 25,
    /**
     * First-Person Shooter
     *
     * Value: 26
     * Name: FPS
     */
    FPS = 26,
    /**
     * Dual-Joystick Shooter
     *
     * Value: 27
     * Name: DUAL_JOYSTICK_SHOOTER
     */
    DUAL_JOYSTICK_SHOOTER = 27,
    /**
     * Simulation
     *
     * Value: 28
     * Name: SIMULATION
     */
    SIMULATION = 28,
    /**
     * Flight Simulator
     *
     * Value: 29
     * Name: FLIGHT_SIMULATOR
     */
    FLIGHT_SIMULATOR = 29,
    /**
     * Train Simulator
     *
     * Value: 30
     * Name: TRAIN_SIMULATOR
     */
    TRAIN_SIMULATOR = 30,
    /**
     * Life Simulator
     *
     * Value: 31
     * Name: LIFE_SIMULATOR
     */
    LIFE_SIMULATOR = 31,
    /**
     * Fishing
     *
     * Value: 32
     * Name: FISHING
     */
    FISHING = 32,
    /**
     * Sports
     *
     * Value: 33
     * Name: SPORTS
     */
    SPORTS = 33,
    /**
     * Baseball
     *
     * Value: 34
     * Name: BASEBALL
     */
    BASEBALL = 34,
    /**
     * Basketball
     *
     * Value: 35
     * Name: BASKETBALL
     */
    BASKETBALL = 35,
    /**
     * Billiards
     *
     * Value: 36
     * Name: BILLIARDS
     */
    BILLIARDS = 36,
    /**
     * Bowling
     *
     * Value: 37
     * Name: BOWLING
     */
    BOWLING = 37,
    /**
     * Boxing
     *
     * Value: 38
     * Name: BOXING
     */
    BOXING = 38,
    /**
     * Football
     *
     * Value: 39
     * Name: FOOTBALL
     */
    FOOTBALL = 39,
    /**
     * Golf
     *
     * Value: 40
     * Name: GOLF
     */
    GOLF = 40,
    /**
     * Hockey
     *
     * Value: 41
     * Name: HOCKEY
     */
    HOCKEY = 41,
    /**
     * Skateboarding / Skating
     *
     * Value: 42
     * Name: SKATEBOARDING_SKATING
     */
    SKATEBOARDING_SKATING = 42,
    /**
     * Snowboarding / Skiing
     *
     * Value: 43
     * Name: SNOWBOARDING_SKIING
     */
    SNOWBOARDING_SKIING = 43,
    /**
     * Soccer
     *
     * Value: 44
     * Name: SOCCER
     */
    SOCCER = 44,
    /**
     * Track & Field
     *
     * Value: 45
     * Name: TRACK_FIELD
     */
    TRACK_FIELD = 45,
    /**
     * Surfing / Wakeboarding
     *
     * Value: 46
     * Name: SURFING_WAKEBOARDING
     */
    SURFING_WAKEBOARDING = 46,
    /**
     * Wrestling
     *
     * Value: 47
     * Name: WRESTLING
     */
    WRESTLING = 47,
    /**
     * Strategy
     *
     * Value: 48
     * Name: STRATEGY
     */
    STRATEGY = 48,
    /**
     * 4X (explore, expand, exploit, exterminate)
     *
     * Value: 49
     * Name: FOUR_X
     */
    FOUR_X = 49,
    /**
     * Artillery
     *
     * Value: 50
     * Name: ARTILLERY
     */
    ARTILLERY = 50,
    /**
     * Real-Time Strategy
     *
     * Value: 51
     * Name: RTS
     */
    RTS = 51,
    /**
     * Tower Defense
     *
     * Value: 52
     * Name: TOWER_DEFENSE
     */
    TOWER_DEFENSE = 52,
    /**
     * Turn-Based Strategy
     *
     * Value: 53
     * Name: TURN_BASED_STRATEGY
     */
    TURN_BASED_STRATEGY = 53,
    /**
     * Wargame
     *
     * Value: 54
     * Name: WARGAME
     */
    WARGAME = 54,
    /**
     * Multiplayer Online Battle Arena
     *
     * Value: 55
     * Name: MOBA
     */
    MOBA = 55,
    /**
     * Fighting
     *
     * Value: 56
     * Name: FIGHTING
     */
    FIGHTING = 56,
    /**
     * Puzzle
     *
     * Value: 57
     * Name: PUZZLE
     */
    PUZZLE = 57,
    /**
     * Card Game
     *
     * Value: 58
     * Name: CARD_GAME
     */
    CARD_GAME = 58,
    /**
     * Education
     *
     * Value: 59
     * Name: EDUCATION
     */
    EDUCATION = 59,
    /**
     * Fitness
     *
     * Value: 60
     * Name: FITNESS
     */
    FITNESS = 60,
    /**
     * Gambling
     *
     * Value: 61
     * Name: GAMBLING
     */
    GAMBLING = 61,
    /**
     * Music / Rhythm
     *
     * Value: 62
     * Name: MUSIC_RHYTHM
     */
    MUSIC_RHYTHM = 62,
    /**
     * Party / Mini Game
     *
     * Value: 63
     * Name: PARTY_MINI_GAME
     */
    PARTY_MINI_GAME = 63,
    /**
     * Pinball
     *
     * Value: 64
     * Name: PINBALL
     */
    PINBALL = 64,
    /**
     * Trivia / Board Game
     *
     * Value: 65
     * Name: TRIVIA_BOARD_GAME
     */
    TRIVIA_BOARD_GAME = 65,
    /**
     * Tactical
     *
     * Value: 66
     * Name: TACTICAL
     */
    TACTICAL = 66,
    /**
     * Indie
     *
     * Value: 67
     * Name: INDIE
     */
    INDIE = 67,
    /**
     * Arcade
     *
     * Value: 68
     * Name: ARCADE
     */
    ARCADE = 68,
    /**
     * Point-and-Click
     *
     * Value: 69
     * Name: POINT_AND_CLICK
     */
    POINT_AND_CLICK = 69,
}
