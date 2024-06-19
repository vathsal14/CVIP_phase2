const apiKey = "1e0c858f2cf4177d958f53f38775729f"; 
let cityList = [];
let cityname;

initCityList();
initWeather();

function renderCities() {
    $("#cityList").empty();
    $("#cityInput").val("");

    cityList.forEach(city => {
        const cityElement = $("<a>")
            .addClass("list-group-item list-group-item-action city")
            .attr("data-name", city)
            .text(city);
        $("#cityList").prepend(cityElement);
    });
}

function initCityList() {
    const storedCities = JSON.parse(localStorage.getItem("cities"));
    if (storedCities) cityList = storedCities;
    renderCities();
}

function initWeather() {
    const storedWeather = JSON.parse(localStorage.getItem("currentCity"));
    if (storedWeather) {
        cityname = storedWeather;
        displayCurrentWeather();
        displayFiveDayForecast();
    }
}

function storeCityArray() {
    localStorage.setItem("cities", JSON.stringify(cityList));
}

function storeCurrentCity() {
    localStorage.setItem("currentCity", JSON.stringify(cityname));
}

$("#citySearchBtn").on("click", function (event) {
    event.preventDefault();
    cityname = $("#cityInput").val().trim();
    if (!cityname) {
        alert("Please enter a city to look up");
        return;
    }

    if (cityList.length >= 5) cityList.shift();
    cityList.push(cityname);
    storeCurrentCity();
    storeCityArray();
    renderCities();
    displayCurrentWeather();
    displayFiveDayForecast();
});

$("#cityInput").keypress(function (e) {
    if (e.which === 13) $("#citySearchBtn").click();
});

async function displayCurrentWeather() {
    const queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityname}&units=imperial&appid=${apiKey}`;
    const response = await $.ajax({ url: queryURL, method: "GET" });

    const currentWeatherDiv = $("<div class='card-body' id='currentWeather'>");
    const date = new Date().toLocaleDateString();
    const displayCurrentWeatherIcon = $(`<img src='http://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png' />`);
    const currentCityEl = $("<h3 class='card-body'>").text(`${response.name} (${date})`).append(displayCurrentWeatherIcon);
    currentWeatherDiv.append(currentCityEl);
    currentWeatherDiv.append($("<p class='card-text'>").text(`Temperature: ${response.main.temp.toFixed(1)}° F`));
    currentWeatherDiv.append($("<p class='card-text'>").text(`Humidity: ${response.main.humidity}%`));
    currentWeatherDiv.append($("<p class='card-text'>").text(`Wind Speed: ${response.wind.speed.toFixed(1)} mph`));

    const uvURL = `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${response.coord.lat}&lon=${response.coord.lon}`;
    const uvResponse = await $.ajax({ url: uvURL, method: "GET" });
    const uvNumber = $("<span>").text(uvResponse.value).addClass(getUVIndexClass(uvResponse.value));
    const uvIndexEl = $("<p class='card-text'>").text("UV Index: ").append(uvNumber);
    currentWeatherDiv.append(uvIndexEl);

    $("#weatherContainer").html(currentWeatherDiv);

    setBackgroundImage(response.weather[0].icon);
}

async function displayFiveDayForecast() {
    const queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityname}&units=imperial&appid=${apiKey}`;
    const response = await $.ajax({ url: queryURL, method: "GET" });

    const forecastDiv = $("<div id='fiveDayForecast'>");
    const forecastHeader = $("<h5 class='card-header border-secondary'>").text("5 Day Forecast");
    forecastDiv.append(forecastHeader);
    const cardDeck = $("<div class='card-deck'>");
    forecastDiv.append(cardDeck);

    for (let i = 0; i < response.list.length; i += 8) {
        const forecastCard = $("<div class='card mb-3 mt-3'>");
        const cardBody = $("<div class='card-body'>");
        const forecastDate = $("<h5 class='card-title'>").text(new Date(response.list[i].dt_txt).toLocaleDateString());
        cardBody.append(forecastDate);
        const displayWeatherIcon = $(`<img src='http://openweathermap.org/img/wn/${response.list[i].weather[0].icon}.png' />`);
        cardBody.append(displayWeatherIcon);
        cardBody.append($("<p class='card-text'>").text(`Temp: ${response.list[i].main.temp}° F`));
        cardBody.append($("<p class='card-text'>").text(`Humidity: ${response.list[i].main.humidity}%`));
        forecastCard.append(cardBody);
        cardDeck.append(forecastCard);
    }

    $("#forecastContainer").html(forecastDiv);
}

function getUVIndexClass(uvIndex) {
    if (uvIndex <= 2.99) return "low";
    else if (uvIndex <= 5.99) return "moderate";
    else if (uvIndex <= 7.99) return "high";
    else if (uvIndex <= 10.99) return "vhigh";
    else return "extreme";
}

function setBackgroundImage(iconCode) {
    const imageMap = {
        "01d": "url(images/clear-sky-day-image.avif)",
        "01n": "url(images/clear-sky-night-image.jpg)",
        "02d": "url(images/few-clouds-day-image.jpg)",
        "02n": "url(images/few-clouds-night-image.jpg)",
        "03d": "url(images/scattered-clouds-image.jpg)",
        "03n": "url(images/scattered-clouds-image.jpg)",
        "04d": "url(images/broken-clouds-image.jpg)",
        "04n": "url(images/broken-clouds-image.jpg)",
        "09d": "url(images/shower-rain-image.jpg)",
        "09n": "url(images/shower-rain-image.jpg)",
        "10d": "url(images/rain-day-image.jpg)",
        "10n": "url(images/rain-night-image.jpg)",
        "11d": "url(images/thunderstorm-image.jpg)",
        "11n": "url(images/thunderstorm-image.jpg)",
        "13d": "url(images/snow-day-image.jpg)",
        "13n": "url(images/snow-night-image.jpg)",
        "50d": "url(images/mist-day-image.jpg)",
        "50n": "url(images/mist-night-image.jpg)"
    };

    $("body").css("background-image", imageMap[iconCode]);
}

function historyDisplayWeather() {
    cityname = $(this).attr("data-name");
    displayCurrentWeather();
    displayFiveDayForecast();
}

$(document).on("click", ".city", historyDisplayWeather);
