import axios from "axios";
import { config } from "../../config";
import { logError } from "config/logger";

export async function getSynonyms(words: string[]) {
  try {
    const response = await axios.post(`${config.pycleanerUrl}/expand`, { words });
    return response.data;
  } catch (error) {
    logError('GetSynonyms error', error);
    throw new Error('Failed to get synonyms');
  }
}
