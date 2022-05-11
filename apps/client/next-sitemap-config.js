module.exports = {
	siteUrl: process.env.NEXT_PUBLIC_URL,
	generateRobotsTxt: true,
	exclude: [
		"/settings/*",
		"/checkout",
		"/cart",
		"/signin/*",
		"/orders",
		"/orders/*",
		"/product-details/*",
	],
	robotsTxtOptions: {
		policies: [
			{
				userAgent: "*",
				allow: "/",
				disallow: [
					"/settings/",
					"/cart",
					"/checkout",
					"/orders",
					"/orders/",
					"/signin/",
				],
			},
		],
		additionalSitemaps: [`${process.env.NEXT_PUBLIC_URL}/server-sitemap.xml`],
	},
};
