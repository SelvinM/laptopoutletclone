import { useRef } from "react";
import useOutsideClickListener from "../../utils/useOutsideClickListener";

interface OutsideClickListenerProps {
	onOutsideClick: () => void;
	children: any;
}

const OutsideClickListener = ({
	onOutsideClick,
	children,
}: OutsideClickListenerProps) => {
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	useOutsideClickListener(wrapperRef, onOutsideClick);
	return <div ref={wrapperRef}>{children}</div>;
};
export default OutsideClickListener;
