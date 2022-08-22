declare global {
	namespace Express {
		interface Request {
			user_id: any;
			token: any;
		}
	}
}
