import {
	DashboardOutlined,
	TeamOutlined,
	ReadOutlined,
	DropboxOutlined,
	FileDoneOutlined,
	SettingOutlined,
	EnvironmentOutlined,
	StockOutlined,
} from "@ant-design/icons";
import { Route } from "@ant-design/pro-layout/lib/typings";
import { Role } from "@laptopoutlet-packages/types";
import React from "react";
import {
	ADMINS_ROLES,
	CATEGORIES_ROLES,
	FINANCE_ROLES,
	MERCHANDISE_INVENTORY_ROLES,
	ORDERS_ROLES,
	RAW_INVENTORY_ROLES,
	STORE_SETTINGS_ROLES,
	USERS_ROLES,
	WAREHOUSES_ROLES,
} from "../constants/pageRoles";
import isUserAllowed from "../utils/isUserAllowed";
type GetRoutesParams = {
	id?: string;
	roles?: Role[];
};
function arrayUnique(array: Role[]) {
	let a = array.concat();
	for (let i = 0; i < a.length; ++i) {
		for (let j = i + 1; j < a.length; ++j) {
			if (a[i] === a[j]) a.splice(j--, 1);
		}
	}
	return a;
}
export const getRoutes = ({ id, roles = [] }: GetRoutesParams) => {
	const routes: Route = {
		path: "/",
		routes: [
			{
				path: "/",
				name: "Tablero",
				icon: <DashboardOutlined />,
			},
			{
				name: "Usuarios",
				icon: <TeamOutlined />,
				key: "all-users",
				hideInMenu: !isUserAllowed({
					allowedRoles: arrayUnique([...ADMINS_ROLES, ...USERS_ROLES]),
					roles,
				}),
				routes: [
					{
						path: "/admins",
						name: "Administradores",
						key: "admins",
						hideInMenu: !isUserAllowed({ allowedRoles: ADMINS_ROLES, roles }),
						parentKeys: ["all-users"],
						hideChildrenInMenu: true,
						routes: [
							{
								path: "/admins/add",
								name: "Agregar administrador",
								key: "admin-add",
								parentKeys: ["admins"],
							},
							{
								path: `/admins/edit/${id}`,
								name: "Editar administrador",
								key: "admin-edit",
								parentKeys: ["admins"],
							},
						],
					},
					{
						path: "/users",
						name: "Clientes",
						key: "users",
						hideInMenu: !isUserAllowed({ allowedRoles: USERS_ROLES, roles }),
						parentKeys: ["all-users"],
						hideChildrenInMenu: true,
						routes: [
							{
								path: `/users/details/${id}`,
								name: "Detalles del cliente",
								key: "users-details",
								parentKeys: ["users"],
							},
						],
					},
				],
			},
			{
				name: "Categorías",
				icon: <ReadOutlined />,
				path: "/categories",
				key: "categories",
				hideChildrenInMenu: true,
				hideInMenu: !isUserAllowed({ allowedRoles: CATEGORIES_ROLES, roles }),
				routes: [
					{
						path: "/categories/add",
						name: "Agregar categoría",
						key: "category-add",
						parentKeys: ["categories"],
					},
					{
						path: `/categories/edit/${id}`,
						name: "Editar categoría",
						key: "category-edit",
						parentKeys: ["categories"],
					},
				],
			},
			{
				name: "Inventario",
				key: "inventory",
				hideInMenu: !isUserAllowed({
					allowedRoles: arrayUnique([
						...MERCHANDISE_INVENTORY_ROLES,
						...RAW_INVENTORY_ROLES,
					]),
					roles,
				}),
				icon: <DropboxOutlined />,
				routes: [
					{
						path: "/raw-inventory",
						name: "Sin Procesar",
						key: "raw-inventory",
						parentKeys: ["inventory"],
						hideInMenu:
							true ||
							!isUserAllowed({
								allowedRoles: RAW_INVENTORY_ROLES,
								roles,
							}),
						hideChildrenInMenu: true,
						routes: [
							{
								path: "/raw-inventory/add",
								name: "Agregar producto",
								key: "piece-add",
								parentKeys: ["raw-inventory"],
							},
							{
								path: `/raw-inventory/edit/${id}`,
								name: "Editar producto",
								key: "piece-edit",
								parentKeys: ["raw-inventory"],
							},
							{
								path: `/raw-inventory/details/${id}`,
								name: "Detalles de producto",
								key: "piece-details",
								parentKeys: ["raw-inventory"],
							},
						],
					},
					{
						path: "/merchandise-inventory",
						name: "Mercancía",
						parentKeys: ["inventory"],
						key: "merchandise-inventory",
						hideChildrenInMenu: true,
						hideInMenu: !isUserAllowed({
							allowedRoles: MERCHANDISE_INVENTORY_ROLES,
							roles,
						}),
						routes: [
							{
								path: "/merchandise-inventory/add",
								name: "Agregar producto",
								parentKeys: ["merchandise-inventory"],
								key: "merchandise-add",
							},
							{
								path: `/merchandise-inventory/edit/${id}`,
								name: "Editar producto",
								parentKeys: ["merchandise-inventory"],
								key: "merchandise-edit",
							},
							{
								path: `/merchandise-inventory/details/${id}`,
								name: "Detalles de producto",
								parentKeys: ["merchandise-inventory"],
								key: "merchandise-details",
							},
						],
					},
				],
			},
			{
				name: "Bodegas",
				icon: <EnvironmentOutlined />,
				path: "/warehouses",
				key: "warehouses",
				hideChildrenInMenu: true,
				hideInMenu: !isUserAllowed({ allowedRoles: WAREHOUSES_ROLES, roles }),
				routes: [
					{
						path: "/warehouses/add",
						name: "Agregar bodega",
						key: "warehouse-add",
						parentKeys: ["warehouses"],
					},
					{
						path: `/warehouses/edit/${id}`,
						name: "Editar bodega",
						key: "warehouse-edit",
						parentKeys: ["warehouses"],
					},
				],
			},
			{
				name: "Finanzas",
				icon: <StockOutlined />,
				path: "/finance",
				hideInMenu:
					true || !isUserAllowed({ roles, allowedRoles: FINANCE_ROLES }),
			},
			{
				name: "Pedidos",
				hideInMenu: !isUserAllowed({ allowedRoles: ORDERS_ROLES, roles }),
				icon: <FileDoneOutlined />,
				key: "all-orders",
				routes: [
					{
						name: "Habilitados",
						path: "/orders",
						parentKeys: ["all-orders"],
						key: "orders",
						hideChildrenInMenu: true,
						routes: [
							{
								path: `/orders/details/${id}`,
								name: "Detalles de pedido",
								parentKeys: ["orders"],
								key: "orders-details",
							},
						],
					},
					{
						name: "Cancelados",
						path: "/cancellations",
						parentKeys: ["all-orders"],
						key: "cancellations",
						hideChildrenInMenu: true,
						routes: [
							{
								path: `/cancellations/details/${id}`,
								name: "Detalles de cancelación",
								parentKeys: ["cancellations"],
								key: "cancellations-details",
							},
						],
					},
				],
			},
			{
				name: "Configuración",
				icon: <SettingOutlined />,
				key: "settings",
				hideInMenu: !isUserAllowed({
					allowedRoles: STORE_SETTINGS_ROLES,
					roles,
				}),
				routes: [
					{
						name: "Tienda",
						path: "/store-settings",
						parentKeys: ["settings"],
					},
				],
			},
		],
	};
	return routes;
};
