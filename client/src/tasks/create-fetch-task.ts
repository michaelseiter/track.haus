import { Task } from "@lit/task";
import { ReactiveControllerHost } from "lit";
import { api } from "../services/api";

type ApiMethod = keyof typeof api;

export function createFetchTask<T>(el: ReactiveControllerHost, method: ApiMethod) {
  return new Task<[], T>(el, {
    task: async () => {
      try {
        // Use the method parameter to dynamically call the appropriate API function
        // Use bind() to explicitly bind the 'this' context to the api object
        const apiFunction = (api[method] as Function).bind(api) as () => Promise<T>;
        const data = await apiFunction();
        return data;
      } catch (e: unknown) {
        throw e;
      }
    },
    args: () => [],
  });
}
