import AuthDirective from "./auth";
import GuestDirective from "./guest";
import SuperAdminDirective from "./superAdmin";
import RawInventoryEditorDirective from "./rawInventoryEditor";
import RawInventoryReaderDirective from "./rawInventoryReader";
import OrdersReaderDirective from "./ordersReader";
import UsersEditorDirective from "./usersEditor";
import UsersReaderDirective from "./usersReader";
import FinanceReaderDirective from "./financeReader";
import MerchandiseInventoryReaderDirective from "./merchandiseInventoryReader";
import MerchandiseInventoryEditorDirective from "./merchandiseInventoryEditor";
import OrdersEditorDirective from "./ordersEditor";

const schemaDirectives = {
	auth: AuthDirective,
	guest: GuestDirective,
	superAdmin: SuperAdminDirective,
	rawInventoryEditor: RawInventoryEditorDirective,
	rawInventoryReader: RawInventoryReaderDirective,
	merchandiseInventoryEditor: MerchandiseInventoryEditorDirective,
	merchandiseInventoryReader: MerchandiseInventoryReaderDirective,
	ordersReader: OrdersReaderDirective,
	ordersEditor: OrdersEditorDirective,
	usersEditor: UsersEditorDirective,
	usersReader: UsersReaderDirective,
	financeReader: FinanceReaderDirective,
};
export default schemaDirectives;
