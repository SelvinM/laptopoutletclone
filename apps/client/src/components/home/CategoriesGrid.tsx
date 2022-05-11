import Link from "next/link";
import React from "react";
import { FormattedMessage } from "react-intl";
import Image from "next/image";
import { useCategoriesQuery } from "../../libs/graphql/operations/category.graphql";
import SectionCard from "../common/SectionCard";
import { AiFillTags } from "react-icons/ai";
import getCurrentLocale from "../../utils/getCurrentLocale";
import { useRouter } from "next/router";
import { BooleanFilterType } from "../../types";
interface Props {}

const CategoriesGrid = ({}: Props) => {
	const { locale } = useRouter();
	const { data } = useCategoriesQuery({
		variables: { locale: getCurrentLocale(locale) },
	});
	return (
		<SectionCard
			title={
				<h2 className="text-xl sm:w-auto md:text-2xl inline-block sm:px-4 title">
					<FormattedMessage id="shopByCategory" />{" "}
				</h2>
			}
		>
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mt-10">
				{data?.categories
					.filter((category) => !category?.isOptional)
					.map(
						(category, index) =>
							category && (
								<Link
									href="/products/[categoryid]"
									as={`/products/${category.id}`}
									key={index}
								>
									<a className="flex justify-center flex-col items-center group">
										<div className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 mb-4 bg-gray-100 dark:bg-primary-100 rounded-full flex items-center justify-center">
											<Image
												src={
													category?.imageUrl
														? process.env.NEXT_PUBLIC_BUCKET_URL +
														  category?.imageUrl
														: "/static/missing-image.png"
												}
												alt={category.name}
												className="unselectable "
												width={200}
												height={200}
												key={category.imageUrl}
											/>
										</div>
										<span className="text-sm md:text-base lg:text-lg w-full truncate text-center group-hover:text-secondary-500 dark:group-hover:text-secondary-200">
											{category.name}
										</span>
									</a>
								</Link>
							)
					)}
				<Link
					href={{
						pathname: "/products/[categoryid]",
						query: {
							[BooleanFilterType.ApplyDiscount]: "true",
							categoryid: "all",
						},
					}}
				>
					<a className="flex justify-center flex-col items-center group">
						<div className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 mb-4 bg-primary-500 rounded-full  flex items-center justify-center">
							<AiFillTags className="text-5xl md:text-6xl lg:text-7xl text-tertiary-500" />
						</div>
						<span className="text-sm md:text-base lg:text-lg w-full truncate text-center group-hover:text-secondary-500 dark:group-hover:text-secondary-200">
							<FormattedMessage id="onSale.message" />
						</span>
					</a>
				</Link>
			</div>
		</SectionCard>
	);
};

export default CategoriesGrid;
