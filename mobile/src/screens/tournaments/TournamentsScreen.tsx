import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, ActivityIndicator, Chip, FAB, Divider, ProgressBar, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { theme } from '../../theme';

interface Tournament {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  rules: string;
  prizes: string;
  entryFee: number;
  maxParticipants?: number;
  _count?: {
    entries: number;
  };
  isParticipating?: boolean;
}

interface LeaderboardEntry {
  id: string;
  rank: number;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  totalWeight?: number;
  totalLength?: number;
  catchCount: number;
  points: number;
}

export default function TournamentsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'browse' | 'my'>('browse');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTournaments = async () => {
    try {
      const endpoint = activeTab === 'my' ? '/tournaments/my' : '/tournaments';
      const response = await api.get(endpoint);
      setTournaments(response.data);
    } catch (error) {
      console.error('Failed to fetch tournaments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchLeaderboard = async (tournamentId: string) => {
    try {
      const response = await api.get(`/tournaments/${tournamentId}/leaderboard`);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, [activeTab]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTournaments();
  };

  const handleJoinTournament = async (tournamentId: string) => {
    try {
      await api.post(`/tournaments/${tournamentId}/join`);
      fetchTournaments();
    } catch (error) {
      console.error('Failed to join tournament:', error);
    }
  };

  const handleTournamentPress = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    fetchLeaderboard(tournament.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING': return '#2196f3';
      case 'ACTIVE': return '#4caf50';
      case 'COMPLETED': return '#9e9e9e';
      default: return theme.colors.primary;
    }
  };

  const getProgressValue = (tournament: Tournament) => {
    if (!tournament.maxParticipants || !tournament._count) return 0;
    return tournament._count.entries / tournament.maxParticipants;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderTournament = ({ item }: { item: Tournament }) => (
    <TouchableOpacity onPress={() => handleTournamentPress(item)}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleLarge" style={styles.title}>{item.name}</Text>
            <Chip 
              mode="flat" 
              compact
              style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
              textStyle={{ color: '#fff' }}
            >
              {item.status}
            </Chip>
          </View>

          <Text variant="bodyMedium" numberOfLines={2} style={styles.description}>
            {item.description}
          </Text>

          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text variant="bodySmall" style={styles.label}>📅 Start</Text>
              <Text variant="bodyMedium">{formatDate(item.startDate)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text variant="bodySmall" style={styles.label}>🏁 End</Text>
              <Text variant="bodyMedium">{formatDate(item.endDate)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text variant="bodySmall" style={styles.label}>💰 Entry</Text>
              <Text variant="bodyMedium">
                {item.entryFee === 0 ? 'Free' : `$${item.entryFee}`}
              </Text>
            </View>
          </View>

          {item.maxParticipants && item._count && (
            <View style={styles.participantsSection}>
              <Text variant="bodySmall" style={styles.participantsText}>
                {item._count.entries} / {item.maxParticipants} participants
              </Text>
              <ProgressBar 
                progress={getProgressValue(item)} 
                color={theme.colors.primary}
                style={styles.progressBar}
              />
            </View>
          )}

          {item.prizes && (
            <View style={styles.prizesSection}>
              <Text variant="bodySmall" style={styles.label}>🏆 Prizes</Text>
              <Text variant="bodyMedium">{item.prizes}</Text>
            </View>
          )}

          {!item.isParticipating && item.status !== 'COMPLETED' && (
            <Card.Actions>
              <Chip
                mode="outlined"
                onPress={() => handleJoinTournament(item.id)}
                style={styles.joinButton}
              >
                Join Tournament
              </Chip>
            </Card.Actions>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderLeaderboardEntry = ({ item }: { item: LeaderboardEntry }) => (
    <View style={styles.leaderboardItem}>
      <View style={styles.rankContainer}>
        <Text 
          variant="titleMedium" 
          style={[
            styles.rank,
            item.rank === 1 && styles.goldRank,
            item.rank === 2 && styles.silverRank,
            item.rank === 3 && styles.bronzeRank,
          ]}
        >
          {item.rank}
        </Text>
      </View>
      <Avatar.Text 
        size={40} 
        label={item.user.name.substring(0, 2).toUpperCase()} 
      />
      <View style={styles.leaderboardInfo}>
        <Text variant="bodyLarge">{item.user.name}</Text>
        <Text variant="bodySmall" style={styles.stats}>
          {item.catchCount} catches • {item.points} pts
        </Text>
      </View>
      {item.totalWeight && (
        <Text variant="bodyMedium" style={styles.weight}>
          {item.totalWeight.toFixed(1)} lbs
        </Text>
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (selectedTournament) {
    return (
      <View style={styles.container}>
        <Card style={styles.detailCard}>
          <Card.Title 
            title={selectedTournament.name}
            subtitle={selectedTournament.description}
            right={(props) => (
              <Chip onPress={() => setSelectedTournament(null)} style={styles.closeButton}>
                Close
              </Chip>
            )}
          />
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Leaderboard</Text>
            <FlatList
              data={leaderboard}
              renderItem={renderLeaderboardEntry}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <Text variant="bodyMedium" style={styles.emptyText}>
                  No entries yet
                </Text>
              }
            />
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <Chip
          selected={activeTab === 'browse'}
          onPress={() => setActiveTab('browse')}
          style={styles.tabChip}
        >
          Browse All
        </Chip>
        <Chip
          selected={activeTab === 'my'}
          onPress={() => setActiveTab('my')}
          style={styles.tabChip}
        >
          My Tournaments
        </Chip>
      </View>

      <FlatList
        data={tournaments}
        renderItem={renderTournament}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge">No tournaments found</Text>
            <Text variant="bodySmall" style={styles.emptySubtext}>
              {activeTab === 'my' 
                ? 'Join a tournament to get started!' 
                : 'Check back soon for new tournaments'}
            </Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        label="Create"
        style={styles.fab}
        onPress={() => {
          // Navigate to create tournament screen
          // navigation.navigate('CreateTournament');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: theme.colors.surface,
    elevation: 2,
  },
  tabChip: {
    flex: 1,
  },
  listContent: {
    padding: 12,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  detailCard: {
    margin: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
  },
  statusChip: {
    marginLeft: 8,
  },
  description: {
    marginTop: 4,
    color: theme.colors.onSurfaceVariant,
  },
  divider: {
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  infoItem: {
    alignItems: 'center',
  },
  label: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  participantsSection: {
    marginVertical: 8,
  },
  participantsText: {
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  prizesSection: {
    marginTop: 8,
  },
  joinButton: {
    marginTop: 8,
  },
  closeButton: {
    marginRight: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.elevation.level2,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  rank: {
    fontWeight: 'bold',
  },
  goldRank: {
    color: '#ffd700',
  },
  silverRank: {
    color: '#c0c0c0',
  },
  bronzeRank: {
    color: '#cd7f32',
  },
  leaderboardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  stats: {
    marginTop: 4,
    color: theme.colors.onSurfaceVariant,
  },
  weight: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptySubtext: {
    marginTop: 8,
    color: theme.colors.onSurfaceVariant,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: theme.colors.onSurfaceVariant,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: theme.colors.primary,
  },
});
