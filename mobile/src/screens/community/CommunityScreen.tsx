import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Avatar,
  Button,
  Searchbar,
  Chip,
  SegmentedButtons,
} from 'react-native-paper';
import api from '../../services/api';

export default function CommunityScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPosts();
    loadClubs();
    loadEvents();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await api.get('/social/feed');
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
  };

  const loadClubs = async () => {
    try {
      const response = await api.get('/community/clubs');
      setClubs(response.data);
    } catch (error) {
      console.error('Failed to load clubs:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const response = await api.get('/community/events', {
        params: { upcoming: true },
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const joinClub = async (clubId: string) => {
    try {
      await api.post(`/community/clubs/${clubId}/join`);
      loadClubs();
    } catch (error) {
      console.error('Failed to join club:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Community</Text>
        <Searchbar
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchbar}
        />

        <SegmentedButtons
          value={activeTab}
          onValueChange={setActiveTab}
          buttons={[
            { value: 'posts', label: 'Feed' },
            { value: 'clubs', label: 'Clubs' },
            { value: 'events', label: 'Events' },
          ]}
        />
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'posts' && (
          <View>
            {posts.map((post: any) => (
              <Card key={post.id} style={styles.card}>
                <Card.Title
                  title={post.user.username}
                  subtitle={new Date(post.createdAt).toLocaleDateString()}
                  left={(props) => (
                    <Avatar.Image
                      {...props}
                      source={{ uri: post.user.avatar || 'https://via.placeholder.com/150' }}
                    />
                  )}
                />
                <Card.Content>
                  <Text variant="bodyLarge">{post.content}</Text>
                  {post.type !== 'post' && (
                    <Chip style={styles.typeChip}>{post.type}</Chip>
                  )}
                </Card.Content>
                {post.media.length > 0 && (
                  <Card.Cover source={{ uri: post.media[0] }} />
                )}
                <Card.Actions>
                  <Button icon="heart">
                    {post._count?.likes || 0}
                  </Button>
                  <Button icon="comment">
                    {post._count?.comments || 0}
                  </Button>
                </Card.Actions>
              </Card>
            ))}
          </View>
        )}

        {activeTab === 'clubs' && (
          <View>
            {clubs.map((club: any) => (
              <Card key={club.id} style={styles.card}>
                <Card.Title
                  title={club.name}
                  subtitle={`${club._count?.members || 0} members`}
                />
                <Card.Content>
                  <Text variant="bodyMedium">{club.description}</Text>
                  {club.location && (
                    <Text variant="bodySmall" style={styles.clubLocation}>
                      📍 {club.location}
                    </Text>
                  )}
                </Card.Content>
                <Card.Actions>
                  <Button
                    mode="contained"
                    onPress={() => joinClub(club.id)}
                  >
                    Join Club
                  </Button>
                </Card.Actions>
              </Card>
            ))}
          </View>
        )}

        {activeTab === 'events' && (
          <View>
            {events.map((event: any) => (
              <Card key={event.id} style={styles.card}>
                <Card.Title
                  title={event.title}
                  subtitle={new Date(event.startDate).toLocaleDateString()}
                />
                <Card.Content>
                  <Chip style={styles.eventType}>{event.eventType}</Chip>
                  <Text variant="bodyMedium" style={styles.eventDescription}>
                    {event.description}
                  </Text>
                  {event.location && (
                    <Text variant="bodySmall">📍 {event.location}</Text>
                  )}
                </Card.Content>
                <Card.Actions>
                  <Button mode="outlined">Learn More</Button>
                </Card.Actions>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchbar: {
    marginVertical: 12,
  },
  content: {
    flex: 1,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  typeChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  clubLocation: {
    marginTop: 8,
    opacity: 0.7,
  },
  eventType: {
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  eventDescription: {
    marginBottom: 8,
  },
});
