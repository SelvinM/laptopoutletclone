import React, {
	ChangeEvent,
	FunctionComponent,
	useEffect,
	useState,
} from "react";
import { BiSearch } from "react-icons/bi";
import { useIntl } from "react-intl";
import OutsideClickListener from "../../common/OutsideClickListener";
import AutocompleteDropdown from "./AutocompleteDropdown";
import queryString from "query-string";
import { useRouter } from "next/router";
import { useGetProductsLazyQuery } from "../../../libs/graphql/operations/product.graphql";
import getCurrentLocale from "apps/client/src/utils/getCurrentLocale";
interface Props {}

const SearchBar: FunctionComponent<Props> = ({}) => {
	const [value, setValue] = useState<string>();
	const [visible, setVisible] = useState<boolean>(false);
	const router = useRouter();
	const { formatMessage } = useIntl();
	const [getProducts, { data, loading, error }] = useGetProductsLazyQuery();
	const [searchFocused, setSearchFocused] = useState(false);
	error && console.error("getProductsLazyQuery error", error);
	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value);
	};
	const handleSearchClick = () => {
		if (value !== "" && !!value) {
			setVisible(true);
		}
	};

	useEffect(() => {
		const timeOutId = setTimeout(() => {
			const newValue = value?.trim();
			if (newValue && newValue.length > 2) {
				setVisible(true);
				getProducts({
					variables: {
						getFacets: false,
						getTotal: true,
						limit: 3,
						search: newValue,
						locale: getCurrentLocale(router.locale),
					},
				});
			} else {
				setVisible(false);
			}
		}, 320);
		return () => clearTimeout(timeOutId);
	}, [value]);
	const handleSearch = (e?: React.FormEvent<HTMLFormElement>) => {
		e?.preventDefault();
		const newValue = value?.trim();
		if (newValue !== "" && !!newValue) {
			const formattedValues = queryString.stringify(
				{
					search: newValue,
				},
				{}
			);
			router.push(
				{ pathname: "/products/[categoryid]", search: formattedValues },
				{ pathname: "/products/all", search: formattedValues }
			);
			setVisible(false);
		}
	};
	const closeDropdown = () => setVisible(false);

	return (
		<OutsideClickListener onOutsideClick={() => setVisible(false)}>
			<div className="relative">
				<div
					className={`${
						visible ? "rounded-t-md" : "rounded-md"
					} relative flex items-center text-base`}
				>
					<form onSubmit={handleSearch} className="w-full">
						<input
							className={`pl-2 py-2 pr-12 input w-full ${
								visible ? "rounded-t-md rounded-b-none" : "rounded-md"
							}`}
							aria-label="Buscar productos"
							onChange={handleChange}
							onFocusCapture={() => setSearchFocused(true)}
							onBlurCapture={() => setSearchFocused(false)}
							onClick={handleSearchClick}
							placeholder={formatMessage({ id: "searchProducts" })}
						/>
						<button
							type="submit"
							aria-label="Buscar"
							className={`absolute border-primary-500 right-0 h-full px-3 btn btn-primary rounded-none ${
								visible ? "rounded-tr-md" : "rounded-r-md"
							} ${searchFocused ? "dark:border-secondary-200 " : ""}`}
						>
							<BiSearch size={20} />
						</button>
					</form>
				</div>
				<AutocompleteDropdown
					getProductsQuery={data}
					searchAction={() => handleSearch()}
					visible={visible}
					loading={loading}
					closeDropdown={closeDropdown}
				/>
			</div>
		</OutsideClickListener>
	);
};

export default SearchBar;
