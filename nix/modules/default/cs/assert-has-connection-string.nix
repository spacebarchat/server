name: extraConfig: {
  assertion = extraConfig ? ConnectionStrings && extraConfig.ConnectionStrings ? Spacebar && extraConfig.ConnectionStrings.Spacebar != null;
  message = ''
    ${name}: Setting a database connection string in extraConfiguration (`extraConfiguration.ConnectionStrings.Spacebar`) is required when using C# services.
    Example: Host=127.0.0.1; Username=Spacebar; Password=SuperSecurePassword12; Database=spacebar; Port=5432; Include Error Detail=true; Maximum Pool Size=1000; Command Timeout=6000; Timeout=600;
  '';
}
