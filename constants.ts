
import { ChannelType, Server, User, UserStatus, Permission, Role, Language, Theme } from './types';

export const DEFAULT_ROLES: Role[] = [
  { id: 'r-admin', name: 'Admin', color: '#ef4444', permissions: [Permission.ADMINISTRATOR], position: 0 },
  { id: 'r-mod', name: 'Moderator', color: '#6366f1', permissions: [Permission.MANAGE_CHANNELS, Permission.SEND_MESSAGES], position: 1 },
  { id: 'r-everyone', name: 'everyone', color: '#94a3b8', permissions: [Permission.SEND_MESSAGES, Permission.CONNECT, Permission.SPEAK], position: 2 }
];

export const PERMISSIONS_LIST = [
  { id: Permission.ADMINISTRATOR, label: 'Administrator', description: 'Udziela wszystkich uprawnień. To niebezpieczne!' },
  { id: Permission.MANAGE_SERVER, label: 'Zarządzanie serwerem', description: 'Pozwala edytować nazwę i ikonę serwera.' },
  { id: Permission.MANAGE_ROLES, label: 'Zarządzanie rolami', description: 'Pozwala tworzyć i edytować role.' },
  { id: Permission.MANAGE_CHANNELS, label: 'Zarządzanie kanałami', description: 'Pozwala tworzyć, edytować i usuwać kanały.' },
  { id: Permission.KICK_MEMBERS, label: 'Wyrzucanie członków', description: 'Pozwala wyrzucać użytkowników z serwera.' },
  { id: Permission.BAN_MEMBERS, label: 'Banowanie członków', description: 'Pozwala banować użytkowników na stałe.' },
  { id: Permission.SEND_MESSAGES, label: 'Wysyłanie wiadomości', description: 'Pozwala pisać na kanałach tekstowych.' },
  { id: Permission.CONNECT, label: 'Łączenie', description: 'Pozwala dołączać do kanałów głosowych.' },
  { id: Permission.SPEAK, label: 'Mówienie', description: 'Pozwala rozmawiać na kanałach głosowych.' },
];

export const MOCK_USER: User = {
  id: 'u1',
  username: 'Developer',
  discriminator: '0001',
  status: UserStatus.ONLINE,
  avatar: 'https://picsum.photos/200',
  bannerColor: '#6366f1',
  aboutMe: 'Tworzę fajne rzeczy w React. Witaj w Cordis!',
  roleIds: ['r-admin'],
  joinedAt: '2025-01-17T12:00:00Z',
  settings: {
    language: Language.PL,
    theme: Theme.DARK,
    notifications: true,
    // Fix: Added missing UserSettings properties
    notificationSounds: true,
    displayDensity: 'COZY',
    voiceSensitivity: 80,
    privacyShowActivity: true,
    privacyDirectMessages: true,
    email: 'dev@cordis.app',
    phone: '+48 123 456 789'
  }
};

export const GEMINI_BOT: User = {
  id: 'gemini',
  username: 'Gemini AI',
  discriminator: '0000',
  status: UserStatus.ONLINE,
  isBot: true,
  avatar: 'https://picsum.photos/201',
  bannerColor: '#1e1b4b',
  aboutMe: 'Jestem zaawansowanym asystentem AI. Zapytaj mnie o cokolwiek!',
  roleIds: ['r-mod'],
  joinedAt: '2025-01-18T09:00:00Z',
  settings: {
    language: Language.EN,
    theme: Theme.DARK,
    notifications: false,
    // Fix: Added missing UserSettings properties
    notificationSounds: false,
    displayDensity: 'COZY',
    voiceSensitivity: 100,
    privacyShowActivity: false,
    privacyDirectMessages: false
  }
};

export const INITIAL_SERVERS: Server[] = [
  {
    id: 's1',
    name: 'React Developers',
    icon: 'https://picsum.photos/seed/react/100',
    ownerId: 'u1',
    members: [MOCK_USER, GEMINI_BOT],
    roles: [...DEFAULT_ROLES],
    categories: [
      {
        id: 'c1',
        name: 'Information',
        channels: [
          { id: 'ch1', name: 'welcome', type: ChannelType.TEXT, messages: [], connectedUserIds: [], categoryId: 'c1' },
          { id: 'ch2', name: 'announcements', type: ChannelType.TEXT, messages: [], connectedUserIds: [], categoryId: 'c1' }
        ]
      },
      {
        id: 'c2',
        name: 'General',
        channels: [
          { 
            id: 'ch3', 
            name: 'general', 
            type: ChannelType.TEXT, 
            messages: [
              { id: 'm1', content: 'Welcome to the server!', senderId: 'gemini', timestamp: new Date() }
            ], 
            connectedUserIds: [],
            categoryId: 'c2'
          },
          { id: 'ch5', name: 'Lounge', type: ChannelType.VOICE, messages: [], connectedUserIds: [], userLimit: 10, categoryId: 'c2' }
        ]
      }
    ]
  }
];
