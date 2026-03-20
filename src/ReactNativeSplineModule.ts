import { NativeModule, requireNativeModule } from 'expo';

import {
  ReactNativeSplineModuleEvents,
  SplineEvent,
  SplineObject,
} from './ReactNativeSpline.types';

declare class ReactNativeSplineModule extends NativeModule<ReactNativeSplineModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;

  // Spline code API methods
  addEventListener(event: SplineEvent, callback: (payload: SplineEvent) => void): void;
  emitEvent(event: SplineEvent, nameOrUUID: string): void;
  emitEventReverse(event: SplineEvent, nameOrUUID: string): void;
  findObjectById(id: string): Promise<SplineObject | null>;
  findObjectByName(name: string): Promise<SplineObject | null>;
  setZoom(value: number): void;
  setNumberVariable(name: string, value: number): void;
  setBoolVariable(name: string, value: boolean): void;
  setStringVariable(name: string, value: string): void;
  getNumberVariable(name: string): Promise<number | null>;
  getBoolVariable(name: string): Promise<boolean | null>;
  getStringVariable(name: string): Promise<string | null>;
  stop(): void;
  play(): void;
  setBackgroundColor(color: { r: number; g: number; b: number; a: number }): void;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ReactNativeSplineModule>('ReactNativeSpline');
