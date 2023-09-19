import * as babel from "@babel/standalone";
import React, { useEffect, useRef } from "react";
import { render } from "react-dom";

interface Props {
	name: string;
	value: string;
}

const createReactComponent = (value: string) => {
	const babelCode = babel.transform(value, {
		presets: ["react", "es2017"],
	}).code;

	const code = babelCode.replace('"use strict";', "").trim();
	const func = new Function("React", `return ${code}`);
	const component = func(React);
	return component;
};

export const Preview = ({ name, value }: Props) => {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (ref.current) {
			const Component = createReactComponent(value);
			render(<Component />, ref.current);
		}
	}, [value, ref.current]);

	return (
		<div
			ref={ref}
			className="flex items-center justify-center h-full overflow-auto p-10"
		/>
	);
};
