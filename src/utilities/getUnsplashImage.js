const axios = require("axios");
// const {UNSPLASH_CLIENT_ID} = require('../config')
import config from "../config";
/**
 * Get a single image from unsplash.
 * Uses the first n words from title as search query
 * 
 * @param {string} title 
 */

async function getImage(title) {
  const clientId = config.UNSPLASH_CLIENT_ID;

  const response = await axios.get("https://api.unsplash.com/search/photos",{
    params:{
      query:title
    },
    headers: {
      "Authorization":`Client-ID ${clientId}`
    }
  })
    .catch(error => {
      console.log("error fetching image:",error);
    });
    // get ther first response
  const image = response.data.results[0];
  const imageUrl = image.urls.regular;
  // console.log('retrieved image:',image.urls.regular)
  return imageUrl;
    
}

module.exports = getImage;
