{
  Logging.LogLevel = {
    Default = "Information";
    "Microsoft.AspNetCore" = "Trace";
    "Microsoft.AspNetCore.Mvc" = "Warning";
    "Microsoft.AspNetCore.HostFiltering" = "Warning";
    "Microsoft.AspNetCore.Cors" = "Warning";
    "Microsoft.EntityFrameworkCore.Database.Command" = "Information";
  };
  Spacebar = {
    Authentication = {
      PrivateKeyPath = "./jwt.key";
      PublicKeyPath = "./jwt.key.pub";
    };
  };
}
