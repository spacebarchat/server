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

import { LocalizedStringSchema } from "../../uncategorised";

export interface SKUSystemRequirementSchema {
    /**
     * The amount of RAM in megabytes
     */
    ram?: number;
    /**
     * The amount of disk space in megabytes
     */
    disk?: number;
    /**
     * The required operating system version
     */
    operating_system_version?: LocalizedStringSchema;
    /**
     * The required CPU
     */
    cpu?: LocalizedStringSchema;
    /**
     * The required GPU
     */
    gpu?: LocalizedStringSchema;
    /**
     * The required sound card
     */
    sound_card?: LocalizedStringSchema;
    /**
     * The required DirectX version
     */
    directx?: LocalizedStringSchema;
    /**
     * The required network connectivity status
     */
    network?: LocalizedStringSchema;
    /**
     * Additional notes
     */
    notes?: LocalizedStringSchema;
}
