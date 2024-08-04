import fs from 'fs';
import { Configuration, OpenAIApi } from 'openai';

/**
 *
 * @param {*} path url mp3
 */
const voiceToText = async (path) => {
  if (!fs.existsSync(path)) {
    throw new Error("No se encuentra el archivo");
  }

  try {
    const configuration = new Configuration({
      apiKey: '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',
    });
    const openai = new OpenAIApi(configuration);
    const resp = await openai.createTranscription(
      fs.createReadStream(path),
      "whisper-1"
    );

    return resp.data.text;
  } catch (err) {
    console.log(err.response.data)
    return "ERROR";
  }
};

export { voiceToText };
