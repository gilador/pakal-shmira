import { UniqueString } from "../models/index";

// Operation time configuration
export const OPERATION_START_TIME = "08:00";
export const OPERATION_END_TIME = "18:00";
export const MINIMUM_REST_TIME = 4; // hours - default middle option

export const defaultPosts: UniqueString[] = [
  { id: "post-1", value: "Post 1" },
  { id: "post-2", value: "Post 2" },
  { id: "post-3", value: "Post 3" },
];

// Fallback hours for when dynamic calculation is not available
export const defaultHours: UniqueString[] = [
  { id: "hour-1", value: "08:00" },
  { id: "hour-2", value: "09:00" },
  { id: "hour-3", value: "10:00" },
  { id: "hour-4", value: "11:00" },
  { id: "hour-5", value: "12:00" },
];

// Default worker count for calculations
export const DEFAULT_STAFF_COUNT = 12;
