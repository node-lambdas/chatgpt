import { Configuration, OpenAIApi } from "openai";

const defaultModel = "gpt-3.5-turbo";
const roles = ["assistant", "user", "system"];
const validateMessage = (m) =>
  typeof m === "object" && m && roles.includes(m.role) && m.content;

export default {
  version: 2,
  actions: {
    ask: {
      default: true,
      description: "Ask ChatGPT a question",
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
    complete: {
      description: "Ask ChatGPT for a completion",
      credentials: ["authorization"],
      input: "json",
      output: "json",
      async handler(request, response) {
        const apiKey = request.headers.authorization;
        const openai = new OpenAIApi(new Configuration({ apiKey }));
        const input = request.body;

        if (!Array.isArray(input) || !input.every(validateMessage)) {
          response.writeHead(400);
          response.end("Invalid chat stream");
          return;
        }

        try {
          const chat = await openai.createChatCompletion({
            model: request.options.model || defaultModel,
            messages: input,
          });

          const output = input.concat({
            role: "assistant",
            content: chat.data.choices.map((c) => c.message.content),
          });

          response.send(200, output);
        } catch (error) {
          response.reject(String(error));
        }
      },
    },
  },
};
