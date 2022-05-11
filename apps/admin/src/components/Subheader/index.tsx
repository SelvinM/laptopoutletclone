import React from "react";
import { Breadcrumb, Card, Space, Typography } from "antd";
import Link from "next/link";
const { Title } = Typography;
type Crumb = {
	name: string;
	href: string;
	as?: string;
};
interface Props {
	hidden?: boolean;
	title?: string;
	breadcrumbs?: Crumb[];
	children?: JSX.Element | string;
}

const Subheader = ({ hidden, title, breadcrumbs, children }: Props) => {
	return (
		<Card hidden={hidden}>
			<Space direction="vertical" size="small">
				<div className="breadcrumb-container">
					{breadcrumbs && breadcrumbs.length > 0 && (
						<Breadcrumb>
							{breadcrumbs?.map((breadcrumb, index) => (
								<Breadcrumb.Item key={index}>
									{index !== breadcrumbs.length - 1 ? (
										<Link href={breadcrumb.href} as={breadcrumb.as}>
											<a>{breadcrumb.name}</a>
										</Link>
									) : (
										breadcrumb.name
									)}
								</Breadcrumb.Item>
							))}
						</Breadcrumb>
					)}
				</div>

				<Title level={3}>{title}</Title>
			</Space>
			<div>{children}</div>
			<style jsx>
				{`
					.breadcrumb-container {
						min-height: 25px;
					}
				`}
			</style>
		</Card>
	);
};

export default Subheader;
