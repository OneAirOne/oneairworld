// colyseus.js package.json "exports" field has no "types" condition, which breaks
// moduleResolution:"bundler". This declaration bridges the gap.
declare module "colyseus.js" {
  export * from "colyseus.js/lib/index";
}
