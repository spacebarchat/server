{
  mkEndpoint = domain: port: ssl: {
    host = domain;
    localPort = port;
    useSsl = ssl;
    publicPort =
      if ssl then
        443
      else if domain == "localhost" then
        port
      else
        80;
  };
}
