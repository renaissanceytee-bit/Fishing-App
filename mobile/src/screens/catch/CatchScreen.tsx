import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Switch,
  Chip,
  HelperText,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useLocation } from '../../context/LocationContext';
import api from '../../services/api';

export default function CatchScreen({ navigation }: any) {
  const { location } = useLocation();
  const [photos, setPhotos] = useState<string[]>([]);
  const [species, setSpecies] = useState('');
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [locationName, setLocationName] = useState('');
  const [waterBody, setWaterBody] = useState('');
  const [bait, setBait] = useState('');
  const [lure, setLure] = useState('');
  const [description, setDescription] = useState('');
  const [isReleased, setIsReleased] = useState(false);
  const [visibility, setVisibility] = useState('PUBLIC');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotos([...photos, ...result.assets.map(asset => asset.uri)]);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const handleSubmit = async () => {
    if (!location) {
      alert('Location required');
      return;
    }

    if (!species || !locationName) {
      alert('Species and location are required');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      
      photos.forEach((photo, index) => {
        const uri = photo;
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('media', {
          uri,
          name: filename,
          type,
        } as any);
      });

      formData.append('customSpecies', species);
      formData.append('weight', weight);
      formData.append('length', length);
      formData.append('latitude', location.coords.latitude.toString());
      formData.append('longitude', location.coords.longitude.toString());
      formData.append('locationName', locationName);
      formData.append('waterBody', waterBody);
      formData.append('bait', bait);
      formData.append('lure', lure);
      formData.append('description', description);
      formData.append('isReleased', isReleased.toString());
      formData.append('visibility', visibility);

      await api.post('/catches', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigation.navigate('Home');
    } catch (error) {
      console.error('Failed to create catch:', error);
      alert('Failed to create catch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Log Your Catch
      </Text>

      {/* Photos */}
      <View style={styles.section}>
        <Text variant="titleMedium">Photos</Text>
        <View style={styles.photoContainer}>
          {photos.map((photo, index) => (
            <Image
              key={index}
              source={{ uri: photo }}
              style={styles.photo}
            />
          ))}
        </View>
        <View style={styles.photoButtons}>
          <Button
            icon="camera"
            mode="outlined"
            onPress={takePhoto}
            style={styles.photoButton}
          >
            Camera
          </Button>
          <Button
            icon="image"
            mode="outlined"
            onPress={pickImage}
            style={styles.photoButton}
          >
            Gallery
          </Button>
        </View>
      </View>

      {/* Species */}
      <TextInput
        label="Species *"
        value={species}
        onChangeText={setSpecies}
        mode="outlined"
        style={styles.input}
      />

      {/* Measurements */}
      <View style={styles.row}>
        <TextInput
          label="Weight (kg)"
          value={weight}
          onChangeText={setWeight}
          mode="outlined"
          keyboardType="numeric"
          style={[styles.input, styles.halfInput]}
        />
        <TextInput
          label="Length (cm)"
          value={length}
          onChangeText={setLength}
          mode="outlined"
          keyboardType="numeric"
          style={[styles.input, styles.halfInput]}
        />
      </View>

      {/* Location */}
      <TextInput
        label="Location Name *"
        value={locationName}
        onChangeText={setLocationName}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Water Body"
        value={waterBody}
        onChangeText={setWaterBody}
        mode="outlined"
        style={styles.input}
      />

      {/* Gear */}
      <TextInput
        label="Bait"
        value={bait}
        onChangeText={setBait}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Lure"
        value={lure}
        onChangeText={setLure}
        mode="outlined"
        style={styles.input}
      />

      {/* Description */}
      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        mode="outlined"
        multiline
        numberOfLines={4}
        style={styles.input}
      />

      {/* Released Switch */}
      <View style={styles.switchRow}>
        <Text variant="bodyLarge">Catch & Release</Text>
        <Switch value={isReleased} onValueChange={setIsReleased} />
      </View>
      <HelperText type="info">
        Earn conservation points for releasing your catch! 🌊
      </HelperText>

      {/* Visibility */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Visibility
        </Text>
        <View style={styles.chipContainer}>
          <Chip
            selected={visibility === 'PUBLIC'}
            onPress={() => setVisibility('PUBLIC')}
            style={styles.chip}
          >
            Public
          </Chip>
          <Chip
            selected={visibility === 'FRIENDS'}
            onPress={() => setVisibility('FRIENDS')}
            style={styles.chip}
          >
            Friends
          </Chip>
          <Chip
            selected={visibility === 'PRIVATE'}
            onPress={() => setVisibility('PRIVATE')}
            style={styles.chip}
          >
            Private
          </Chip>
        </View>
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        style={styles.submitButton}
      >
        Log Catch
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  photoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  photoButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  photoButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  chipContainer: {
    flexDirection: 'row',
  },
  chip: {
    marginRight: 8,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 32,
    paddingVertical: 8,
  },
});
