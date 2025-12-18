function getWeatherDescription(code) {
    const codes = {
        0: "Clear sunny day", 1: "Mainly clear skies", 2: "Partly cloudy",
        3: "Cloudy day...", 45: "Foggy outside", 51: "Light drizzle",
        61: "Slight rain", 63: "Moderate rain", 71: "Slight snow",
        95: "Thunderstorm likely"
    };
    return codes[code] || "Condition unknown";
}

function getWeatherIconUrl(code, temp) {
    let iconName = "";
    if (temp >= -5 && temp <= -2) iconName = "VERY_COLD.png";
    else if (temp > -2 && temp <= 2) iconName = "COLD.png";
    else if (temp >= 3 && temp <= 7) iconName = "COOL.png";
    else if (temp >= 8 && temp <= 12) iconName = "FRESH_SPRING.png";
    else if (temp >= 13 && temp <= 18) iconName = "COMFORTABLE.png";
    else if (temp >= 19 && temp <= 24) iconName = "WARM.PNG";
    else if (temp >= 25 && temp <= 28) iconName = "GETTING_HOT.png";
    else if (temp >= 29 && temp <= 32) iconName = "HOT.png";
    else if (temp >= 33 && temp <= 35) iconName = "VERY_HOT.png";
    else if (temp < -5) iconName = "VERY_COLD.png";
    else iconName = "VERY_HOT.png";

    if (code >= 51) {
        if (code >= 71 && code <= 77) iconName = "SNOW_CONDITION.PNG"; 
        else if (code >= 95) iconName = "THUNDERSTORM.PNG";
        else iconName = "RAIN_CONDITION.PNG";
    }
    return `icons/${iconName}`;
}

function getRecommendation(temp) {
    if (temp > 25) return "Stay cool, drink water!";
    if (temp > 15) return "Enjoy the pleasant day.";
    if (temp > 5)  return "Bring a warm jacket.";
    return "Bundle up, it's cold!";
}

async function searchCity() {
    const cityName = document.getElementById('cityInput').value;
    const status = document.getElementById('searchStatus');
    if (!cityName) return;
    
    status.innerText = "Searching...";
    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (!geoData.results) {
            status.innerText = "City not found!";
            return;
        }

        const city = geoData.results[0];
        document.getElementById('searchOverlay').style.display = 'none';
        document.getElementById('weatherContainer').style.display = 'block';
        document.getElementById('cityTitle').innerText = `${city.name.toUpperCase()}.EXE`;

        updateWeather(city.latitude, city.longitude);
    } catch (e) { status.innerText = "Error loading data."; }
}

async function updateWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m&daily=weathercode&timezone=auto`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        
        const current = data.current_weather;
        const temp = Math.round(current.temperature);
        const code = current.weathercode;
        
        const timeISO = current.time.slice(0, 14) + '00';
        const idx = data.hourly.time.indexOf(timeISO);
        const hum = idx !== -1 ? data.hourly.relativehumidity_2m[idx] : '--';

        document.getElementById('currentTemp').innerText = temp + "°C";
        document.getElementById('weatherDescription').innerText = getWeatherDescription(code);
        document.getElementById('humidity').innerText = hum + "%";
        document.getElementById('tomorrowDesc').innerText = getWeatherDescription(data.daily.weathercode[1]);
        document.getElementById('recommendationText').innerText = getRecommendation(temp);
        document.getElementById('weatherIcon').src = getWeatherIconUrl(code, temp);
    } catch (e) { console.error(e); }
}

document.getElementById('searchBtn').addEventListener('click', searchCity);
document.getElementById('cityInput').addEventListener('keypress', (e) => { if (e.key === 'Enter') searchCity(); });
document.getElementById('backBtn').addEventListener('click', () => {
    document.getElementById('searchOverlay').style.display = 'flex';
    document.getElementById('weatherContainer').style.display = 'none';
    document.getElementById('cityInput').value = '';

});

