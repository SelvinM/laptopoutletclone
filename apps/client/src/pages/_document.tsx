import Document, {
	Html,
	Head,
	Main,
	NextScript,
	DocumentContext,
} from "next/document";
class MyDocument extends Document {
	static async getInitialProps(ctx: DocumentContext) {
		const initialProps = await Document.getInitialProps(ctx);
		return initialProps;
	}
	render() {
		return (
			<Html lang="es">
				<Head />
				<body className="bg-gray-50 text-gray-800 dark:bg-gray-950 dark:text-gray-300">
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument;
