import { GetProductQuery } from "../../libs/graphql/operations/product.graphql";
import React from "react";
import { FormattedMessage } from "react-intl";
interface Props {
	data: GetProductQuery;
}
type Details = {
	[key: string]: string;
};
const ProductDetailsTable = ({ data }: Props) => {
	const details: Details = (data.getProduct as any).details;
	let descriptionItems: JSX.Element[] = [];
	for (const key in details) {
		if (details.hasOwnProperty(key)) {
			const element = details[key];
			if (key !== "__typename") {
				descriptionItems.push(
					<div
						key={key}
						className="flex border-b border-r dark:border-gray-600"
					>
						<div className="dark:bg-gray-900 text-right md:text-left dark:border-gray-600 bg-gray-100  p-4 w-1/2 sm:w-2/5 md:w-1/2 lg:w-2/5 border-r">
							<label className="font-medium dark:text-gray-400">
								<FormattedMessage id={`productDetails.${key}`} />
							</label>
						</div>
						<div className="p-4 w-1/2 sm:w-3/5 md:w-1/2 lg:w-3/5">
							<p>{element || <FormattedMessage id="notAvailable" />}</p>
						</div>
					</div>
				);
			}
		}
	}
	return (
		<div className="dark:border-gray-600 grid grid-cols-1 md:grid-cols-2 border-t text-sm sm:text-base md:text-sm lg:text-base border-l">
			<div className="dark:border-gray-600 flex border-b border-r ">
				<div className="dark:bg-gray-900 text-right md:text-left dark:border-gray-600 bg-gray-100  p-4 w-1/2 sm:w-2/5 md:w-1/2 lg:w-2/5 border-r ">
					<label className="font-medium dark:text-gray-400">
						<FormattedMessage id="brand" />
					</label>
				</div>
				<div className="p-4 w-1/2 sm:w-3/5 md:w-1/2 lg:w-3/5">
					<p>
						{data.getProduct?.manufacturer?.brand || (
							<FormattedMessage id="brand.generic" />
						)}
					</p>
				</div>
			</div>
			<div className="flex border-b border-r dark:border-gray-600">
				<div className="dark:bg-gray-900 text-right md:text-left dark:border-gray-600 bg-gray-100  p-4 border-r w-1/2 sm:w-2/5 md:w-1/2 lg:w-2/5 ">
					<label className="font-medium dark:text-gray-400">
						<FormattedMessage id="model" />
					</label>
				</div>
				<div className="p-4 w-1/2 sm:w-3/5 md:w-1/2 lg:w-3/5">
					<p>
						{data.getProduct?.manufacturer?.model || (
							<FormattedMessage id="notAvailable" />
						)}
					</p>
				</div>
			</div>
			{descriptionItems}
		</div>
	);
};

export default ProductDetailsTable;
