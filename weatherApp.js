/*  -----  REUSABLE HTTP REQUEST FUNCTION -------------------------

1. TAKES IN URL AND CALLBACK AS PARAMETERS
2. PARSES RESPONSE FROM URL (AKA API ENDPOINT)
3. PASSES PARSED RESPONSE INTO CALLBACK

*/

function httpRequest(url, callback) {
    let request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            let response = this.response;
            let responseParsed = JSON.parse(response);
            // console.log('This is my response data parsed: ', responseParsed);

            callback(responseParsed);

        } else if (request.status == 500) {

            httpRequest(url, callback);
        }


    }

    request.open('GET', url);
    request.send();
};


/* ------ STEP 1: GET ADDRESS DATA -----------------------------------------------
***  GETADDRESSDATA CALLED ONCLICK
 
1. STORE VALUE OF ADDRESS INPUT IN LET ADDRESS
2. STORE API KEY IN LET API-KEY
3. CREATE ADDRESS API ENDPOINT USING TEMPLATE LITERAL AND STORE IT IN LET ADDRESS-API-ENDPOINT
4. CALL HTTP REQUEST FUNCTION AND PASS ARGUMENTS: ADDRESS-API-ENDPOINT AND GET-WEATHER-DATA FUNCTION
 
*/


//function allows you to press enter and search results
let addressInputField = document.getElementById('address');
// console.log(addressInputField);

addressInputField.addEventListener('keyup', function (e) {
    e.preventDefault();
    if (e.keyCode === 13) {
        // console.log('enter key pressed');
        document.getElementById('search-button').click()
    }
});



let currentAddress = '';
let currentForecastSection = '';
let weeklyForecastSection = '';

// function loadingModal() {
//   let contentContainer = document.getElementById('content-container');

//   //creates cardDiv and styles it using bootstrap classes
//   let contentContainer = document.createElement('div');
//   let cardClassesToAdd = ['width: 100%', 'height: 100%', 'position: absolute'];
//   cardDiv.classList.add(...cardClassesToAdd); //adds all the classes in the array above
//   cardDiv.style = 'max-width: 540px';
//   currentForecastSection.appendChild(cardDiv);

// };

function getAddressData() {
    currentForecastSection = document.getElementById('current-forecast');
    weeklyForecastSection = document.getElementById('weekly-forecast');

    let address = document.getElementById("address").value || '';
    let apiKey = '40b84821222891148551b618569b1f0d28e9206';
    let addressApiEndpoint = `https://api.geocod.io/v1.6/geocode?q=${address}&api_key=${apiKey}`;


    // loadingModal();
    if (currentAddress === '' || currentAddress !== address) {
        let loadingSpinner = document.getElementById('loading-spinner-wrapper'); //loading spinner before data is rendered
        loadingSpinner.style = 'opacity: 1'; // opacity is set to 1 to be displayed
        currentForecastSection.innerHTML = ''; //resets the current Forecast section
        weeklyForecastSection.innerHTML = '';

        currentAddress = address; //overwrite address

        httpRequest(addressApiEndpoint, getWeatherData);


    } else return;

};

/* ------ STEP 2: GET WEATHER DATA -----------------------------------------------
***  GET-WEATHER-DATA CALLED IN HTTP RESPONSE FUNCTION AND PARSED RESPONSE PASSED AS ARGUMENT
 
1. FIND OBJECT THAT HAS A LOCATION PROPERTY IN AN RESULTS ARRAY AND STORE IT
2. DESTURCTURE LOCATION OBJECT AND STORE LAT AND LNG IN LET LATITUDE AND LONGITUDE
3. CREATE WEATHER API ENDPOINT USING TEMPLATE LITERAL AND STORE IT IN LET WEATHER-API-ENDPOINT
4. CALL HTTP REQUEST FUNCTION AND PASS ARGUMENTS: WEATHER-API-ENDPOINT AND GET-FORECAST-DATA FUNCTION
 
*/

let city = '';
let state = '';

