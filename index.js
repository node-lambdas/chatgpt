import { Configuration, OpenAIApi } from "openai";

const defaultModel = 'gpt-3.5-turbo';

export default {
  version: 2,
  actions: {
    ask: {
      default: true,
      description: "Ask ChatGPT for a completion",
      credentials: ["authorization"],
      input: "text",
      output: "text",
      async handler(request, response) {
        const apiKey = request.headers.authorization;
        const openai = new OpenAIApi(new Configuration({ apiKey }));

        try {
          const chat = await openai.createChatCompletion({
            model: request.options.model || defaultModel,
            messages: [{ role: "user", content: request.body }],
          });
          response.send(
            200,
            chat.data.choices.map((c) => c.message.content).join("")
          );
        } catch (error) {
          response.reject(String(error));
        }
      },
    },
  },
};
