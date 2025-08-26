'use client';

import { formatInTimeZone } from 'date-fns-tz';
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
import { type ParsedTimeCommand, parseTimeCommand } from '@/utils/time-parser';
import { convertTimeToTimezones, type TimezoneConversion } from '@/utils/timezone-utils';

interface TimezoneCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TimezoneCommand({ open, onOpenChange }: TimezoneCommandProps) {
  const [query, setQuery] = useState('');
  const [parsedCommand, setParsedCommand] = useState<ParsedTimeCommand | null>(null);
  const [conversions, setConversions] = useState<TimezoneConversion[]>([]);
  const [recentCommands, setRecentCommands] = useState<string[]>([]);

  // Load recent commands from localStorage on component mount
  useEffect(() => {
    const stored = localStorage.getItem('timezone-recent-commands');
    if (stored) {
      try {
        setRecentCommands(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recent commands:', e);
      }
    }
  }, []);

  // Parse command and generate conversions when query changes
  useEffect(() => {
    if (!query.trim()) {
      setParsedCommand(null);
      setConversions([]);
      return;
    }

    // Debounce to prevent excessive calls
    const timeoutId = setTimeout(() => {
      console.log('Parsing query:', query);
      const parsed = parseTimeCommand(query);
      console.log('Parsed result:', parsed);
      setParsedCommand(parsed);

      if (parsed) {
        try {
          console.log('Converting timezones:', {
            sourceTime: parsed.sourceTime,
            sourceTimezone: parsed.sourceTimezone,
            targetTimezones: parsed.targetTimezones,
          });
          const results = convertTimeToTimezones(
            parsed.sourceTime,
            parsed.sourceTimezone,
            parsed.targetTimezones
          );
          console.log('Conversion results:', results);
          setConversions(results);
        } catch (error) {
          console.error('Error converting timezones:', error);
          setConversions([]);
        }
      } else {
        console.log('No parsed command found');
        setConversions([]);
      }
    }, 150); // 150ms debounce

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelectConversion = (conversion: TimezoneConversion) => {
    const timeString = `${conversion.time} ${conversion.offset} (${conversion.city})${
      conversion.dayDiff ? ` ${conversion.dayDiff}` : ''
    }`;

    navigator.clipboard.writeText(timeString).then(() => {
      // Add to recent commands if it's a valid command
      if (parsedCommand) {
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

  const suggestedCommands = [
    '3pm EST to PST',
    'now in London',
    'meeting at 10am PST',
    '14:00 Paris to Tokyo, NYC',
    '9am CST to GMT, CET',
  ];

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
                {suggestedCommands.map(command => (
                  <CommandItem key={command} onSelect={() => handleSelectRecentCommand(command)}>
                    <Globe className="mr-2 h-4 w-4" />
                    {command}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {query && !parsedCommand && (
            <CommandEmpty>Try formats like "3pm EST to PST" or "now in London"</CommandEmpty>
          )}

          {parsedCommand && conversions.length > 0 && (
            <CommandGroup heading="Conversions">
              {conversions.map((conversion, index) => {
                const sourceTime = formatInTimeZone(
                  parsedCommand.sourceTime,
                  parsedCommand.sourceTimezone,
                  'h:mm a'
                );
                const sourceInfo =
                  parsedCommand.sourceTimezone.split('/').pop()?.replace('_', ' ') ||
                  parsedCommand.sourceTimezone;

                return (
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
                        From {sourceTime} {sourceInfo}
                      </div>
                    )}
                  </CommandItem>
                );
              })}
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
