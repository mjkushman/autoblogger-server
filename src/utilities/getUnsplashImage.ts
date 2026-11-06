import axios from "axios";
import config from "../config";
/**
 * Get a single image from unsplash.
 * Uses the first n words from title as search query
 * 
 * @param {string} title 
 */

async function getImage(title: string): Promise<string> {
  const clientId = config.UNSPLASH_CLIENT_ID;

  // Errors (including no results) reject; the caller decides whether a missing image matters
  const response = await axios.get("https://api.unsplash.com/search/photos", {
    params: { query: title },
    headers: { Authorization: `Client-ID ${clientId}` },
  });
  return response.data.results[0].urls.regular;
}

export default getImage;
