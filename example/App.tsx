import { useEffect, useState } from 'react';
import { ReactNativeSplineView, useSpline, type SplineEventPayload } from 'react-native-spline';
import { SafeAreaView, Text, View } from 'react-native';

export default function App() {
  const { addEventListener } = useSpline();
  const [latestEvent, setLatestEvent] = useState<SplineEventPayload | null>(null);

  useEffect(() => {
    const subscriptions = [
      addEventListener('mouseDown', setLatestEvent),
      addEventListener('mouseUp', setLatestEvent),
      addEventListener('mouseHover', setLatestEvent),
      addEventListener('start', setLatestEvent),
      addEventListener('follow', setLatestEvent),
      addEventListener('lookAt', setLatestEvent),
    ];

    return () => {
      for (const subscription of subscriptions) {
        subscription.remove();
      }
    };
  }, [addEventListener]);

  return (
    <SafeAreaView style={styles.container}>
      <ReactNativeSplineView
        url="https://build.spline.design/MEB5dcTLGkXFu2uqul4b/scene.splineswift"
        onSplineEvent={({ nativeEvent }) => {
          console.log('[view event]', nativeEvent.event, nativeEvent.objectName);
        }}
        onLoad={({ nativeEvent: { url } }) => console.log(`Loaded: ${url}`)}
        style={styles.view}
      />
      <Group name="Latest module listener event">
        <Text>
          {latestEvent
            ? `${latestEvent.event} on ${latestEvent.objectName ?? latestEvent.objectId ?? 'unknown'}`
            : 'Interact with the scene to trigger an event.'}
        </Text>
      </Group>
    </SafeAreaView>
  );
}

function Group(props: { name: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{props.name}</Text>
      {props.children}
    </View>
  );
}

const styles = {
  header: {
    fontSize: 30,
    margin: 20,
  },
  groupHeader: {
    fontSize: 20,
    marginBottom: 20,
  },
  group: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#eee',
  },
  view: {
    flex: 1,
    height: 200,
  },
};
