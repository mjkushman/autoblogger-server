import { BadRequestError } from "../utilities/expressError";

/** Turns a provider failure into a 400 whose message the user can act on */
export const toUserError = (error, providerName: string, model: string) => {
  console.error(`${providerName} request failed:`, error);
  switch (error?.status) {
    case 401:
    case 403:
      return new BadRequestError(`${providerName} rejected this agent's API key. Check that the key is correct and still active.`);
    case 404:
      return new BadRequestError(`${providerName} doesn't recognize the model "${model}" for this key. Choose a different model.`);
    case 429:
      return new BadRequestError(
        `${providerName} is rate limiting this key, or the account is out of credit. Check your ${providerName} billing and try again.`
      );
    default:
      return new BadRequestError(
        error?.status
          ? `${providerName} returned an error: ${error.message}`
          : `We couldn't read ${providerName}'s response. Please try again.`
      );
  }
};
