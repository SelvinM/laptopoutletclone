import React from "react";
import { Card, Typography } from "antd";
interface Props {
	id?: string;
}

const Dashboard = ({}: Props) => {
	return (
		<div>
			<Card>
				<Typography.Title level={3} className="text-center">
					Laptop Outlet
				</Typography.Title>
			</Card>
		</div>
	);
};

export default Dashboard;
