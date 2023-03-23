import { APIErrorResponse } from "./APIErrorResponse";
import { CaptchaRequiredResponse } from "./CaptchaRequiredResponse";

export type APIErrorOrCaptchaResponse =
	| CaptchaRequiredResponse
	| APIErrorResponse;
