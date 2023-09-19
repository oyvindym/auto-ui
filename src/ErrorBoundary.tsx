import React, { ReactNode } from "react";

export class ErrorBoundary extends React.Component<
	{ children: ReactNode },
	{ error: Error | null }
> {
	constructor(props: { children: ReactNode }) {
		super(props);
		this.state = { error: null };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
		this.setState({ error });
	}

	render() {
		if (this.state.error) {
			return (
				<div className="flex flex-col justify-center h-full overflow-auto mx-auto w-5/10 p-10 gap-2">
					<strong>{this.state.error.message}</strong>

					<div className="bg-red-100 whitespace-pre overflow-auto p-2">
						{this.state.error.stack}
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
