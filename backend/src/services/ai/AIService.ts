import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { PROVIDER_MODE, AWS_REGION, GROQ_API_KEY } from "../../config/aws";

export class AIService {
  private bedrockClient: BedrockRuntimeClient | null = null;

  constructor() {
    if (PROVIDER_MODE === "aws") {
      this.bedrockClient = new BedrockRuntimeClient({ region: AWS_REGION });
    }
  }

  /**
   * Universal text completion method routing to Groq or Bedrock.
   * If no credentials are found, it throws or falls back.
   */
  async getCompletion(prompt: string, systemPrompt: string): Promise<string> {
    // 1. Try Groq (Default when key is present)
    if (GROQ_API_KEY) {
      return this.callGroq(prompt, systemPrompt);
    }

    // 2. Try AWS Bedrock (If AWS Mode and client is active)
    if (PROVIDER_MODE === "aws" && this.bedrockClient) {
      return this.callBedrock(prompt, systemPrompt);
    }

    // 3. Fallback mock if no keys are defined
    console.warn("No GROQ_API_KEY or AWS Bedrock configured. Using fallback local response.");
    throw new Error("API_KEYS_MISSING");
  }

  private async callGroq(prompt: string, systemPrompt: string): Promise<string> {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-specdec", // high-quality fast reasoning model
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          temperature: 0.3,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API returned ${response.status}: ${errorText}`);
      }

      const data = (await response.json()) as any;
      return data.choices[0].message.content || "";
    } catch (error) {
      console.error("Groq API error:", error);
      throw error;
    }
  }

  private async callBedrock(prompt: string, systemPrompt: string): Promise<string> {
    if (!this.bedrockClient) throw new Error("Bedrock client uninitialized");
    
    // We target Claude 3.5 Sonnet on Bedrock
    const modelId = process.env.AWS_BEDROCK_MODEL_ID || "anthropic.claude-3-5-sonnet-20240620-v1:0";
    
    try {
      const payload = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 4000,
        temperature: 0.2,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              }
            ]
          }
        ]
      };

      const command = new InvokeModelCommand({
        modelId,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(payload)
      });

      const response = await this.bedrockClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      return responseBody.content[0].text || "";
    } catch (error) {
      console.error("AWS Bedrock API error:", error);
      throw error;
    }
  }
}
export const aiService = new AIService();
