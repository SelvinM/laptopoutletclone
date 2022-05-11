import React from "react";
import Image from "next/image";
import { BiCreditCard } from "react-icons/bi";
import { CardBrand } from "@laptopoutlet-packages/types";
import visa from "../../../public/static/visa.png";
import mastercard from "../../../public/static/mastercard.png";
interface Props {
	cardBrand?: CardBrand;
	showAll?: boolean;
}

const CardBrandIcon = ({ cardBrand, showAll }: Props) => {
	if (showAll) {
		return (
			<div className="flex space-x-2">
				<div className="justify-center items-center flex">
					<Image
						src={visa}
						objectFit="contain"
						className="unselectable"
						height={18}
						width={25}
					/>
				</div>
				<div className="justify-center items-center flex">
					<Image
						src={mastercard}
						objectFit="contain"
						className="unselectable"
						height={18}
						width={25}
					/>
				</div>
			</div>
		);
	}
	switch (cardBrand) {
		case CardBrand.Mastercard:
			return (
				<Image
					src={mastercard}
					objectFit="contain"
					className="unselectable"
					height={18}
					width={25}
				/>
			);
		case CardBrand.Visa:
			return (
				<Image
					src={visa}
					objectFit="contain"
					className="unselectable"
					height={18}
					width={25}
				/>
			);
		default:
			return (
				<BiCreditCard className="text-2xl text-gray-500 dark:text-gray-400" />
			);
	}
};

export default CardBrandIcon;
