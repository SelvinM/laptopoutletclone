import React from "react";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { FormattedMessage } from "react-intl";
import { GetCartQuery } from "../../libs/graphql/operations/cart.graphql";
import { MeQuery } from "../../libs/graphql/operations/user.graphql";
import goToSignIn from "../../utils/goToSignIn";
import Card from "../common/Card";
import MessageWithLink from "../common/MessageWithAction";
import CartItemSkeleton from "../skeletons/CartItemSkeleton";
import CartItem from "./CartItem";

interface Props {
	loading?: boolean;
	dataMe?: MeQuery;
	data?: GetCartQuery;
	title: JSX.Element | string;
	isCheckout?: boolean;
}

const CartItems = ({ data, loading, dataMe, title, isCheckout }: Props) => {
	const hasProducts =
		!!data?.getCart?.cartItems.some((item) => !!item?.product) ||
		!!data?.getCart?.instaCheckout?.product?.id; //Hacemos esto por si existen en el carrito productos que se han eliminado de la base de datos
	return (
		<Card title={title}>
			<>
				{loading ? (
					<div className="p-4 sm:p-8 ">
						<div className="py-4 pb-4">
							<CartItemSkeleton />
						</div>
						<div className="border-t dark:border-gray-600 py-4 pb-4">
							<CartItemSkeleton />
						</div>
						<div className="border-t dark:border-gray-600 py-4 pb-4">
							<CartItemSkeleton />
						</div>
					</div>
				) : !dataMe?.me ? (
					<MessageWithLink
						action={() => goToSignIn()}
						buttonLabel={<FormattedMessage id="signIn" />}
						message={<FormattedMessage id="cart.signIn" />}
					/>
				) : !hasProducts ||
				  ((!data?.getCart?.cartItems || data.getCart.cartItems.length <= 0) &&
						!(isCheckout && data?.getCart?.instaCheckout)) ? (
					<MessageWithLink
						buttonLabel={<FormattedMessage id="continueShopping" />}
						icon={<AiOutlineShoppingCart />}
						message={<FormattedMessage id="cart.emptyMessage" />}
						link={{ href: "/" }}
					/>
				) : (
					<div className="p-4 sm:p-8">
						{isCheckout && data?.getCart.instaCheckout?.product ? (
							<CartItem
								title={data.getCart.instaCheckout.product.listing.longTitle}
								quantity={data.getCart.instaCheckout.quantity}
								productid={data.getCart.instaCheckout.product.id}
								slug={data.getCart.instaCheckout.product.slug}
								condition={data.getCart.instaCheckout.product.condition}
								discountPrice={
									data.getCart.instaCheckout.product.pricing.discountPrice
								}
								isInstaCheckout={!!data.getCart.instaCheckout}
								price={data.getCart.instaCheckout.product.pricing.price}
								shipping={data.getCart.instaCheckout.product.pricing.shipping}
								freeShipping={data.getCart.instaCheckout.product.freeShipping}
								applyDiscount={data.getCart.instaCheckout.product.applyDiscount}
								list={data.getCart.instaCheckout.product.list}
								maxQuantity={data.getCart.instaCheckout.product.quantity}
								imageUrl={data.getCart.instaCheckout.product.images?.[0]?.url}
							/>
						) : (
							data?.getCart?.cartItems.map(
								(item, index) =>
									item?.product && (
										<div
											className={`${
												index > 0 ? "border-t dark:border-gray-600" : ""
											} ${
												data.getCart && data.getCart.cartItems.length === 1
													? ""
													: index === 0
													? "pb-4"
													: data.getCart &&
													  index === data.getCart.cartItems.length - 1
													? "pt-4"
													: "py-4"
											}`}
											key={index}
										>
											<CartItem
												title={item.product.listing.longTitle}
												quantity={item.quantity}
												productid={item.product.id}
												slug={item.product.slug}
												condition={item.product.condition}
												discountPrice={item.product.pricing.discountPrice}
												price={item.product.pricing.price}
												shipping={item.product.pricing.shipping}
												freeShipping={item.product.freeShipping}
												applyDiscount={item.product.applyDiscount}
												list={item.product.list}
												maxQuantity={item.product.quantity}
												imageUrl={item.product.images?.[0]?.url}
												imagePlaceholder={item.product.images?.[0]?.placeholder}
											/>
										</div>
									)
							)
						)}
					</div>
				)}
			</>
		</Card>
	);
};

export default CartItems;
