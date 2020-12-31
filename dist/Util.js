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
exports.traverseDirectory = void 0;
const promises_1 = __importDefault(require("fs/promises"));
require("missing-native-js-functions");
const DEFAULT_EXCLUDE_DIR = /^\./;
const DEFAULT_FILTER = /^([^\.].*)\.js$/;
function traverseDirectory(options, action) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!options.filter)
            options.filter = DEFAULT_FILTER;
        if (!options.excludeDirs)
            options.excludeDirs = DEFAULT_EXCLUDE_DIR;
        const routes = yield promises_1.default.readdir(options.dirname);
        const promises = routes.map((file) => __awaiter(this, void 0, void 0, function* () {
            const path = options.dirname + file;
            const stat = yield promises_1.default.lstat(path);
            if (path.match(options.excludeDirs))
                return;
            if (stat.isFile() && path.match(options.filter)) {
                return action(path);
            }
            else if (options.recursive && stat.isDirectory()) {
                return traverseDirectory(Object.assign(Object.assign({}, options), { dirname: path + "/" }), action);
            }
        }));
        const result = yield Promise.all(promises);
        const t = result.flat();
        return t.filter((x) => x != undefined);
    });
}
exports.traverseDirectory = traverseDirectory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9VdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJEQUE2QjtBQUM3Qix1Q0FBcUM7QUFTckMsTUFBTSxtQkFBbUIsR0FBRyxLQUFLLENBQUM7QUFDbEMsTUFBTSxjQUFjLEdBQUcsaUJBQWlCLENBQUM7QUFFekMsU0FBc0IsaUJBQWlCLENBQ3RDLE9BQWlDLEVBQ2pDLE1BQTJCOztRQUUzQixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU07WUFBRSxPQUFPLENBQUMsTUFBTSxHQUFHLGNBQWMsQ0FBQztRQUNyRCxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFBRSxPQUFPLENBQUMsV0FBVyxHQUFHLG1CQUFtQixDQUFDO1FBRXBFLE1BQU0sTUFBTSxHQUFHLE1BQU0sa0JBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2pELE1BQU0sUUFBUSxHQUFtQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQU8sSUFBSSxFQUFFLEVBQUU7WUFDMUUsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDcEMsTUFBTSxJQUFJLEdBQUcsTUFBTSxrQkFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQVMsT0FBTyxDQUFDLFdBQVcsQ0FBQztnQkFBRSxPQUFPO1lBRXBELElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQVMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUN4RCxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNwQjtpQkFBTSxJQUFJLE9BQU8sQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFO2dCQUNuRCxPQUFPLGlCQUFpQixpQ0FBTSxPQUFPLEtBQUUsT0FBTyxFQUFFLElBQUksR0FBRyxHQUFHLEtBQUksTUFBTSxDQUFDLENBQUM7YUFDdEU7UUFDRixDQUFDLENBQUEsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxNQUFNLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRTNDLE1BQU0sQ0FBQyxHQUFzQixNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFM0MsT0FBWSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLENBQUM7SUFDN0MsQ0FBQztDQUFBO0FBeEJELDhDQXdCQyJ9