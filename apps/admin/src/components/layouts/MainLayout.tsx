import React, { useContext } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MenuDataItem } from "@ant-design/pro-layout/lib/typings";
import { useRouter } from "next/router";
import { LoadingContext } from "../../contexts/LoadingContext";
import { Spin } from "antd";
import { getRoutes } from "../getRoutes";
import { getParamAsString } from "@laptopoutlet-packages/utils";
import HeaderAccountDropdown from "../HeaderAccountDropdown";
import { useMeQuery } from "../../libs/graphql/operations/admin.graphql";
import Login from "../LoginForm";
import { SiderMenuProps } from "@ant-design/pro-layout/lib/components/SiderMenu/SiderMenu";
const ProLayout = dynamic(() => import("@ant-design/pro-layout"), {
	ssr: false,
});
const menuItemRender = (options: MenuDataItem, element: React.ReactNode) => {
	if (typeof options.path === "string") {
		return (
			<Link href={options.path}>
				<a>{element}</a>
			</Link>
		);
	}
};

const menuHeaderRender = (
	logoDom: React.ReactNode,
	titleDom: React.ReactNode,
	props: SiderMenuProps | undefined
) => (
	<Link href="/">
		<div>
			{logoDom}
			{!props?.collapsed && titleDom}
		</div>
	</Link>
);

interface Props {
	children?: any;
}

export const MainLayout = ({ children }: Props) => {
	const router = useRouter();
	const { loading } = useContext(LoadingContext);
	const { data: meData } = useMeQuery();
	const rightContentRender = () => {
		return (
			<div className="pr-20px">
				<HeaderAccountDropdown name={meData?.me?.firstname} />
			</div>
		);
	};
	const isLoggedIn = meData?.me;
	return (
		<>
			{isLoggedIn || router.pathname === "/404" ? (
				<ProLayout
					style={{ height: "100vh" }}
					route={getRoutes({
						id: getParamAsString(router.query.id),
						roles: meData?.me?.roles,
					})}
					pure={router.pathname === "/404"}
					rightContentRender={rightContentRender}
					title="Laptop Outlet"
					logo="/static/logo-small-alt.png"
					menuItemRender={menuItemRender}
					menuHeaderRender={menuHeaderRender}
					disableContentMargin
				>
					<Spin spinning={loading} size="large">
						<div
							style={{
								height: isLoggedIn ? "calc(100vh - 50px)" : "100vh",
								overflow: "auto",
							}}
						>
							<div className={`${loading ? "display-none" : "display-block"}`}>
								{children}
							</div>
						</div>
					</Spin>
				</ProLayout>
			) : (
				<Login />
			)}
		</>
	);
};
