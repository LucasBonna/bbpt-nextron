'use client';

import * as React from 'react';
import {
	CirclePlus,
	Search,
	Edit3,
	Trash2,
	MoreHorizontal,
	MessageSquareText,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

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
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { NavUser } from './nav-user';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { deleteteChat, renameChat } from '@/actions/chat';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface AppSidebarProps {
	chats: {
		id: string;
		name: string | null;
	}[];
}

export function AppSidebar({ chats }: AppSidebarProps) {
	const pathname = usePathname();
	const router = useRouter();
	const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
	const [renameDialogOpen, setRenameDialogOpen] = React.useState(false);
	const [selectedChatId, setSelectedChatId] = React.useState<string>('');
	const [newChatName, setNewChatName] = React.useState('');
	const [isDeleting, setIsDeleting] = React.useState(false);
	const [isRenaming, setIsRenaming] = React.useState(false);
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

	const handleDeleteChat = async () => {
		if (!selectedChatId) return;

		setIsDeleting(true);
		try {
			console.log('selectedChatId', selectedChatId);
			await deleteteChat(selectedChatId);

			console.log('pathname', pathname);

			if (pathname === `/chat/${selectedChatId}/`) {
				router.push(`/chat/${crypto.randomUUID()}`);
			}

			toast.success('Conversa excluída com sucesso');
		} catch (error) {
			console.error('Erro ao excluir a conversa:', error);
			toast.error('Falha ao excluir a conversa');
		} finally {
			setIsDeleting(false);
			setDeleteDialogOpen(false);
			setSelectedChatId('');
		}
	};

	const handleRenameChat = async () => {
		if (!selectedChatId || !newChatName.trim()) return;

		setIsRenaming(true);
		try {
			await renameChat(selectedChatId, newChatName.trim());
			toast.success('Nome da conversa alterado com sucesso');
		} catch (error) {
			console.error('Erro ao alterar o nome da conversa:', error);
			toast.error('Falha ao alterar o nome da conversa');
		} finally {
			setIsRenaming(false);
			setRenameDialogOpen(false);
			setSelectedChatId('');
			setNewChatName('');
		}
	};

	const openDeleteDialog = (chatId: string) => {
		setSelectedChatId(chatId);
		setDeleteDialogOpen(true);
	};

	const openRenameDialog = (chatId: string, currentName: string | null) => {
		setSelectedChatId(chatId);
		setNewChatName(currentName || `Chat ${chatId.substring(0, 8)}...`);
		setRenameDialogOpen(true);
	};

	if (isPending || error) {
		return null;
	}

	return (
		<>
			<Sidebar collapsible="icon">
				<SidebarHeader>
					<div className="flex items-center justify-between px-2 py-2">
						<h2 className="text-xl text-[#00BC5F] font-semibold">
							ByeBye
							<span className="text-[#BABABA]">Paper</span>
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
							<div className="w-full">
								<Link
									href={`/chat/${crypto.randomUUID()}`}
									className="inline-flex items-center gap-2 px-2 py-1.5 rounded-md transition-all duration-200 hover:bg-green-800/10 select-none"
								>
									<CirclePlus className="size-5 text-[#00BC5F]" />
									<span className="text-[#00BC5F] font-semibold">
										Nova conversa
									</span>
								</Link>
							</div>
							<br />
						</SidebarGroupContent>
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
													<MessageSquareText className="h-4 w-4 shrink-0" />
													<span>
														{chat.name || `Chat ${chat.id.substring(0, 8)}...`}
													</span>
												</Link>
											</SidebarMenuButton>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<SidebarMenuAction showOnHover>
														<MoreHorizontal />
														<span className="sr-only">More</span>
													</SidebarMenuAction>
												</DropdownMenuTrigger>
												<DropdownMenuContent
													className="w-48"
													side="right"
													align="start"
												>
													<DropdownMenuItem
														onClick={() => openRenameDialog(chat.id, chat.name)}
													>
														<Edit3 className="h-4 w-4" />
														<span>Renomear</span>
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => openDeleteDialog(chat.id)}
														variant="destructive"
														className="hover:bg-destructive/10"
													>
														<Trash2 className="h-4 w-4 text-red-500" />
														<span className="text-red-400">Excluir</span>
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
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

			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
						<AlertDialogDescription>
							Esta ação não pode ser revertida. Isso irá excluir a conversa e
							todas as suas mensagens.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteChat}
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90 bg-[#E02E2A] hover:bg-[#E02E2A]/80 text-white"
						>
							{isDeleting ? 'Excluindo...' : 'Excluir'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Rename Dialog */}
			<Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Renomear conversa</DialogTitle>
						<DialogDescription>
							Digite um novo nome para esta conversa.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-1 py-4">
						<div className="grid grid-cols-4 items-center">
							<Label htmlFor="name" className="text-right invisible">
								Nome
							</Label>
							<Input
								id="name"
								value={newChatName}
								onChange={e => setNewChatName(e.target.value)}
								className="col-span-4"
								placeholder="Digite o nome da conversa..."
								onKeyDown={e => {
									if (e.key === 'Enter') {
										handleRenameChat();
									}
								}}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setRenameDialogOpen(false)}
						>
							Cancelar
						</Button>
						<Button
							className="bg-[#00BC5F] hover:bg-[#00BC5F]/90 text-white"
							type="button"
							onClick={handleRenameChat}
							disabled={isRenaming || !newChatName.trim()}
						>
							{isRenaming ? 'Alterando...' : 'Renomear'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
