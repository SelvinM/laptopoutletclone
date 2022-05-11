import { useGetConfigQuery } from "../../libs/graphql/operations/config.graphql";
import Link from "next/link";
import React, { FunctionComponent } from "react";
import Image from "next/image";
import getCurrentLocale from "../../utils/getCurrentLocale";
import { useRouter } from "next/router";
import { getRgbDataUrl } from "../../utils/getRgbDataUrl";
interface Props {}

const HomeBanner: FunctionComponent<Props> = ({}) => {
	const { locale } = useRouter();
	const { data } = useGetConfigQuery({
		variables: { locale: getCurrentLocale(locale) },
	});
	return (
		<div className="relative xs:rounded-md overflow-hidden bg-[#FECCCB] ">
			<Link
				href={data?.getConfig?.homeBanner.href || "/"}
				as={data?.getConfig?.homeBanner.as || undefined}
			>
				<a>
					{data?.getConfig?.homeBanner.imageUrl && (
						<Image
							src={`${process.env.NEXT_PUBLIC_BUCKET_URL}${data?.getConfig?.homeBanner.imageUrl}`}
							alt={data?.getConfig?.homeBanner.title || ""}
							sizes="	(min-width: 1024px) 1024px,
									(min-width: 1280px) 1536px,
									768px"
							width={1800}
							height={650}
							placeholder="blur"
							objectFit="contain"
							blurDataURL={
								data.getConfig.homeBanner.imagePlaceholder ||
								getRgbDataUrl([29, 27, 74])
							}
							quality={85}
						/>
					)}
					<div className="absolute max-h-32 sm:max-h-full top-0 right-0 w-full text-primary-500 h-full text-right">
						{data?.getConfig && (
							<div className="w-48 p-3 sm:w-6/12 lg:w-5/12 flex flex-col justify-between h-full sm:p-8 lg:p-12 float-right">
								<div className="flex justify-between flex-col h-14 sm:h-24 md:h-28 xl:h-36">
									<h1 className="title dark:text-primary-500 leading-none xs:leading-normal text-sm sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">
										{data?.getConfig?.homeBanner.title}
									</h1>
									<p className="text-2xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl truncate-2-lines">
										{data?.getConfig?.homeBanner.message}
									</p>
								</div>
								<div className="lg:mb-10">
									<span className="px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 lg:px-6 lg:py-3 text-2xs leading-none sm:text-sm md:text-base lg:text-lg rounded-full border-primary-500 border sm:border-2 inline-block">
										{data?.getConfig?.homeBanner.buttonLabel}
									</span>
								</div>
							</div>
						)}
					</div>
				</a>
			</Link>
		</div>
	);
};

export default HomeBanner;
