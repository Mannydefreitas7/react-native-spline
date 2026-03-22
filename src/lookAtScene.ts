import { decode } from '@msgpack/msgpack';

export type CursorLookAtConfig = {
  axis?: string;
  dampingFactor?: number;
  distance?: number;
  objectId: string;
  plane?: string;
  resetOnPointerLeave?: boolean;
  target?: unknown;
  tilt?: string;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function getNodeEventEntries(node: UnknownRecord): unknown[] {
  const data = node.data;
  if (!isRecord(data)) {
    return [];
  }

  for (const value of Object.values(data)) {
    const events = isRecord(value) && isRecord(value._0) && isRecord(value._0.object)
      ? value._0.object.events
      : undefined;

    if (Array.isArray(events)) {
      return events;
    }
  }

  return [];
}

function getLookAtConfig(eventEntry: unknown): UnknownRecord | null {
  if (!isRecord(eventEntry) || !isRecord(eventEntry.data)) {
    return null;
  }

  const direct = eventEntry.data.lookAt;
  if (isRecord(direct) && isRecord(direct._0)) {
    return direct._0;
  }

  const fallback = eventEntry.data.LookAt;
  if (isRecord(fallback) && isRecord(fallback._0)) {
    return fallback._0;
  }

  return null;
}

function collectCursorLookAts(node: unknown, results: CursorLookAtConfig[]) {
  if (!isRecord(node)) {
    return;
  }

  const objectId = typeof node.id === 'string' ? node.id : null;
  if (objectId) {
    for (const eventEntry of getNodeEventEntries(node)) {
      const config = getLookAtConfig(eventEntry);
      if (!config || typeof config.target === 'string') {
        continue;
      }

      results.push({
        objectId,
        axis: typeof config.axis === 'string' ? config.axis : undefined,
        dampingFactor:
          typeof config.dampingFactor === 'number' ? config.dampingFactor : undefined,
        distance: typeof config.distance === 'number' ? config.distance : undefined,
        plane: typeof config.plane === 'string' ? config.plane : undefined,
        resetOnPointerLeave:
          typeof config.resetOnPointerLeave === 'boolean'
            ? config.resetOnPointerLeave
            : undefined,
        target: config.target,
        tilt: typeof config.tilt === 'string' ? config.tilt : undefined,
      });
    }
  }

  const children = node.children;
  if (Array.isArray(children)) {
    for (const child of children) {
      collectCursorLookAts(child, results);
    }
  }
}

export function extractCursorLookAtConfigs(sceneData: unknown): CursorLookAtConfig[] {
  if (!isRecord(sceneData)) {
    return [];
  }

  const scenes = sceneData.scenes;
  if (!Array.isArray(scenes)) {
    return [];
  }

  const results: CursorLookAtConfig[] = [];

  for (const scene of scenes) {
    if (!isRecord(scene) || !isRecord(scene.data) || !Array.isArray(scene.data.objects)) {
      continue;
    }

    for (const object of scene.data.objects) {
      collectCursorLookAts(object, results);
    }
  }

  return results;
}

export function decodeSplineScene(sceneBytes: ArrayBuffer): unknown {
  return decode(new Uint8Array(sceneBytes));
}

export async function loadCursorLookAtConfigs(url: string): Promise<CursorLookAtConfig[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load Spline scene: ${response.status}`);
  }

  const sceneBytes = await response.arrayBuffer();
  return extractCursorLookAtConfigs(decodeSplineScene(sceneBytes));
}
