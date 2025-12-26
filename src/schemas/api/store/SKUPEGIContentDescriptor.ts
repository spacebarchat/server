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

export enum SKUPEGIContentDescriptor {
    /**
     * Depictions of violence
     *
     * Value: 1
     * Name: VIOLENCE
     */
    VIOLENCE = 1,
    /**
     * Use of bad language
     *
     * Value: 2
     * Name: BAD_LANGUAGE
     */
    BAD_LANGUAGE = 2,
    /**
     * Scenes that may frighten
     *
     * Value: 3
     * Name: FEAR
     */
    FEAR = 3,
    /**
     * Depictions of gambling
     *
     * Value: 4
     * Name: GAMBLING
     */
    GAMBLING = 4,
    /**
     * Depictions of sexual content
     *
     * Value: 5
     * Name: SEX
     */
    SEX = 5,
    /**
     * Depictions of drugs
     *
     * Value: 6
     * Name: DRUGS
     */
    DRUGS = 6,
    /**
     * Depictions of discrimination
     *
     * Value: 7
     * Name: DISCRIMINATION
     */
    DISCRIMINATION = 7,
}
