/* eslint-disable */
import { GuildSettings } from "bahamutbot";

export interface ShardingServerConfig {
    serverId: string;
    ip: string;
    port: number;
    communication_token: string;
    lastMessageTime: number;
    managedGuilds: ManagedGuild[];
    managedShards: ManagedShard[];
    startupTime: number;
    currentTime: number;
    latency: number;
    serverLocation: string;
}

export interface APIConfig {
    "hostname": string;
    "api_token": string;
    "ownerID": string,
    "register_tokens": string[];
    "db": {
        "host": string;
        "user": string;
        "pass": string;
        "database": string
    },
    "twitch": {
        "clientId": string;
        "clientSecret": string;
        "signingSecret": string
    },
}

export interface ManagedGuild {
    id: string;
    name: string;
    icon: string;
    acronym: string;
    members: number;
    channels: number;
}

export interface ManagedShard {
    shardId: number,
    guilds: ManagedGuild[];
    guildCount: number;
    membersTotal: number;
    channelCount: number;
    totalMusicQueues: number;
    playingMusicQueues: number;
    uptime: number;
    time: number;
}

export interface LodestoneNewsData {
    topics: {
        id: string;
        url: string;
        title: string;
        time: string;
        image: string;
        description: string;
    }[],
    notices: {
        id: string;
        url: string;
        title: string;
        time: string;
    }[],
    maintenance: {
        id: string;
        url: string;
        title: string;
        time: string;
        start: string;
        end: string;
    }[],
    updates: {
        id: string;
        url: string;
        title: string;
        time: string;
    }[],
    status: {
        id: string;
        url: string;
        title: string;
        time: string;
    }[],
    developers: {
        id: string;
        url: string;
        title: string;
        time: string;
        description: string;
    }[]
}

export interface GlobalGuildSettings extends Partial<GuildSettings> {
    lastFashionReport: string;
    lastFashionReportDate: string;
    lastLodestoneTopic: string;
    lastLodestoneNotice: string;
    lastLodestoneMaintenance: string;
    lastLodestoneUpdate: string;
    lastLodestoneStatus: string;
    lastLodestoneDeveloper: string;
    lastIslandNews: string;
    lastIslandSeason: string;
}

export interface GlobalConfig {
    admins: string[];
    avatar_link: string;
    cookie_images: any;
    emoji_icons: any;
    error_message_color: string;
    ffxiv_settings: any;
    game_icons: any;
    genius_token: string;
    invite_link: string;
    job_emoji_list: any;
    lavalink_settings: any;
    level_up_images: any;
    message_icons: any;
    owner_id: string;
    patreon_link: string;
    premium_settings: any;
    primary_message_color: string;
    prod_token: string;
    reddit: string;
    spotify_client_id: string;
    spotify_client_secret: string;
    statcord_prod_token: string;
    statcord_test_token: string;
    status_emojis: any;
    stuff_icons: any;
    tenor_token: string;
    test_token: string;
    tmdb_token: string;
    total_shards: string;
    website_link: string;
    xivapi_token: string;
    youtube_token: string;
    config_types: any;
    defaultSettings: any; 
}

export interface GlobalBootConfig extends GlobalConfig {
    token?: string;
    test_token?: string;
    prod_token?: string;
}