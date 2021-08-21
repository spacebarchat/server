import "reflect-metadata";
import { createConnection } from "typeorm";

// UUID extension option is only supported with postgres
// We want to generate all id's with Snowflakes that's why we have our own BaseEntity class

createConnection({ type: "sqlite", database: "database.db", entities: [], synchronize: true, logging: true });
