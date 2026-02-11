namespace Spacebar.Models.Gateway;

public enum CloseCode {
    UnknownError = 4000,
    UnknownOpcode = 4001,
    DecodeError = 4002,
    NotAuthenticated = 4003,
    AuthenticationFailed = 4004,
    AlreadyAuthenticated = 4005,
    InvalidSession = 4006,
    InvalidSeq = 4007,
    RateLimited = 4008,
    SessionTimedOut = 4009,
    InvalidShard = 4010,
    ShardingRequired = 4011,
    InvalidApiVersion = 4012,
    InvalidIntent = 4013,
    DisallowedIntent = 4014,
}