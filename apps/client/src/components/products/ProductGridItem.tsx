import Link from "next/link";
import { useContext } from "react";
import { FormattedMessage } from "react-intl";
import { CurrencyContext } from "../../contexts/CurrencyContextProvider";
import Image from "next/image";
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
	price: number;
	applyDiscount: boolean;
	discountPrice: number;
	slug: string;
	freeShipping: boolean;
	shipping: number;
}

const ProductGridItem = ({
	title,
	imageUrl,
	condition,
	price,
	applyDiscount,
	discountPrice,
	slug,
	freeShipping,
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
		<>
			<div className="w-2/5 sm:w-full">
				<Link href="/product-details/[slug]" as={`/product-details/${slug}`}>
					<a aria-label="Product Link">
						<Image
							src={
								imageUrl
									? process.env.NEXT_PUBLIC_BUCKET_URL + imageUrl
									: "/static/missing-image.png"
							}
							className="product-image"
							alt={title}
							width={300}
							height={300}
							key={imageUrl}
							placeholder="blur"
							blurDataURL={imagePlaceholder || getRgbDataUrl(RGB_PLACEHOLDER)}
							objectFit="contain"
						/>
					</a>
				</Link>
			</div>
			<div className="w-3/5 pl-4 sm:pl-0 sm:w-full sm:h-48 ">
				<Link href="/product-details/[slug]" as={`/product-details/${slug}`}>
					<a className="link truncate-2-lines sm:truncate-3-lines overflow-hidden sm:mt-4 text-xs sm:text-sm">
						{title}
					</a>
				</Link>
				<div className="my-2 text-2xs sm:text-xs">
					<span className="font-medium">
						<FormattedMessage id="condition" />:
					</span>
					<span className="ml-1">
						<FormattedMessage id={`condition.${condition}`} />
					</span>
				</div>
				{applyDiscount && (
					<span className="text-gray-700 dark:text-gray-400 line-through font-light text-xs sm:text-sm">
						{formattedPrice}
					</span>
				)}
				<div className="flex items-center font-medium">
					{priceParts.map(({ type, value }, index) => (
						<span
							className={
								type === "currency"
									? "text-2xs sm:text-xs"
									: "font-medium sm:text-lg"
							}
							key={index}
						>
							{value}
						</span>
					))}
				</div>
				<div className="text-2xs sm:text-xs">
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
		</>
	);
};

export default ProductGridItem;
