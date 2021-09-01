// https://mermade.github.io/openapi-gui/#
// https://editor.swagger.io/
import path from "path";
import fs from "fs";
import * as TJS from "typescript-json-schema";
import "missing-native-js-functions";

const settings: TJS.PartialArgs = {
	required: true,
	ignoreErrors: true,
	excludePrivate: true,
	defaultNumberType: "integer",
	noExtraProps: true,
	defaultProps: false
};
const compilerOptions: TJS.CompilerOptions = {
	strictNullChecks: false
};
const openapiPath = path.join(__dirname, "..", "assets", "openapi.json");
var specification = JSON.parse(fs.readFileSync(openapiPath, { encoding: "utf8" }));

async function generateSchemas() {
	const program = TJS.getProgramFromFiles([path.join(__dirname, "..", "..", "util", "src", "index.ts")], compilerOptions);
	const generator = TJS.buildGenerator(program, settings);

	const schemas = [
		"Application",
		"Attachment",
		"Message",
		"AuditLog",
		"Ban",
		"Channel",
		"Emoji",
		"Guild",
		"Invite",
		"ReadState",
		"Recipient",
		"Relationship",
		"Role",
		"Sticker",
		"Team",
		"TeamMember",
		"Template",
		"VoiceState",
		"Webhook",
		"User",
		"UserPublic"
	];

	// @ts-ignore
	const definitions = combineSchemas({ schemas, generator, program });

	for (const key in definitions) {
		specification.components.schemas[key] = definitions[key];
		delete definitions[key].additionalProperties;
	}
}

function combineSchemas(opts: { program: TJS.Program; generator: TJS.JsonSchemaGenerator; schemas: string[] }) {
	var definitions: any = {};

	for (const name of opts.schemas) {
		const part = TJS.generateSchema(opts.program, name, settings, [], opts.generator as TJS.JsonSchemaGenerator);
		if (!part) continue;

		definitions = { ...definitions, ...part.definitions, [name]: { ...part, definitions: undefined, $schema: undefined } };
	}

	return definitions;
}

function generateBodies() {
	const program = TJS.getProgramFromFiles([path.join(__dirname, "..", "src", "schema", "index.ts")], compilerOptions);
	const generator = TJS.buildGenerator(program, settings);

	const schemas = [
		"BanCreateSchema",
		"DmChannelCreateSchema",
		"ChannelModifySchema",
		"ChannelGuildPositionUpdateSchema",
		"ChannelGuildPositionUpdateSchema",
		"EmojiCreateSchema",
		"GuildCreateSchema",
		"GuildUpdateSchema",
		"GuildTemplateCreateSchema",
		"GuildUpdateWelcomeScreenSchema",
		"InviteCreateSchema",
		"MemberCreateSchema",
		"MemberNickChangeSchema",
		"MemberChangeSchema",
		"MessageCreateSchema",
		"RoleModifySchema",
		"TemplateCreateSchema",
		"TemplateModifySchema",
		"UserModifySchema",
		"UserSettingsSchema",
		"WidgetModifySchema"
	];

	// @ts-ignore
	const definitions = combineSchemas({ schemas, generator, program });

	for (const key in definitions) {
		specification.components.requestBodies[key] = {
			content: {
				"application/json": { schema: definitions[key] }
			},
			description: ""
		};

		delete definitions[key].additionalProperties;
		delete definitions[key].$schema;
	}
}

function addDefaultResponses() {
	Object.values(specification.paths).forEach((path: any) =>
		Object.values(path).forEach((request: any) => {
			if (!request.responses?.["401"]) {
				request.responses["401"] = {
					description: "Unauthorized",
					content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
				};
			}
			if (!request.responses?.["429"]) {
				request.responses["429"] = {
					description: "Rate limit exceeded",
					content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
					headers: {
						"X-RateLimit-Bucket": {
							description:
								"A unique string denoting the rate limit being encountered (non-inclusive of major parameters in the route path)",
							schema: { type: "string" }
						},
						"X-Rate-Limit-Limit": {
							description: "The number of allowed requests in the current period",
							schema: {
								type: "integer"
							}
						},
						"X-Rate-Limit-Remaining": {
							description: "The number of remaining requests in the current period",
							schema: {
								type: "integer"
							}
						},
						"X-Rate-Limit-Reset": {
							description: "Date when current period is over in seconds since the Unix epoch",
							schema: {
								type: "integer"
							}
						},
						"X-Rate-Limit-Reset-After": {
							description: "Number of seconds when current period will reset (can have decimal)",
							schema: {
								type: "number"
							}
						},
						"Retry-After": {
							description: "Same as X-Rate-Limit-Reset-After but an integer",
							schema: {
								type: "integer"
							}
						},
						"X-RateLimit-Global": {
							description: "Indicates whether or not all requests from your ip are rate limited",
							schema: {
								type: "boolean"
							}
						}
					}
				};
			}
		})
	);
}

function main() {
	addDefaultResponses();
	generateSchemas();
	specification = JSON.parse(JSON.stringify(specification).replaceAll("#/definitions", "#/components/schemas"));

	generateBodies();

	fs.writeFileSync(
		openapiPath,
		JSON.stringify(specification, null, 4).replaceAll("#/definitions", "#/components/requestBodies").replaceAll("bigint", "number")
	);
}

main();
