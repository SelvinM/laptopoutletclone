import { LogoutOutlined, DownOutlined } from "@ant-design/icons";
import { useApolloClient } from "@apollo/client";
import { Dropdown, Menu, Button, message } from "antd";
import { useLogoutAdminMutation } from "../../libs/graphql/operations/admin.graphql";
import React from "react";
import { useRouter } from "next/router";
interface Props {
	name?: string;
}

const HeaderAccountDropdown = ({ name }: Props) => {
	const [logoutAdmin] = useLogoutAdminMutation();
	const client = useApolloClient();
	const router = useRouter();
	const logout = async () => {
		message.loading({
			content: "Saliendo...",
			key: "logout",
		});
		await client.resetStore();
		await logoutAdmin();
		message.destroy();
		router.reload();
	};
	return (
		<div id="account-dropdown-container">
			<Dropdown
				getPopupContainer={() =>
					document.getElementById("account-dropdown-container") as HTMLElement
				}
				overlay={
					<Menu>
						{/* <Menu.Item key="0">
							<UserOutlined /> Ver Perfil
						</Menu.Item>
						<Menu.Divider /> */}
						<Menu.Item key="3" onClick={logout}>
							<LogoutOutlined /> Cerrar Sesión
						</Menu.Item>
					</Menu>
				}
				placement="bottomRight"
				trigger={["click"]}
			>
				<Button onClick={(e) => e.preventDefault()} type="text">
					Hola {name} <DownOutlined />
				</Button>
			</Dropdown>
		</div>
	);
};

export default HeaderAccountDropdown;
