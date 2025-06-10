'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import Logo from '@/assets/BBPT.png';
import Image from 'next/image';
import SignInSocial from '@/components/(auth)/sign-in-social';

export default function LoginForm({
	className,
	...props
}: React.ComponentPropsWithoutRef<'div'>) {
	const fullText = 'Bem vindo ao';
	const [displayedText, setDisplayedText] = useState('');

	const fullEndText = 'BBPT CHAT';
	const [EndDisplayText, setEndDisplayedText] = useState('');

	useEffect(() => {
		let index = 0;
		const interval = setInterval(() => {
			index++;
			setDisplayedText(fullText.slice(0, index));
			if (index === fullText.length) {
				clearInterval(interval);

				let endIndex = 0;
				const endInterval = setInterval(() => {
					endIndex++;
					setEndDisplayedText(fullEndText.slice(0, endIndex));
					if (endIndex === fullEndText.length) {
						clearInterval(endInterval);
					}
				}, 100);
			}
		}, 100);

		return () => {
			clearInterval(interval);
		};
	}, []);

	return (
		<div
			className={cn(
				'flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10 bg-[#282828]',
				className
			)}
			{...props}
		>
			<form>
				<div className="flex flex-col gap-6">
					<div className="flex flex-col items-center gap-2">
						<a
							href="#"
							className="flex flex-col items-center gap-2 font-medium"
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-md select-none">
								<Image src={Logo} alt="Logo BBPT" width={60} height={60} />
							</div>
						</a>
						<h1 className="text-xl font-bold flex justify-center min-w-[250px]">
							<span className="text-[#DEDEDE]">
								{displayedText}{' '}
								<span className="text-[#00BC5F]">{EndDisplayText}</span>
							</span>
							<span className="text-[#00BC5F] animate-pulse">|</span>
						</h1>
					</div>
					<div className="flex flex-col gap-6">
						<SignInSocial
							className="w-full bg-[#00BC5F] hover:bg-[#058E4A] transition-colors duration-300"
							provider="github"
						>
							Clique para fazer login
						</SignInSocial>
					</div>

					<div className="grid gap-4 sm:grid-cols-2"></div>
				</div>
			</form>
		</div>
	);
}
