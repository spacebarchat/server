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

export const ApplicationModifySchema = z.object({
    description: z.string().optional(),
    icon: z.string().optional(),
    cover_image: z.string().optional(),
    interactions_endpoint_url: z.string().optional(),
    max_participants: z.number().nullish(),
    name: z.string().optional(),
    privacy_policy_url: z.string().optional(),
    role_connections_verification_url: z.string().optional(),
    tags: z.array(z.string()).optional(),
    terms_of_service_url: z.string().optional(),
    bot_public: z.boolean().optional(),
    bot_require_code_grant: z.boolean().optional(),
    flags: z.number().optional(),
    custom_install_url: z.string().optional(),
    guild_id: z.string().optional(),
});

export type ApplicationModifySchema = z.infer<typeof ApplicationModifySchema>;
