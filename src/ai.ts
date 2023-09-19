import OpenAI from "openai";
import { SYSTEM_PROMPT } from "./prompt";

const openai = new OpenAI({
	apiKey: import.meta.env.VITE_OPENAI_API_KEY,
	dangerouslyAllowBrowser: true,
});

interface ChatStreamingParams {
	messages: OpenAI.Chat.ChatCompletionMessageParam[];
}

export interface ChatResult {
	code: string;
	name: string;
}

export async function chat(params: ChatStreamingParams): Promise<ChatResult> {
	const functionName = "create-react-component";
	const response = await openai.chat.completions.create({
		model: "gpt-4",
		messages: [
			{
				role: "system",
				content: SYSTEM_PROMPT,
			},
			...params.messages,
		],
		temperature: 0.8,
		functions: [
			{
				name: functionName,
				parameters: {
					type: "object",
					properties: {
						code: {
							type: "string",
							description:
								"React code for a component. Special characters should be escaped so that the value can be parsed as JSON",
						},
						name: {
							type: "string",
							description: "Name of the component",
						},
					},
					required: ["code", "name"],
				},
			},
		],
		function_call: {
			name: functionName,
		},
	});

	const args = response.choices[0].message.function_call?.arguments;

	if (args) {
		return JSON.parse(args) as ChatResult;
	}

	throw new Error("No arguments returned ");
}

export const fixOutput = (code: string): string =>
	code.replace(/h-screen/g, "h-full");
