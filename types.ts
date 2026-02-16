

export enum ChannelType {
  TEXT = 'TEXT',
  VOICE = 'VOICE'
}

export enum UserStatus {
  ONLINE = 'ONLINE',
  IDLE = 'IDLE',
  DND = 'DND',
  OFFLINE = 'OFFLINE',
  IN_CALL = 'IN_CALL'
}

export enum Language {
  PL = 'pl',
  EN = 'en'
}

export enum Theme {
  DARK = 'dark',
  LIGHT = 'light',
  AMOLED = 'amoled'
}

export enum Permission {
  ADMINISTRATOR = 'ADMINISTRATOR',
  MANAGE_SERVER = 'MANAGE_SERVER',
  MANAGE_ROLES = 'MANAGE_ROLES',
  MANAGE_CHANNELS = 'MANAGE_CHANNELS',
  KICK_MEMBERS = 'KICK_MEMBERS',
  BAN_MEMBERS = 'BAN_MEMBERS',
  CREATE_INVITE = 'CREATE_INVITE',
  CHANGE_NICKNAME = 'CHANGE_NICKNAME',
  MANAGE_NICKNAMES = 'MANAGE_NICKNAMES',
  SEND_MESSAGES = 'SEND_MESSAGES',
  EMBED_LINKS = 'EMBED_LINKS',
  ATTACH_FILES = 'ATTACH_FILES',
  ADD_REACTIONS = 'ADD_REACTIONS',
  USE_EXTERNAL_EMOJIS = 'USE_EXTERNAL_EMOJIS',
  MENTION_EVERYONE = 'MENTION_EVERYONE',
  MANAGE_MESSAGES = 'MANAGE_MESSAGES',
  READ_MESSAGE_HISTORY = 'READ_MESSAGE_HISTORY',
  SEND_TTS_MESSAGES = 'SEND_TTS_MESSAGES',
  CONNECT = 'CONNECT',
  SPEAK = 'SPEAK',
  STREAM = 'STREAM',
  MUTE_MEMBERS = 'MUTE_MEMBERS',
  DEAFEN_MEMBERS = 'DEAFEN_MEMBERS',
  MOVE_MEMBERS = 'MOVE_MEMBERS',
  USE_VAD = 'USE_VAD'
}

export interface Role {
  id: string;
  name: string;
  color: string;
  permissions: Permission[];
  position: number;
}

export interface UserSettings {
  language: Language;
  theme: Theme;
  notifications: boolean;
  voiceSensitivity: number;
  privacyShowActivity: boolean;
  privacyDirectMessages: boolean;
  email?: string;
  phone?: string;
  // Device IDs
  inputDeviceId?: string;
  outputDeviceId?: string;
  videoDeviceId?: string;
}

export interface User {
  id: string;
  username: string;
  avatar?: string;
  discriminator: string;
  status: UserStatus;
  customStatus?: string;
  isBot?: boolean;
  roleIds?: string[];
  settings: UserSettings;
  friends?: string[]; // IDs of friends
  joinedAt?: string; // ISO format string
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  replyToId?: string;
  isDeleted?: boolean;
  isEdited?: boolean;
  attachment?: {
    type: 'IMAGE' | 'GIF' | 'AUDIO';
    url: string;
    duration?: number; // For audio
  };
}

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  messages: Message[]; 
  connectedUserIds: string[]; 
  userLimit?: number; 
  categoryId: string;
  topic?: string;
  isPrivate?: boolean;
  allowedRoleIds?: string[];
}

export interface ServerCategory {
  id: string;
  name: string;
  channels: Channel[];
}

export interface Server {
  id: string;
  name: string;
  icon?: string;
  banner?: string;
  description?: string;
  categories: ServerCategory[];
  members: User[];
  ownerId: string;
  roles: Role[];
  invites?: ServerInvite[];
  notificationSettings?: {
    mode: 'ALL' | 'MENTIONS' | 'NONE';
  };
}

export interface ServerInvite {
  code: string;
  creatorId: string;
  expiresAt?: Date;
  uses: number;
  maxUses?: number;
}

export type ModalType = 
  | 'CREATE_SERVER' 
  | 'CREATE_CHANNEL' 
  | 'CREATE_CATEGORY'
  | 'EDIT_CHANNEL'
  | 'EDIT_CATEGORY'
  | 'INVITE' 
  | 'SETTINGS' 
  | 'SERVER_SETTINGS'
  | 'DELETE_SERVER' 
  | 'DEVICE_SETTINGS' 
  | 'NOTIFICATION_SETTINGS'
  | 'ADD_FRIEND'
  | null;
