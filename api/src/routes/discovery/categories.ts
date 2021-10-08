import { Router, Response, Request } from "express";
import { route } from "@fosscord/api";

const router = Router();

router.get("/", route({}), (req: Request, res: Response) => {
	//Just send what discord sends
    const { locale, primary_only } = req.query;
	res.json([
        {
            id: 0,
            name: "General",
            is_primary: true
        },
        {
            id: 15,
            name: "Esports",
            is_primary: false
        },
        {
            id: 16,
            name: "Anime & Manga",
            is_primary: false
        },
        {
            id: 17,
            name: "Movies & TV",
            is_primary: false
        },
        {
            id: 18,
            name: "Books",
            is_primary: false
        },
        {
            id: 19,
            name: "Art",
            is_primary: false
        },
        {
            id: 20,
            name: "Writing",
            is_primary: false
        },
        {
            id: 21,
            name: "Crafts, DIY, & Making",
            is_primary: false
        },
        {
            id: 22,
            name: "Programming",
            is_primary: false
        },
        {
            id: 23,
            name: "Podcasts",
            is_primary: false
        },
        {
            id: 24,
            name: "Tabletop Games",
            is_primary: false
        },
        {
            id: 25,
            name: "Memes",
            is_primary: false
        },
        {
            id: 26,
            name: "News & Current Events",
            is_primary: false
        },
        {
            id: 27,
            name: "Cryptocurrency",
            is_primary: false
        },
        {
            id: 28,
            name: "Investing",
            is_primary: false
        },
        {
            id: 29,
            name: "Studying & Teaching",
            is_primary: false
        },
        {
            id: 30,
            name: "LFG",
            is_primary: false
        },
        {
            id: 31,
            name: "Customer Support",
            is_primary: false
        },
        {
            id: 32,
            name: "Theorycraft",
            is_primary: false
        },
        {
            id: 33,
            name: "Events",
            is_primary: false
        },
        {
            id: 34,
            name: "Roleplay",
            is_primary: false
        },
        {
            id: 35,
            name: "Content Creator",
            is_primary: false
        },
        {
            id: 36,
            name: "Business",
            is_primary: false
        },
        {
            id: 37,
            name: "Local Group",
            is_primary: false
        },
        {
            id: 38,
            name: "Collaboration",
            is_primary: false
        },
        {
            id: 39,
            name: "Fandom",
            is_primary: false
        },
        {
            id: 40,
            name: "Wiki & Guide",
            is_primary: false
        },
        {
            id: 42,
            name: "Subreddit",
            is_primary: false
        },
        {
            id: 43,
            name: "Emoji",
            is_primary: true
        },
        {
            id: 45,
            name: "Mobile",
            is_primary: false
        },
        {
            id: 46,
            name: "Console",
            is_primary: false
        },
        {
            id: 2,
            name: "Music",
            is_primary: true
        },
        {
            id: 3,
            name: "Entertainment",
            is_primary: true
        },
        {
            id: 4,
            name: "Creative Arts",
            is_primary: true
        },
        {
            id: 5,
            name: "Science & Tech",
            is_primary: true
        },
        {
            id: 6,
            name: "Education",
            is_primary: true
        },
        {
            id: 7,
            name: "Sports",
            is_primary: true
        },
        {
            id: 8,
            name: "Fashion & Beauty",
            is_primary: true
        },
        {
            id: 9,
            name: "Relationships & Identity",
            is_primary: true
        },
        {
            id: 10,
            name: "Travel & Food",
            is_primary: true
        },
        {
            id: 11,
            name: "Fitness & Health",
            is_primary: true
        },
        {
            id: 12,
            name: "Finance",
            is_primary: true
        },
        {
            id: 13,
            name: "Other",
            is_primary: true
        },
        {
            id: 14,
            name: "General Chatting",
            is_primary: true
        },
        {
            id: 1,
            name: "Gaming",
            is_primary: true
        },
        {
            id: 44,
            name: "Comics & Cartoons",
            is_primary: false
        },
        {
            id: 47,
            name: "Charity & Nonprofit",
            is_primary: false
        },
        {
            id: 48,
            name: "Game Developer",
            is_primary: false
        },
        {
            id: 49,
            name: "Bots",
            is_primary: true
        }
    ]).status(200);
});

export default router;
