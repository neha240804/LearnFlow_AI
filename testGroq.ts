import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function main() {
  try {
    console.log("Groq Key Loaded:", !!process.env.GROQ_API_KEY);

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: "Reply with exactly: Groq is working successfully.",
        },
      ],
      temperature: 0,
    });

    console.log("\nResponse:");
    console.log(response.choices[0].message.content);

  } catch (err: any) {
    console.error("\nGroq Error:");
    console.error(err.status || err.code);
    console.error(err.message);

    if (err.response) {
      console.error(err.response.data);
    }
  }
}

main();