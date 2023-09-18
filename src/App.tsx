import { ChatCompletionMessageParam } from "openai/resources/chat";
import { useState } from "react";
import { Code } from "./Code";
import { Preview } from "./Preview";
import { chat, fixOutput } from "./ai";

interface Message extends ChatCompletionMessageParam {
	timestamp: Date;
	hidden: boolean;
}

function App() {
	const [prompt, setPrompt] = useState("");
	const [loading, setLoading] = useState(false);
	const [messages, setMessages] = useState<Message[]>([]);
	const [output, setOutput] = useState("");

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const history = [...messages];

		if (output) {
			const previousOutputMessage: Message = {
				hidden: true,
				role: "user",
				content: `To my previous message, you responded with this code: ${output}`,
				timestamp: new Date(),
			};

			history.push(previousOutputMessage);
		}

		const message: Message = {
			content: prompt,
			role: "user",
			timestamp: new Date(),
			hidden: false,
		};

		history.push(message);
		setMessages(history);
		setPrompt("");
		setLoading(true);
		try {
			const response = await chat({
				messages: history.map<ChatCompletionMessageParam>((it) => {
					const { timestamp: _timestamp, hidden: _hidden, ...rest } = it;
					return rest;
				}),
			});

			console.log(response);

			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content: response.followUpQuestion,
					timestamp: new Date(),
					hidden: false,
				},
			]);
			setOutput(fixOutput(response.code));
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="grid grid-cols-2 gap-4 h-full">
			<div className="flex flex-col h-full p-4 gap-4">
				<form className="flex gap-4" onSubmit={handleSubmit}>
					<textarea
						className="border px-4 py-2 mr-2 w-full"
						placeholder="write code using only HTML and Tailwind CSS for a login form"
						value={prompt}
						onChange={(e) => {
							setPrompt(e.target.value);
						}}
					/>

					<button
						className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
						type="submit"
					>
						{loading ? "Working" : "Send"}
					</button>
				</form>

				<div className="flex flex-col flex-grow gap-2">
					{messages
						.filter((it) => it.hidden === false)
						.map((it) => (
							<div
								key={it.timestamp.getTime()}
								className={
									it.role === "user"
										? "flex items-start space-x-2"
										: "flex items-start space-x-2 justify-end"
								}
							>
								<div className="bg-gray-100 p-2 rounded-lg">
									<p className="text-gray-700">{it.content}</p>
								</div>
								<span className="text-xs text-gray-400">
									{it.timestamp.toISOString().split("T")[1].split(".")[0]}
								</span>
							</div>
						))}
				</div>
			</div>

			<div className="h-full">
				{output && (
					<div className="grid grid-rows-2 h-full">
						<div className="row-span-1 overflow-auto">
							<Preview value={output} />
						</div>
						<div className="row-span-1 overflow-auto">
							<Code value={output} />
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default App;
