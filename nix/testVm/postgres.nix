{ config, pkgs, ... }:

{
  services.postgresql = {
    enable = true;
    package = pkgs.postgresql_18_jit;
    initdbArgs = [
      "--encoding=UTF8"
      "--locale=C.UTF-8"
      "--data-checksums"
      "--allow-group-access"
    ];
    enableTCPIP = true;
    authentication = pkgs.lib.mkOverride 10 ''
      # TYPE, DATABASE, USER, ADDRESS, METHOD
      local all all trust
      host all all 127.0.0.1/32 trust
      host all all ::1/128 trust
      host all all 0.0.0.0/0 md5
    '';
     initialScript = pkgs.writeText "backend-initScript" ''
       CREATE ROLE spacebar WITH LOGIN PASSWORD 'spacebar' CREATEDB;
       CREATE DATABASE spacebar;
       GRANT ALL PRIVILEGES ON DATABASE spacebar TO spacebar;
     '';
    settings = {
      # https://pgconfigurator.cybertec.at/
      max_connections = 2500;
      superuser_reserved_connections = 3;

      shared_buffers = "128MB";
      work_mem = "64MB";
      maintenance_work_mem = "512MB";
      huge_pages = "try";
      effective_cache_size = "512MB";
      effective_io_concurrency = 100;
      random_page_cost = 1.1;

      # can use this to view stats: SELECT query, total_time, calls, rows FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
      shared_preload_libraries = "pg_stat_statements";
      track_io_timing = "on";
      track_functions = "pl";
      "pg_stat_statements.max" = "10000"; # additional
      "pg_stat_statements.track" = "all"; # additional

      wal_level = "replica";
      max_wal_senders = 0;
      synchronous_commit = "on"; # was ond3

      checkpoint_timeout = "15min";
      checkpoint_completion_target = "0.9";
      max_wal_size = "2GB";
      min_wal_size = "1GB";

      wal_compression = "off";
      wal_buffers = "-1";
      wal_writer_delay = "500ms"; # was 100
      wal_writer_flush_after = "32MB"; # was 1
      #checkpoint_segments = "64"; # additional
      default_statistics_target = "250"; # additional

      bgwriter_delay = "200ms";
      bgwriter_lru_maxpages = "100";
      bgwriter_lru_multiplier = "2.0";
      bgwriter_flush_after = "0";

      max_worker_processes = "64"; # was 14
      max_parallel_workers_per_gather = "32"; # was 7
      max_parallel_maintenance_workers = "32"; # was 7
      max_parallel_workers = "64"; # was 14
      parallel_leader_participation = "on";

      enable_partitionwise_join = "on";
      enable_partitionwise_aggregate = "on";
      jit = "on";
      max_slot_wal_keep_size = "1GB";
      track_wal_io_timing = "on";
      maintenance_io_concurrency = "4";
      wal_recycle = "on";
    };
  };
}
