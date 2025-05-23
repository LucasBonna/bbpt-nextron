'use client';

import * as React from 'react';
import { MessageSquare, Plus, Search } from 'lucide-react';
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
	SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface AppSidebarProps {
	chats: {
		id: string;
		name: string | null;
	}[];
}

export function AppSidebar({ chats }: AppSidebarProps) {
	const pathname = usePathname();
	const [searchQuery, setSearchQuery] = React.useState('');

	const filteredChats = React.useMemo(() => {
		if (!searchQuery.trim()) return chats;

		return chats.filter(chat =>
			(chat.name?.toLowerCase() || chat.id.toLowerCase()).includes(
				searchQuery.toLowerCase()
			)
		);
	}, [chats, searchQuery]);

	return (
		<Sidebar collapsible='icon'>
			<SidebarHeader>
				<div className="flex items-center justify-between px-2 py-2">
					<h2 className="text-lg font-semibold">BBPT Chat</h2>
					<Button variant="ghost" size="icon" asChild>
						<Link href="/chat/new">
							<Plus className="h-5 w-5" />
							<span className="sr-only">New Chat</span>
						</Link>
					</Button>
				</div>
				<form className="px-2 pb-2">
					<SidebarGroup className="py-0">
						<SidebarGroupContent className="relative">
							<Label htmlFor="search" className="sr-only">
								Search Chats
							</Label>
							<SidebarInput
								id="search"
								placeholder="Search chats..."
								className="pl-8"
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
							/>
							<Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 select-none opacity-50" />
						</SidebarGroupContent>
					</SidebarGroup>
				</form>
				<SidebarSeparator />
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
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
				<div className="p-2">
					<Button className="w-full" asChild>
						<Link href="/chat/new">
							<Plus className="mr-2 h-4 w-4" />
							New Chat
						</Link>
					</Button>
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}
