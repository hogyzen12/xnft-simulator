import React, { useEffect } from "react";
import { View, Image, Button, TouchableOpacity, Text, Dimensions } from "react-native";
import { atom, useRecoilState } from "recoil";
import { Screen } from "../components/Screen";
import { Section } from "../components/Section";
import {
  Connection,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  PublicKey,
} from '@solana/web3.js';
import { useRoute } from "@react-navigation/native"; // Import useRoute hook
import { useNavigation } from "@react-navigation/native";
import { useSolanaConnection, usePublicKeys } from "react-xnft";
import { Buffer } from 'buffer';
import tw from "twrnc";

const deepCopyBoard = (originalBoard) => {
  return originalBoard.map(row => row.slice());
};

const screenWidth = Dimensions.get('window').width;
console.log(screenWidth);
const gridRows = 5;
const gridCols = 5;

// Array of candy image URLs
const candyImages = [
"https://shdw-drive.genesysgo.net/3UgjUKQ1CAeaecg5CWk88q9jGHg8LJg9MAybp4pevtFz/backpack.png",
"https://shdw-drive.genesysgo.net/3UgjUKQ1CAeaecg5CWk88q9jGHg8LJg9MAybp4pevtFz/bonk.png",
"https://shdw-drive.genesysgo.net/3UgjUKQ1CAeaecg5CWk88q9jGHg8LJg9MAybp4pevtFz/jules.png",
"https://shdw-drive.genesysgo.net/3UgjUKQ1CAeaecg5CWk88q9jGHg8LJg9MAybp4pevtFz/nyla.png",
"https://shdw-drive.genesysgo.net/3UgjUKQ1CAeaecg5CWk88q9jGHg8LJg9MAybp4pevtFz/otter.png",
"https://shdw-drive.genesysgo.net/3UgjUKQ1CAeaecg5CWk88q9jGHg8LJg9MAybp4pevtFz/tetsu.png",
"https://shdw-drive.genesysgo.net/5rWLS6ycBjmBSxAqyJ82yukZWLWZ5R9Ru97vvcJqknjN/sticker_size.gif"
];

// Seed string (you can change it or even make it a prop to change dynamically)
const seed = "2cN982Bz3FTMGJdYrN91RFsHs4erJQTgQ63if4mYaawLzzwVmjgtcDpBo7gs4Vf8TBk81PH15qXrStJVgFmTmtbc";

const generateBoardFromSeed = (seed) => {
  let board = Array.from({ length: gridRows }, () => Array(gridCols).fill(0));
  for (let i = 0; i < gridRows; i++) {
    for (let j = 0; j < gridCols; j++) {
      const seedChar = seed[i * gridRows + j];
      board[i][j] = seedChar.charCodeAt(0) % 6;
    }
  }
  return board;
};

const boardState = atom({
  key: 'boardState',
  default: generateBoardFromSeed(seed),
});

const matchCountState = atom({
  key: 'matchCountState',
  default: 0, // Start with 0 matches
});

const cardCollectedState = atom({
  key: 'cardCollectedState',
  default: 0, // Start with 0 matches
});

const turnCountState = atom({
  key: 'turnCountState',
  default: 0, // Start with 0 turns
});

const selectedTileState = atom({
  key: 'selectedTileState',
  default: null,
});

const movesState = atom({
  key: 'movesState',
  default: [],
});

const balanceState = atom({
  key: 'balanceState',
  default: 0,
});

const signatureState = atom({
  key: 'signatureState',
  default: "",
});

