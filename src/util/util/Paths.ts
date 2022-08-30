import path from "path";
import fs from "fs";





export class ProjectPaths {
    public static RuntimePath = path.join(__dirname, "..", "..");
    public static ProjectRoot = path.join(ProjectPaths.RuntimePath, "..");
    public static DataDir = path.join(ProjectPaths.ProjectRoot, "data");
    public static ApiPath = path.join(ProjectPaths.RuntimePath, "api");
    public static CdnPath = path.join(ProjectPaths.RuntimePath, "cdn");
    public static GatewayPath = path.join(ProjectPaths.RuntimePath, "gateway");
    public static UtilPath = path.join(ProjectPaths.RuntimePath, "util");
}

export class Paths {
    public static AssetsPath = path.join(ProjectPaths.ProjectRoot, "assets");
    public static PrivateAssetsPath = path.join(ProjectPaths.DataDir, "assets");
    public static MigrationsRoot = path.join(ProjectPaths.UtilPath, "migrations");
    public static CDNFilePath = path.resolve(process.env.STORAGE_LOCATION || path.join(ProjectPaths.ProjectRoot, "files"));
    public static SchemaPath = path.join(ProjectPaths.DataDir, "schemas.json");
    public static IconPath = path.join(Paths.AssetsPath, "icons");
    public static CustomIconPath = path.join(Paths.AssetsPath, "icons", "custom");
}

export class TestClientPaths {
    public static TestClientRoot = path.join(ProjectPaths.DataDir, "test-client");
    public static TestClientCacheDir = process.env.TEST_CLIENT_CACHE_DIR || process.env.ASSET_CACHE_DIR || path.join(TestClientPaths.TestClientRoot, "cache");
    public static Index = path.join(TestClientPaths.TestClientRoot, "index.html");
    public static Developers = path.join(TestClientPaths.TestClientRoot, "developers.html");
    public static PatchDir = path.join(TestClientPaths.TestClientRoot, "patches");
    public static CacheDir = TestClientPaths.TestClientCacheDir;
    public static CacheIndex = path.join(TestClientPaths.TestClientCacheDir, "index.json");
    public static PluginsDir = path.join(TestClientPaths.TestClientRoot, "plugins");
    public static PreloadPluginsDir = path.join(TestClientPaths.TestClientRoot, "preload-plugins");
    public static InlinePluginsDir = path.join(TestClientPaths.TestClientRoot, "inline-plugins");
}


//warnings
if(process.env.ASSET_CACHE_DIR) console.log(`[ENV/WARN] ASSET_CACHE_DIR is deprecated, please use TEST_CLIENT_CACHE_DIR instead!`);

for(let key in ProjectPaths) {
    if(!fs.existsSync((ProjectPaths as any)[key])) {
        console.error(`[ERROR] ${(ProjectPaths as any)[key]} does not exist!`);
    }
}
for(let key in Paths) {
    if(!fs.existsSync((Paths as any)[key])) {
        console.error(`[ERROR] ${(Paths as any)[key]} does not exist!`);
    }
}
for(let key in TestClientPaths) {
    if(!fs.existsSync((TestClientPaths as any)[key])) {
        console.error(`[ERROR] ${(TestClientPaths as any)[key]} does not exist!`);
    }
}
