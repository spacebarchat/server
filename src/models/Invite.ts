export interface Invite {
    code: string,
    guild: {  
        id: bigint,
        name: string,
        splash: string,
        description: string,
        icon: string,
        features: Object,
        verification_level: number
    },
    channel: {
        id: bigint,
        name: string,
        type: number
    },

    inviter: {
        id: bigint,
        username: string,
        avatar: string,
        discriminator: number,
    },
    target_user: {
        id: bigint,
        username: string,
        avatar: string,
        discriminator: number
    },
    target_user_type: number
}