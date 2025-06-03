'use client';

import * as React from 'react';
import { Check, ChevronDown, UserRoundSearch } from 'lucide-react';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface Client {
	id: string;
	name: string;
}

const clientes: Client[] = [
	{ id: '65cf4e352d52ba933878c161', name: 'Ford' },
	{ id: '2', name: 'Toyota' },
	{ id: '3', name: 'BMW' },
	{ id: '4', name: 'Mercedes' },
	{ id: '5', name: 'Volkswagen' },
];

export function ClienteSelector({
	onSelectClient,
}: { onSelectClient: (client: Client) => void }) {
	const [selectedClient, setSelectedClient] = React.useState<Client | null>(null);

	const handleSelectClient = (client: Client) => {
		setSelectedClient(client);
		onSelectClient(client);
	};

	return (
		<div className="flex items-center">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-[#00BC5F] outline-none hover:bg-green-800/10 select-none"
						aria-label="Selecionar cliente"
					>
						<UserRoundSearch className="h-4 w-4" />
						<span>
							{selectedClient
								? selectedClient.name
								: 'Selecionar o cliente'}
						</span>
						<ChevronDown className="h-4 w-4" />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56">
					{clientes.map(cliente => (
						<DropdownMenuItem
							key={cliente.id}
							className={cn(
								'flex cursor-pointer items-center justify-between',
								selectedClient?.id === cliente.id &&
									'bg-green-500/10'
							)}
							onClick={() => handleSelectClient(cliente)}
						>
							<span>{cliente.name}</span>
							{selectedClient?.id === cliente.id && (
								<Check className="h-4 w-4 text-green-500" />
							)}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
