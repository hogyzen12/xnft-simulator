import React, { useEffect, useState } from "react";
import { atom, useRecoilState } from "recoil";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Connection, PublicKey } from '@solana/web3.js';
const LAMPORTS_PER_SOL = 1000000000; // Number of lamports in one SOL

interface LeaderboardItem {
  signer: string;
  points: number;
  cards_collected: number;
}

const balanceState = atom({
  key: 'balanceState',
  default: 0,
});

export function LeaderboardScreens() {
  const [topPointsData, setTopPointsData] = useState<LeaderboardItem[]>([]);
  const [topCardsCollectedData, setTopCardsCollectedData] = useState<LeaderboardItem[]>([]);  
  const [balance, setBalance] = useRecoilState(balanceState); // State variable for the balance

  useEffect(() => {
    const connection = new Connection('https://solana-mainnet.g.alchemy.com/v2/tJU39R0J_FS049vOxqzyl4qMGP3F-i1e');
    const prizePoolPublicKey = new PublicKey('crushpRpFZ7r36fNfCMKHFN4SDvc7eyXfHehVu34ecW');
    async function fetchBalance() {
      try {
        const lamports = await connection.getBalance(prizePoolPublicKey); // Use PublicKey object
        const sol = lamports / LAMPORTS_PER_SOL;
        setBalance(sol);
      } catch (error) {
        console.error('Error fetching balance', error);
      }
    }

    fetchBalance(); // Call the function
  }, []);
  
  const navigation = useNavigation();
  const fetchLeaderboardData = async () => {
    try {
      const response = await fetch('https://shdw-drive.genesysgo.net/3UgjUKQ1CAeaecg5CWk88q9jGHg8LJg9MAybp4pevtFz/leaderboard.json');
      const data = await response.json();
      setTopPointsData(data.top_points);
      
  
      // Find the entry with the maximum number of cards collected
      const maxCardsCollectedEntry = data.top_cards_collected.reduce((max, current) => 
        (current.cardsCollected > max.cardsCollected) ? current : max, data.top_cards_collected[0]);
  
      setTopCardsCollectedData([maxCardsCollectedEntry]); // Set only the top entry
      console.log(data.top_points)
      console.log(maxCardsCollectedEntry)
    } catch (error) {
      console.error('Failed to fetch leaderboard data:', error);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const truncateSigner = (signer: string) => {
    return signer.substring(0, 4) + "..." + signer.substring(signer.length - 4);
  };

  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardItem; index: number }) => (
    <View style={styles.leaderboardItem}>
      <View style={styles.rankContainer}>
        <Text style={styles.rank}>{index + 1}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
          Signer: {truncateSigner(item.signer)}
        </Text>
      </View>
      <View style={styles.stats}>
        <Text>Cards: {item.cards_collected}</Text>
        <Text>Points: {item.points}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prize Pool Balance</Text>
      <Text>{balance.toFixed(2)} SOL</Text>
      <Text style={styles.title}>Point Leaders</Text>
      <FlatList
        data={topPointsData}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item, index) => 'points' + item.signer + index}
      />
      <Text style={styles.title}>Top Cards Collector</Text>
      <FlatList
        data={topCardsCollectedData}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item, index) => 'cards' + item.signer + index}
      />
      <Button title="Refresh Leaderboard" onPress={fetchLeaderboardData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  leaderboardItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  rankContainer: {
    width: 30,
    marginRight: 10,
  },
  rank: {
    fontSize: 16,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  userSeed: {
    fontSize: 12,
    color: "#666",
  },
  stats: {
    alignItems: "flex-end",
  },
  challengeButton: {
    backgroundColor: "#007AFF", // Blue background color
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
  },

  challengeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },

  stats: {
    alignItems: "flex-end",
  },
  userName: {
    fontSize: 14, // Adjust font size
    fontWeight: "bold",
    flexShrink: 1, // Allow text to shrink
  },
  userSeed: {
    fontSize: 12,
    color: "#666",
    flexShrink: 1, // Allow text to shrink
  },
  stats: {
    alignItems: "flex-end",
    marginLeft: 10, // Add some space between text and stats
  },
  leaderboardItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    flex: 1, // Ensure it takes full width
  },
});
