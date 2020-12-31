"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const express_1 = __importDefault(require("express"));
const lambert_db_1 = require("lambert-db");
const Util_1 = require("./Util");
require("express-async-errors");
const log = console.log;
console.log = (content) => {
    log(`[${new Date().toTimeString().split(" ")[0]}]`, content);
};
class Server {
    constructor(options = { port: 3000, host: "0.0.0.0" }) {
        this.app = express_1.default();
        this.db = new lambert_db_1.MongoDatabase(options === null || options === void 0 ? void 0 : options.db);
        this.options = options;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.init();
            console.log("[Database] connected...");
            yield new Promise((res, rej) => {
                this.http = this.app.listen(this.options.port, this.options.host, () => res(null));
            });
            this.routes = yield this.registerRoutes(__dirname + "/routes/");
        });
    }
    registerRoutes(root) {
        return __awaiter(this, void 0, void 0, function* () {
            this.app.use((req, res, next) => {
                req.server = this;
                next();
            });
            const routes = yield Util_1.traverseDirectory({ dirname: root, recursive: true }, this.registerRoute.bind(this, root));
            this.app.use((err, req, res, next) => {
                res.status(400).send(err);
                next(err);
            });
            return routes;
        });
    }
    registerRoute(root, file) {
        var _a, _b;
        if (root.endsWith("/") || root.endsWith("\\"))
            root = root.slice(0, -1); // removes slash at the end of the root dir
        let path = file.replace(root, ""); // remove root from path and
        path = path.split(".").slice(0, -1).join("."); // trancate .js/.ts file extension of path
        if (path.endsWith("/index"))
            path = path.slice(0, -6); // delete index from path
        try {
            var router = require(file);
            if (router.router)
                router = router.router;
            if (router.default)
                router = router.default;
            if (!router || ((_b = (_a = router === null || router === void 0 ? void 0 : router.prototype) === null || _a === void 0 ? void 0 : _a.constructor) === null || _b === void 0 ? void 0 : _b.name) !== "router")
                throw `File doesn't export any default router`;
            this.app.use(path, router);
            console.log(`[Routes] ${path} registerd`);
            return router;
        }
        catch (error) {
            console.error(new Error(`[Server] ¯\\_(ツ)_/¯ Failed to register route ${path}: ${error}`));
        }
    }
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.destroy();
            yield new Promise((res, rej) => {
                this.http.close((err) => {
                    if (err)
                        return rej(err);
                    return res("");
                });
            });
        });
    }
}
exports.Server = Server;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL1NlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxzREFBd0Y7QUFDeEYsMkNBQXFEO0FBRXJELGlDQUEyQztBQUUzQyxnQ0FBOEI7QUFFOUIsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztBQUN4QixPQUFPLENBQUMsR0FBRyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUU7SUFDekIsR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUM5RCxDQUFDLENBQUM7QUFnQkYsTUFBYSxNQUFNO0lBT2xCLFlBQVksVUFBa0MsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUU7UUFDNUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxpQkFBTyxFQUFFLENBQUM7UUFDckIsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLDBCQUFhLENBQUMsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBd0IsQ0FBQztJQUN6QyxDQUFDO0lBRUssSUFBSTs7WUFDVCxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7Z0JBQzlCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDcEYsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLENBQUM7UUFDakUsQ0FBQztLQUFBO0lBRUssY0FBYyxDQUFDLElBQVk7O1lBQ2hDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRTtnQkFDL0IsR0FBRyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7Z0JBQ2xCLElBQUksRUFBRSxDQUFDO1lBQ1IsQ0FBQyxDQUFDLENBQUM7WUFDSCxNQUFNLE1BQU0sR0FBRyxNQUFNLHdCQUFpQixDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDaEgsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFtQixFQUFFLEdBQVksRUFBRSxHQUFhLEVBQUUsSUFBa0IsRUFBRSxFQUFFO2dCQUNyRixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDMUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1gsQ0FBQyxDQUFDLENBQUM7WUFDSCxPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7S0FBQTtJQUVELGFBQWEsQ0FBQyxJQUFZLEVBQUUsSUFBWTs7UUFDdkMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1lBQUUsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQywyQ0FBMkM7UUFDcEgsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyw0QkFBNEI7UUFDL0QsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLDBDQUEwQztRQUN6RixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO1lBQUUsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyx5QkFBeUI7UUFFaEYsSUFBSTtZQUNILElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzQixJQUFJLE1BQU0sQ0FBQyxNQUFNO2dCQUFFLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQzFDLElBQUksTUFBTSxDQUFDLE9BQU87Z0JBQUUsTUFBTSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7WUFDNUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxhQUFBLE1BQU0sYUFBTixNQUFNLHVCQUFOLE1BQU0sQ0FBRSxTQUFTLDBDQUFFLFdBQVcsMENBQUUsSUFBSSxNQUFLLFFBQVE7Z0JBQy9ELE1BQU0sd0NBQXdDLENBQUM7WUFDaEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFVLE1BQU0sQ0FBQyxDQUFDO1lBQ25DLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLFlBQVksQ0FBQyxDQUFDO1lBRTFDLE9BQU8sTUFBTSxDQUFDO1NBQ2Q7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsZ0RBQWdELElBQUksS0FBSyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDM0Y7SUFDRixDQUFDO0lBRUssT0FBTzs7WUFDWixNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDeEIsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtnQkFDOUIsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtvQkFDdkIsSUFBSSxHQUFHO3dCQUFFLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUN6QixPQUFPLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDaEIsQ0FBQyxDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7S0FBQTtDQUNEO0FBbEVELHdCQWtFQyJ9