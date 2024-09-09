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
      overlays = [ (import rust-overlay) ];

      forAllSystems = nixpkgs.lib.genAttrs [
        "aarch64-darwin"
      ];

    in
    {
      devShells = forAllSystems (system:
        let
          pkgs = import nixpkgs {
            inherit system overlays;
          };

          packages-darwin = with pkgs; [
            rustup
            libiconv
            darwin.apple_sdk.frameworks.AppKit
            darwin.apple_sdk.frameworks.WebKit
            cargo-tauri
          ];

          packages = packages-darwin;
        in
        {
          default = pkgs.mkShell {
            buildInputs = packages;
          };
        });
    };
}
