import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation hook

interface LeaderboardItem {
  name: string;
  seed: string;
  cardsCollected: number;
  points: number;
}

export function LeaderboardScreens() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>([]);

  const navigation = useNavigation(); // Initialize the navigation object

  const navigateToGameWithSeed = (seed: string) => {
    // Navigate to ExamplesScreens with the provided seed
    navigation.navigate("Examples", { seed });
  };

  // Dummy leaderboard data (replace with API call)
  const dummyLeaderboardData: LeaderboardItem[] = [
    { name: "Player 1", seed: "2cN982Bz3FTMGJdYrN91RFsHs4erJQTgQ63if4mYaawLzzwVmjgtcDpBo7gs4Vf8TBk81PH15qXrStJVgFmTmtbc", cardsCollected: 3, points: 1000 },
    { name: "Player 2", seed: "2cN982Bz3FTMGJdYrN91RFsHs4erJQTgQ63if4mYaawLzzwVmjgtcDpBo7gs4Vf8TBk81PH15qXrStJVgFmTmtbc", cardsCollected: 2, points: 690 },
    { name: "Player 3", seed: "BLY32Qhe8vAkxKiYexJRzvKASsRBU9brqzKt6wWspC36q9dhmyUsAkPZG8HjpctED5XRt9hANZVUJwNqLVFA552", cardsCollected: 24, points: 1000 },
    { name: "Player 4", seed: "BLY32Qhe8vAkxKiYexJRzvKASsRBU9brqzKt6wWspC36q9dhmyUsAkPZG8HjpctED5XRt9hANZVUJwNqLVFA552", cardsCollected: 4, points: 70 },
    { name: "Top gun", seed: "2edSTdcBYNz5LnwHT6vjxqWa7q1HepMdc8ykuisnHxxiNnSRkF7AtWpidZHicAoT9PbtCDX5jb22kdHfRjbNGJrY", cardsCollected: 88, points: 40 },
    // ... more data ...
  ];

  useEffect(() => {
    // Simulate API call and set the leaderboard data
    setTimeout(() => {
      setLeaderboardData(dummyLeaderboardData);
    }, 1000); // Simulating a 1-second delay
  }, []);

  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardItem; index: number }) => (
    <View style={styles.leaderboardItem}>
      <View style={styles.rankContainer}>
        <Text style={styles.rank}>{index + 1}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userSeed}>Seed: {item.seed.substr(0, 9)}</Text>
      </View>
      <TouchableOpacity
        style={styles.challengeButton}
        onPress={() => navigateToGameWithSeed(item.seed)}
      >
        <Text style={styles.challengeButtonText}>Challenge</Text>
      </TouchableOpacity>
      <View style={styles.stats}>
        <Text>Cards: {item.cardsCollected}</Text>
        <Text>Points: {item.points}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top 5</Text>
      <FlatList
        data={leaderboardData}
        renderItem={renderLeaderboardItem}
        keyExtractor={(_, index) => index.toString()}
      />
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
});
