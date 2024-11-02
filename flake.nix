{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    rust-overlay.url = "github:oxalica/rust-overlay";
  };

  outputs =
    { nixpkgs
    , rust-overlay
    , ...
    }:
    let
      forAllSystems = nixpkgs.lib.genAttrs [
        "x86_64-linux"
        "aarch64-darwin"
      ];

    in
    {
      devShells = forAllSystems (system:
        let
          pkgs = import nixpkgs {
            inherit system;
            overlays = [ rust-overlay.overlays.default ]; 
          };

          rustEnv = pkgs.rust-bin.nightly."2024-05-09".default.override {
            targets = [ "wasm32-unknown-unknown" ];
          };

          # cargoTauri = pkgs.rustPlatform.buildRustPackage rec {
          #   pname = "cargo-tauri";

          #   src = pkgs.fetchFromGitHub {
          #     owner = "tauri-apps";
          #     repo = "tauri";
          #     rev = "v2.0.4";
          #     sha256 = "sha256-W08R1ny4LyzWehnsWSMCRjCxmvV0k7ARVbmZ740hg8w=";
          #   };
          #   cargoSha256 = "sha256-kuKsBnmH3bPgwuJ1q49iHMNT47Djx9BKxcMBbJ3zqis=";

          #   RUSTC = "${rustEnv}/bin/rustc";
          #   CARGO = "${rustEnv}/bin/cargo";

          #   doCheck = false;

          #   meta = {
          #     description = "Cargo extension for Tauri framework";
          #     homepage = "https://github.com/tauri-apps/tauri";
          #     license = pkgs.lib.licenses.mit;
          #   };
          # };

          cargoTauri = pkgs.rustPlatform.buildRustPackage rec {
            pname = "tauri-cli";
            version = "2.0.4";

            src = pkgs.fetchFromGitHub {
              owner = "tauri-apps";
              repo = "tauri";
              rev = "v${version}";
              sha256 = "sha256-W08R1ny4LyzWehnsWSMCRjCxmvV0k7ARVbmZ740hg8w=";
            };

            cargoSha256 = "sha256-PvoOmQ8nCWypy4p2kCAnbr8ChWyVdYN176JHCAitdUs=";

            RUSTC = "${rustEnv}/bin/rustc";
            CARGO = "${rustEnv}/bin/cargo";

            doCheck = false;

            meta = {
              description = "Cargo extension for Tauri framework";
              homepage = "https://github.com/tauri-apps/tauri";
              license = pkgs.lib.licenses.mit;
            };
          };
          packages-darwin = with pkgs; [
            darwin.apple_sdk.frameworks.AppKit
            darwin.apple_sdk.frameworks.WebKit
          ];

          # only add packages darwin packages if we are on darwin
          packages =  with pkgs; [
            rustEnv
            cargoTauri
            rustup
            libiconv
            openjdk17
          ] ++ (if pkgs.stdenv.isDarwin then packages-darwin else []);
        in
        {
          default = pkgs.mkShell {
            buildInputs = packages;
          };
        });
    };
}
