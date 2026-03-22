import { useCallback, useEffect, useState } from 'react'

import ReactNativeSpline from './ReactNativeSplineModule'

type SplineVariableType = string | boolean | number

function getVariableAsync(
  name: string,
  value: SplineVariableType
): Promise<SplineVariableType | null> {
  if (typeof value === 'string') return ReactNativeSpline.getStringVariable(name)
  if (typeof value === 'boolean') return ReactNativeSpline.getBoolVariable(name)
  return ReactNativeSpline.getNumberVariable(name)
}

function setVariableNative(name: string, value: SplineVariableType): void {
  if (typeof value === 'string') ReactNativeSpline.setStringVariable(name, value)
  else if (typeof value === 'boolean') ReactNativeSpline.setBoolVariable(name, value)
  else ReactNativeSpline.setNumberVariable(name, value)
}

/**
 * useState-like hook for a Spline scene variable.
 * Reads the current value from the native scene on mount, then keeps
 * local React state and the native scene in sync on every set call.
 *
 * @example
 * const [opacity, setOpacity] = useVariable<number>('opacity', 1)
 * const [visible, setVisible] = useVariable<boolean>('visible', true)
 * const [label, setLabel]     = useVariable<string>('label', '')
 */
export function useVariable<T extends SplineVariableType>(
  name: string,
  initialValue: T
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(initialValue)

  useEffect(() => {
    getVariableAsync(name, initialValue).then((v) => {
      if (v !== null) setValue(v as T)
    })
  }, [name])

  const set = useCallback(
    (next: T) => {
      setValue(next)
      setVariableNative(name, next)
    },
    [name]
  )

  return [value, set]
}
