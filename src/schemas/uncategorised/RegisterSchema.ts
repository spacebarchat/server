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

import { z } from "zod";

export const RegisterSchema = z
    .object({
        username: z.string().min(2),
        password: z.string().min(1).max(72),
        consent: z.boolean(),
        email: z.email(),
        fingerprint: z.string(),
        invite: z.string(),
        date_of_birth: z.union([z.string(), z.date()]),
        gift_code_sku_id: z.string(),
        captcha_key: z.string(),
        promotional_email_opt_in: z.boolean(),
        unique_username_registration: z.boolean(),
        global_name: z.string(),
    })
    .partial({
        password: true,
        email: true,
        fingerprint: true,
        invite: true,
        date_of_birth: true,
        gift_code_sku_id: true,
        captcha_key: true,
        promotional_email_opt_in: true,
        unique_username_registration: true,
        global_name: true,
    });

export type RegisterSchema = z.infer<typeof RegisterSchema>;
