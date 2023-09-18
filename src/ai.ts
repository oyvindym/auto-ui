import OpenAI from "openai";
import { SYSTEM_PROMPT } from "./prompt";

const openai = new OpenAI({
	apiKey: "",
	dangerouslyAllowBrowser: true,
});

interface MessageChunk {
	content: string;
}

interface ChatStreamingParams {
	messages: OpenAI.Chat.ChatCompletionMessageParam[];
}

interface ChatResult {
	code: string;
	followUpQuestion: string;
}

export async function chat(params: ChatStreamingParams): Promise<ChatResult> {
	console.log(params);
	const functionName = "create-tailwind-html-component";
	const response = await openai.chat.completions.create({
		model: "gpt-3.5-turbo",
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
								"HTML code for a Tailwind component and all quotes are escaped",
						},
						followUpQuestion: {
							type: "string",
							description:
								"Follow up question to ask whether the user is happy with the tailwind component",
						},
					},
					required: ["code", "followUpQuestion"],
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
