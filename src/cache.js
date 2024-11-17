const { LRUCache } = require("lru-cache");

const cache = new LRUCache({
  max: 500, // maximum entries
  ttl: 1000 * 60 * 60, // one hours
});


module.exports = { cache };
