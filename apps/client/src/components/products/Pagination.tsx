import { useRouter } from "next/router";
import React from "react";
import {
	BiChevronLeft,
	BiChevronRight,
	BiChevronsLeft,
	BiChevronsRight,
} from "react-icons/bi";
import { FormattedMessage } from "react-intl";
import { getParamAsString } from "@laptopoutlet-packages/utils";
import queryString from "query-string";
interface Props {
	total?: number | null;
	pageSize: number;
	asPath?: string;
	onChangeQueryObj?: object;
	paginatedObjects: string;
}

const Pagination = ({
	pageSize,
	total,
	onChangeQueryObj,
	asPath,
	paginatedObjects,
}: Props) => {
	let shownTotal = 0;
	if (total) shownTotal = total;
	if (shownTotal <= pageSize) {
		return null;
	}
	const router = useRouter();
	const totalPages = Math.ceil(shownTotal / pageSize);
	const page = Number(getParamAsString(router.query.page)) || 1;
	const handlePaginationChange = (page: number) => {
		//change url to selected page
		const currentPage = page !== 1 ? page : undefined;
		const formattedValues = queryString.stringify(
			{
				...router.query,
				...onChangeQueryObj,
				page: currentPage,
			},
			{}
		);
		router.push(
			{
				pathname: router.pathname,
				search: formattedValues,
			},
			{
				pathname: asPath || router.pathname,
				search: formattedValues,
			},
			{ shallow: true }
		);
		window.scrollTo({ top: 0 });
	};
	if (page > totalPages) {
		handlePaginationChange(1);
	}
	let buttons: number[] = [];
	if (totalPages < 6) {
		for (let i = 1; i <= totalPages; i++) {
			buttons.push(i);
		}
	} else if (totalPages === 6) {
		if (page < 4) buttons = [1, 2, 3, 4, 0];
		else buttons = [0, 3, 4, 5, 6];
	} else if (totalPages > 6) {
		if (page < 4) buttons = [1, 2, 3, 4, 0];
		else if (page >= 4 && page < totalPages - 2)
			buttons = [0, page - 1, page, page + 1, 0];
		else
			buttons = [0, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
	}

	return (
		<div className="flex justify-between items-center mt-4">
			<span className="text-xs sm:text-sm mr-4">
				<FormattedMessage
					id="pagination.rangeMessage"
					values={{
						range0: page * pageSize - pageSize + 1,
						range1:
							page === totalPages
								? page * pageSize - (pageSize - (shownTotal % pageSize))
								: page * pageSize,
						total: shownTotal,
						paginatedObjects,
					}}
				/>
			</span>
			<div className="text-xs sm:text-sm">
				<nav className="inline-flex xs:hidden shadow-sm">
					<button
						className={`-ml-px border btn px-1 sm:px-2 py-1 rounded-none ${
							page === 1
								? "btn-default-disabled"
								: "btn-default focus:ring-1 focus:ring-inset"
						}`}
						disabled={page === 1}
						aria-label="Previous"
						onClick={() => page !== 1 && handlePaginationChange(page - 1)}
					>
						<FormattedMessage id="previous" />
					</button>
					<button
						className={`-ml-px border btn px-1 sm:px-2 py-1 rounded-none ${
							page === totalPages
								? "btn-default-disabled"
								: "btn-default focus:ring-1 focus:ring-inset"
						}`}
						disabled={page === totalPages}
						aria-label="Next"
						onClick={() => handlePaginationChange(page + 1)}
					>
						<FormattedMessage id="next" />
					</button>
				</nav>
				<nav className="hidden xs:inline-flex shadow-sm z-0">
					<button
						className={`-ml-px border btn  px-1 sm:px-2 py-1 rounded-none ${
							page === 1
								? "btn-default-disabled"
								: "btn-default text-gray-600 focus:ring-inset focus:ring-1 focus:z-10"
						}`}
						disabled={page === 1}
						aria-label="First"
						onClick={() => handlePaginationChange(1)}
					>
						<BiChevronsLeft className="text-xl sm:text-2xl" />
					</button>
					<button
						className={`-ml-px border btn px-1 focus:z-10 sm:px-2 py-1 rounded-none ${
							page === 1
								? "btn-default-disabled"
								: "btn-default text-gray-600 focus:ring-inset focus:ring-1"
						}`}
						disabled={page === 1}
						aria-label="Previous"
						onClick={() => handlePaginationChange(page - 1)}
					>
						<BiChevronLeft className="text-xl sm:text-2xl" />
					</button>
					{buttons.map((button, index) => {
						if (button === 0) {
							return (
								<div
									className="-ml-px border dark:border-gray-600 btn px-3 sm:px-4 py-1 rounded-none bg-white dark:bg-gray-900"
									key={`dots-${index}`}
								>
									...
								</div>
							);
						} else {
							return (
								<button
									className={`-ml-px  font-medium btn px-3 sm:px-4 py-1 rounded-none ${
										page === button
											? "bg-white dark:bg-gray-900 shadow-inner border text-secondary-500 dark:text-secondary-200  border-secondary-500 dark:border-secondary-200 z-20"
											: "btn-default focus:ring-inset focus:ring-1 focus:z-10"
									}`}
									disabled={page === button}
									onClick={() => handlePaginationChange(button)}
									key={button}
								>
									{button}
								</button>
							);
						}
					})}
					<button
						className={`-ml-px border  btn px-1 sm:px-2 py-1 rounded-none ${
							page === totalPages
								? "btn-default-disabled"
								: "btn-default text-gray-600 focus:ring-inset focus:ring-1"
						}`}
						disabled={page === totalPages}
						aria-label="Next"
						onClick={() => handlePaginationChange(page + 1)}
					>
						<BiChevronRight className="text-xl sm:text-2xl" />
					</button>
					<button
						className={`-ml-px border btn px-1 sm:px-2 py-1 rounded-none  ${
							page === totalPages
								? "btn-default-disabled"
								: "btn-default text-gray-600 focus:ring-inset focus:ring-1"
						}`}
						disabled={page === totalPages}
						aria-label="Last"
						onClick={() => handlePaginationChange(totalPages)}
					>
						<BiChevronsRight className="text-xl sm:text-2xl" />
					</button>
				</nav>
			</div>
		</div>
	);
};

export default Pagination;
