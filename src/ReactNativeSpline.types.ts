import type { EventSubscription } from 'expo-modules-core'
import type { StyleProp, ViewStyle } from 'react-native'

export type OnLoadEventPayload = {
  url: string
}

export type ReactNativeSplineModuleEvents = {
  onChange: (params: ChangeEventPayload) => void
  onSplineEvent: (params: SplineEventPayload) => void
}

export type ChangeEventPayload = {
  value: string
}

export type SplineEventPayload = {
  event: SplineEvent
  objectName?: string
  objectId?: string
}

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
  | 'follow'

export interface SplineObject {
  name: string
  uuid: string
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: { x: number; y: number; z: number }
  visible: boolean
  intensity?: number
}

export type SplineEventSubscription = EventSubscription

export type SplineViewProps = {
  url: string
  onLoad: (event: { nativeEvent: OnLoadEventPayload }) => void
  onSplineEvent?: (event: { nativeEvent: SplineEventPayload }) => void
  useDeviceGyroscopeForLookAt?: boolean
  gyroscopeLookAtObjectIds?: string[]
  style?: StyleProp<ViewStyle>
}

export type ReactNativeSplineViewProps = SplineViewProps