function getWeatherData(addressData) {
    // console.log(addressData);
    city = addressData.results[0].address_components.city;
    state = addressData.results[0].address_components.state;//Fixes BUG IF SOMEONE PUTS A STATE and no city=> UNDEFINED
    // console.log(city);

    let obj = addressData.results.find(obj => obj.location);
    // console.log(obj.address_components);
    let { lat: latitude, lng: longitude } = obj.location;
    // console.log('This is my location, latitude, and longitude respectively: ', obj.location, latitude, longitude);

    let weatherApiEndpoint = `https://api.weather.gov/points/${latitude},${longitude}`;
    console.log('This is the weather api endpoint: ', weatherApiEndpoint);

    httpRequest(weatherApiEndpoint, getForecast);
};

/* ------ STEP 3: DISPLAY FORECAST -----------------------------------------------
***  DISPLAY-FORECAST CALLED IN HTTP RESPONSE FUNCTION AND PARSED RESPONSE PASSED AS ARGUMENT
 
1. DESTURCTURE PROPERTIES OBJECT AND STORE FORECASTHOURLY AND FORECAST IN LET FORECAST-HOURLY AND FORECAST API-ENDPOINT
2. CALL HTTP REQUEST FUNCTION AND PASS ARGUMENTS: FORECAST-HOURLY-ENDPOINT AND DISPLAY-CURRENT-FORECAST FUNCTION
3. CALL HTTP REQUEST FUNCTION AND PASS ARGUMENTS: FORECAST-API-ENDPOINT AND DISPLAY-WEEKLY-FORECAST FUNCTION
4. CALL DISPLAY-LOCATION FUNCTION AND PASS IN LOCATION PROPERTIES
 
*/

// let locationProps = {};
let forecastApiEndpoint = '';
let forecastHourlyApiEndpoint = '';

function getForecast(forecastData) {
    // console.log('This is the forecast data: ', forecastData);
    let {
        forecastHourly,
        forecast,
        // relativeLocation,
        forecastGridData: forecastGridApiEndpoint
    } = forecastData.properties;

    forecastApiEndpoint = forecast;

    forecastHourlyApiEndpoint = forecastHourly;

    // locationProps = relativeLocation.properties; //location properties like city and state

    console.log('This is the hourly forecast api endpoint: ', forecastHourlyApiEndpoint);
    console.log('This is the weekly forecast api endpoint: ', forecastApiEndpoint);
    console.log('This is the forecast grid api endpoint: ', forecastGridApiEndpoint);
    // console.log('This is the location details: ', locationProps);

    httpRequest(forecastGridApiEndpoint, displayForecast);

};

function getMotivationalQuotes() {
    let motivationalQuotesApi = 'https://type.fit/api/quotes';

    httpRequest(motivationalQuotesApi, createGlobalQuoteArray); //get quote data
};

getMotivationalQuotes(); //calls the function when main js file loads


let quotesArray = [];

function createGlobalQuoteArray(quoteData) {
    quotesArray = [...quoteData]; //creates a clone of the quote data array
}

function displayForecast(gridData) {
    let { properties } = gridData;
    console.log('This is the grid data properties: ', properties);

    convertToFahrenheit(properties);

    httpRequest(forecastHourlyApiEndpoint, displayForecastHourly);

    httpRequest(forecastApiEndpoint, displayWeeklyForecast);

    let probabilityOfPrecipitation = properties.probabilityOfPrecipitation.values[0].value;

    probabilityOfPrecipitation > 20 ? showPrecipitationModal(probabilityOfPrecipitation) : '';
    // console.log('This is the grid data: ', gridData);
};


let maxTemperatureFahrenheitArray = [];
let minTemperatureFahrenheitArray = [];


