import { LRUCache } from "lru-cache";

export const cache: LRUCache<string, object> = new LRUCache({
  max: 500, // maximum entries
  ttl: 1000 * 60 * 60, // one hours
});
