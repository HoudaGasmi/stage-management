import {
  MediaMatcher
} from "./chunk-54DKLMKE.js";
import {
  ANIMATION_MODULE_TYPE
} from "./chunk-4DGF33UC.js";
import {
  InjectionToken,
  inject
} from "./chunk-NOY4CGJY.js";

// node_modules/@angular/material/fesm2022/_animation-chunk.mjs
var MATERIAL_ANIMATIONS = new InjectionToken("MATERIAL_ANIMATIONS");
var reducedMotion = null;
function _getAnimationsState() {
  if (inject(MATERIAL_ANIMATIONS, {
    optional: true
  })?.animationsDisabled || inject(ANIMATION_MODULE_TYPE, {
    optional: true
  }) === "NoopAnimations") {
    return "di-disabled";
  }
  reducedMotion ??= inject(MediaMatcher).matchMedia("(prefers-reduced-motion)").matches;
  return reducedMotion ? "reduced-motion" : "enabled";
}
function _animationsDisabled() {
  return _getAnimationsState() !== "enabled";
}

export {
  MATERIAL_ANIMATIONS,
  _getAnimationsState,
  _animationsDisabled
};
//# sourceMappingURL=chunk-J3VZLYAZ.js.map
