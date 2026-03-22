import { useEvent } from 'expo';
import { ReactNativeSplineView, ReactNativeSpline } from 'react-native-spline';
import { Button, SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function App() {


  return (
    <ReactNativeSplineView
      url="https://build.spline.design/MEB5dcTLGkXFu2uqul4b/scene.splineswift"
      onSplineEvent={(event) => console.log(event.nativeEvent.event)}

      onLoad={({ nativeEvent: { url } }) => console.log(`Loaded: ${url}`)}
      style={styles.view}
    />
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
