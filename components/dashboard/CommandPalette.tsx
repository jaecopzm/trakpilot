'use client';

import { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Mail, BarChart3, Settings, Plus, RefreshCw, Search, ListChecks } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompose?: () => void;
  onRefresh?: () => void;
}

export default function CommandPalette({ open, onOpenChange, onCompose, onRefresh }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const handleSelect = (callback: () => void) => {
    callback();
    onOpenChange(false);
    setSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-xl">
        <Command className="rounded-lg border-none">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Type a command or search..."
              value={search}
              onValueChange={setSearch}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            <Command.Group heading="Actions">
              {onCompose && (
                <Command.Item
                  onSelect={() => handleSelect(onCompose)}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent aria-selected:bg-accent"
                >
                  <Plus className="h-4 w-4" />
                  <span>Compose Email</span>
                  <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    N
                  </kbd>
                </Command.Item>
              )}
              {onRefresh && (
                <Command.Item
                  onSelect={() => handleSelect(onRefresh)}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent aria-selected:bg-accent"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                  <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    R
                  </kbd>
                </Command.Item>
              )}
            </Command.Group>

            <Command.Separator className="my-1 h-px bg-border" />

            <Command.Group heading="Navigate">
              <Command.Item
                onSelect={() => handleSelect(() => router.push('/dashboard'))}
                className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent aria-selected:bg-accent"
              >
                <Mail className="h-4 w-4" />
                <span>Dashboard</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => router.push('/dashboard/analytics'))}
                className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent aria-selected:bg-accent"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => router.push('/dashboard/sequences'))}
                className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent aria-selected:bg-accent"
              >
                <ListChecks className="h-4 w-4" />
                <span>Sequences</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => router.push('/dashboard/settings'))}
                className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent aria-selected:bg-accent"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
