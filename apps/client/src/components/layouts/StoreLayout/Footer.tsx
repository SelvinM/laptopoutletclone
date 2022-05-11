import Link from "next/link";
import React from "react";
import { FormattedMessage } from "react-intl";
import {
	FaCcMastercard,
	FaCcVisa,
	FaFacebook,
	FaInstagram,
	FaWhatsapp,
} from "react-icons/fa";
import { BiMailSend, BiMap } from "react-icons/bi";
import { useGetConfigQuery } from "../../../libs/graphql/operations/config.graphql";
import getCurrentLocale from "apps/client/src/utils/getCurrentLocale";
import { useRouter } from "next/router";
import Image from "next/image";
import logo from "../../../../public/static/logo.png";
interface Props {}

const Footer = ({}: Props) => {
	const { locale } = useRouter();
	const currentLocale = getCurrentLocale(locale);
	const { data } = useGetConfigQuery({
		variables: { locale: currentLocale },
	});
	return (
		<div className=" bg-white dark:bg-gray-900 text-sm ">
			<div className="p-4 ">
				<div className="flex flex-wrap justify-between">
					<div className="w-full md:w-4/12 lg:w-4/12 md:px-8 p-4 ">
						<h4 className="uppercase my-5 title">
							<FormattedMessage id="footer.customerCare" />
						</h4>
						<ul className="grid grid-cols-1 gap-4">
							<li>
								<Link href="/blog/terms-of-use">
									<a className="link">
										<FormattedMessage id="blog.termsOfUse" />
									</a>
								</Link>
							</li>
							<li>
								<Link href="/blog/privacy-policy">
									<a className="link">
										<FormattedMessage id="blog.privacyPolicy" />
									</a>
								</Link>
							</li>
							<li>
								<Link href="/blog/shipping-info">
									<a className="link">
										<FormattedMessage id="blog.shippingInfo" />
									</a>
								</Link>
							</li>
							<li>
								<Link href="/blog/warranty-and-returns">
									<a className="link">
										<FormattedMessage id="blog.warrantyAndReturns" />
									</a>
								</Link>
							</li>
						</ul>
					</div>
					<div className="w-full md:w-4/12 lg:w-4/12 md:px-8 p-4">
						<h4 className="uppercase my-5 title">
							<FormattedMessage id="footer.aboutUs" />
						</h4>
						<p>
							<FormattedMessage
								id="footer.aboutUs.content"
								values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
							/>
						</p>
					</div>
					<div className="w-full md:w-4/12 lg:w-4/12 md:px-8 p-4">
						<h4 className="uppercase my-5 title">
							<FormattedMessage id="footer.contactUs" />
						</h4>
						<div className="flex">
							<div className="w-6">
								<FaWhatsapp size={25} />
							</div>
							<span className="ml-2 flex-auto">+(504) 3272-9950</span>
						</div>
						<div className="flex  mt-6">
							<div className="w-6">
								<BiMailSend size={25} />
							</div>
							<span className="ml-2 flex-auto">soporte@laptopoutlet.com</span>
						</div>
						<div className="flex  mt-6">
							<div className="w-6">
								<BiMap size={25} />
							</div>
							<span className="ml-2 flex-auto">
								<FormattedMessage id="footer.legalAddress" />
							</span>
						</div>
					</div>
				</div>
				<div className="flex  flex-wrap">
					<div className="w-full sm:w-6/12 md:w-4/12 lg:w-4/12 md:px-8 p-4 ">
						<h4 className="uppercase my-5 title">
							<FormattedMessage id="footer.payments" />
						</h4>
						<div className="flex">
							<FaCcMastercard size={22} />
							<FaCcVisa size={22} className="ml-2" />
						</div>
					</div>
					<div className="w-full sm:w-6/12 md:w-4/12 lg:w-4/12 md:px-8 p-4 ">
						<h4 className="uppercase my-5 title">
							<FormattedMessage id="footer.socials" />
						</h4>
						<div className="flex">
							<a
								href={data?.getConfig?.socialLinks?.facebook || "#"}
								target="_blank"
								rel="noreferrer"
								aria-label="Facebook"
								className="link"
							>
								<FaFacebook size={22} />
							</a>
							<a
								href={data?.getConfig?.socialLinks?.instagram || "#"}
								target="_blank"
								rel="noreferrer"
								aria-label="Instagram"
								className="ml-2 link"
							>
								<FaInstagram size={22} />
							</a>
						</div>
					</div>
					<div className="hidden md:flex w-full md:w-4/12 lg:w-4/12 md:px-8 p-4 h-100  items-end ">
						<Link href="/">
							<a>
								<Image
									src={logo}
									className="unselectable"
									objectFit="contain"
									width={176}
									height={42}
									alt={process.env.NEXT_PUBLIC_APP_NAME}
								/>
							</a>
						</Link>
					</div>
				</div>
				<div className="md:px-8 px-4 text-center sm:text-left pt-10 pb-6">
					<span>
						<FormattedMessage
							id="footer.copyright"
							values={{ appname: process.env.NEXT_PUBLIC_APP_NAME }}
						/>
					</span>
				</div>
			</div>
		</div>
	);
};

export default Footer;
