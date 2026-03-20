import type { StyleProp, ViewStyle } from 'react-native';

export type OnLoadEventPayload = {
  url: string;
};

export type ReactNativeSplineModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
  onSplineEvent: (params: SplineEventPayload) => void;
};

export type ChangeEventPayload = {
  value: string;
};

export type SplineEventPayload = {
  event: SplineEvent;
  objectName?: string;
  objectId?: string;
};

export type SplineEvent =
  | 'mouseUp'
  | 'mouseDown'
  | 'mousePress'
  | 'mouseHover'
  | 'keyUp'
  | 'keyDown'
  | 'keyPress'
  | 'start'
  | 'lookAt'
  | 'follow';

export interface SplineObject {
  name: string;
  uuid: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  visible: boolean;
  intensity?: number; // For light objects
  emitEvent(event: SplineEvent): void;
  emitEventReverse(event: SplineEvent): void;
}

export type ReactNativeSplineViewProps = {
  url: string;
  onLoad: (event: { nativeEvent: OnLoadEventPayload }) => void;
  onSplineEvent?: (event: { nativeEvent: SplineEventPayload }) => void;
  style?: StyleProp<ViewStyle>;
};