function convertToFahrenheit(properties) {
    let { maxTemperature, minTemperature } = properties;

    // console.log(maxTemperature, minTemperature);

    let maxTemperatures = maxTemperature.values;
    let minTemperatures = minTemperature.values;

    // console.log(maxTemperatures);
    // console.log(minTemperatures);

    let maxTemperatureLength = maxTemperatures.length;
    let minTemperatureLength = minTemperatures.length;

    // console.log(maxTemperatureLength);
    // console.log(minTemperatureLength);

    maxTemperatureFahrenheitArray = [];// resets the array
    minTemperatureFahrenheitArray = []; //resets the array

    //loop through the max temperatures and push them to an array
    for (let maxTemperatureIndex = 0; maxTemperatureIndex < maxTemperatureLength; maxTemperatureIndex++) {
        let maxTemperatureCelcius = maxTemperatures[maxTemperatureIndex].value;
        // console.log(maxTemperatureCelcius);

        //converts temperature from celcius to fahrenheit
        let maxTemperatureFahrenheit = Math.round((maxTemperatureCelcius * 9 / 5) + 32);
        // console.log(maxTemperatureFahrenheit);

        maxTemperatureFahrenheitArray.push(maxTemperatureFahrenheit);
    }

    //loop through the max temperatures and push them to an array
    for (let minTemperatureIndex = 0; minTemperatureIndex < minTemperatureLength; minTemperatureIndex++) {
        let minTemperatureCelcius = minTemperatures[minTemperatureIndex].value;
        // console.log(minTemperatureCelcius);

        //converts temperature from celcius to fahrenheit
        let minTemperatureFahrenheit = Math.round((minTemperatureCelcius * 9 / 5) + 32);

        minTemperatureFahrenheitArray.push(minTemperatureFahrenheit);
    }

    // console.log('This is the max and min temperature arrays: ', maxTemperatureFahrenheitArray, minTemperatureFahrenheitArray);
};

function showPrecipitationModal(probabilityOfPrecipitation) {

    let myModal = new bootstrap.Modal(document.getElementById('my-modal'));
    let modalTitle = document.getElementById('modal-title');
    let modalBody = document.getElementById('modal-body');

    myModal.hide(); //hide if there are numerous calls to the server aka multiple 500 errors;
    modalBody.innerHTML = ''; //resets modal body if multiple calls to server. 

    let modalTitleClassesToAdd = ['text-danger'];
    modalTitle.classList.add(...modalTitleClassesToAdd);
    modalTitle.innerHTML = `${probabilityOfPrecipitation}% Chance of Preciptiation`;

    let modalSubtitle = document.createElement('h5');
    let modalSubtitleClassesToAdd = ['text-muted'];
    modalSubtitle.classList.add(...modalSubtitleClassesToAdd); //adds all the classes in the array above
    modalSubtitle.innerHTML = "Looks like you need some sunshine:"
    modalBody.appendChild(modalSubtitle);

    displayQuote(modalBody);

    myModal.show(); //shows modal
    // console.log(probabilityOfPrecipitation);
};

function displayQuote(modalBody) {
    // console.log(modalBody); need this to append quote
    let quotesArrayLength = quotesArray.length; //quotesArray global variable is on line 160
    let randomIndex = Math.floor(Math.random() * quotesArrayLength);
    let randomQuote = quotesArray[randomIndex].text;

    let paragraph = document.createElement('p');
    paragraph.innerHTML = randomQuote;
    modalBody.appendChild(paragraph);
}


