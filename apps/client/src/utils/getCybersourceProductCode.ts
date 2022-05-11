import { ProductType } from "@laptopoutlet-packages/types";
import { CybersourceProductCode } from "../types";

const getCybersourceProductCode = (type: ProductType) => {
	switch (type) {
		case ProductType.ComputerProduct:
			return CybersourceProductCode.ElectronicGood;
		default:
			return CybersourceProductCode.Default;
	}
};
export default getCybersourceProductCode;
