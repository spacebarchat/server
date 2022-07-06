import { Router, Response, Request } from "express";
import { route } from "@fosscord/api";

const router = Router();

router.get("/", route({}), (req: Request, res: Response) => {
	// TODO:
	// Load categories from db instead

	const { locale, primary_only } = req.query;

	let out;

	switch (locale) {
		case "en-US":
			switch (primary_only) {
				case "false":
					out = [{"id": 0, "is_primary": true, "name": "General"}, {"id": 10, "is_primary": true, "name": "Travel & Food"}, {"id": 15, "is_primary": false, "name": "Esports"}, {"id": 30, "is_primary": false, "name": "LFG"}, {"id": 32, "is_primary": false, "name": "Theorycraft"}, {"id": 36, "is_primary": false, "name": "Business"}, {"id": 39, "is_primary": false, "name": "Fandom"}, {"id": 43, "is_primary": true, "name": "Emoji"}, {"id": 18, "is_primary": false, "name": "Books"}, {"id": 23, "is_primary": false, "name": "Podcasts"}, {"id": 28, "is_primary": false, "name": "Investing"}, {"id": 7, "is_primary": true, "name": "Sports"}, {"id": 13, "is_primary": true, "name": "Other"}, {"id": 2, "is_primary": true, "name": "Music"}, {"id": 3, "is_primary": true, "name": "Entertainment"}, {"id": 4, "is_primary": true, "name": "Creative Arts"}, {"id": 6, "is_primary": true, "name": "Education"}, {"id": 9, "is_primary": true, "name": "Relationships & Identity"}, {"id": 11, "is_primary": true, "name": "Fitness & Health"}, {"id": 12, "is_primary": true, "name": "Finance"}, {"id": 45, "is_primary": false, "name": "Mobile"}, {"id": 16, "is_primary": false, "name": "Anime & Manga"}, {"id": 17, "is_primary": false, "name": "Movies & TV"}, {"id": 19, "is_primary": false, "name": "Art"}, {"id": 20, "is_primary": false, "name": "Writing"}, {"id": 22, "is_primary": false, "name": "Programming"}, {"id": 25, "is_primary": false, "name": "Memes"}, {"id": 27, "is_primary": false, "name": "Cryptocurrency"}, {"id": 31, "is_primary": false, "name": "Customer Support"}, {"id": 33, "is_primary": false, "name": "Events"}, {"id": 34, "is_primary": false, "name": "Roleplay"}, {"id": 37, "is_primary": false, "name": "Local Group"}, {"id": 38, "is_primary": false, "name": "Collaboration"}, {"id": 40, "is_primary": false, "name": "Wiki & Guide"}, {"id": 42, "is_primary": false, "name": "Subreddit"}, {"id": 1, "is_primary": true, "name": "Gaming"}, {"id": 5, "is_primary": true, "name": "Science & Tech"}, {"id": 8, "is_primary": true, "name": "Fashion & Beauty"}, {"id": 14, "is_primary": true, "name": "General Chatting"}, {"id": 21, "is_primary": false, "name": "Crafts, DIY, & Making"}, {"id": 48, "is_primary": false, "name": "Game Developer"}, {"id": 49, "is_primary": true, "name": "Bots"}, {"id": 24, "is_primary": false, "name": "Tabletop Games"}, {"id": 26, "is_primary": false, "name": "News & Current Events"}, {"id": 29, "is_primary": false, "name": "Studying & Teaching"}, {"id": 35, "is_primary": false, "name": "Content Creator"}, {"id": 44, "is_primary": false, "name": "Comics & Cartoons"}, {"id": 46, "is_primary": false, "name": "Console"}, {"id": 47, "is_primary": false, "name": "Charity & Nonprofit"}]
				case "true":
					out = [{"id": 0, "is_primary": true, "name": "General"}, {"id": 10, "is_primary": true, "name": "Travel & Food"}, {"id": 43, "is_primary": true, "name": "Emoji"}, {"id": 7, "is_primary": true, "name": "Sports"}, {"id": 13, "is_primary": true, "name": "Other"}, {"id": 2, "is_primary": true, "name": "Music"}, {"id": 3, "is_primary": true, "name": "Entertainment"}, {"id": 4, "is_primary": true, "name": "Creative Arts"}, {"id": 6, "is_primary": true, "name": "Education"}, {"id": 9, "is_primary": true, "name": "Relationships & Identity"}, {"id": 11, "is_primary": true, "name": "Fitness & Health"}, {"id": 12, "is_primary": true, "name": "Finance"}, {"id": 1, "is_primary": true, "name": "Gaming"}, {"id": 5, "is_primary": true, "name": "Science & Tech"}, {"id": 8, "is_primary": true, "name": "Fashion & Beauty"}, {"id": 14, "is_primary": true, "name": "General Chatting"}]
				}
	}

	res.json(out).status(200);
});

export default router;
