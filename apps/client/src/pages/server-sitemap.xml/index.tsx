import { getServerSideSitemap, ISitemapField } from "next-sitemap";
import { GetServerSideProps } from "next";
import { Product, ProductDocument } from "@laptopoutlet-packages/models";
import { Model } from "mongoose";
import { dbConnect } from "@laptopoutlet-packages/utils";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	await dbConnect();
	const products = await (Product as Model<ProductDocument>).find({
		list: true,
		quantity: { $gt: 0 },
	});
	const fields: ISitemapField[] = products.map((product) => ({
		loc: `${process.env.NEXT_PUBLIC_URL}/product-details/${product.slug}`,
		lastmod: product.updatedAt.toISOString(),
	}));
	return getServerSideSitemap(ctx, fields);
};

// Default export to prevent next.js errors
export default () => {};
