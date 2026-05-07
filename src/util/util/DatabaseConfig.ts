export const getDatabaseUrl = () => {
    if (process.env.DATABASE) return process.env.DATABASE;

    throw new Error(
        "DATABASE environment variable not set! Please set it to your database connection string.\n" + "Example for postgres: postgres://user:password@localhost:5432/database",
    );
};

export const getDatabaseType = (databaseUrl: string = getDatabaseUrl()) => databaseUrl.split(":")[0]?.replace("+srv", "");
