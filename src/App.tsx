import { ChatCompletionMessageParam } from "openai/resources/chat";
import { useState } from "react";
import { Code } from "./Code";
import { ErrorBoundary } from "./ErrorBoundary";
import { Preview } from "./Preview";
import { ChatResult, chat, fixOutput } from "./ai";

interface Message extends ChatCompletionMessageParam {
	timestamp: Date;
	hidden: boolean;
}

function App() {
	const [prompt, setPrompt] = useState("");
	const [loading, setLoading] = useState(false);
	const [messages, setMessages] = useState<Message[]>([]);
	const [output, setOutput] = useState<ChatResult | null>(null);

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

			if (response.success) {
				setOutput({
					name: response.body.name,
					code: fixOutput(response.body.code),
				});
				return;
			} else if (response.errorCode === "INVALID_JSON") {
				const response = await chat({
					messages: history
						.map<ChatCompletionMessageParam>((it) => {
							const { timestamp: _timestamp, hidden: _hidden, ...rest } = it;
							return rest;
						})
						.concat([
							{
								content:
									"The previous response included invalid JSON. Can you try again?",
								role: "user",
							},
						]),
				});

				if (response.success) {
					setOutput({
						name: response.body.name,
						code: fixOutput(response.body.code),
					});
					return;
				}
			}

			throw new Error("Something went wrong");
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="w-full h-full">
			<div className="grid grid-cols-4 h-screen w-full">
				<div className="bg-blue-100 col-span-1 p-4">
					<form className="flex gap-1 mb-4" onSubmit={handleSubmit}>
						<textarea
							className="border px-4 py-2 mr-2 w-full rounded-lg"
							placeholder="create a beautiful sign up form for new users to my app"
							value={prompt}
							onChange={(e) => {
								setPrompt(e.target.value);
							}}
						/>

						<button
							className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
							type="submit"
						>
							{loading ? "Working" : "Send"}
						</button>
					</form>

					<div className="flex flex-col flex-grow gap-4">
						{messages
							.filter((it) => it.hidden === false)
							.map((it) => (
								<div
									key={it.timestamp.getTime()}
									className="flex gap-2 items-start space-x-2"
								>
									<div className="bg-blue-600 text-white p-2 rounded-lg">
										<p>{it.content}</p>
									</div>
									<span className="text-xs text-gray-400">
										{it.timestamp.toISOString().split("T")[1].split(".")[0]}
									</span>
								</div>
							))}
					</div>
				</div>

				<div className="grid grid-rows-4 col-span-3 bg-white h-screen w-full relative">
					{output && (
						<>
							<div className="row-span-2 overflow-auto">
								<ErrorBoundary>
									<Preview value={output.code} name={output.name} />
								</ErrorBoundary>
							</div>
							<div className="row-span-2 overflow-auto">
								<Code value={output.code} />
							</div>
						</>
					)}

					{loading && (
						<div className="absolute inset-0 bg-white opacity-30 flex flex-col gap-4 mx-auto justify-center items-center">
							<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900" />
							<p>Generating</p>
						</div>
					)}

					{!output && !loading && (
						<div className="flex items-center justify-center h-full">
							Describe your component to get started
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default App;

{
	/* <div class="relative">
  <div class="absolute inset-0 bg-black opacity-30"></div>
  <!-- Your content goes here -->
</div> */
}
