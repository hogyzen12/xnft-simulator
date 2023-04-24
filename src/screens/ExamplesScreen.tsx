import { Button, Image, Text, View } from "react-native";
import * as Linking from "expo-linking";
import { atom, useRecoilState } from "recoil";

import { Section } from "../components/Section";
import { Screen } from "../components/Screen";2

const testAtom = atom<"native" | "bright">({
  key: "testAtom",
  default: "native",
});

function LearnMoreLink({ url }: { url: string }) {
  return <Text onPress={() => Linking.openURL(url)}>Learn more</Text>;
}

export function ExamplesScreens() {
  const [future, setFuture] = useRecoilState(testAtom);

  return (
    <Screen>

      <Section title="Welcome to Metame">
      <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >

        <Button
          title={`Change Image`}
          color="rgb(33, 150, 243)"
          onPress={() => setFuture(String(Math.floor(Math.random() * 200) + 1) + ".png")}
        />

        <Image 
          source={{uri: 'https://shdw-drive.genesysgo.net/EcrJqYViqdV3Sc8r35oU7igJH6soaVewVK6cUorvyMsA/' + future}}
          style={{width: 300, height: 300}}
        />

        <Button
          onPress={() => Linking.openURL("https://metame.vercel.app/")}
          title="Open Metame"
        />
      </View>

      </Section>
    </Screen>
  );
}

      {/*
      <Section title="Custom Font">
        <Text style={{ fontFamily: "Inter_900Black" }}>
          Inter 900 Black Font
        </Text>
        <LearnMoreLink url="https://docs.expo.dev/guides/using-custom-fonts/#using-a-google-font" />
      </Section>
      */}

      {/*
      <Section title="Opening a URL">
        <Button
          onPress={() => Linking.openURL("https://metame.vercel.app/")}
          title="Open Metame"
        />
        <LearnMoreLink url="https://docs.expo.dev/versions/latest/sdk/linking/#linkingopenurlurl" />
      </Section>
      */}

