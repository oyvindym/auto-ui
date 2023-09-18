interface Props {
	value: string;
}

export const Preview = ({ value }: Props) => {
	return (
		<div
			className="flex items-center justify-center h-full overflow-auto"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
			dangerouslySetInnerHTML={{ __html: value }}
		/>
	);
};
