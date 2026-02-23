import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
const DiscordTimestamp = lazy(() => import('./index'));

export const tool = defineTool('time', {
  path: 'discord-timestamp',
  component: DiscordTimestamp,
  icon: 'mdi:clock',
  keywords: ['discord', 'timestamp', 'time'],
  i18n: {
    name: 'time:discordTimestamp.name',
    description: 'time:discordTimestamp.description',
    shortDescription: 'time:discordTimestamp.shortDescription'
  }
});
