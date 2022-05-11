import { Button, Result } from "antd";
import Link from "next/link";
import React from "react";

interface Props {}

const Custom404 = ({}: Props) => {
	return (
		<div className="text-center pt-60px">
			<Result
				status="404"
				title="404"
				subTitle="La página que estás buscando no existe."
				extra={
					<Link href="/">
						<Button type="primary">Regresar a inicio</Button>
					</Link>
				}
			/>
		</div>
	);
};

export default Custom404;
