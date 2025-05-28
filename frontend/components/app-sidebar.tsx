'use client';

import * as React from 'react';
import { MessageSquare, CirclePlus, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInput,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { NavUser } from './nav-user';
import { authClient } from '@/lib/auth-client';

interface AppSidebarProps {
	chats: {
		id: string;
		name: string | null;
	}[];
}

export function AppSidebar({ chats }: AppSidebarProps) {
	const pathname = usePathname();
	const [searchQuery, setSearchQuery] = React.useState('');
	const { data: userSession, isPending, error } = authClient.useSession();

	const filteredChats = React.useMemo(() => {
		if (!searchQuery.trim()) return chats;

		return chats.filter(chat =>
			(chat.name?.toLowerCase() || chat.id.toLowerCase()).includes(
				searchQuery.toLowerCase()
			)
		);
	}, [chats, searchQuery]);

	if (isPending || error) {
		return null;
	}

	return (
		<Sidebar collapsible='icon'>
			<SidebarHeader>
				<div className="flex items-center justify-between px-2 py-2">
					<h2 className="text-xl text-[#00BC5F] font-semibold">ByeBye
						<span className='text-[#BABABA]'>Paper</span>
					</h2>
				</div>
				<form className="px-2 pb-2">
					<SidebarGroup className="py-0">
						<SidebarGroupContent className="relative right-2.5">
							<Label htmlFor="search" className="sr-only">
								Search Chats
							</Label>
							<SidebarInput
								id="search"
								placeholder="Buscar conversas..."
								className="pl-8"
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
							/>
							<Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 select-none opacity-50" />
						</SidebarGroupContent>
					</SidebarGroup>
				</form>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<Button variant="ghost" size="default" asChild>
							<Link href={`/chat/${crypto.randomUUID()}`} className="-ml-2">
								<CirclePlus className="size-6 text-[#00BC5F]" />
								<span className="text-[#00BC5F] -ml-1">Nova conversa</span>
							</Link>
						</Button>
					</SidebarGroupContent>
					<br>
					</br>
					<SidebarGroupLabel>Conversas recentes</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{filteredChats.length > 0 ? (
								filteredChats.map(chat => (
									<SidebarMenuItem key={chat.id}>
										<SidebarMenuButton
											asChild
											isActive={pathname === `/chat/${chat.id}`}
											tooltip={chat.id}
										>
											<Link href={`/chat/${chat.id}`}>
												<MessageSquare className="h-4 w-4 shrink-0" />
												<span>
													{chat.name || `Chat ${chat.id.substring(0, 8)}...`}
												</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))
							) : (
								<div className="px-2 py-3 text-sm text-muted-foreground">
									{searchQuery ? 'No chats found' : 'No chats yet'}
								</div>
							)}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={userSession.user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
