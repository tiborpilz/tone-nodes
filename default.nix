{ pkgs ? import <nixpkgs> {} }:

pkgs.buildNpmPackage {
  pname = "my-next-tauri-app";
  version = "1.0.0";

  src = ./.;

  npmDeps = ./package-lock.json;

  # Use Bun instead of Node.js during the build process
  shellHook = ''
    export PATH=${pkgs.bun}/bin:$PATH
  '';
}

