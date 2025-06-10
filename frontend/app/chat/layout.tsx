import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import '../globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { SidebarWrapper } from '@/components/sidebar-wrapper';

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem
					disableTransitionOnChange
				>
					<SidebarProvider>
						<SidebarWrapper />
						<SidebarInset>{children}</SidebarInset>
					</SidebarProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
