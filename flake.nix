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
        "x86_64-linux"
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
            darwin.apple_sdk.frameworks.AppKit
            darwin.apple_sdk.frameworks.WebKit
          ];

          # only add packages darwin packages if we are on darwin
          packages =  with pkgs; [
            rustup
            libiconv
            cargo-tauri
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
