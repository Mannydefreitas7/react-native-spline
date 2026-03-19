import * as React from 'react';

import { ReactNativeSplineViewProps } from './ReactNativeSpline.types';

export default function ReactNativeSplineView(props: ReactNativeSplineViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
