import { Config } from "@fosscord/server-util";
import { getConfigPathForFile } from "@fosscord/server-util/dist/util/Config";
import Ajv, { JSONSchemaType } from "ajv";

export interface DefaultOptions {
	endpoint?: string;
	security: {
		jwtSecret: string;
	}
}

const schema: JSONSchemaType<DefaultOptions> = {
	type: "object",
	properties: {
		endpoint: {
			type: "string",
			nullable: true
		},
		security: {
			type: "object",
			properties: {
				jwtSecret: {
					type: "string"
				}
			},
			required: ["jwtSecret"]
		},
	},
	required: ["security"]
}

const ajv = new Ajv();
const validator = ajv.compile(schema);

const configPath = getConfigPathForFile("fosscord", "gateway", ".json"); 
export const gatewayConfig = new Config({path: configPath, schemaValidator: validator, schema: schema})