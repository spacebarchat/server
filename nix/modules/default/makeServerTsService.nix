{
  lib,
  secrets,
  cfg,
}:
conf:
lib.recursiveUpdate
  (lib.recursiveUpdate {
    documentation = [ "https://docs.spacebar.chat/" ];
    wantedBy = [ "multi-user.target" ];
    wants = [ "network-online.target" ];
    after = [ "network-online.target" ];
    environment = secrets.systemdEnvironment;
    serviceConfig = {
      LoadCredential = secrets.systemdLoadCredentials;

      User = "spacebarchat";
      Group = "spacebarchat";
      DynamicUser = false;

      LockPersonality = true;
      NoNewPrivileges = true;

      ProtectClock = true;
      ProtectControlGroups = true;
      ProtectHostname = true;
      ProtectKernelLogs = true;
      ProtectKernelModules = true;
      ProtectKernelTunables = true;
      PrivateDevices = true;
      PrivateMounts = true;
      PrivateUsers = true;
      RestrictAddressFamilies = [
        "AF_INET"
        "AF_INET6"
        "AF_UNIX"
        "AF_NETLINK"
      ];
      RestrictNamespaces = true;
      RestrictRealtime = true;
      SystemCallArchitectures = "native";
      SystemCallFilter = [
        "@system-service"
        "~@privileged"
        "@chown" # Required for copying files with FICLONE, apparently.
      ];
      CapabilityBoundingSet = [
        "~CAP_SYS_ADMIN"
        "~CAP_AUDIT_*"
        "~CAP_NET_(BIND_SERVICE|BROADCAST|RAW)"
        "~CAP_NET_ADMIN" # No use for this as we don't currently use iptables for enforcing instance bans
        "~CAP_SYS_TIME"
        "~CAP_KILL"
        "~CAP_(DAC_*|FOWNER|IPC_OWNER)"
        "~CAP_LINUX_IMMUTABLE"
        "~CAP_IPC_LOCK"
        "~CAP_BPF"
        "~CAP_SYS_TTY_CONFIG"
        "~CAP_SYS_BOOT"
        "~CAP_SYS_CHROOT"
        "~CAP_BLOCK_SUSPEND"
        "~CAP_LEASE"
        "~CAP_(CHOWN|FSETID|FSETFCAP)" # Check if we need CAP_CHOWN for `fchown()` (FICLONE)?
        "~CAP_SET(UID|GID|PCAP)"
        "~CAP_MAC_*"
        "~CAP_SYS_PTRACE"
        "~CAP_SYS_(NICE|RESOURCE)"
        "~CAP_SYS_RAWIO"
        "~CAP_SYSLOG"
      ];
      RestrictSUIDSGID = true;

      WorkingDirectory = "/var/lib/spacebar";
      StateDirectory = "spacebar";
      StateDirectoryMode = "0750";
      RuntimeDirectory = "spacebar";
      RuntimeDirectoryMode = "0750";
      RuntimeDirectoryPreserve = "yes";
      ReadWritePaths = [ cfg.cdnPath ];
      NoExecPaths = [ cfg.cdnPath ];

      Restart = "on-failure";
      RestartSec = 10;
      StartLimitBurst = 5;
      UMask = "077";
    }
    // lib.optionalAttrs (cfg.databaseFile != null) { EnvironmentFile = cfg.databaseFile; };
  } conf)
  {
  }
