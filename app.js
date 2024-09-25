const defaultCity = "Gdańsk";

// Ustaw domyślną wartość w polu wejściowym
document.getElementById("cityInput").value = defaultCity;

// Funkcja do pobierania ostatnich miast z LocalStorage
function getRecentCities() {
  const cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  return cities;
}

// Funkcja do zapisywania ostatnich miast w LocalStorage
function saveRecentCity(city) {
  let cities = getRecentCities();
  cities = cities.filter(c => c !== city);
  cities.unshift(city);
  if (cities.length > 3) cities.pop();
  localStorage.setItem("recentCities", JSON.stringify(cities));
  displayRecentCities();
}

// Funkcja do wyświetlania ostatnio wyszukiwanych miast
function displayRecentCities() {
  const recentCities = getRecentCities();
  const recentCitiesList = document.getElementById("recentCities");
  recentCitiesList.innerHTML = "";
  recentCities.forEach(city => {
    const cityElement = document.createElement("li");
    cityElement.textContent = city;
    cityElement.addEventListener("click", function () {
      document.getElementById("cityInput").value = city;
      getWeather();
    });
    recentCitiesList.appendChild(cityElement);
  });
}

// Funkcja do pobierania pogody
function getWeather() {
  const city = document.getElementById("cityInput").value;
  const apiKey = "f00a6e2109ede344955797b1535efacb";

  // Fetch current weather
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
    .then((response) => response.json())
    .then((data) => {
      const temperature = Math.round(data.main.temp);
      const weatherDescription = data.weather[0].description;
      const weatherIcon = data.weather[0].icon; // Pobieramy kod ikony
      const humidity = data.main.humidity;
      const windSpeed = (data.wind.speed * 3.6).toFixed(0);
      const cloudiness = data.clouds.all;

      const date = new Date(data.dt * 1000);
      const dateString = date.toLocaleDateString();
      const timeString = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      document.getElementById("temperature").innerHTML = `${temperature}°`;
      document.getElementById("city").innerHTML = city;
      document.getElementById("dateTime").innerHTML = `${timeString} - ${dateString}`;
      document.getElementById("description").innerHTML = `<img src="http://openweathermap.org/img/wn/${weatherIcon}.png" alt="${weatherDescription}" /><br>${weatherDescription}`;
      document.getElementById("humidity").innerHTML = `Humidity: ${humidity}%`;
      document.getElementById("windSpeed").innerHTML = `Wind: ${windSpeed} km/h`;
      document.getElementById("cloudiness").innerHTML = `Cloudy: ${cloudiness}%`;

      saveRecentCity(city);
      getFiveDayForecast(city); // Pobieranie prognozy na 5 dni
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}

// Funkcja do pobierania prognozy na 5 dni
function getFiveDayForecast(city) {
  const apiKey = "f00a6e2109ede344955797b1535efacb";

  // Fetch 5-day forecast
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`)
    .then((response) => response.json())
    .then((data) => {
      const forecastContainer = document.getElementById("forecastContainer");
      forecastContainer.innerHTML = ""; // Czyścimy poprzednią prognozę

      // Filtrujemy prognozy na najbliższe 5 dni w południe
      const filteredForecast = data.list.filter((forecast) => forecast.dt_txt.includes("12:00:00"));

      filteredForecast.slice(0, 5).forEach((day) => {
        const date = new Date(day.dt * 1000);
        const dayOfWeek = date.toLocaleDateString("en-GB", { weekday: 'short', day: 'numeric', month: 'short' });
        const temp = Math.round(day.main.temp);
        const icon = day.weather[0].icon;

        const forecastElement = document.createElement("div");
        forecastElement.classList.add("forecast-day");
        forecastElement.innerHTML = `
          <p class="dayOfWeek">${dayOfWeek}</p>
          <img src="http://openweathermap.org/img/wn/${icon}.png" alt="Weather icon">
          <p>${temp}°C</p>
        `;
        forecastContainer.appendChild(forecastElement);
      });
    })
    .catch((error) => {
      console.error("There was a problem with fetching the forecast:", error);
    });
}

// Dodaj nasłuchiwacz zdarzeń do pola wejściowego (obsługa klawisza Enter)
document.getElementById("cityInput").addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    getWeather();
  }
});

// Domyślne wywołanie, aby uzyskać pogodę dla domyślnego miasta
getWeather();
displayRecentCities();
