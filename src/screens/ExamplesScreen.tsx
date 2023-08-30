import React, { useEffect } from "react";
import { View, Image, Button, TouchableOpacity, Text } from "react-native";
import { atom, useRecoilState } from "recoil";
import { Screen } from "../components/Screen";

const deepCopyBoard = (originalBoard) => {
  return originalBoard.map(row => row.slice());
};

const gridRows = 5;
const gridCols = 5;

// Array of candy image URLs
const candyImages = [
"https://shdw-drive.genesysgo.net/5CtiANdzSkHndMmuFE42cHVaTrEPJshUn2TBJ5iCoKc8/nu43gnAPV37WFa8uSkbiqB2kdm1XqVucivCZRuvmhCkRWRG1zeEEiY64wv95pQnKwNSiFZf8MvtNTQQhvKQnjYW.png",
"https://shdw-drive.genesysgo.net/5CtiANdzSkHndMmuFE42cHVaTrEPJshUn2TBJ5iCoKc8/5PXP94DjjjaKzDFHhiejHWFm8QhB32eqxjudrQktuxPZJL689kqnPAWVrz4LEzpogTQLA9UuszE3aJSLqcD2fThA.png",
"https://shdw-drive.genesysgo.net/5CtiANdzSkHndMmuFE42cHVaTrEPJshUn2TBJ5iCoKc8/42Gpds4k38ut9MjboHdYvxi7DD9y9noR7o3XJUJkFQYF83GKtHEsS3Gh6ZBmaB8bt1UhGNpFVDB9oz1FVJaGijbm.png",
"https://shdw-drive.genesysgo.net/5CtiANdzSkHndMmuFE42cHVaTrEPJshUn2TBJ5iCoKc8/23pP97nVAKDQct2wjRuGQjhN6XPdXfuCdRrmbMJ7WbSTVsWyU5k5kKojMsYJyf8nPeN9Ph1SzSvsToGu9SXVuJpY.png",
"https://shdw-drive.genesysgo.net/5CtiANdzSkHndMmuFE42cHVaTrEPJshUn2TBJ5iCoKc8/4Ra2YfcPkBAjJs4ZcCnVLjiLWw4uGShrR46ii8Qr33asXor8hsabMXeGKMvJmHnFfuasPsaYDXZCiUvdC9ytpo7r.png",
"https://shdw-drive.genesysgo.net/5CtiANdzSkHndMmuFE42cHVaTrEPJshUn2TBJ5iCoKc8/5x2DYeNEHmaBM6qdpxj2sgVj78aaFPLpVCQ38eUfvGtj2TokmvUgG1jWgn4etwn97VJfo9oLpkvmSWey86crcsg1.png",
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

export function ExamplesScreens() {
  const [board, setBoard] = useRecoilState(boardState);
  const [matchCount, setMatchCount] = useRecoilState(matchCountState);
  const [turnCount, setTurnCount] = useRecoilState(turnCountState);
  const [selectedTile, setSelectedTile] = useRecoilState(selectedTileState);
  const [moves, setMoves] = useRecoilState(movesState);

  const generateSeedBoard = () => {
    const newBoard = generateBoardFromSeed(seed);
    setBoard(newBoard);
    setMatchCount(0);  // Reset the match counter to zero
    setTurnCount(0);  // Reset the turn counter to zero
    setMoves([]);     // Reset the move log to an empty array
  };

  const detectAndReplaceMatches = (newBoard) => {
    let matches = 0;

    const matchAndReplace = (row, col, rowInc, colInc, len) => {
      let baseValue = newBoard[row][col];
      let replace = false;

      const generateDifferentCandyType = (excludeType) => {
        let newType;
        do {
          newType = Math.floor(Math.random() * (candyImages.length - 1));
        } while (newType === excludeType);
        return newType;
      };
    
      for (let i = 1; i < len; i++) {
        if (newBoard[row + i * rowInc][col + i * colInc] !== baseValue) {
          replace = false;
          break;
        }
        replace = true;
      }
    
      if (replace) {
        matches += len;  // Increase the matches by the length of the match
        for (let i = 0; i < len; i++) {
          newBoard[row + i * rowInc][col + i * colInc] = generateDifferentCandyType(baseValue);
        }
      }
    
      return replace;
    }

    // Loop through the board and check for matches
    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
            for (let len = gridCols; len >= 3; len--) { // Check from longest possible match down to 3
                if (col + len <= gridCols && matchAndReplace(row, col, 0, 1, len)) break; // Check horizontally
                if (row + len <= gridRows && matchAndReplace(row, col, 1, 0, len)) break; // Check vertically
            }
        }
    }

    return matches; // Return the total number of matches detected
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
  
        if (matchesFound > 0) {
          setMatchCount(prevCount => prevCount + matchesFound);
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

  


  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row' }}>
          {board.map((row, rowIndex) => (
            <View key={rowIndex} style={{ flexDirection: 'column' }}>
              {row.map((candyIndex, colIndex) => (
                <TouchableOpacity
                  key={colIndex}
                  onPress={() => handleTilePress(rowIndex, colIndex)}
                  style={{
                    width: 100,
                    height: 100,
                    opacity: selectedTile && selectedTile.row === rowIndex && selectedTile.col === colIndex ? 0.5 : 1
                  }}
                >
                  <Image
                    source={{ uri: candyImages[candyIndex] }}
                    style={{ width: 100, height: 100 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
        <Button title="Generate New Board" onPress={generateSeedBoard} />
        <Text style={{ fontSize: 20, marginTop: 20 }}>
          Matches Made: {matchCount}
        </Text>
        <Text style={{ fontSize: 20, marginTop: 20 }}>
          Turns Taken: {turnCount}
        </Text>
        <Button title="Submit" onPress={() => console.log("Submit")} />
      </View>
    </Screen>
  );
}
