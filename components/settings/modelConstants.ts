import type { Model } from "../../types";

export type StaticModelOption = Pick<Model, "id" | "name" | "description">;

export const GEMINI_IMAGE_MODELS: StaticModelOption[] = [
  {
    id: "gemini-2.5-flash-image",
    name: "Gemini 2.5 Flash Image (Standard)",
    description: "Fast, efficient image generation.",
  },
  {
    id: "gemini-3-pro-image-preview",
    name: "Gemini 3.0 Pro Image (High Quality)",
    description: "High-fidelity, text-following image generation.",
  },
];
