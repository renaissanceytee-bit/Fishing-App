import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator, IconButton, Divider, Surface } from 'react-native-paper';
import { useLocation } from '../../context/LocationContext';
import api from '../../services/api';
import { theme } from '../../theme';

interface WeatherData {
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    weather: Array<{ description: string; icon: string }>;
  };
  daily?: Array<{
    dt: number;
    temp: { min: number; max: number };
    weather: Array<{ description: string; icon: string }>;
    pop: number;
  }>;
}

interface SolunarData {
  major_periods: Array<{ start: string; end: string }>;
  minor_periods: Array<{ start: string; end: string }>;
  moon_phase: string;
  rating: string;
}

export default function WeatherScreen() {
  const { location } = useLocation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [solunar, setSolunar] = useState<SolunarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWeatherData = async () => {
    try {
      if (!location) return;
      
      const [weatherRes, solunarRes] = await Promise.all([
        api.get(`/weather/current?lat=${location.coords.latitude}&lon=${location.coords.longitude}`),
        api.get(`/weather/solunar?lat=${location.coords.latitude}&lon=${location.coords.longitude}`)
      ]);
      
      setWeather(weatherRes.data);
      setSolunar(solunarRes.data);
    } catch (error) {
      console.error('Failed to fetch weather:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, [location]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWeatherData();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!location || !weather) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="bodyLarge">Enable location to see weather data</Text>
      </View>
    );
  }

  const getWeatherIcon = (description: string) => {
    if (description.includes('rain')) return 'weather-rainy';
    if (description.includes('cloud')) return 'weather-cloudy';
    if (description.includes('sun') || description.includes('clear')) return 'weather-sunny';
    if (description.includes('storm')) return 'weather-lightning';
    return 'weather-partly-cloudy';
  };

  const formatTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Current Weather */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.currentWeather}>
            <IconButton
              icon={getWeatherIcon(weather.current.weather[0].description)}
              size={80}
              iconColor={theme.colors.primary}
            />
            <View style={styles.tempContainer}>
              <Text variant="displayLarge" style={styles.temp}>
                {Math.round(weather.current.temp)}°
              </Text>
              <Text variant="bodyLarge" style={styles.description}>
                {weather.current.weather[0].description}
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <IconButton icon="thermometer" size={24} />
              <Text variant="bodySmall">Feels Like</Text>
              <Text variant="bodyLarge">{Math.round(weather.current.feels_like)}°</Text>
            </View>
            <View style={styles.detailItem}>
              <IconButton icon="water-percent" size={24} />
              <Text variant="bodySmall">Humidity</Text>
              <Text variant="bodyLarge">{weather.current.humidity}%</Text>
            </View>
            <View style={styles.detailItem}>
              <IconButton icon="weather-windy" size={24} />
              <Text variant="bodySmall">Wind</Text>
              <Text variant="bodyLarge">{Math.round(weather.current.wind_speed)} mph</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Solunar Data */}
      {solunar && (
        <Card style={styles.card}>
          <Card.Title 
            title="Best Fishing Times" 
            left={(props) => <IconButton {...props} icon="fish" />}
          />
          <Card.Content>
            <Surface style={styles.ratingBadge}>
              <Text variant="titleMedium">Fishing Rating: {solunar.rating}</Text>
            </Surface>

            <Text variant="titleSmall" style={styles.sectionTitle}>
              🌙 Moon Phase: {solunar.moon_phase}
            </Text>

            <Text variant="titleSmall" style={styles.sectionTitle}>Major Periods</Text>
            {solunar.major_periods.map((period, index) => (
              <Surface key={index} style={styles.periodCard}>
                <Text>{formatTime(period.start)} - {formatTime(period.end)}</Text>
              </Surface>
            ))}

            <Text variant="titleSmall" style={styles.sectionTitle}>Minor Periods</Text>
            {solunar.minor_periods.map((period, index) => (
              <Surface key={index} style={styles.periodCard}>
                <Text>{formatTime(period.start)} - {formatTime(period.end)}</Text>
              </Surface>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Forecast */}
      {weather.daily && (
        <Card style={styles.card}>
          <Card.Title 
            title="7-Day Forecast" 
            left={(props) => <IconButton {...props} icon="calendar-week" />}
          />
          <Card.Content>
            {weather.daily.slice(0, 7).map((day, index) => (
              <View key={index} style={styles.forecastItem}>
                <Text style={styles.forecastDay}>
                  {new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
                <IconButton 
                  icon={getWeatherIcon(day.weather[0].description)}
                  size={24}
                />
                <Text style={styles.forecastTemp}>
                  {Math.round(day.temp.max)}° / {Math.round(day.temp.min)}°
                </Text>
                <Text style={styles.forecastRain}>💧 {Math.round(day.pop * 100)}%</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
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
  card: {
    margin: 12,
    elevation: 2,
  },
  currentWeather: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  tempContainer: {
    marginLeft: 20,
  },
  temp: {
    fontWeight: 'bold',
  },
  description: {
    textTransform: 'capitalize',
  },
  divider: {
    marginVertical: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailItem: {
    alignItems: 'center',
  },
  ratingBadge: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: theme.colors.primaryContainer,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  periodCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: theme.colors.elevation.level1,
  },
  forecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.elevation.level2,
  },
  forecastDay: {
    width: 50,
    fontWeight: 'bold',
  },
  forecastTemp: {
    width: 100,
    textAlign: 'center',
  },
  forecastRain: {
    width: 50,
    textAlign: 'right',
  },
});