function displayForecastHourly(forecastHourlyData) {
    // console.log(maxTemperatureFahrenheitArray);
    // console.log(forecastHourlyData);
    let { icon, shortForecast, temperature } = forecastHourlyData.properties.periods[0]; //data
    // let { city } = locationProps;
    let currentMaxTemperature = maxTemperatureFahrenheitArray[0];
    let currentMinTemperature = minTemperatureFahrenheitArray[0];
    // console.log(icon);
    // console.log(currentAddress);
    // console.log(locationProps);
    // console.log(currentForecastSection);
    // console.log(maxTemperatureFahrenheit);

    currentForecastSection.innerHTML = ''; //resets the current Forecast section in case of 500 error

    //creates cardDiv and styles it using bootstrap classes
    let cardDiv = document.createElement('div');
    let cardClassesToAdd = ['card', 'my-4', 'p-0'];
    cardDiv.classList.add(...cardClassesToAdd); //adds all the classes in the array above
    cardDiv.style = 'max-width: 540px';
    currentForecastSection.appendChild(cardDiv);

    //creates rowDiv and styles it using bootstrap classes
    let rowDiv = document.createElement('div');
    let rowClassesToAdd = ['row', 'g-0'];
    rowDiv.classList.add(...rowClassesToAdd); //adds all the classes in the array above
    cardDiv.appendChild(rowDiv);

    //creates colDiv and styles it using bootstrap classes
    let colDiv = document.createElement('div');
    let colClassesToAdd = ['col-md-4'];
    colDiv.classList.add(...colClassesToAdd); //adds all the classes in the array above
    rowDiv.appendChild(colDiv);

    //creates image tag and styles using bootstrap classes
    let image = document.createElement('img');
    let imageClassesToAdd = ['img-fluid', 'rounded-start', 'w-100'];
    image.classList.add(...imageClassesToAdd);
    image.src = icon;
    colDiv.appendChild(image);

    //creates colTwoDiv and styles it using bootstrap classes
    let colTwoDiv = document.createElement('div');
    let colTwoClassesToAdd = ['col-md-8'];
    colTwoDiv.classList.add(...colTwoClassesToAdd); //adds all the classes in the array above
    rowDiv.appendChild(colTwoDiv);

    //creates cardBody div tag and styles using bootstrap classes
    let cardBodyDiv = document.createElement('div');
    let cardBodyClassesToAdd = ['card-body'];
    cardBodyDiv.classList.add(...cardBodyClassesToAdd);
    colTwoDiv.appendChild(cardBodyDiv);

    //creates card title tag and styles using bootstrap classes
    let cardTitle = document.createElement('h4');
    let cardTitleClassesToAdd = ['card-title'];
    cardTitle.classList.add(...cardTitleClassesToAdd);
    cardTitle.innerHTML = city ? city : state;
    cardBodyDiv.appendChild(cardTitle);

    //creates card text tag and styles using bootstrap classes
    let cardText = document.createElement('h6');
    let cardTextClassesToAdd = ['card-subtitle', 'mb-2', 'text-muted'];
    cardText.classList.add(...cardTextClassesToAdd);
    cardText.innerHTML = shortForecast;
    cardBodyDiv.appendChild(cardText);

    //creates card text two tag and styles using bootstrap classes
    let cardTextTwo = document.createElement('h1');
    let cardTextTwoClassesToAdd = ['card-text'];
    cardTextTwo.classList.add(...cardTextTwoClassesToAdd);
    cardTextTwo.innerHTML = temperature;
    cardBodyDiv.appendChild(cardTextTwo)

    //creates card text three tag and styles using bootstrap classes
    let cardTextThree = document.createElement('p');
    let cardTextThreeClassesToAdd = ['card-text'];
    cardTextThree.classList.add(...cardTextThreeClassesToAdd);
    cardTextThree.id = 'high-low-temperature';
    cardBodyDiv.appendChild(cardTextThree);

    //creates card small text tag and styles using bootstrap classes
    let cardSmallText = document.createElement('small');
    let cardSmallTextClassesToAdd = ['text-muted'];
    cardSmallText.classList.add(...cardSmallTextClassesToAdd);
    cardSmallText.innerHTML = `H: ${currentMaxTemperature} L: ${currentMinTemperature}`;
    cardTextThree.appendChild(cardSmallText);

    let loadingSpinner = document.getElementById('loading-spinner-wrapper');
    loadingSpinner.style = 'opacity: 0';

    // console.log('this is the forecast hourly data: ', forecastHourlyData);
};


