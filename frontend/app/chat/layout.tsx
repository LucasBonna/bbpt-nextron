import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import '../globals.css'
import { AppSidebar } from '@/components/app-sidebar'
import { ThemeProvider } from '@/components/theme-provider'

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
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
						<AppSidebar />
						<SidebarInset>
							<SidebarTrigger />
							{children}
						</SidebarInset>
					</SidebarProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}
