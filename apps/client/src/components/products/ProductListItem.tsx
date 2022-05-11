import React, { useContext } from "react";
import { CurrencyContext } from "../../contexts/CurrencyContextProvider";
import Image from "next/image";
import Link from "next/link";
import { FormattedMessage } from "react-intl";
import getCurrentLocale from "../../utils/getCurrentLocale";
import { useRouter } from "next/router";
import { getPriceFormatter } from "@laptopoutlet-packages/utils";
import { getRgbDataUrl } from "../../utils/getRgbDataUrl";
import { RGB_PLACEHOLDER } from "../../constants";
interface Props {
	title: string;
	imageUrl?: string;
	imagePlaceholder?: string | null;
	condition: string;
	brand?: string | null;
	price: number;
	applyDiscount: boolean;
	discountPrice: number;
	slug: string;
	freeShipping: boolean;
	shipping: number;
}

const ProductListItem = ({
	title,
	imageUrl,
	condition,
	price,
	applyDiscount,
	discountPrice,
	slug,
	freeShipping,
	brand,
	shipping,
	imagePlaceholder,
}: Props) => {
	const { locale } = useRouter();
	const currentLocale = getCurrentLocale(locale);
	const { currency: ctxCurrency } = useContext(CurrencyContext);
	const priceFormatter = getPriceFormatter(currentLocale, ctxCurrency);
	const priceParts = priceFormatter.formatToParts(
		applyDiscount ? discountPrice : price
	);
	const formattedShipping = priceFormatter.format(shipping || 0);
	const formattedPrice = priceFormatter.format(price || 0);
	return (
		<div className="border-b dark:border-gray-600 p-4 sm:px-6 md:px-8">
			<div className="xs:hidden mb-2">
				<Link href="/product-details/[slug]" as={`/product-details/${slug}`}>
					<a className="text-sm xs:text-base link truncate-3-lines overflow-hidden">
						{title}
					</a>
				</Link>
			</div>
			<div className="flex">
				<div className="w-2/5 sm:w-auto">
					<Link href="/product-details/[slug]" as={`/product-details/${slug}`}>
						<a aria-label="Link para detalles de producto">
							<div className="w-full sm:w-48 sm:h-48 xl:w-56 xl:h-56">
								<Image
									src={
										imageUrl
											? process.env.NEXT_PUBLIC_BUCKET_URL + imageUrl
											: "/static/missing-image.png"
									}
									className="product-image"
									width={300}
									height={300}
									alt={title}
									placeholder="blur"
									blurDataURL={
										imagePlaceholder || getRgbDataUrl(RGB_PLACEHOLDER)
									}
									objectFit="contain"
									key={imageUrl}
								/>
							</div>
						</a>
					</Link>
				</div>
				<div className="w-3/5 sm:w-auto pl-4 md:pl-10 lg:pl-8 flex-auto ">
					<Link
						href={{
							pathname: "/products/[categoryid]",
							query: { brand: brand || "undefined" },
						}}
						as={`/products/all?brand=${brand || "undefined"}`}
					>
						<a className="btn btn-primary h-5 px-1 text-2xs xs:mb-2">
							{brand || <FormattedMessage id="brand.generic" />}
						</a>
					</Link>
					<div className="hidden w-full xs:block md:mb-4">
						<Link
							href="/product-details/[slug]"
							as={`/product-details/${slug}`}
						>
							<a className="md:mr-6 link text-xs sm:text-sm md:text-base xl:text-lg truncate-2-lines sm:max-h-10 md:max-h-12  xl:max-h-16 overflow-hidden">
								{title}
							</a>
						</Link>
					</div>
					<div className="my-2 xl:my-3 text-2xs xs:text-xs">
						<span className="font-medium sm:text-sm">
							<FormattedMessage id="condition" />:
						</span>
						<span className="ml-1 sm:text-sm">
							<FormattedMessage id={`condition.${condition}`} />
						</span>
					</div>
					{applyDiscount && (
						<span className="text-gray-700 dark:text-gray-400 font-light line-through text-xs md:text-sm ">
							{formattedPrice}
						</span>
					)}
					<div className="flex items-center font-medium">
						{priceParts.map(({ type, value }, index) => (
							<span
								className={
									type === "currency"
										? "text-xs sm:text-sm "
										: "text-lg sm:text-xl "
								}
								key={index}
							>
								{value}
							</span>
						))}
					</div>
					<div className="text-2xs xs:text-xs">
						{!freeShipping ? (
							<FormattedMessage
								id="shippingLabel"
								values={{ shipping: formattedShipping }}
							/>
						) : (
							<FormattedMessage id="freeShipping" />
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProductListItem;
