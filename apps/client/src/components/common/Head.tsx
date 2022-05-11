import * as React from "react";
import NextHead from "next/head";

type ChildrenElement = JSX.Element | undefined | boolean | null | string;
interface Props {
	title?: string;
	children?: ChildrenElement | ChildrenElement[];
	fontHref?: string;
	canonical?: string;
}

const Head = ({ title, children, canonical }: Props) => {
	return (
		<React.Fragment>
			<NextHead>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<meta httpEquiv="x-ua-compatible" content="ie=edge" />
				{canonical && (
					<link
						rel="canonical"
						href={`${process.env.NEXT_PUBLIC_URL}${canonical}`}
					/>
				)}
				<title>{title}</title>
				{children}
			</NextHead>
		</React.Fragment>
	);
};

export default Head;
