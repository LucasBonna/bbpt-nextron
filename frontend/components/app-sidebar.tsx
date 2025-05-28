'use client';

import * as React from 'react';
import { MessageSquare, CirclePlus, Search, Edit3, Trash2, MoreHorizontal } from 'lucide-react';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface AppSidebarProps {
	chats: {
		id: string;
		name: string | null;
	}[];
}

export function AppSidebar({ chats }: AppSidebarProps) {
	const pathname = usePathname();
	const router = useRouter()
	const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
	const [renameDialogOpen, setRenameDialogOpen] = React.useState(false)
	const [selectedChatId, setSelectedChatId] = React.useState<string>("")
	const [newChatName, setNewChatName] = React.useState("")
	const [isDeleting, setIsDeleting] = React.useState(false)
	const [isRenaming, setIsRenaming] = React.useState(false)
	const [searchQuery, setSearchQuery] = React.useState('');
	const { data: userSession, isPending, error } = authClient.useSession();

	const filteredChats = React.useMemo(() => {
		if (!searchQuery.trim()) return chats;

		return chats.filter((chat) =>
			(chat.name?.toLowerCase() || chat.id.toLowerCase()).includes(searchQuery.toLowerCase()),
		  )
	}, [chats, searchQuery])

	const handleDeleteChat = async () => {
		if (!selectedChatId) return
	
		setIsDeleting(true)
		try {
			console.log("selectedChatId", selectedChatId)
		  await deleteteChat(selectedChatId)
	
		  console.log("pathname", pathname);
	
		  if (pathname === `/chat/${selectedChatId}/`) {
			router.push(`/chat/${crypto.randomUUID()}`)
		  }
	
		  toast.success("Chat deleted successfully")
		} catch (error) {
		  console.error("Error deleting chat:", error)
		  toast.error("Failed to delete chat")
		} finally {
		  setIsDeleting(false)
		  setDeleteDialogOpen(false)
		  setSelectedChatId("")
		}
	}

	const handleRenameChat = async () => {
		if (!selectedChatId || !newChatName.trim()) return
	
		setIsRenaming(true)
		try {
		  await renameChat(selectedChatId, newChatName.trim())
		  toast.success("Chat renamed successfully")
		} catch (error) {
		  console.error("Error renaming chat:", error)
		  toast.error("Failed to rename chat")
		} finally {
		  setIsRenaming(false)
		  setRenameDialogOpen(false)
		  setSelectedChatId("")
		  setNewChatName("")
		}
	}

	const openDeleteDialog = (chatId: string) => {
		setSelectedChatId(chatId)
		setDeleteDialogOpen(true)
	}

	const openRenameDialog = (chatId: string, currentName: string | null) => {
		setSelectedChatId(chatId)
		setNewChatName(currentName || `Chat ${chatId.substring(0, 8)}...`)
		setRenameDialogOpen(true)
	}

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
					  onChange={(e) => setSearchQuery(e.target.value)}
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
				<br />
				<SidebarGroupLabel>Conversas recentes</SidebarGroupLabel>
				<SidebarGroupContent>
				  <SidebarMenu>
					{filteredChats.length > 0 ? (
					  filteredChats.map((chat) => (
						<SidebarMenuItem key={chat.id}>
						  <SidebarMenuButton asChild isActive={pathname === `/chat/${chat.id}`} tooltip={chat.id}>
							<Link href={`/chat/${chat.id}`}>
							  <MessageSquare className="h-4 w-4 shrink-0" />
							  <span>{chat.name || `Chat ${chat.id.substring(0, 8)}...`}</span>
							</Link>
						  </SidebarMenuButton>
						  <DropdownMenu>
							<DropdownMenuTrigger asChild>
							  <SidebarMenuAction showOnHover>
								<MoreHorizontal />
								<span className="sr-only">More</span>
							  </SidebarMenuAction>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-48" side="right" align="start">
							  <DropdownMenuItem onClick={() => openRenameDialog(chat.id, chat.name)}>
								<Edit3 className="h-4 w-4" />
								<span>Rename</span>
							  </DropdownMenuItem>
							  <DropdownMenuItem
								onClick={() => openDeleteDialog(chat.id)}
								className="text-destructive focus:text-destructive"
							  >
								<Trash2 className="h-4 w-4" />
								<span>Delete</span>
							  </DropdownMenuItem>
							</DropdownMenuContent>
						  </DropdownMenu>
						</SidebarMenuItem>
					  ))
					) : (
					  <div className="px-2 py-3 text-sm text-muted-foreground">
						{searchQuery ? "No chats found" : "No chats yet"}
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
				<AlertDialogTitle>Are you sure?</AlertDialogTitle>
				<AlertDialogDescription>
				  This action cannot be undone. This will permanently delete the chat and all its messages.
				</AlertDialogDescription>
			  </AlertDialogHeader>
			  <AlertDialogFooter>
				<AlertDialogCancel>Cancel</AlertDialogCancel>
				<AlertDialogAction
				  onClick={handleDeleteChat}
				  disabled={isDeleting}
				  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
				>
				  {isDeleting ? "Deleting..." : "Delete"}
				</AlertDialogAction>
			  </AlertDialogFooter>
			</AlertDialogContent>
		  </AlertDialog>
	
		  {/* Rename Dialog */}
		  <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
			<DialogContent className="sm:max-w-[425px]">
			  <DialogHeader>
				<DialogTitle>Rename Chat</DialogTitle>
				<DialogDescription>Enter a new name for this chat conversation.</DialogDescription>
			  </DialogHeader>
			  <div className="grid gap-4 py-4">
				<div className="grid grid-cols-4 items-center gap-4">
				  <Label htmlFor="name" className="text-right">
					Name
				  </Label>
				  <Input
					id="name"
					value={newChatName}
					onChange={(e) => setNewChatName(e.target.value)}
					className="col-span-3"
					placeholder="Enter chat name..."
					onKeyDown={(e) => {
					  if (e.key === "Enter") {
						handleRenameChat()
					  }
					}}
				  />
				</div>
			  </div>
			  <DialogFooter>
				<Button type="button" variant="outline" onClick={() => setRenameDialogOpen(false)}>
				  Cancel
				</Button>
				<Button type="button" onClick={handleRenameChat} disabled={isRenaming || !newChatName.trim()}>
				  {isRenaming ? "Renaming..." : "Rename"}
				</Button>
			  </DialogFooter>
			</DialogContent>
		  </Dialog>
		</>
	  )
	}
	