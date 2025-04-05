import { ReactiveControllerHost } from "lit";
import { createFetchTask } from "./create-fetch-task";
import { Play } from "../types/play";

export function createFetchPlaysTask(el: ReactiveControllerHost) {
    // Pass default arguments for limit and offset
    return createFetchTask<Play[], [number, number]>(el, "getPlays", [50, 0]);
}


