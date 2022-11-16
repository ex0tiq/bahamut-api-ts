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
    }
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

