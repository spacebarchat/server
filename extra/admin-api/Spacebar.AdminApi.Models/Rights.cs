using System.Diagnostics.CodeAnalysis;

namespace Spacebar.AdminApi.Models;

public static class SpacebarRights {
    [Flags]
    [SuppressMessage("ReSharper", "InconsistentNaming")]
    public enum Rights : ulong {
        OPERATOR = 1ul << 0, // has all rights
        MANAGE_APPLICATIONS = 1ul << 1,
        MANAGE_GUILDS = 1ul << 2,   // Manage all guilds instance-wide
        MANAGE_MESSAGES = 1ul << 3, // Can't see other messages but delete/edit them in channels that they can see
        MANAGE_RATE_LIMITS = 1ul << 4,
        MANAGE_ROUTING = 1ul << 5, // can create custom message routes to any channel/guild
        MANAGE_TICKETS = 1ul << 6, // can respond to and resolve support tickets
        MANAGE_USERS = 1ul << 7,
        ADD_MEMBERS = 1ul << 8, // can manually add any members in their guilds
        BYPASS_RATE_LIMITS = 1ul << 9,
        CREATE_APPLICATIONS = 1ul << 10,
        CREATE_CHANNELS = 1ul << 11, // can create guild channels or threads in the guilds that they have permission
        CREATE_DMS = 1ul << 12,
        CREATE_DM_GROUPS = 1ul << 13, // can create group DMs or custom orphan channels
        CREATE_GUILDS = 1ul << 14,
        CREATE_INVITES = 1ul << 15, // can create mass invites in the guilds that they have CREATE_INSTANT_INVITE
        CREATE_ROLES = 1ul << 16,
        CREATE_TEMPLATES = 1ul << 17,
        CREATE_WEBHOOKS = 1ul << 18,
        JOIN_GUILDS = 1ul << 19,
        PIN_MESSAGES = 1ul << 20,
        SELF_ADD_REACTIONS = 1ul << 21,
        SELF_DELETE_MESSAGES = 1ul << 22,
        SELF_EDIT_MESSAGES = 1ul << 23,
        SELF_EDIT_NAME = 1ul << 24,
        SEND_MESSAGES = 1ul << 25,
        USE_ACTIVITIES = 1ul << 26, // use (game) activities in voice channels (e.g. Watch together)
        USE_VIDEO = 1ul << 27,
        USE_VOICE = 1ul << 28,
        INVITE_USERS = 1ul << 29,        // can create user-specific invites in the guilds that they have INVITE_USERS
        SELF_DELETE_DISABLE = 1ul << 30, // can disable/delete own account
        DEBTABLE = 1ul << 31,            // can use pay-to-use features
        CREDITABLE = 1ul << 32,          // can receive money from monetisation related features
        KICK_BAN_MEMBERS = 1ul << 33,

        // can kick or ban guild or group DM members in the guilds/groups that they have KICK_MEMBERS, or BAN_MEMBERS
        SELF_LEAVE_GROUPS = 1ul << 34,

        // can leave the guilds or group DMs that they joined on their own (one can always leave a guild or group DMs they have been force-added)
        PRESENCE = 1ul << 35,

        // inverts the presence confidentiality default (OPERATOR's presence is not routed by default, others' are) for a given user
        SELF_ADD_DISCOVERABLE = 1ul << 36,      // can mark discoverable guilds that they have permissions to mark as discoverable
        MANAGE_GUILD_DIRECTORY = 1ul << 37,     // can change anything in the primary guild directory
        POGGERS = 1ul << 38,                    // can send confetti, screenshake, random user mention (@someone)
        USE_ACHIEVEMENTS = 1ul << 39,           // can use achievements and cheers
        INITIATE_INTERACTIONS = 1ul << 40,      // can initiate interactions
        RESPOND_TO_INTERACTIONS = 1ul << 41,    // can respond to interactions
        SEND_BACKDATED_EVENTS = 1ul << 42,      // can send backdated events
        USE_MASS_INVITES = 1ul << 43,           // added per @xnacly's request - can accept mass invites
        ACCEPT_INVITES = 1ul << 44,             // added per @xnacly's request - can accept user-specific invites and DM requests
        SELF_EDIT_FLAGS = 1ul << 45,            // can modify own flags
        EDIT_FLAGS = 1ul << 46,                 // can set others' flags
        MANAGE_GROUPS = 1ul << 47,              // can manage others' groups
        VIEW_SERVER_STATS = 1ul << 48,          // added per @chrischrome's request - can view server stats
        RESEND_VERIFICATION_EMAIL = 1ul << 49,  // can resend verification emails (/auth/verify/resend)
        CREATE_REGISTRATION_TOKENS = 1ul << 50, // can create registration tokens (/auth/generate-registration-tokens)
    }
    
    public static bool HasAllRights(this Rights val, Rights rights) {  
        if (val.HasFlag(Rights.OPERATOR)) {
            return true;
        }

        return (val & rights) == rights;
    }
    
    public static void AssertHasAllRights(this Rights val, Rights rights) {
        if (!val.HasAllRights(rights)) {
            throw new UnauthorizedAccessException("Insufficient rights: missing " + rights);
        }
    }
}