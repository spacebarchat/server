import { Router } from "express";
import { getAvatar } from "./avatars";

const router = Router();

// TODO: handle guild profiles
router.get("/:guild_id/users/:user_id/avatars/:hash", getAvatar);
router.get("/:guild_id/users/:user_id/banners/:hash", getAvatar);

export default router;