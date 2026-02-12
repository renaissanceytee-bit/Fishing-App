import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Avatar,
  Button,
  Card,
  Chip,
  Divider,
  List,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [catches, setCatches] = useState([]);

  useEffect(() => {
    loadStats();
    loadCatches();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/catches/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadCatches = async () => {
    try {
      const response = await api.get(`/catches/user/${user?.id}`);
      setCatches(response.data);
    } catch (error) {
      console.error('Failed to load catches:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Avatar.Image
          size={80}
          source={{ uri: user?.avatar || 'https://via.placeholder.com/150' }}
        />
        <Text variant="headlineSmall" style={styles.username}>
          {user?.username}
        </Text>
        {user?.fullName && (
          <Text variant="bodyLarge">{user.fullName}</Text>
        )}

        <Chip
          icon="crown"
          style={styles.subscriptionChip}
        >
          {user?.subscriptionTier}
        </Chip>
      </View>

      {/* Stats */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text variant="headlineMedium">{stats.totalCatches}</Text>
            <Text variant="bodyMedium">Catches</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="headlineMedium">{stats.uniqueSpecies}</Text>
            <Text variant="bodyMedium">Species</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="headlineMedium">{stats.releasedCount}</Text>
            <Text variant="bodyMedium">Released</Text>
          </View>
        </View>
      )}

      <Divider />

      {/* Actions */}
      <List.Section>
        <List.Item
          title="Edit Profile"
          left={(props) => <List.Icon {...props} icon="account-edit" />}
          onPress={() => {}}
        />
        <List.Item
          title="Subscription"
          description={`Current: ${user?.subscriptionTier}`}
          left={(props) => <List.Icon {...props} icon="crown" />}
          onPress={() => navigation.navigate('Subscription')}
        />
        <List.Item
          title="Statistics"
          left={(props) => <List.Icon {...props} icon="chart-line" />}
          onPress={() => {}}
        />
        <List.Item
          title="Achievements"
          left={(props) => <List.Icon {...props} icon="trophy" />}
          onPress={() => {}}
        />
        <List.Item
          title="Settings"
          left={(props) => <List.Icon {...props} icon="cog" />}
          onPress={() => {}}
        />
      </List.Section>

      <Divider />

      {/* Recent Catches */}
      <Text variant="titleLarge" style={styles.sectionTitle}>
        Recent Catches
      </Text>

      {catches.slice(0, 5).map((catchItem: any) => (
        <Card
          key={catchItem.id}
          style={styles.catchCard}
          onPress={() => navigation.navigate('CatchDetail', { id: catchItem.id })}
        >
          {catchItem.photos[0] && (
            <Card.Cover source={{ uri: catchItem.photos[0] }} />
          )}
          <Card.Content style={styles.catchContent}>
            <Text variant="titleMedium">
              {catchItem.species?.name || catchItem.customSpecies}
            </Text>
            <Text variant="bodySmall">
              {new Date(catchItem.timestamp).toLocaleDateString()}
            </Text>
          </Card.Content>
        </Card>
      ))}

      <Button
        mode="outlined"
        onPress={handleLogout}
        style={styles.logoutButton}
        textColor="#dc3545"
      >
        Logout
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  username: {
    marginTop: 12,
    fontWeight: 'bold',
  },
  subscriptionChip: {
    marginTop: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 24,
    backgroundColor: '#fff',
  },
  statItem: {
    alignItems: 'center',
  },
  sectionTitle: {
    padding: 16,
    paddingBottom: 8,
  },
  catchCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  catchContent: {
    paddingTop: 12,
  },
  logoutButton: {
    margin: 24,
    borderColor: '#dc3545',
  },
});
