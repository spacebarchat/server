/* eslint-disable */
import { DataSource, QueryRunner } from "typeorm";
import { QueryResultCache } from "typeorm/cache/QueryResultCache";
import { QueryResultCacheOptions } from "typeorm/cache/QueryResultCacheOptions";

export class CustomQueryResultCache implements QueryResultCache {
	constructor(private dataSource: DataSource) {}
	connect(): Promise<void> {
		throw new Error("Method not implemented.");
	}
	disconnect(): Promise<void> {
		throw new Error("Method not implemented.");
	}
	synchronize(queryRunner?: QueryRunner | undefined): Promise<void> {
		throw new Error("Method not implemented.");
	}
	getFromCache(
		options: QueryResultCacheOptions,
		queryRunner?: QueryRunner | undefined,
	): Promise<QueryResultCacheOptions | undefined> {
		throw new Error("Method not implemented.");
	}
	storeInCache(
		options: QueryResultCacheOptions,
		savedCache: QueryResultCacheOptions | undefined,
		queryRunner?: QueryRunner | undefined,
	): Promise<void> {
		throw new Error("Method not implemented.");
	}
	isExpired(savedCache: QueryResultCacheOptions): boolean {
		throw new Error("Method not implemented.");
	}
	clear(queryRunner?: QueryRunner | undefined): Promise<void> {
		throw new Error("Method not implemented.");
	}
	remove(
		identifiers: string[],
		queryRunner?: QueryRunner | undefined,
	): Promise<void> {
		throw new Error("Method not implemented.");
	}
}
