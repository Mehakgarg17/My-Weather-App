// src/components/Weather.js
import React, { useState, useEffect, useCallback } from "react";

const Weather = () => {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState("");
  const [backgroundImage, setBackgroundImage] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const apiKey = "9de243494c0b295cca9337e1e96b00e2"; // Replace with your OpenWeatherMap API key

  // Function to fetch weather data based on city name or coordinates
  const fetchWeather = useCallback(async (cityOrLat, lon = null) => {
    try {
      setLoading(true);
      let url = "";
      if (lon === null) {
        // Fetch by city name
        url = `https://api.openweathermap.org/data/2.5/weather?q=${cityOrLat}&appid=${apiKey}&units=metric`;
      } else {
        // Fetch by coordinates
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${cityOrLat}&lon=${lon}&appid=${apiKey}&units=metric`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Error fetching weather data.");
      }

      const data = await response.json();
      setWeatherData(data);
      setBackgroundImageBasedOnWeather(data.weather[0].main);
    } catch (error) {
      setError(error.message);
      setWeatherData(null);
      setBackgroundImage("");
    }
    finally {
      setLoading(false);
    }
  }, [apiKey]);

  const setBackgroundImageBasedOnWeather = (weatherCondition) => {
    switch (weatherCondition.toLowerCase()) {
      case "clear":
        setBackgroundImage("url('/images/clear.avif')");
        break;
      case "clouds":
        setBackgroundImage("url('/images/clouds.avif')");
        break;
      case "rain":
        setBackgroundImage("url('/images/rain.avif')");
        break;
      default:
        setBackgroundImage("url('/images/thunderstorm.avif')");
        break;
    }
  };

  useEffect(() => {
    // Get current location weather on load
    const getCurrentLocationWeather = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            fetchWeather(latitude, longitude);
          },
          (error) => {
            setError("Unable to retrieve your location. Please try again.");
          }
        );
      } else {
        setError("Geolocation is not supported by this browser.");
      }
    };

    getCurrentLocationWeather();

    // Load favorites from local storage
    const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(storedFavorites);
  }, [fetchWeather]);

  const getWeatherByCity = (e) => {
    e.preventDefault();
    setError("");
    if (city.trim() === "") {
      setError("Please enter a valid city name.");
      return;
    }
    fetchWeather(city.trim()); // Fetch weather by city name, ensuring no extra spaces
  };

  // Function to add a city to favorites
  const addToFavorites = () => {
    if (weatherData) {
      const cityName = weatherData.name;
      if (!favorites.includes(cityName)) {
        const updatedFavorites = [...favorites, cityName];
        setFavorites(updatedFavorites);
        localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
        setError(`${cityName} added to favorites!`); // Feedback message
      } else {
        setError("City is already in favorites.");
      }
    } else {
      setError("No weather data available to add to favorites.");
    }
  };

  return (
    <div className="weather-container">
      <h1 className="weather-title">Weather App</h1>
      <form className="weather-form" onSubmit={getWeatherByCity}>
        <input
          type="text"
          placeholder="Enter city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="weather-input"
        />
        <button type="submit" className="weather-button">Get Weather</button>
      </form>

      {error && <p className="error-message">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && weatherData && (
        <div className="weather-info" style={{ backgroundImage }}>
          <h3>Weather in {weatherData.name}</h3>
          <p>Temperature: {weatherData.main.temp}°C</p>
          <p>Condition: {weatherData.weather[0].description}</p>
          <p>Humidity: {weatherData.main.humidity}%</p>
          <button onClick={addToFavorites} className="favorite-button">Add to Favorites</button>
        </div>
      )}

      {/* Favorites List */}
      <div className="favorites-container">
        <h2>Favorite Cities</h2>
        <ul>
          {favorites.map((favCity, index) => (
            <li key={index}>{favCity}</li>
          ))}
        </ul>
      </div>

      {/* <div className="info-box">
        <p>Additional information or tips about the weather can go here!</p>
      </div> */}
    </div>
  );
};

export default Weather;
