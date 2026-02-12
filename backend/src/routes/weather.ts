import express from 'express';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, requireSubscription } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get weather for location
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Location required' });
    }

    const lat = parseFloat(latitude as string);
    const lon = parseFloat(longitude as string);

    // Check cache first
    const cached = await prisma.weatherCache.findFirst({
      where: {
        latitude: lat,
        longitude: lon,
        expiresAt: { gt: new Date() }
      }
    });

    if (cached) {
      return res.json(cached.data);
    }

    // Fetch from weather API
    const weatherData = await fetchWeatherData(lat, lon);

    // Cache for 1 hour
    await prisma.weatherCache.create({
      data: {
        latitude: lat,
        longitude: lon,
        data: weatherData,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000)
      }
    });

    res.json(weatherData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather' });
  }
});

// Get forecast (Pro feature)
router.get('/forecast', authenticate, requireSubscription(['PRO', 'ELITE']), async (req: AuthRequest, res) => {
  try {
    const { latitude, longitude, days = '7' } = req.query;

    const forecast = await fetchForecast(
      parseFloat(latitude as string),
      parseFloat(longitude as string),
      parseInt(days as string)
    );

    res.json(forecast);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch forecast' });
  }
});

// Get solunar data (bite times)
router.get('/solunar', authenticate, async (req: AuthRequest, res) => {
  try {
    const { latitude, longitude, date } = req.query;

    const solunarData = calculateSolunarTimes(
      parseFloat(latitude as string),
      parseFloat(longitude as string),
      date ? new Date(date as string) : new Date()
    );

    res.json(solunarData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate solunar data' });
  }
});

async function fetchWeatherData(lat: number, lon: number) {
  // Using OpenWeather API as example
  const apiKey = process.env.WEATHER_API_KEY;
  const response = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
  );

  return {
    temperature: response.data.main.temp,
    feelsLike: response.data.main.feels_like,
    humidity: response.data.main.humidity,
    pressure: response.data.main.pressure,
    windSpeed: response.data.wind.speed,
    windDirection: response.data.wind.deg,
    clouds: response.data.clouds.all,
    description: response.data.weather[0].description,
    icon: response.data.weather[0].icon,
    timestamp: new Date()
  };
}

async function fetchForecast(lat: number, lon: number, days: number) {
  const apiKey = process.env.WEATHER_API_KEY;
  const response = await axios.get(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&cnt=${days * 8}`
  );

  return response.data.list.map((item: any) => ({
    timestamp: new Date(item.dt * 1000),
    temperature: item.main.temp,
    humidity: item.main.humidity,
    pressure: item.main.pressure,
    windSpeed: item.wind.speed,
    description: item.weather[0].description,
    icon: item.weather[0].icon
  }));
}

function calculateSolunarTimes(lat: number, lon: number, date: Date) {
  // Simplified solunar calculation
  // In production, use a proper library like suncalc
  const moonPhase = getMoonPhase(date);
  
  return {
    date: date,
    moonPhase: moonPhase.phase,
    moonIllumination: moonPhase.illumination,
    majorPeriods: [
      {
        start: new Date(date.setHours(6, 0, 0)),
        end: new Date(date.setHours(8, 0, 0)),
        rating: 'excellent'
      },
      {
        start: new Date(date.setHours(18, 0, 0)),
        end: new Date(date.setHours(20, 0, 0)),
        rating: 'excellent'
      }
    ],
    minorPeriods: [
      {
        start: new Date(date.setHours(12, 0, 0)),
        end: new Date(date.setHours(13, 0, 0)),
        rating: 'good'
      }
    ]
  };
}

function getMoonPhase(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  let c = 0;
  let e = 0;
  let jd = 0;
  let b = 0;

  if (month < 3) {
    c = year - 1;
    e = month + 12;
  } else {
    c = year;
    e = month;
  }

  jd = Math.floor(365.25 * (c + 4716)) + Math.floor(30.6001 * (e + 1)) + day - 1524.5;
  b = (jd - 2451550.1) / 29.530588853;
  b = b - Math.floor(b);

  const phase = b < 0.5 ? 'waxing' : 'waning';
  const illumination = Math.abs(b - 0.5) * 2;

  return { phase, illumination };
}

export default router;
