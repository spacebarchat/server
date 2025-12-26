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

export enum SKUESRBContentDescriptor {
    /**
     * References to alcohol
     *
     * Value: 1
     * Name: ALCOHOL_REFERENCE
     */
    ALCOHOL_REFERENCE = 1,
    /**
     * Animated blood
     *
     * Value: 2
     * Name: ANIMATED_BLOOD
     */
    ANIMATED_BLOOD = 2,
    /**
     * Blood
     *
     * Value: 3
     * Name: BLOOD
     */
    BLOOD = 3,
    /**
     * Blood and gore
     *
     * Value: 4
     * Name: BLOOD_AND_GORE
     */
    BLOOD_AND_GORE = 4,
    /**
     * Cartoon violence
     *
     * Value: 5
     * Name: CARTOON_VIOLENCE
     */
    CARTOON_VIOLENCE = 5,
    /**
     * Comic mischief
     *
     * Value: 6
     * Name: COMIC_MISCHIEF
     */
    COMIC_MISCHIEF = 6,
    /**
     * Crude humor
     *
     * Value: 7
     * Name: CRUDE_HUMOR
     */
    CRUDE_HUMOR = 7,
    /**
     * References to drugs
     *
     * Value: 8
     * Name: DRUG_REFERENCE
     */
    DRUG_REFERENCE = 8,
    /**
     * Fantasy violence
     *
     * Value: 9
     * Name: FANTASY_VIOLENCE
     */
    FANTASY_VIOLENCE = 9,
    /**
     * Intense violence
     *
     * Value: 10
     * Name: INTENSE_VIOLENCE
     */
    INTENSE_VIOLENCE = 10,
    /**
     * Use of strong language
     *
     * Value: 11
     * Name: LANGUAGE
     */
    LANGUAGE = 11,
    /**
     * Lyrics
     *
     * Value: 12
     * Name: LYRICS
     */
    LYRICS = 12,
    /**
     * Mature humor
     *
     * Value: 13
     * Name: MATURE_HUMOR
     */
    MATURE_HUMOR = 13,
    /**
     * Nudity
     *
     * Value: 14
     * Name: NUDITY
     */
    NUDITY = 14,
    /**
     * Partial nudity
     *
     * Value: 15
     * Name: PARTIAL_NUDITY
     */
    PARTIAL_NUDITY = 15,
    /**
     * Real gambling
     *
     * Value: 16
     * Name: REAL_GAMBLING
     */
    REAL_GAMBLING = 16,
    /**
     * Sexual content
     *
     * Value: 17
     * Name: SEXUAL_CONTENT
     */
    SEXUAL_CONTENT = 17,
    /**
     * Sexual themes
     *
     * Value: 18
     * Name: SEXUAL_THEMES
     */
    SEXUAL_THEMES = 18,
    /**
     * Sexual violence
     *
     * Value: 19
     * Name: SEXUAL_VIOLENCE
     */
    SEXUAL_VIOLENCE = 19,
    /**
     * Simulated gambling
     *
     * Value: 20
     * Name: SIMULATED_GAMBLING
     */
    SIMULATED_GAMBLING = 20,
    /**
     * Strong language
     *
     * Value: 21
     * Name: STRONG_LANGUAGE
     */
    STRONG_LANGUAGE = 21,
    /**
     * Strong lyrics
     *
     * Value: 22
     * Name: STRONG_LYRICS
     */
    STRONG_LYRICS = 22,
    /**
     * Strong sexual content
     *
     * Value: 23
     * Name: STRONG_SEXUAL_CONTENT
     */
    STRONG_SEXUAL_CONTENT = 23,
    /**
     * Suggestive themes
     *
     * Value: 24
     * Name: SUGGESTIVE_THEMES
     */
    SUGGESTIVE_THEMES = 24,
    /**
     * References to tobacco
     *
     * Value: 25
     * Name: TOBACCO_REFERENCE
     */
    TOBACCO_REFERENCE = 25,
    /**
     * Use of alcohol
     *
     * Value: 26
     * Name: USE_OF_ALCOHOL
     */
    USE_OF_ALCOHOL = 26,
    /**
     * Use of drugs
     *
     * Value: 27
     * Name: USE_OF_DRUGS
     */
    USE_OF_DRUGS = 27,
    /**
     * Use of tobacco
     *
     * Value: 28
     * Name: USE_OF_TOBACCO
     */
    USE_OF_TOBACCO = 28,
    /**
     * Violence
     *
     * Value: 29
     * Name: VIOLENCE
     */
    VIOLENCE = 29,
    /**
     * Violent references
     *
     * Value: 30
     * Name: VIOLENT_REFERENCES
     */
    VIOLENT_REFERENCES = 30,
    /**
     * In-game purchases
     *
     * Value: 31
     * Name: IN_GAME_PURCHASES
     */
    IN_GAME_PURCHASES = 31,
    /**
     * User interaction
     *
     * Value: 32
     * Name: USERS_INTERACT
     */
    USERS_INTERACT = 32,
    /**
     * Location sharing
     *
     * Value: 33
     * Name: SHARES_LOCATION
     */
    SHARES_LOCATION = 33,
    /**
     * Unrestricted internet access
     *
     * Value: 34
     * Name: UNRESTRICTED_INTERNET
     */
    UNRESTRICTED_INTERNET = 34,
    /**
     * Mild blood
     *
     * Value: 35
     * Name: MILD_BLOOD
     */
    MILD_BLOOD = 35,
    /**
     * Mild cartoon violence
     *
     * Value: 36
     * Name: MILD_CARTOON_VIOLENCE
     */
    MILD_CARTOON_VIOLENCE = 36,
    /**
     * Mild fantasy violence
     *
     * Value: 37
     * Name: MILD_FANTASY_VIOLENCE
     */
    MILD_FANTASY_VIOLENCE = 37,
    /**
     * Mild language
     *
     * Value: 38
     * Name: MILD_LANGUAGE
     */
    MILD_LANGUAGE = 38,
    /**
     * Mild lyrics
     *
     * Value: 39
     * Name: MILD_LYRICS
     */
    MILD_LYRICS = 39,
    /**
     * Mild sexual themes
     *
     * Value: 40
     * Name: MILD_SEXUAL_THEMES
     */
    MILD_SEXUAL_THEMES = 40,
    /**
     * Mild suggestive themes
     *
     * Value: 41
     * Name: MILD_SUGGESTIVE_THEMES
     */
    MILD_SUGGESTIVE_THEMES = 41,
    /**
     * Mild violence
     *
     * Value: 42
     * Name: MILD_VIOLENCE
     */
    MILD_VIOLENCE = 42,
    /**
     * Animated violence
     *
     * Value: 43
     * Name: ANIMATED_VIOLENCE
     */
    ANIMATED_VIOLENCE = 43,
}
