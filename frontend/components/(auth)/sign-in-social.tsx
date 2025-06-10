'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { v4 as uuid } from 'uuid';
import { authClient } from '@/lib/auth-client';

type SignInSocialProps = {
	provider: 'github' | 'microsoft';
	children: React.ReactNode;
	className?: string;
};

export default function SignInSocial({
	provider,
	children,
	className,
}: SignInSocialProps) {
	const [loading, setLoading] = useState(false);

	return (
		<Button
			onClick={async () => {
				try {
					setLoading(true);
					await authClient.signIn.social({
						provider,
						callbackURL: `/chat/${uuid()}`,
					});
				} finally {
					setLoading(false);
				}
			}}
			type="button"
			className={className}
		>
			{children}
		</Button>
	);
}
