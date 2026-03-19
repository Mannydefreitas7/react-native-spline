// Reexport the native module. On web, it will be resolved to ReactNativeSplineModule.web.ts
// and on native platforms to ReactNativeSplineModule.ts
export { default } from './ReactNativeSplineModule';
export { default as ReactNativeSplineView } from './ReactNativeSplineView';
export * from  './ReactNativeSpline.types';
