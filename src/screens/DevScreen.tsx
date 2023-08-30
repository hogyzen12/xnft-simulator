import { useEffect, useState } from "react";
import { Button, Image, Text, TextInput, View } from "react-native";
import { usePublicKeys} from "../hooks/xnft-hooks"
import {
  Connection,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import * as Linking from "expo-linking";
import { atom, useRecoilState } from "recoil";

import { Section } from "../components/Section";
import { Screen } from "../components/Screen";

const devAtom = atom<"native" | "bright">({
  key: "devAtom",
  default: "Enter your code here and then click submit",
});
const devDiscord = atom<"native" | "bright">({
  key: "devDiscord",
  default: "Enter your Discord here to receive WL role",
});

function LearnMoreLink({ url }: { url: string }) {
  return <Text onPress={() => Linking.openURL(url)}>Learn more</Text>;
}

export function DevScreens() {
  const [input, setInput] = useRecoilState(devAtom);
  const [discord, setDiscord] = useRecoilState(devDiscord); // added line
  const [apiResponse, setApiResponse] = useState(null); // added state for API response
  const pub = usePublicKeys();
  console.log(pub?.yourPublicKey)
  console.log(window.xnft.solana.publicKey)

  const handlePress = async () => {

    try {
      const url = `https://accessapi-1-n8034115.deta.app/check-code/${input}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log("API Response:", data);
        setApiResponse(data); // set the API response to state
      } else {
        console.error("API Error:", response.status);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  return (
    <Screen>

      <Section title="Welcome Prospective Cardholder!">
      <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          
          <TextInput
            value={input}
            onChangeText={(text) => setInput(text)}
            style={{
              width: "100%",
              height: 60,
              borderColor: "black",
              borderWidth: 10,
              textAlign: "center",
            }}
          />

          <TextInput
            value={discord}
            onChangeText={(text) => setDiscord(text)}
            style={{
              width: "100%",
              height: 60,
              borderColor: "black",
              borderWidth: 10,
              textAlign: "center",
            }}
          />

          <Button
            title={"Submit Code"}
            onPress={handlePress}
            color="black" // Set text color to gold
            style={{
              marginTop: 16,
              backgroundColor: "black", // Set background color to black
              borderRadius: 10, // Add border radius for rounded corners
              paddingHorizontal: 32, // Add horizontal padding
            }}
          />

          {apiResponse && (
            <Text style={{ marginTop: 16, textAlign: "center" }}>
              Response:{" "}
              {apiResponse === "Welcome Cardholder" ? "Welcome Cardholder!" : "Access Denied, Try again"}
            </Text>
          )}
          {apiResponse === "Welcome Cardholder" && (
            <Image
              source={{
                uri:
                  "https://shdw-drive.genesysgo.net/6okGJJ9xLon3PocbtSdmKedAqX6Fvvcu32qd46Qx1uwi/card.png",
              }}
              style={{
                width: 300,
                height: 300,
                marginTop: 16,
                alignSelf: "center",
              }}
              resizeMode="contain"
            />
          )}

          {apiResponse && (
            <Text style={{ marginTop: 16, textAlign: "center" }}>
              Response:{" "}
              {apiResponse === "Welcome Cardholder" ? "Your discord: " + discord + "will receive WL shortly" : "Please remember to enter your Discord again"}
            </Text>
          )}
        </View>

      </Section>
    </Screen>
  );
}


