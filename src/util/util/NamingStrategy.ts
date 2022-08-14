import { DefaultNamingStrategy } from "typeorm";

export class NamingStrategy extends DefaultNamingStrategy {
	eagerJoinRelationAlias(alias: string, propertyPath: string) {
		const result = super.eagerJoinRelationAlias(alias, propertyPath);

		console.log({ alias, propertyPath, result });
		return result;
	}
}

export const namingStrategy = new NamingStrategy();
