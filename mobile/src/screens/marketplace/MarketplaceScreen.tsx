import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { Text, Card, ActivityIndicator, Searchbar, Chip, FAB, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useLocation } from '../../context/LocationContext';
import api from '../../services/api';
import { theme } from '../../theme';

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  type: 'SALE' | 'RENT' | 'TRADE';
  category: string;
  condition: string;
  images: string[];
  seller: {
    id: string;
    name: string;
    avatar?: string;
  };
  distance?: number;
  createdAt: string;
}

export default function MarketplaceScreen() {
  const navigation = useNavigation();
  const { location } = useLocation();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      const params: any = {};
      if (location) {
        params.lat = location.latitude;
        params.lon = location.longitude;
        params.radius = 50; // 50 miles
      }
      if (selectedType) {
        params.type = selectedType;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await api.get('/marketplace', { params });
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch marketplace items:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedType, location]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  const handleSearch = () => {
    setLoading(true);
    fetchItems();
  };

  const renderItem = ({ item }: { item: MarketplaceItem }) => (
    <TouchableOpacity 
      onPress={() => {
        // Navigate to item detail screen
        // navigation.navigate('MarketplaceDetail', { itemId: item.id });
      }}
    >
      <Card style={styles.card}>
        {item.images && item.images.length > 0 && (
          <Card.Cover 
            source={{ uri: item.images[0] }} 
            style={styles.cardImage}
          />
        )}
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleMedium" numberOfLines={1} style={styles.title}>
              {item.title}
            </Text>
            <Chip 
              mode="flat" 
              compact
              style={[
                styles.typeChip,
                item.type === 'SALE' && styles.saleChip,
                item.type === 'RENT' && styles.rentChip,
                item.type === 'TRADE' && styles.tradeChip,
              ]}
            >
              {item.type}
            </Chip>
          </View>

          <Text variant="bodyMedium" style={styles.price}>
            {item.type === 'TRADE' ? 'For Trade' : `$${item.price.toFixed(2)}${item.type === 'RENT' ? '/day' : ''}`}
          </Text>

          <Text variant="bodySmall" numberOfLines={2} style={styles.description}>
            {item.description}
          </Text>

          <Divider style={styles.divider} />

          <View style={styles.footer}>
            <View style={styles.sellerInfo}>
              <Text variant="bodySmall">
                {item.seller.name}
              </Text>
              <Text variant="bodySmall" style={styles.condition}>
                Condition: {item.condition}
              </Text>
            </View>
            {item.distance && (
              <Text variant="bodySmall" style={styles.distance}>
                📍 {item.distance.toFixed(1)} mi
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search gear..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchBar}
        />
      </View>

      <View style={styles.filterContainer}>
        <Chip
          selected={selectedType === null}
          onPress={() => setSelectedType(null)}
          style={styles.filterChip}
        >
          All
        </Chip>
        <Chip
          selected={selectedType === 'SALE'}
          onPress={() => setSelectedType('SALE')}
          style={styles.filterChip}
        >
          For Sale
        </Chip>
        <Chip
          selected={selectedType === 'RENT'}
          onPress={() => setSelectedType('RENT')}
          style={styles.filterChip}
        >
          For Rent
        </Chip>
        <Chip
          selected={selectedType === 'TRADE'}
          onPress={() => setSelectedType('TRADE')}
          style={styles.filterChip}
        >
          For Trade
        </Chip>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge">No items found</Text>
            <Text variant="bodySmall" style={styles.emptySubtext}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        label="List Item"
        style={styles.fab}
        onPress={() => {
          // Navigate to create listing screen
          // navigation.navigate('CreateListing');
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
  searchContainer: {
    padding: 12,
    backgroundColor: theme.colors.surface,
    elevation: 2,
  },
  searchBar: {
    elevation: 0,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  listContent: {
    padding: 12,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardImage: {
    height: 200,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
  },
  typeChip: {
    marginLeft: 8,
  },
  saleChip: {
    backgroundColor: '#4caf50',
  },
  rentChip: {
    backgroundColor: '#2196f3',
  },
  tradeChip: {
    backgroundColor: '#ff9800',
  },
  price: {
    marginTop: 4,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  description: {
    marginTop: 8,
    color: theme.colors.onSurfaceVariant,
  },
  divider: {
    marginVertical: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sellerInfo: {
    flex: 1,
  },
  condition: {
    marginTop: 4,
    color: theme.colors.onSurfaceVariant,
  },
  distance: {
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
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: theme.colors.primary,
  },
});
