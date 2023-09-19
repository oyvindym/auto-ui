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

export async function chat(
	params: ChatStreamingParams,
): Promise<
	| { success: true; body: ChatResult }
	| { success: false; errorCode: "INVALID_JSON" | "UNKNOWN" | "NO_ARGUMENTS" }
> {
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
		try {
			const data = JSON.parse(args) as ChatResult;
			return {
				success: true,
				body: data,
			};
		} catch (err: unknown) {
			if (err instanceof Error) {
				if (/bad\scontrol\scharacter/i.test(err.message)) {
					return {
						success: false,
						errorCode: "INVALID_JSON",
					};
				} else {
					return {
						success: false,
						errorCode: "UNKNOWN",
					};
				}
			} else {
				throw err;
			}
		}
	}

	return {
		success: false,
		errorCode: "NO_ARGUMENTS",
	};
}

export const fixOutput = (code: string): string =>
	code.replace(/h-screen/g, "h-full");
