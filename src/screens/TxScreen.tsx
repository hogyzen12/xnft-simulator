import { Text, FlatList, Button } from "react-native";
import tw from "twrnc";

import { Screen } from "../components/Screen";
//import { useConnection, usePublicKey, usePublicKeys, useSolanaConnection } from "../hooks/xnft-hooks";
import { PublicKey, SystemProgram, Transaction, TransactionInstruction, Connection} from "@solana/web3.js";
import { useSolanaConnection, usePublicKeys } from "react-xnft";
import { useState } from "react";
import { Buffer } from 'buffer';

export function TxScreens() {

  const [blockhash, setBlockhash] = useState("");
  const [signature, setSignature] = useState("");

  const receiver = new PublicKey("6tBou5MHL5aWpDy6cgf3wiwGGK2mR8qs68ujtpaoWrf2");

  const pks = usePublicKeys() as unknown as {solana: string};
  //const pks = usePublicKeys();
  //const pk = pks && pks.length > 0 ? new PublicKey(pks[0]) : undefined;

  console.log(pks)
  let pksString: string = "No pubkeys available!"
  //console.log("Public Keys:", pks);
  //console.log("Selected Public Key:", pk ? pk.toBase58() : "None");

  const pk = pks ? new PublicKey(pks?.solana) : undefined;
  if(pk){
      pksString = pk.toBase58();
  }
  
  //const connection = useSolanaConnection();
  const connection = new Connection('https://solana-mainnet.g.alchemy.com/v2/tJU39R0J_FS049vOxqzyl4qMGP3F-i1e');

  const onButtonClick = async () => {
    
    const bh = (await connection.getLatestBlockhash()).blockhash;
    setBlockhash(bh);

    if(!pk){
      console.log("NO PUBKEY!");
      return;
    }
    
    // const ix = SystemProgram.transfer({
    //   fromPubkey: pk,
    //   toPubkey: receiver,
    //   lamports: 1000000
    // });
    const data = Buffer.alloc(4+8);
    data.writeUInt32LE(2,0); // transfer instruction descriminator
    data.writeUInt32LE(1000000,4); // lamports
    data.writeUInt32LE(0,8); // lamports (upper part, because can't write u64)
    const ix = new TransactionInstruction({
      keys: [
        {
            pubkey: pk,
            isSigner: true,
            isWritable: true
        },
        {
            pubkey: receiver,
            isSigner: false,
            isWritable: true
        },
        {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false
        },
      ],
      programId: SystemProgram.programId,
      data: data
    });

    // Create a memo instruction
    const memoText = "Your memo text here"; // Replace with your memo text
    const memoData = Buffer.from(memoText, "utf-8");
    const memoProgramId = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
    const memoInstruction = new TransactionInstruction({
    keys: [{ pubkey: pk, isSigner: true, isWritable: false }],
    programId: memoProgramId,
    data: memoData
    });

    const tx = new Transaction();
    tx.add(memoInstruction); // Add the memo instruction
    tx.add(ix); // Add your existing instruction

    const sx = await window.xnft.solana.send(tx);
    console.log("signature: "+ sx);
    setSignature(sx);
  }

  return (
    <Screen>
      <Text style={tw`mb-4`}>
        This is my first xNFT!
      </Text>
      
      <Text style={tw`mb-4`}>
        Your pubkey: {pksString} 
      </Text>
      <Text style={tw`mb-4`}>
        Recent Blockhash: {blockhash} 
      </Text>
      <Text style={tw`mb-4`}>
        Signature: {signature} 
      </Text>
      <Button title="sendtx" onPress={onButtonClick} />
    </Screen>
  );
}