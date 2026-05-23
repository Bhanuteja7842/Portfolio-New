document.addEventListener('DOMContentLoaded', () => {
  // Initialize icons
  lucide.createIcons();

  // Elements
  const cityInput = document.getElementById('cityInput');
  const searchBtn = document.getElementById('searchBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsModal = document.getElementById('settingsModal');
  const closeSettings = document.getElementById('closeSettings');
  const saveSettings = document.getElementById('saveSettings');
  const apiKeyInput = document.getElementById('apiKey');
  
  const weatherContent = document.getElementById('weatherContent');
  const errorState = document.getElementById('errorState');
  const errorMessage = document.getElementById('errorMessage');

  const cityName = document.getElementById('cityName');
  const weatherDate = document.getElementById('weatherDate');
  const currentTemp = document.getElementById('currentTemp');
  const weatherCondition = document.getElementById('weatherCondition');
  const weatherIcon = document.getElementById('weatherIcon');

  const valHumidity = document.getElementById('valHumidity');
  const valWind = document.getElementById('valWind');
  const valFeels = document.getElementById('valFeels');
  const valVisibility = document.getElementById('valVisibility');
  const forecastGrid = document.getElementById('forecastGrid');

  // App State
  let apiKey = localStorage.getItem('weather-api-key') || '';
  apiKeyInput.value = apiKey;

  // Settings Modal Toggle
  settingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'flex';
  });

  closeSettings.addEventListener('click', () => {
    settingsModal.style.display = 'none';
  });

  saveSettings.addEventListener('click', () => {
    apiKey = apiKeyInput.value.trim();
    localStorage.setItem('weather-api-key', apiKey);
    settingsModal.style.display = 'none';
    searchWeather(cityName.textContent);
  });

  searchBtn.addEventListener('click', () => {
    const query = cityInput.value.trim();
    if (query) {
      searchWeather(query);
    }
  });

  cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchBtn.click();
    }
  });

  // Mock Database
  const mockDatabase = {
    karimnagar: {
      name: "Karimnagar, IN",
      temp: 34,
      condition: "Sunny & Hot",
      icon: "sun",
      iconClass: "sun-glow",
      humidity: "42%",
      wind: "10 km/h",
      feels: 38,
      visibility: "10 km",
      forecast: [
        { day: "Sun", temp: 35, icon: "sun" },
        { day: "Mon", temp: 34, icon: "cloud-sun" },
        { day: "Tue", temp: 33, icon: "cloud" },
        { day: "Wed", temp: 32, icon: "cloud-rain" },
        { day: "Thu", temp: 34, icon: "sun" }
      ]
    },
    hyderabad: {
      name: "Hyderabad, IN",
      temp: 31,
      condition: "Partly Cloudy",
      icon: "cloud-sun",
      iconClass: "cloud-drift",
      humidity: "50%",
      wind: "14 km/h",
      feels: 34,
      visibility: "8 km",
      forecast: [
        { day: "Sun", temp: 32, icon: "cloud-sun" },
        { day: "Mon", temp: 31, icon: "cloud" },
        { day: "Tue", temp: 30, icon: "cloud-rain" },
        { day: "Wed", temp: 31, icon: "cloud-sun" },
        { day: "Thu", temp: 33, icon: "sun" }
      ]
    },
    newyork: {
      name: "New York, US",
      temp: 18,
      condition: "Overcast Clouds",
      icon: "cloud",
      iconClass: "cloud-drift",
      humidity: "65%",
      wind: "18 km/h",
      feels: 17,
      visibility: "9 km",
      forecast: [
        { day: "Sun", temp: 19, icon: "cloud-sun" },
        { day: "Mon", temp: 16, icon: "cloud-drizzle" },
        { day: "Tue", temp: 15, icon: "cloud-rain" },
        { day: "Wed", temp: 18, icon: "cloud" },
        { day: "Thu", temp: 20, icon: "sun" }
      ]
    },
    london: {
      name: "London, UK",
      temp: 14,
      condition: "Light Drizzle",
      icon: "cloud-drizzle",
      iconClass: "rain-flow",
      humidity: "82%",
      wind: "22 km/h",
      feels: 12,
      visibility: "6 km",
      forecast: [
        { day: "Sun", temp: 13, icon: "cloud-rain" },
        { day: "Mon", temp: 15, icon: "cloud" },
        { day: "Tue", temp: 16, icon: "cloud-sun" },
        { day: "Wed", temp: 14, icon: "cloud-drizzle" },
        { day: "Thu", temp: 15, icon: "cloud" }
      ]
    }
  };

  function searchWeather(city) {
    const formattedQuery = city.toLowerCase().replace(/\s/g, '');
    
    // Check if API key is entered
    if (apiKey) {
      fetchWeatherFromAPI(city);
    } else {
      // Use Mock Database
      const data = mockDatabase[formattedQuery] || getMockRandom(city);
      if (data) {
        showWeather(data);
      } else {
        showError("City not found. Try searching Karimnagar, Hyderabad, or New York!");
      }
    }
  }

  function getMockRandom(city) {
    // Generate randomized but stable mock data for query
    const codeSum = city.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const temp = 10 + (codeSum % 28); // 10 to 38 C
    const feels = temp + (codeSum % 3) - 1;
    const conditions = ["Sunny & Clear", "Partly Cloudy", "Heavy Rain", "Light Showers", "Overcast"];
    const icons = ["sun", "cloud-sun", "cloud-rain", "cloud-drizzle", "cloud"];
    const iconClasses = ["sun-glow", "cloud-drift", "rain-flow", "rain-flow", "cloud-drift"];
    
    const condIdx = codeSum % conditions.length;
    
    return {
      name: capitalizeWords(city),
      temp: temp,
      condition: conditions[condIdx],
      icon: icons[condIdx],
      iconClass: iconClasses[condIdx],
      humidity: `${40 + (codeSum % 45)}%`,
      wind: `${8 + (codeSum % 18)} km/h`,
      feels: feels,
      visibility: `${7 + (codeSum % 4)} km`,
      forecast: [
        { day: "Sun", temp: temp + 1, icon: icons[(condIdx + 1) % icons.length] },
        { day: "Mon", temp: temp, icon: icons[condIdx] },
        { day: "Tue", temp: temp - 2, icon: icons[(condIdx + 2) % icons.length] },
        { day: "Wed", temp: temp - 1, icon: icons[(condIdx + 3) % icons.length] },
        { day: "Thu", temp: temp + 2, icon: icons[condIdx] }
      ]
    };
  }

  function fetchWeatherFromAPI(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;
    
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error("City not found");
        return res.json();
      })
      .then(data => {
        // Fetch 5-day forecast also
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;
        return fetch(forecastUrl)
          .then(res => res.json())
          .then(forecastData => {
            const formatted = formatAPIResponse(data, forecastData);
            showWeather(formatted);
          });
      })
      .catch(err => {
        showError(err.message === "City not found" 
          ? `Could not find city "${city}". Please check the spelling.` 
          : "Error connecting to OpenWeather API. Please verify your API Key!");
      });
  }

  function formatAPIResponse(current, forecast) {
    // Map OpenWeather icon code to Lucide Icon
    const iconMap = {
      "01": { icon: "sun", class: "sun-glow" },
      "02": { icon: "cloud-sun", class: "cloud-drift" },
      "03": { icon: "cloud", class: "cloud-drift" },
      "04": { icon: "cloud", class: "cloud-drift" },
      "09": { icon: "cloud-drizzle", class: "rain-flow" },
      "10": { icon: "cloud-rain", class: "rain-flow" },
      "11": { icon: "cloud-lightning", class: "rain-flow" },
      "13": { icon: "snowflake", class: "cloud-drift" },
      "50": { icon: "wind", class: "cloud-drift" }
    };
    const iconCode = current.weather[0].icon.slice(0, 2);
    const iconMeta = iconMap[iconCode] || { icon: "cloud", class: "cloud-drift" };

    // Format forecast - take 1 item per day (every 8th list entry, which is 24 hours apart)
    const forecastDays = [];
    const list = forecast.list || [];
    for (let i = 8; i < list.length; i += 8) {
      const item = list[i];
      const d = new Date(item.dt_txt);
      const dayName = d.toLocaleDateString(undefined, { weekday: 'short' });
      const fIconCode = item.weather[0].icon.slice(0, 2);
      const fIcon = (iconMap[fIconCode] || { icon: "cloud" }).icon;
      forecastDays.push({
        day: dayName,
        temp: Math.round(item.main.temp),
        icon: fIcon
      });
    }

    return {
      name: `${current.name}, ${current.sys.country}`,
      temp: Math.round(current.main.temp),
      condition: capitalizeWords(current.weather[0].description),
      icon: iconMeta.icon,
      iconClass: iconMeta.class,
      humidity: `${current.main.humidity}%`,
      wind: `${Math.round(current.wind.speed * 3.6)} km/h`, // convert m/s to km/h
      feels: Math.round(current.main.feels_like),
      visibility: `${(current.visibility / 1000).toFixed(0)} km`,
      forecast: forecastDays
    };
  }

  function showWeather(data) {
    errorState.style.display = 'none';
    weatherContent.style.display = 'block';

    cityName.textContent = data.name;
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    weatherDate.textContent = new Date().toLocaleDateString(undefined, dateOptions);
    currentTemp.textContent = `${data.temp}°C`;
    weatherCondition.textContent = data.condition;
    
    // Icon
    weatherIcon.innerHTML = `<i data-lucide="${data.icon}" class="${data.iconClass}"></i>`;

    // Stats
    valHumidity.textContent = data.humidity;
    valWind.textContent = data.wind;
    valFeels.textContent = `${data.feels}°C`;
    valVisibility.textContent = data.visibility;

    // Forecast Grid
    forecastGrid.innerHTML = '';
    data.forecast.forEach(item => {
      const fItem = document.createElement('div');
      fItem.className = 'forecast-item';
      fItem.innerHTML = `
        <span class="forecast-day">${item.day}</span>
        <i data-lucide="${item.icon}"></i>
        <span class="forecast-temp">${item.temp}°C</span>
      `;
      forecastGrid.appendChild(fItem);
    });

    lucide.createIcons();
  }

  function showError(msg) {
    weatherContent.style.display = 'none';
    errorState.style.display = 'flex';
    errorMessage.textContent = msg;
  }

  function capitalizeWords(str) {
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  // Initial Search
  searchWeather("Karimnagar");
});
