export type CurrentWeather = {
  temperatureCelsius: number;
  weatherCode: number;
};

export async function getCurrentWeather(latitude: number, longitude: number): Promise<CurrentWeather> {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`,
  );
  const data = await response.json();
  return {
    temperatureCelsius: data.current.temperature_2m,
    weatherCode: data.current.weather_code,
  };
}

/** Maps Open-Meteo's WMO weather codes to a representative emoji. */
export function weatherEmoji(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 2) return '🌤️';
  if (code === 3) return '☁️';
  if (code <= 48) return '🌫️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '🌨️';
  if (code <= 82) return '🌦️';
  if (code <= 86) return '🌨️';
  return '⛈️';
}
