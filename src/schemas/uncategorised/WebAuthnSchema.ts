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

export const GenerateWebAuthnCredentialsSchema = z.object({
    password: z.string(),
});

export const CreateWebAuthnCredentialSchema = z.object({
    credential: z.string(),
    name: z.string(),
    ticket: z.string(),
});

export const WebAuthnPostSchema = z.union([GenerateWebAuthnCredentialsSchema, CreateWebAuthnCredentialSchema]);

export const WebAuthnTotpSchema = z.object({
    code: z.string(),
    ticket: z.string(),
});

export type GenerateWebAuthnCredentialsSchema = z.infer<typeof GenerateWebAuthnCredentialsSchema>;
export type CreateWebAuthnCredentialSchema = z.infer<typeof CreateWebAuthnCredentialSchema>;
export type WebAuthnPostSchema = z.infer<typeof WebAuthnPostSchema>;
export type WebAuthnTotpSchema = z.infer<typeof WebAuthnTotpSchema>;
