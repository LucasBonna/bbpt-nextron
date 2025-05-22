import { getBasicChatInfo } from '@/actions/chat';
import { AppSidebar } from './app-sidebar';

export async function SidebarWrapper() {
	const chats = await getBasicChatInfo();

	return <AppSidebar chats={chats} />;
}
