import {
	OrderItemStatus,
	ProductCondition,
	ProductType,
	Role,
	ShipmentStatus,
} from "@laptopoutlet-packages/types";

export const translateProductType = (productType?: ProductType) => {
	switch (productType) {
		case ProductType.ComputerProduct:
			return "Computadora";

		default:
			return "Indefinido";
	}
};

export const translateShipmentStatus = (shipmentStatus?: ShipmentStatus) => {
	switch (shipmentStatus) {
		case ShipmentStatus.Pending:
			return "Pendiente";

		default:
			return "Enviado";
	}
};

export const translateOrderItemStatus = (shipmentStatus?: OrderItemStatus) => {
	switch (shipmentStatus) {
		case OrderItemStatus.PartialReturn:
			return "Devuelto parcialmente";
		case OrderItemStatus.Returned:
			return "Devuelto";
		default:
			return "Normal";
	}
};

export const translateProductCondition = (condition?: ProductCondition) => {
	switch (condition) {
		case ProductCondition.New:
			return "Nuevo";
		case ProductCondition.OpenBox:
			return "Abierto, sin usar";
		case ProductCondition.LikeNew:
			return "Como nuevo";
		case ProductCondition.Used:
			return "Usado";
		case ProductCondition.Refurbished:
			return "Restaurado";
		case ProductCondition.ForParts:
			return "Para partes o no funcional";
		default:
			return undefined;
	}
};

export const translateRoles = (role: Role) => {
	switch (role) {
		case Role.SuperAdmin:
			return "Super Admin";
		case Role.OrdersReader:
			return "Lector de Pedidos";
		case Role.OrdersEditor:
			return "Editor de Pedidos";
		case Role.UsersEditor:
			return "Editor de Clientes";
		case Role.UsersReader:
			return "Lector de Clientes";
		case Role.RawInventoryEditor:
			return "Editor de Inventario Sin Procesar";
		case Role.RawInventoryReader:
			return "Lector de Inventario Sin Procesar";
		case Role.MerchandiseInventoryReader:
			return "Lector de Inventario de mercancía";
		case Role.MerchandiseInventoryEditor:
			return "Editor de Inventario de mercancía";
		case Role.RawInventoryReader:
			return "Lector de Inventario de mercancía";
		case Role.FinanceReader:
			return "Lector de Finanzas";
		default:
			return undefined;
	}
};

export const getRoleDescription = (role: Role) => {
	switch (role) {
		case Role.SuperAdmin:
			return "Acceso total";
		case Role.OrdersReader:
			return "Permisos para ver los pedidos";
		case Role.OrdersEditor:
			return "Permisos para cambiar estado de los pedidos";
		case Role.UsersEditor:
			return "Permisos para ver información de los clientes y poder bloquearlos";
		case Role.UsersReader:
			return "Permisos para ver información de los clientes";
		case Role.RawInventoryEditor:
			return "Permisos para ver y editar el inventario sin procesar";
		case Role.RawInventoryReader:
			return "Permisos para ver el inventario sin procesar";
		case Role.MerchandiseInventoryEditor:
			return "Permisos para ver y editar el inventario de mercancía";
		case Role.MerchandiseInventoryReader:
			return "Permisos para ver el inventario de mercancía";
		case Role.FinanceReader:
			return "Permisos para ver información financiera";
		default:
			return undefined;
	}
};
