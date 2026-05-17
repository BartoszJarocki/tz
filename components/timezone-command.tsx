'use client';

import { Clock, Copy, Globe } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  convertTimezoneCommand,
  type TimezoneConversionCommandResult,
  type TimezoneConversionDisplayRow,
} from '@/utils/timezone-conversion';

interface TimezoneCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SUGGESTED_COMMANDS = [
  '3pm EST to PST',
  'now in London',
  'meeting at 10am PST',
  '14:00 Paris to Tokyo, NYC',
  '9am CST to GMT, CET',
];

export function TimezoneCommand({ open, onOpenChange }: TimezoneCommandProps) {
  const [query, setQuery] = useState('');
  const [conversionResult, setConversionResult] = useState<TimezoneConversionCommandResult | null>(
    null
  );
  const [recentCommands, setRecentCommands] = useState<string[]>([]);
  const conversions = conversionResult?.conversions ?? [];

  // Load recent commands from localStorage on component mount
  useEffect(() => {
    const stored = localStorage.getItem('timezone-recent-commands');
    if (stored) {
      try {
        setRecentCommands(JSON.parse(stored));
      } catch {
        setRecentCommands([]);
      }
    }
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setConversionResult(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      setConversionResult(convertTimezoneCommand(query));
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelectConversion = (conversion: TimezoneConversionDisplayRow) => {
    navigator.clipboard.writeText(conversion.clipboardText).then(() => {
      if (conversionResult) {
        addToRecentCommands(query);
      }
      onOpenChange(false);
    });
  };

  const handleSelectRecentCommand = useCallback((command: string) => {
    setQuery(command);
  }, []);

  const addToRecentCommands = useCallback(
    (command: string) => {
      const updated = [command, ...recentCommands.filter(c => c !== command)].slice(0, 5);
      setRecentCommands(updated);
      localStorage.setItem('timezone-recent-commands', JSON.stringify(updated));
    },
    [recentCommands]
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command className="rounded-lg border shadow-md" shouldFilter={false}>
        <CommandInput
          placeholder="Convert time zones... (e.g., '3pm EST to PST')"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {!query && (
            <>
              {recentCommands.length > 0 && (
                <CommandGroup heading="Recent">
                  {recentCommands.map(command => (
                    <CommandItem key={command} onSelect={() => handleSelectRecentCommand(command)}>
                      <Clock className="mr-2 h-4 w-4" />
                      {command}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              <CommandSeparator />

              <CommandGroup heading="Try these examples">
                {SUGGESTED_COMMANDS.map(command => (
                  <CommandItem key={command} onSelect={() => handleSelectRecentCommand(command)}>
                    <Globe className="mr-2 h-4 w-4" />
                    {command}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {query && !conversionResult && (
            <CommandEmpty>Try formats like "3pm EST to PST" or "now in London"</CommandEmpty>
          )}

          {conversionResult && conversions.length > 0 && (
            <CommandGroup heading="Conversions">
              {conversions.map((conversion, index) => (
                <CommandItem
                  key={conversion.timezone}
                  value={`${conversion.time} ${conversion.offset} ${conversion.city}`}
                  onSelect={() => handleSelectConversion(conversion)}
                  className="flex flex-col items-start p-3"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2">
                      <Copy className="h-4 w-4 opacity-50" />
                      <span className="font-medium">
                        {conversion.time} {conversion.offset}
                      </span>
                    </div>
                    {conversion.dayDiff && (
                      <span className="text-xs text-muted-foreground">{conversion.dayDiff}</span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground ml-6">{conversion.city}</div>
                  {index === 0 && (
                    <div className="text-xs text-muted-foreground ml-6 mt-1">
                      From {conversionResult.source.time} {conversionResult.source.abbreviation}
                    </div>
                  )}
                </CommandItem>
              ))}
              <div className="px-3 py-2 text-xs text-muted-foreground">
                Click any result to copy to clipboard
              </div>
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
