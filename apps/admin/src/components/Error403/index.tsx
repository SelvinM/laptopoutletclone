import { Result, Button } from "antd";
import Link from "next/link";
import React from "react";

interface Props {}

const Error403 = ({}: Props) => {
	return (
		<div className="text-center pt-60px">
			<Result
				status="403"
				title="403"
				subTitle="Lo sentimos, no tienes autorización para acceder a esta página."
				extra={
					<Link href="/">
						<Button type="primary">Regresar a inicio</Button>
					</Link>
				}
			/>
		</div>
	);
};

export default Error403;
