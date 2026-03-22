const mockAddListener = jest.fn();

jest.mock('expo', () => ({
  NativeModule: class NativeModule { },
  requireNativeModule: jest.fn(() => ({
    addListener: mockAddListener,
  })),
}));

describe('ReactNativeSplineModule.addEventListener', () => {
  beforeEach(() => {
    mockAddListener.mockReset();
  });

  it('subscribes to native spline events and filters by event name', () => {
    const subscription = { remove: jest.fn() };
    let nativeListener: ((payload: { event: string; objectName?: string }) => void) | undefined;

    mockAddListener.mockImplementation((eventName, listener) => {
      expect(eventName).toBe('onSplineEvent');
      nativeListener = listener;
      return subscription;
    });

    const ReactNativeSplineModule = require('../ReactNativeSplineModule').default;
    const callback = jest.fn();

    const result = ReactNativeSplineModule.addEventListener('mouseDown', callback);

    expect(result).toBe(subscription);
    expect(mockAddListener).toHaveBeenCalledTimes(1);

    nativeListener?.({ event: 'mouseHover', objectName: 'Sphere' });
    expect(callback).not.toHaveBeenCalled();

    nativeListener?.({ event: 'mouseDown', objectName: 'Sphere' });
    expect(callback).toHaveBeenCalledWith({ event: 'mouseDown', objectName: 'Sphere' });
  });
});
