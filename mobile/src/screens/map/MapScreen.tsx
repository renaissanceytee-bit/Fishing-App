import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { FAB, Portal, Modal, Text, Button } from 'react-native-paper';
import { useLocation } from '../../context/LocationContext';
import api from '../../services/api';

export default function MapScreen({ navigation }: any) {
  const { location, refreshLocation } = useLocation();
  const [catches, setCatches] = useState([]);
  const [selectedCatch, setSelectedCatch] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (location) {
      loadNearbyCatches();
    }
  }, [location]);

  const loadNearbyCatches = async () => {
    if (!location) return;

    try {
      const response = await api.get('/catches/nearby', {
        params: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          radius: 50, // 50km
        },
      });
      setCatches(response.data);
    } catch (error) {
      console.error('Failed to load nearby catches:', error);
    }
  };

  const handleMarkerPress = (catchItem: any) => {
    setSelectedCatch(catchItem);
    setModalVisible(true);
  };

  if (!location) {
    return (
      <View style={styles.container}>
        <Text>Loading location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        {catches.map((catchItem: any) => (
          <Marker
            key={catchItem.id}
            coordinate={{
              latitude: catchItem.latitude,
              longitude: catchItem.longitude,
            }}
            title={catchItem.species?.name || catchItem.customSpecies}
            description={catchItem.locationName}
            onPress={() => handleMarkerPress(catchItem)}
          >
            <View style={styles.markerContainer}>
              <Text style={styles.markerText}>🐟</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      <FAB
        style={styles.fab}
        icon="refresh"
        onPress={refreshLocation}
        small
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          {selectedCatch && (
            <View>
              <Text variant="titleLarge">
                {selectedCatch.species?.name || selectedCatch.customSpecies}
              </Text>
              <Text variant="bodyMedium" style={styles.modalText}>
                Caught by: {selectedCatch.user.username}
              </Text>
              <Text variant="bodyMedium">
                Location: {selectedCatch.locationName}
              </Text>
              {selectedCatch.weight && (
                <Text variant="bodyMedium">
                  {selectedCatch.weight} kg • {selectedCatch.length} cm
                </Text>
              )}
              <Button
                mode="contained"
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('CatchDetail', { id: selectedCatch.id });
                }}
                style={styles.modalButton}
              >
                View Details
              </Button>
            </View>
          )}
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    borderWidth: 2,
    borderColor: '#1e90ff',
  },
  markerText: {
    fontSize: 24,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#fff',
  },
  modal: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalText: {
    marginTop: 8,
  },
  modalButton: {
    marginTop: 16,
  },
});
