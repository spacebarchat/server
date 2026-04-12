{ pkgs, rVersion }:
{
  name,
  nugetDeps ? null,
  projectReferences ? [ ],
  projectFile ? "${name}/${name}.csproj",
  runtimeId ? null,
  useAppHost ? null,
  packNupkg ? true,
  srcRoot ? ./.,
  ...
}@args:
pkgs.buildDotnetModule (pkgs.lib.recursiveUpdate
  (
    rec {
      inherit
        projectReferences
        nugetDeps
        projectFile
        runtimeId
        useAppHost
        srcRoot
        packNupkg
        ;

      pname = "${name}";
      version = "1.0.0-" + rVersion;
      dotnetPackFlags = [
        "--include-symbols"
        "--include-source"
        "--version-suffix ${rVersion}"
      ];
      # dotnetFlags = [ "-v:n" ]; # diag
      dotnet-sdk = pkgs.dotnet-sdk_10;
      dotnet-runtime = pkgs.dotnet-aspnetcore_10;
      src = pkgs.lib.cleanSource srcRoot;
      meta = with pkgs.lib; {
        description = "Spacebar Server, Typescript Edition (C# extensions)";
        homepage = "https://github.com/spacebarchat/server";
        license = licenses.agpl3Plus;
        maintainers = with maintainers; [ RorySys ];
        mainProgram = name;
      };
    }
    // {
      __nugetDeps = if args ? nugetDeps then args.nugetDeps else null;
    }
  )
  (
    builtins.removeAttrs args [
      "name"
      "nugetDeps"
      "projectReferences"
      "projectFile"
      "runtimeId"
      "useAppHost"
      "packNupkg"
      "srcRoot"
    ]
  )
)