import { ReactiveControllerHost } from "lit";
import { createFetchTask } from "./create-fetch-task";
import { Stats } from "../types/stats";

export function createFetchStatsTask(el: ReactiveControllerHost) {
  // getStats doesn't require any arguments, so we pass an empty array
  return createFetchTask<Stats, []>(el, "getStats", []);
}
  
  
  