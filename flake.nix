{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    nixpkgs-master.url = "github:nixos/nixpkgs/master";
    rust-overlay.url = "github:oxalica/rust-overlay";
  };

  outputs =
    { nixpkgs
    , nixpkgs-master
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

          pkgs-master = import nixpkgs-master {
            inherit system;
            overlays = [ rust-overlay.overlays.default ];
          };

          cargoTauri = pkgs.rustPlatform.buildRustPackage rec {
            pname = "tauri-cli";
            version = "2.0.4";

            src = pkgs.fetchFromGitHub {
              name = "${pname}-${version}";
              owner = "tauri-apps";
              repo = "tauri";
              rev = "tauri-v${version}";
              sha256 = "sha256-XgvAsETYSI6cDFOsXZIk+KMPbI0zmfS8TetiF8IRE6k=";
            };

            sourceRoot = "${src.name}/packages/cli";

            cargoLock.lockFile = "${src.name}/Cargo.lock";

            cargoSha256 = "sha256-PvoOmQ8nCWypy4p2kCAnbr8ChWyVdYN176JHCAitdUs=";

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
            # cargoTauri
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
