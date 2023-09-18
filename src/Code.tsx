import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Props {
	value: string;
}

export const Code = ({ value }: Props) => (
	<SyntaxHighlighter
		children={value}
		showLineNumbers
		language="typescript"
		style={vscDarkPlus}
		customStyle={{
			margin: 0,
			height: "100%",
		}}
	/>
);
