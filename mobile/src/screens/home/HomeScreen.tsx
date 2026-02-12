import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Text,
  Card,
  Avatar,
  IconButton,
  Chip,
  FAB,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import api from '../../services/api';

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const { location } = useLocation();
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    loadFeed();
    if (location) {
      loadWeather();
    }
  }, [location]);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const response = await api.get('/catches/feed');
      setCatches(response.data);
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWeather = async () => {
    if (!location) return;
    
    try {
      const response = await api.get('/weather', {
        params: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      });
      setWeather(response.data);
    } catch (error) {
      console.error('Failed to load weather:', error);
    }
  };

  const handleLike = async (catchId: string) => {
    try {
      await api.post('/social/like', { catchId });
      loadFeed();
    } catch (error) {
      console.error('Failed to like:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Welcome, {user?.username}!</Text>
        {weather && (
          <TouchableOpacity onPress={() => navigation.navigate('Weather')}>
            <Chip icon="weather-partly-cloudy" style={styles.weatherChip}>
              {Math.round(weather.temperature)}°C
            </Chip>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadFeed} />
        }
      >
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Map')}
          >
            <IconButton icon="map-marker" size={32} />
            <Text variant="labelMedium">Nearby</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Weather')}
          >
            <IconButton icon="weather-cloudy" size={32} />
            <Text variant="labelMedium">Weather</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Tournaments')}
          >
            <IconButton icon="trophy" size={32} />
            <Text variant="labelMedium">Tournaments</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Marketplace')}
          >
            <IconButton icon="shopping" size={32} />
            <Text variant="labelMedium">Marketplace</Text>
          </TouchableOpacity>
        </View>

        {/* Feed */}
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Recent Catches
        </Text>

        {catches.map((catchItem: any) => (
          <Card
            key={catchItem.id}
            style={styles.catchCard}
            onPress={() => navigation.navigate('CatchDetail', { id: catchItem.id })}
          >
            <Card.Title
              title={catchItem.user.username}
              subtitle={new Date(catchItem.timestamp).toLocaleDateString()}
              left={(props) => (
                <Avatar.Image
                  {...props}
                  source={{ uri: catchItem.user.avatar || 'https://via.placeholder.com/150' }}
                />
              )}
            />
            
            {catchItem.photos[0] && (
              <Card.Cover source={{ uri: catchItem.photos[0] }} />
            )}
            
            <Card.Content style={styles.catchContent}>
              <Text variant="titleMedium">
                {catchItem.species?.name || catchItem.customSpecies}
              </Text>
              {catchItem.weight && (
                <Text variant="bodyMedium">
                  {catchItem.weight} kg • {catchItem.length} cm
                </Text>
              )}
              <Text variant="bodySmall" style={styles.location}>
                📍 {catchItem.locationName}
              </Text>
              {catchItem.description && (
                <Text variant="bodyMedium" style={styles.description}>
                  {catchItem.description}
                </Text>
              )}
            </Card.Content>
            
            <Card.Actions>
              <IconButton
                icon="heart"
                onPress={() => handleLike(catchItem.id)}
              />
              <Text>{catchItem._count.likes}</Text>
              <IconButton
                icon="comment"
                onPress={() => navigation.navigate('CatchDetail', { id: catchItem.id })}
              />
              <Text>{catchItem._count.comments}</Text>
            </Card.Actions>
          </Card>
        ))}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="camera"
        onPress={() => navigation.navigate('Catch')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  weatherChip: {
    marginLeft: 8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  actionCard: {
    alignItems: 'center',
  },
  sectionTitle: {
    padding: 16,
    paddingBottom: 8,
  },
  catchCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  catchContent: {
    paddingTop: 12,
  },
  location: {
    marginTop: 4,
    opacity: 0.7,
  },
  description: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#1e90ff',
  },
});
