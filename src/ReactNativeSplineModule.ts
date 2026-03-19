import { NativeModule, requireNativeModule } from 'expo';

import { ReactNativeSplineModuleEvents } from './ReactNativeSpline.types';

declare class ReactNativeSplineModule extends NativeModule<ReactNativeSplineModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ReactNativeSplineModule>('ReactNativeSpline');
