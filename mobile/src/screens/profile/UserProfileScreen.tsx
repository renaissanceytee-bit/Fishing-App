import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Image } from 'react-native';
import { Text, Card, ActivityIndicator, Button, Avatar, Divider, Chip, Surface } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { theme } from '../../theme';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  location?: string;
  subscriptionTier: 'FREE' | 'BASIC' | 'PRO' | 'ELITE';
  isFollowing?: boolean;
  _count?: {
    catches: number;
    followers: number;
    following: number;
    posts: number;
  };
  stats?: {
    totalCatches: number;
    totalSpecies: number;
    biggestCatch?: {
      species: string;
      weight: number;
      length: number;
    };
  };
}

interface UserCatch {
  id: string;
  species: string;
  weight?: number;
  length?: number;
  photos: string[];
  location?: string;
  createdAt: string;
  likes: number;
  comments: number;
}

export default function UserProfileScreen({ route }: any) {
  const { userId } = route.params;
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [catches, setCatches] = useState<UserCatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'catches' | 'stats'>('catches');

  const isOwnProfile = currentUser?.id === userId;

  const fetchProfile = async () => {
    try {
      const [profileRes, catchesRes] = await Promise.all([
        api.get(`/users/${userId}`),
        api.get(`/catches?userId=${userId}&limit=20`)
      ]);
      
      setProfile(profileRes.data);
      setCatches(catchesRes.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const handleFollow = async () => {
    try {
      if (profile?.isFollowing) {
        await api.delete(`/social/follow/${userId}`);
      } else {
        await api.post(`/social/follow/${userId}`);
      }
      fetchProfile();
    } catch (error) {
      console.error('Failed to follow/unfollow:', error);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'ELITE': return '#9c27b0';
      case 'PRO': return '#ff9800';
      case 'BASIC': return '#2196f3';
      default: return '#757575';
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="bodyLarge">User not found</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <Surface style={styles.header}>
        <View style={styles.avatarContainer}>
          {profile.avatar ? (
            <Avatar.Image size={100} source={{ uri: profile.avatar }} />
          ) : (
            <Avatar.Text size={100} label={profile.name.substring(0, 2).toUpperCase()} />
          )}
          <Chip 
            mode="flat"
            style={[styles.tierBadge, { backgroundColor: getTierColor(profile.subscriptionTier) }]}
            textStyle={{ color: '#fff', fontWeight: 'bold' }}
          >
            {profile.subscriptionTier}
          </Chip>
        </View>

        <Text variant="headlineMedium" style={styles.name}>
          {profile.name}
        </Text>

        {profile.location && (
          <Text variant="bodyMedium" style={styles.location}>
            📍 {profile.location}
          </Text>
        )}

        {profile.bio && (
          <Text variant="bodyMedium" style={styles.bio}>
            {profile.bio}
          </Text>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text variant="titleLarge" style={styles.statNumber}>
              {profile._count?.catches || 0}
            </Text>
            <Text variant="bodySmall">Catches</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="titleLarge" style={styles.statNumber}>
              {profile._count?.followers || 0}
            </Text>
            <Text variant="bodySmall">Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="titleLarge" style={styles.statNumber}>
              {profile._count?.following || 0}
            </Text>
            <Text variant="bodySmall">Following</Text>
          </View>
        </View>

        {/* Action Buttons */}
        {!isOwnProfile && (
          <View style={styles.actionButtons}>
            <Button 
              mode={profile.isFollowing ? "outlined" : "contained"}
              onPress={handleFollow}
              style={styles.followButton}
            >
              {profile.isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
            <Button 
              mode="outlined"
              onPress={() => {/* Navigate to message */}}
              style={styles.messageButton}
            >
              Message
            </Button>
          </View>
        )}
      </Surface>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <Chip
          selected={activeTab === 'catches'}
          onPress={() => setActiveTab('catches')}
          style={styles.tab}
        >
          Catches
        </Chip>
        <Chip
          selected={activeTab === 'stats'}
          onPress={() => setActiveTab('stats')}
          style={styles.tab}
        >
          Stats
        </Chip>
      </View>

      {/* Content */}
      {activeTab === 'catches' ? (
        <View style={styles.catchesGrid}>
          {catches.map((catchItem) => (
            <Card key={catchItem.id} style={styles.catchCard}>
              {catchItem.photos.length > 0 && (
                <Card.Cover 
                  source={{ uri: catchItem.photos[0] }} 
                  style={styles.catchImage}
                />
              )}
              <Card.Content style={styles.catchInfo}>
                <Text variant="titleSmall" numberOfLines={1}>
                  {catchItem.species}
                </Text>
                {catchItem.weight && (
                  <Text variant="bodySmall">
                    {catchItem.weight} lbs
                  </Text>
                )}
                <View style={styles.catchMeta}>
                  <Text variant="bodySmall">❤️ {catchItem.likes}</Text>
                  <Text variant="bodySmall">💬 {catchItem.comments}</Text>
                </View>
              </Card.Content>
            </Card>
          ))}
          {catches.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text variant="bodyLarge">No catches yet</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.statsContainer}>
          <Card style={styles.statsCard}>
            <Card.Title title="Fishing Statistics" />
            <Card.Content>
              <View style={styles.statRow}>
                <Text variant="bodyLarge">Total Catches</Text>
                <Text variant="titleMedium" style={styles.statValue}>
                  {profile.stats?.totalCatches || 0}
                </Text>
              </View>
              <Divider style={styles.statDivider} />
              
              <View style={styles.statRow}>
                <Text variant="bodyLarge">Species Caught</Text>
                <Text variant="titleMedium" style={styles.statValue}>
                  {profile.stats?.totalSpecies || 0}
                </Text>
              </View>
              <Divider style={styles.statDivider} />

              {profile.stats?.biggestCatch && (
                <>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    🏆 Biggest Catch
                  </Text>
                  <View style={styles.biggestCatch}>
                    <Text variant="bodyLarge">
                      {profile.stats.biggestCatch.species}
                    </Text>
                    <Text variant="bodyMedium">
                      {profile.stats.biggestCatch.weight} lbs • {profile.stats.biggestCatch.length}" long
                    </Text>
                  </View>
                </>
              )}
            </Card.Content>
          </Card>

          <Card style={styles.statsCard}>
            <Card.Title title="Activity" />
            <Card.Content>
              <View style={styles.statRow}>
                <Text variant="bodyLarge">Posts</Text>
                <Text variant="titleMedium" style={styles.statValue}>
                  {profile._count?.posts || 0}
                </Text>
              </View>
              <Divider style={styles.statDivider} />
              
              <View style={styles.statRow}>
                <Text variant="bodyLarge">Followers</Text>
                <Text variant="titleMedium" style={styles.statValue}>
                  {profile._count?.followers || 0}
                </Text>
              </View>
              <Divider style={styles.statDivider} />
              
              <View style={styles.statRow}>
                <Text variant="bodyLarge">Following</Text>
                <Text variant="titleMedium" style={styles.statValue}>
                  {profile._count?.following || 0}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>
      )}
    </ScrollView>
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
  header: {
    padding: 20,
    alignItems: 'center',
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  tierBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  location: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: 8,
  },
  bio: {
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 20,
  },
  followButton: {
    flex: 1,
  },
  messageButton: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: theme.colors.surface,
  },
  tab: {
    flex: 1,
  },
  catchesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  catchCard: {
    width: '48%',
    margin: '1%',
    marginBottom: 12,
  },
  catchImage: {
    height: 150,
  },
  catchInfo: {
    paddingTop: 8,
  },
  catchMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  statsContainer: {
    padding: 12,
  },
  statsCard: {
    marginBottom: 12,
    elevation: 2,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statValue: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statDivider: {
    marginVertical: 8,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  biggestCatch: {
    padding: 12,
    backgroundColor: theme.colors.elevation.level1,
    borderRadius: 8,
  },
  emptyContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 50,
  },
});
