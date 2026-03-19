import { requireNativeView } from 'expo';
import * as React from 'react';

import { ReactNativeSplineViewProps } from './ReactNativeSpline.types';

const NativeView: React.ComponentType<ReactNativeSplineViewProps> =
  requireNativeView('ReactNativeSpline');

export default function ReactNativeSplineView(props: ReactNativeSplineViewProps) {
  return <NativeView {...props} />;
}
