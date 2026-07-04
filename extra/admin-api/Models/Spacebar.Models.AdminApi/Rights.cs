using System.Diagnostics.CodeAnalysis;

namespace Spacebar.Models.AdminApi;

public static class SpacebarRights {
    [Flags]
    [SuppressMessage("ReSharper", "InconsistentNaming")]
    public enum Rights : ulong {
        OPERATOR = 1ul << 0, // has all rights
        UNUSED_1 = 1ul << 1,
        MANAGE_GUILDS = 1ul << 2,   // Manage all guilds instance-wide
        MANAGE_MESSAGES = 1ul << 3, // Can't see other messages but delete/edit them in channels that they can see
        UNUSED_2 = 1ul << 4,
        UNUSED_3 = 1ul << 5,
        UNUSED_4 = 1ul << 6,
        MANAGE_USERS = 1ul << 7,
        UNUSED_5 = 1ul << 8,
        BYPASS_RATE_LIMITS = 1ul << 9,
        UNUSED_6 = 1ul << 10,
        UNUSED_7 = 1ul << 11,
        UNUSED_8 = 1ul << 12,
        UNUSED_9 = 1ul << 13,
        CREATE_GUILDS = 1ul << 14,
        CREATE_INVITES = 1ul << 15, // can create mass invites in the guilds that they have CREATE_INSTANT_INVITE
        UNUSED_10 = 1ul << 16,
        UNUSED_11 = 1ul << 17,
        UNUSED_12 = 1ul << 18,
        JOIN_GUILDS = 1ul << 19,
        UNUSED_13 = 1ul << 20,
        SELF_ADD_REACTIONS = 1ul << 21,
        SELF_DELETE_MESSAGES = 1ul << 22,
        SELF_EDIT_MESSAGES = 1ul << 23,
        UNUSED_14 = 1ul << 24,
        SEND_MESSAGES = 1ul << 25,
        UNUSED_15 = 1ul << 26,
        UNUSED_16 = 1ul << 27,
        UNUSED_17 = 1ul << 28,
        UNUSED_18 = 1ul << 29,
        UNUSED_19 = 1ul << 30,
        UNUSED_20 = 1ul << 31,
        UNUSED_21 = 1ul << 32,
        KICK_BAN_MEMBERS = 1ul << 33,

        // can kick or ban guild or group DM members in the guilds/groups that they have KICK_MEMBERS, or BAN_MEMBERS
        SELF_LEAVE_GROUPS = 1ul << 34,

        // can leave the guilds or group DMs that they joined on their own (one can always leave a guild or group DMs they have been force-added)
        PRESENCE = 1ul << 35,

        // inverts the presence confidentiality default (OPERATOR's presence is not routed by default, others' are) for a given user
        UNUSED_22 = 1ul << 36,
        UNUSED_23 = 1ul << 37,
        UNUSED_24 = 1ul << 38,
        UNUSED_25 = 1ul << 39,           // can use achievements and cheers
        UNUSED_26 = 1ul << 40,      // can initiate interactions
        UNUSED_27 = 1ul << 41,    // can respond to interactions
        SEND_BACKDATED_EVENTS = 1ul << 42,      // can send backdated events
        USE_MASS_INVITES = 1ul << 43,           // added per @xnacly's request - can accept mass invites
        UNUSED_28 = 1ul << 44,             // added per @xnacly's request - can accept user-specific invites and DM requests
        UNUSED_29 = 1ul << 45,            // can modify own flags
        UNUSED_30 = 1ul << 46,                 // can set others' flags
        UNUSED_31 = 1ul << 47,              // can manage others' groups
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