function displayWeeklyForecast(weeklyForecastData) {
    // console.log('This is the weekly forecast data : ', weeklyForecastData);
    weeklyForecastSection.innerHTML = ''; //resets the current Forecast section in case of 500 error

    let { periods } = weeklyForecastData.properties;
    let days = periods.filter(item => item.name === 'Monday' | item.name === 'Tuesday' | item.name === 'Wednesday' | item.name === 'Thursday' | item.name === 'Friday' | item.name === 'Saturday' | item.name === 'Sunday'); //filters out any period whose name is not a day i.e. today
    // console.log(days);
    let daysLength = days.length;
    let maxTemperatureFahrenheitArrayClone = [...maxTemperatureFahrenheitArray]; //made a cloned array
    let minTemperatureFahrenheitArrayClone = [...minTemperatureFahrenheitArray];
    // console.log('This is min temperature Array', minTemperatureFahrenheitArrayClone);

    maxTemperatureFahrenheitArrayClone.shift();
    minTemperatureFahrenheitArrayClone.shift();
    // console.log('This is min array item removed', minTemperatureFahrenheitArrayClone);

    //creates parent div for weekly section
    let parentDiv = document.createElement('div');
    let parentDivClassesToAdd = ['col-8', 'bg-light', 'my-4', 'rounded'];
    parentDiv.classList.add(...parentDivClassesToAdd); //adds all the classes in the array above
    parentDiv.style = 'width: 540px'
    weeklyForecastSection.appendChild(parentDiv);


    for (let index = 0; index < daysLength; index++) {

        let { name: date, icon } = days[index];

        let maxTemperature = maxTemperatureFahrenheitArrayClone[index];
        let minTemperature = minTemperatureFahrenheitArrayClone[index];
        // console.log(minTemperature);

        //creates first row for weekly section
        let rowDiv = document.createElement('div');
        let rowClassesToAdd = ['row'];
        rowDiv.classList.add(...rowClassesToAdd); //adds all the classes in the array above
        rowDiv.style = 'max-width: 540px; height: 110px';
        parentDiv.appendChild(rowDiv);

        //creates first column for weekly section
        let colDiv = document.createElement('div');
        let colClassesToAdd = ['col-4',];
        colDiv.classList.add(...colClassesToAdd); //adds all the classes in the array above
        rowDiv.appendChild(colDiv);

        //creates date for weekly section
        let dateText = document.createElement('h6');
        let dateTextClassesToAdd = ['dark-text', 'd-flex', 'justify-content-center', 'align-items-center', 'w-100', 'h-100'];
        dateText.classList.add(...dateTextClassesToAdd); //adds all the classes in the array above
        dateText.innerHTML = date;
        colDiv.appendChild(dateText);

        //creates first columnTwo for weekly section
        let colTwoDiv = document.createElement('div');
        let colTwoClassesToAdd = ['col-4', 'd-flex', 'justify-content-center', 'align-items-center'];
        colTwoDiv.classList.add(...colTwoClassesToAdd); //adds all the classes in the array above
        rowDiv.appendChild(colTwoDiv);

        //creates image tag and styles using bootstrap classes
        let dailyImage = document.createElement('img');
        let dailyImageClassesToAdd = ['img-fluid', 'rounded-start', 'w-50'];
        dailyImage.classList.add(...dailyImageClassesToAdd);
        dailyImage.src = icon;
        colTwoDiv.appendChild(dailyImage);

        //creates first columnTwo for weekly section
        let colThreeDiv = document.createElement('div');
        let colThreeClassesToAdd = ['col-4',];
        colThreeDiv.classList.add(...colThreeClassesToAdd); //adds all the classes in the array above
        rowDiv.appendChild(colThreeDiv);

        //creates card small text tag and styles using bootstrap classes
        let temperatureText = document.createElement('h6');
        let temperatureTextClassesToAdd = ['text-muted', 'd-flex', 'justify-content-center', 'align-items-center', 'w-100', 'h-100'];
        temperatureText.classList.add(...temperatureTextClassesToAdd);
        temperatureText.innerHTML = `H: ${maxTemperature} L: ${minTemperature}`;
        console.log(temperatureText.innerHTML);
        colThreeDiv.appendChild(temperatureText);
    }

    displayTodaysDetailedForecast(periods);
};

function displayTodaysDetailedForecast(periods) {
    let { detailedForecast } = periods[0];
    // console.log(detailedForecast);

    let detailedForecastSection = document.getElementById('todays-detailed-forecast');

    detailedForecastSection.innerHTML = '';


    //creates card div and styles using bootstrap classes
    let cardDiv = document.createElement('div');
    let cardDivClassesToAdd = ['card', 'my-4'];
    cardDiv.classList.add(...cardDivClassesToAdd); //adds all the classes in the array above
    cardDiv.style = 'max-width: 540px';
    detailedForecastSection.appendChild(cardDiv);

    //creates card body div and styles using bootstrap classes
    let cardBodyDiv = document.createElement('div');
    let cardBodyDivClassesToAdd = ['card-body'];
    cardBodyDiv.classList.add(...cardBodyDivClassesToAdd); //adds all the classes in the array above
    cardDiv.appendChild(cardBodyDiv);

    //creates card title and styles using bootstrap classes
    let cardTitle = document.createElement('h5');
    let cardTitleClassesToAdd = ['card-title'];
    cardTitle.classList.add(...cardTitleClassesToAdd);
    cardTitle.innerHTML = 'Today:'
    cardBodyDiv.appendChild(cardTitle);

    //creates card paragraph and styles using bootstrap classes
    let paragraph = document.createElement('p');
    let paragraphClassesToAdd = ['card-text'];
    paragraph.classList.add(...paragraphClassesToAdd);
    paragraph.innerHTML = detailedForecast
    cardBodyDiv.appendChild(paragraph);
}