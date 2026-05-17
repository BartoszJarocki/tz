export interface SlackCommandPayload {
  token: string;
  team_id: string;
  team_domain: string;
  channel_id: string;
  channel_name: string;
  user_id: string;
  user_name: string;
  command: string;
  text: string;
  response_url: string;
  trigger_id: string;
}

export interface SlackResponse {
  response_type?: 'ephemeral' | 'in_channel';
  text?: string;
  blocks?: SlackBlock[];
  attachments?: unknown[];
}

// Block Kit types
export type SlackBlock = HeaderBlock | SectionBlock | DividerBlock | ContextBlock | ActionsBlock;

export interface HeaderBlock {
  type: 'header';
  text: PlainTextElement;
}

export interface SectionBlock {
  type: 'section';
  text?: TextElement;
  fields?: TextElement[];
  accessory?: unknown;
}

export interface DividerBlock {
  type: 'divider';
}

export interface ContextBlock {
  type: 'context';
  elements: (TextElement | ImageElement)[];
}

export interface ActionsBlock {
  type: 'actions';
  elements: unknown[];
}

export interface PlainTextElement {
  type: 'plain_text';
  text: string;
  emoji?: boolean;
}

export interface MrkdwnElement {
  type: 'mrkdwn';
  text: string;
}

export type TextElement = PlainTextElement | MrkdwnElement;

export interface ImageElement {
  type: 'image';
  image_url: string;
  alt_text: string;
}

export interface TimezoneConversion {
  timezone: string;
  city: string;
  time: string;
  offset: string;
  dayDiff?: string;
}
