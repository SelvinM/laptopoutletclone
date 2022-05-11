/* eslint-disable */
const path = require("path");
const withLess = require("next-plugin-antd-less");
const withPlugins = require("next-compose-plugins");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
	enabled: process.env.ANALYZE === "true",
});

module.exports = withPlugins([[withBundleAnalyzer], [withLess]], {
	webpack: (config, { defaultLoaders }) => {
		const resolvedBaseUrl = path.resolve(config.context, "../../");
		config.module.rules = [
			...config.module.rules,
			{
				test: /\.(tsx|ts|js|mjs|jsx)$/,
				include: [resolvedBaseUrl],
				use: defaultLoaders.babel,
				exclude: (excludePath) => {
					return /node_modules/.test(excludePath);
				},
			},
		];
		//graphql rules
		config.module.rules.push({
			test: /\.graphql$/,
			exclude: /node_modules/,
			use: [defaultLoaders.babel, { loader: "graphql-let/loader" }],
		});
		config.module.rules.push({
			test: /\.graphqls$/,
			exclude: /node_modules/,
			use: ["graphql-tag/loader", "graphql-let/schema/loader"],
		});
		//end of graphql rules
		return config;
	},
	images: {
		domains: ["storage.googleapis.com"],
	},
});
