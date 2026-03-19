import { registerWebModule, NativeModule } from 'expo';

import { ReactNativeSplineModuleEvents } from './ReactNativeSpline.types';

class ReactNativeSplineModule extends NativeModule<ReactNativeSplineModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ReactNativeSplineModule, 'ReactNativeSplineModule');