export function ExamplesScreens() {
  const [board, setBoard] = useRecoilState(boardState);
  const [matchCount, setMatchCount] = useRecoilState(matchCountState);
  const [cardCollectedCount, setcardCollectedCount] = useRecoilState(cardCollectedState);
  const [turnCount, setTurnCount] = useRecoilState(turnCountState);
  const [selectedTile, setSelectedTile] = useRecoilState(selectedTileState);
  const [moves, setMoves] = useRecoilState(movesState);
  const [balance, setBalance] = useRecoilState(balanceState); // State variable for the balance
  const [signature, setSignature] = useRecoilState(signatureState);
  const tileSize = Math.min(Math.max(screenWidth / gridCols, 70), 120);

  const route = useRoute(); // Initialize the route object
  const seedFromRoute = route.params?.seed || ""; // Extract the seed parameter from route
  const receiver = new PublicKey("crushpRpFZ7r36fNfCMKHFN4SDvc7eyXfHehVu34ecW");
  const pks = usePublicKeys() as unknown as {solana: string};
  console.log(pks)
  let pksString: string = "No pubkeys available!"
  const pk = pks ? new PublicKey(pks?.solana) : undefined;
  if(pk){
      pksString = pk.toBase58();
  }

  useEffect(() => {
    const connection = new Connection('https://solana-mainnet.g.alchemy.com/v2/tJU39R0J_FS049vOxqzyl4qMGP3F-i1e');
    async function fetchBalance() {
      try {
        const lamports = await connection.getBalance(pk); // Fetch the balance in lamports
        const sol = lamports / LAMPORTS_PER_SOL; // Convert to SOL
        setBalance(sol); // Update the state variable
      } catch (error) {
        console.error('Error fetching balance', error);
      }
    }

    fetchBalance(); // Call the function
  }, []);

  console.log(seedFromRoute);

  // Generate the initial board from seedFromRoute if it exists, or use the default seed
  useEffect(() => {
    if (seedFromRoute) {
      const newBoard = generateBoardFromSeed(seedFromRoute);
      setBoard(newBoard);
      setMatchCount(0);
      setcardCollectedCount(0);
      setTurnCount(0);
      setMoves([]);
    }
  }, [seedFromRoute]);

  
  const generateSeedBoard = () => {
    const newBoard = generateBoardFromSeed(seed);
    setBoard(newBoard);
    setMatchCount(0);  // Reset the match counter to zero
    setcardCollectedCount(0);  // Reset the card collet counter to zero
    setTurnCount(0);  // Reset the turn counter to zero
    setMoves([]);     // Reset the move log to an empty array
  };

  function getReplacementIndices(matchedIndex, totalMatches) {
    // Boundary check for the matchedIndex to be valid
    if (matchedIndex < 0 || matchedIndex >= candyImages.length - 1) {
      throw new Error('Invalid candy index');
    }
  
    if (matchedIndex === candyImages.length - 1) { // Special card
      if (totalMatches % 2 === 0) {  // Even
        return [0, 1, 2];  // Return the first three entries
      } else {  // Odd
        return [3, 4, 5];  // Return the entries corresponding to the last three, excluding the special one
      }
    }
  
    // Calculate indices for regular candies
    const previousIndex = matchedIndex - 1 < 0 ? candyImages.length - 2 : matchedIndex - 1;
    const nextIndex = (matchedIndex + 1) % (candyImages.length - 1);
  
    return [previousIndex, candyImages.length - 1, nextIndex];
  }

  const detectAndReplaceMatches = (newBoard) => {
    let matches = 0;
    let cardMatches = 0;
    let specialCardMatches = 0;  // New counter for special card matches
  
    const replaceCandies = (row, col, rowInc, colInc, len, matchedType) => {
      let indices;
      if (matchedType === candyImages.length - 1 && len === 3) { 
        if (colInc !== 0) { // horizontal match
          newBoard[row][col] = 0; // Candy 1
          newBoard[row][col + colInc] = 1; // Candy 2
          newBoard[row][col + 2 * colInc] = 2; // Candy 3
        } else { // vertical match
          newBoard[row][col] = 5; // Candy 6
          newBoard[row + rowInc][col] = 4; // Candy 5
          newBoard[row + 2 * rowInc][col] = 3; // Candy 4
        }
        cardMatches += len;  // Increase the matches by the length of the match
        specialCardMatches += len;  // Increase the special matches by the length of the match
        console.log("cardMatches: " + cardMatches);
        console.log("specialCardMatches: " + specialCardMatches); // Log special matches
      } else {
        indices = getReplacementIndices(matchedType);
              
        newBoard[row][col] = indices[0];
        for (let i = 1; i < len - 1; i++) {
          newBoard[row + i * rowInc][col + i * colInc] = indices[1];
        }
        newBoard[row + (len - 1) * rowInc][col + (len - 1) * colInc] = indices[2];
      }
    };
  
    const matchAndReplace = (row, col, rowInc, colInc, len) => {
      let baseValue = newBoard[row][col];
      let replace = false;
  
      for (let i = 1; i < len; i++) {
        if (newBoard[row + i * rowInc][col + i * colInc] !== baseValue) {
          replace = false;
          break;
        }
        replace = true;
      }
  
      if (replace) {
        matches += len;  // Increase the matches by the length of the match
        replaceCandies(row, col, rowInc, colInc, len, baseValue);
      }
  
      return replace;
    };
  
    // Loop through the board and check for matches
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        for (let len = gridCols; len >= 3; len--) { // Check from longest possible match down to 3
          if (col + len <= gridCols && matchAndReplace(row, col, 0, 1, len)) break; // Check horizontally
          if (row + len <= gridRows && matchAndReplace(row, col, 1, 0, len)) break; // Check vertically
        }
      }
    }
  
    return {
      matches: matches,  // Return the total number of matches detected
      specialMatches: specialCardMatches  // Return the total number of special matches
    };
};

  const handleTilePress = (rowIndex, colIndex) => {

    const recordMove = (startTile, direction) => {
      const colLetter = String.fromCharCode(97 + startTile.col); // Convert 0 -> 'a', 1 -> 'b', ...
      const move = `${colLetter}${startTile.row + 1}${direction}`;
      setMoves(prevMoves => {
        const updatedMoves = [...prevMoves, move];
        console.log(updatedMoves);
        return updatedMoves;
      });
    };
  
    if (selectedTile) {
      const rowDiff = Math.abs(rowIndex - selectedTile.row);
      const colDiff = Math.abs(colIndex - selectedTile.col);
  
      const isAdjacentHorizontally = (rowDiff === 0 && colDiff === 1);
      const isAdjacentVertically = (colDiff === 0 && rowDiff === 1);
  
      // Check if it's an adjacent tile either horizontally or vertically
      if (isAdjacentHorizontally || isAdjacentVertically) {
        const newBoard = deepCopyBoard(board);
        const temp = newBoard[rowIndex][colIndex];
        newBoard[rowIndex][colIndex] = newBoard[selectedTile.row][selectedTile.col];
        newBoard[selectedTile.row][selectedTile.col] = temp;
  
        const matchesFound = detectAndReplaceMatches(newBoard);
        const matchCount = matchesFound.matches;
                
        if (matchCount > 0) {
          setMatchCount(prevCount => prevCount + matchCount);
        }

        const cardCollectedCount = matchesFound.specialMatches;   
        if (cardCollectedCount > 0) {
          setcardCollectedCount(prevCount => prevCount + cardCollectedCount);
        }
  
        setBoard(newBoard);
        setTurnCount(prevTurnCount => prevTurnCount + 1);
  
        // Recording the moves after a successful tile swap:
        if (isAdjacentHorizontally) {
          if (colIndex > selectedTile.col) {
            recordMove(selectedTile, 'r');
          } else {
            recordMove(selectedTile, 'l');
          }
        } else if (isAdjacentVertically) {
          if (rowIndex > selectedTile.row) {
            recordMove(selectedTile, 's');
          } else {
            recordMove(selectedTile, 'n');
          }
        }
      }
  
      setSelectedTile(null);  // Clear the selected tile after the switch or if the selected tile is not adjacent
    } else {
      setSelectedTile({ row: rowIndex, col: colIndex });  // Set the current tile as the selected tile for switching
    }
  };

  const entrySubmit = async () => {
    const connection = new Connection('https://solana-mainnet.g.alchemy.com/v2/tJU39R0J_FS049vOxqzyl4qMGP3F-i1e');
    const bh = (await connection.getLatestBlockhash()).blockhash;
    if(!pk){
      console.log("NO PUBKEY!");
      return;
    }

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
    const movesString = moves.join("|");
    const memoData = Buffer.from(movesString, "utf-8");
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
      <Section>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <Text style={{ fontSize: 10 }}>
            Turn: {turnCount}
          </Text>
          <Text style={{ fontSize: 10 }}>
            Cards Collected: {cardCollectedCount}
          </Text>
          <Text style={{ fontSize: 10 }}>
            Points: {matchCount}
          </Text>
          <Text style={{ fontSize: 10 }}>
          Balance: {balance} SOL
          </Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row' }}>
            {board.map((row, rowIndex) => (
              <View key={rowIndex} style={{ flexDirection: 'column' }}>
                {row.map((candyIndex, colIndex) => (
                  <TouchableOpacity
                    key={colIndex}
                    onPress={() => handleTilePress(rowIndex, colIndex)}
                    style={{
                      width: tileSize,
                      height: tileSize,
                      opacity: selectedTile && selectedTile.row === rowIndex && selectedTile.col === colIndex ? 0.5 : 1
                    }}
                  >
                    <Image
                      source={{ uri: candyImages[candyIndex] }}
                      style={{ width: tileSize, height: tileSize }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
          <Button title="Reset" onPress={generateSeedBoard} />
          <View style={{ width: 10 }} /> {/* This View acts as a spacer */}
          <Button title="Submit" onPress={entrySubmit} />
        </View>
      </Section>
    </Screen>
  );
}
