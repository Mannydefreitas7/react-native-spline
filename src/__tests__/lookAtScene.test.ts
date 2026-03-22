import { extractCursorLookAtConfigs } from '../lookAtScene';

describe('extractCursorLookAtConfigs', () => {
  it('returns only cursor-driven lookAt objects', () => {
    const sceneData = {
      scenes: [
        {
          data: {
            objects: [
              {
                id: 'cursor-look-at',
                data: {
                  mesh: {
                    _0: {
                      object: {
                        events: [
                          {
                            data: {
                              lookAt: {
                                _0: {
                                  axis: 'y',
                                  dampingFactor: 1,
                                  distance: 1000,
                                  plane: 'custom',
                                  resetOnPointerLeave: true,
                                  tilt: 'target',
                                },
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                },
                children: [],
              },
              {
                id: 'object-look-at',
                data: {
                  mesh: {
                    _0: {
                      object: {
                        events: [
                          {
                            data: {
                              lookAt: {
                                _0: {
                                  target: 'target-object-id',
                                },
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                },
                children: [],
              },
            ],
          },
        },
      ],
    };

    expect(extractCursorLookAtConfigs(sceneData)).toEqual([
      {
        axis: 'y',
        dampingFactor: 1,
        distance: 1000,
        objectId: 'cursor-look-at',
        plane: 'custom',
        resetOnPointerLeave: true,
        target: undefined,
        tilt: 'target',
      },
    ]);
  });
});
