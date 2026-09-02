import { CustomEase } from "./gsap-setup.js";

export const EASE_OUT_EXPO = "outExpo";
export const EASE_IN_OUT_QUART = "inOutQuart";

CustomEase.create(EASE_OUT_EXPO, "0.16, 1, 0.3, 1");
CustomEase.create(EASE_IN_OUT_QUART, "0.76, 0, 0.24, 1");
