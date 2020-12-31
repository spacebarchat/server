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
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = require("express");
const node_fetch_1 = __importDefault(require("node-fetch"));
const cheerio_1 = __importDefault(require("cheerio"));
const btoa_1 = __importDefault(require("btoa"));
const url_1 = require("url");
const router = express_1.Router();
const DEFAULT_FETCH_OPTIONS = {
    redirect: "follow",
    follow: 1,
    headers: {
        "user-agent": "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)",
    },
    size: 1024 * 1024 * 8,
    compress: true,
    method: "GET",
};
router.post("/", body_parser_1.default.json(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body)
        throw new Error("Invalid Body (url missing) \nExample: url:https://discord.com");
    const { db } = req.server;
    const { url } = req.body;
    const ID = btoa_1.default(url);
    const cache = yield db.data.crawler({ id: ID }).get();
    if (cache)
        return res.send(cache);
    try {
        const request = yield node_fetch_1.default(url, DEFAULT_FETCH_OPTIONS);
        const text = yield request.text();
        const ツ = cheerio_1.default.load(text);
        const ogTitle = ツ('meta[property="og:title"]').attr("content");
        const ogDescription = ツ('meta[property="og:description"]').attr("content");
        const ogImage = ツ('meta[property="og:image"]').attr("content");
        const ogUrl = ツ('meta[property="og:url"]').attr("content");
        const ogType = ツ('meta[property="og:type"]').attr("content");
        const filename = new url_1.URL(url).host.split(".")[0];
        const ImageResponse = yield node_fetch_1.default(ogImage, DEFAULT_FETCH_OPTIONS);
        const ImageType = ImageResponse.headers.get("content-type");
        const ImageExtension = ImageType === null || ImageType === void 0 ? void 0 : ImageType.split("/")[1];
        const ImageResponseBuffer = (yield ImageResponse.buffer()).toString("base64");
        const cachedImage = `/external/${ID}/${filename}.${ImageExtension}`;
        yield db.data.externals.push({ image: ImageResponseBuffer, id: ID, type: ImageType });
        const new_cache_entry = { id: ID, ogTitle, ogDescription, cachedImage, ogUrl, ogType };
        yield db.data.crawler.push(new_cache_entry);
        res.send(new_cache_entry);
    }
    catch (error) {
        console.log(error);
        throw new Error("Couldn't fetch website");
    }
}));
router.get("/:id/:filename", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { db } = req.server;
    const { id, filename } = req.params;
    const { image, type } = yield db.data.externals({ id: id }).get();
    const imageBuffer = Buffer.from(image, "base64");
    res.set("Content-Type", type);
    res.send(imageBuffer);
}));
exports.default = router;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcm91dGVzL2V4dGVybmFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsOERBQXFDO0FBQ3JDLHFDQUFpQztBQUNqQyw0REFBK0I7QUFDL0Isc0RBQThCO0FBQzlCLGdEQUF3QjtBQUN4Qiw2QkFBMEI7QUFFMUIsTUFBTSxNQUFNLEdBQUcsZ0JBQU0sRUFBRSxDQUFDO0FBV3hCLE1BQU0scUJBQXFCLEdBQVE7SUFDbEMsUUFBUSxFQUFFLFFBQVE7SUFDbEIsTUFBTSxFQUFFLENBQUM7SUFDVCxPQUFPLEVBQUU7UUFDUixZQUFZLEVBQUUsbUVBQW1FO0tBQ2pGO0lBQ0QsSUFBSSxFQUFFLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQztJQUNyQixRQUFRLEVBQUUsSUFBSTtJQUNkLE1BQU0sRUFBRSxLQUFLO0NBQ2IsQ0FBQztBQUVGLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLHFCQUFVLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBTyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFDdEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJO1FBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQywrREFBK0QsQ0FBQyxDQUFDO0lBRWhHLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO0lBQzFCLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO0lBRXpCLE1BQU0sRUFBRSxHQUFHLGNBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUVyQixNQUFNLEtBQUssR0FBRyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDdEQsSUFBSSxLQUFLO1FBQUUsT0FBTyxHQUFHLENBQUMsSUFB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