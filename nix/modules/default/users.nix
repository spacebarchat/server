{ ... }:
{
  users.users.spacebarchat = {
    isSystemUser = true;
    description = "Spacebar service user";
    home = "/var/lib/spacebar";
    group = "spacebarchat";
  };
  users.groups.spacebarchat = { };
}
