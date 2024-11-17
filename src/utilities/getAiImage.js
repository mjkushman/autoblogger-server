// I'm not goinig to use this yet.

/** How should this work?
 * 
 *  - Have LLM write a prompt that will supply an image for this post.
 *  -- Requires sending the whole post back to the LLM.
 *  -- Should return an image url, but the url expires
 *  -- Another function needs to take url, upload in to cloudinary
 *  -- cloudinary returns another url. Save THAT url to the db along with the post
 *  - 
 * 
 */
const { OPENAI_API_KEY } = require("../config");
const OpenAI = require("openai") 

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function genImage(){

 const prompt = `A confident Pembroke Welsh Corgi standing tall with a proud expression, its short legs poised confidently, and its fluffy tail held high like it's walking a runway. Surrounding the corgi are various symbols of confidence and empowerment, such as a shining golden crown, a microphone representing speaking up, a group of admiring animals and humans, and paw prints leading towards a brighter future. The background features vibrant colors and dynamic patterns, evoking a sense of energy and positivity. The corgi exudes charisma and determination, embodying the spirit of embracing one's quirks and using confidence to make a difference.`


  const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      });
      
      // image_url = response.data.data[0].url;
      console.log(response)

}

genImage()