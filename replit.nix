{ pkgs }: {
  deps = [
    pkgs.run
    pkgs.nano
    pkgs.nodejs-18_x
    pkgs.nodePackages.typescript
    pkgs.yarn
  ];
}
