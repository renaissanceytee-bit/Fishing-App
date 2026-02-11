import express from 'express';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, requireSubscription } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Identify species from image (Pro feature)
router.post('/identify-species', authenticate, requireSubscription(['PRO', 'ELITE']), async (req: AuthRequest, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL required' });
    }

    // Using OpenAI Vision API for species identification
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Identify the fish species in this image. Provide the common name, scientific name, and a brief description. Format the response as JSON with fields: commonName, scientificName, description, confidence (0-1).'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const result = JSON.parse(response.data.choices[0].message.content);

    // Try to find matching species in database
    const species = await prisma.species.findFirst({
      where: {
        OR: [
          { name: { contains: result.commonName, mode: 'insensitive' } },
          { scientificName: { contains: result.scientificName, mode: 'insensitive' } }
        ]
      }
    });

    res.json({
      ...result,
      speciesId: species?.id,
      speciesData: species
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to identify species' });
  }
});

// AI fishing assistant chatbot
router.post('/assistant', authenticate, async (req: AuthRequest, res) => {
  try {
    const { message, context } = req.body;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful fishing assistant AI. Provide advice on fishing techniques, gear, locations, weather conditions, species identification, and conservation. Keep responses concise and practical.'
          },
          ...(context || []),
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      response: response.data.choices[0].message.content,
      conversationId: response.data.id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'AI assistant unavailable' });
  }
});

// Get fishing recommendations based on conditions
router.post('/recommendations', authenticate, async (req: AuthRequest, res) => {
  try {
    const { latitude, longitude, date } = req.body;

    // Get weather data
    const weather = await getWeather(latitude, longitude);
    
    // Get nearby catches
    const recentCatches = await prisma.catch.findMany({
      where: {
        latitude: { gte: latitude - 0.1, lte: latitude + 0.1 },
        longitude: { gte: longitude - 0.1, lte: longitude + 0.1 },
        timestamp: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      },
      include: { species: true },
      take: 20
    });

    // Use AI to generate recommendations
    const prompt = `Based on the following conditions, provide fishing recommendations:
    Weather: ${weather.description}, ${weather.temperature}°C, wind ${weather.windSpeed} m/s
    Recent catches in area: ${recentCatches.map(c => c.species?.name || c.customSpecies).join(', ')}
    Date: ${date || new Date().toISOString()}
    
    Provide recommendations for:
    1. Best time to fish
    2. Recommended techniques
    3. Suggested baits/lures
    4. Target species
    
    Format as JSON.`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(JSON.parse(response.data.choices[0].message.content));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

async function getWeather(lat: number, lon: number) {
  const apiKey = process.env.WEATHER_API_KEY;
  const response = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
  );

  return {
    temperature: response.data.main.temp,
    humidity: response.data.main.humidity,
    pressure: response.data.main.pressure,
    windSpeed: response.data.wind.speed,
    description: response.data.weather[0].description
  };
}

export default router;
