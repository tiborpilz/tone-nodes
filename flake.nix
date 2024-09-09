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

      # Helper generating outputs for each desired system
      forAllSystems = nixpkgs.lib.genAttrs [
        "aarch64-darwin"
      ];

      # Import nixpkgs' package set for each system.
      nixpkgsFor = forAllSystems (system:
        import nixpkgs {
          inherit system overlays;
        });
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
