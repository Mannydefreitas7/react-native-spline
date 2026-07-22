import { NativeModule, requireNativeModule } from 'expo'

import type {
  ReactNativeSplineModuleEvents,
  SplineEvent,
  SplineEventPayload,
  SplineEventSubscription,
  SplineObject,
} from './ReactNativeSpline.types'

declare class NativeReactNativeSplineModule extends NativeModule<ReactNativeSplineModuleEvents> {
  PI: number
  hello(): string
  setValueAsync(value: string): Promise<void>

  // Spline code API methods
  emitEvent(event: SplineEvent, nameOrUUID: string): void
  emitEventReverse(event: SplineEvent, nameOrUUID: string): void
  findObjectById(id: string): Promise<SplineObject | null>
  findObjectByName(name: string): Promise<SplineObject | null>
  setObjectRotation(nameOrUUID: string, x: number, y: number, z: number): void
  setZoom(value: number): void
  setNumberVariable(name: string, value: number): void
  setBoolVariable(name: string, value: boolean): void
  setStringVariable(name: string, value: string): void
  getNumberVariable(name: string): Promise<number | null>
  getBoolVariable(name: string): Promise<boolean | null>
  getStringVariable(name: string): Promise<string | null>
  stop(): void
  play(): void
  setBackgroundColor(color: { r: number; g: number; b: number; a: number }): void
}

type ReactNativeSplineModuleType = NativeReactNativeSplineModule & {
  addEventListener(
    event: SplineEvent,
    callback: (payload: SplineEventPayload) => void
  ): SplineEventSubscription
}

const ReactNativeSplineModule =
  requireNativeModule<ReactNativeSplineModuleType>('ReactNativeSpline')

ReactNativeSplineModule.addEventListener = (event, callback) =>
  ReactNativeSplineModule.addListener('onSplineEvent', (payload) => {
    if (payload.event === event) {
      callback(payload)
    }
  })

export default ReactNativeSplineModule
