const OV_URL = 'https://cors-anywhere.herokuapp.com/http://v0.ovapi.nl/'
managingCompany = "GVB"
let routeNumber
let direction
let tpc
let modeOfTransport
let linesData
let departuresData
let detailsData
let stopsOnLine = []
let tpcName
let scrollOffset = 100;

function startLoadingAnimation(){
  document.getElementById("loading").style.display = 'block';
}

function stopLoadingAnimation(){
  document.getElementById("loading").style.display = 'none';
}

function travelType(type){//Runs when a travel type has been selected
  modeOfTransport = type;

  //resets background color of all travel type buttons
  for(button of document.getElementsByClassName("type-buttons")){
    button.style.backgroundColor = ""
  }

  //colors the chosen travel type button
  document.getElementById(modeOfTransport).style.backgroundColor = "#960084"

  startRoutePicker();
}

function startRoutePicker(){
  //show the route buttons container and title
  document.getElementById("route-buttons").style.display = "block";
  startLoadingAnimation()

  //retrieve list of routes
  grabAllData();

  //scroll to top of routes title
  $('html, body').animate({scrollTop: $("#route-buttons").offset().top -scrollOffset}, 500);
}


function determineRoutes(data) {//extracts routes from AJAX response
  let allRoutes = []
  for (line in data){
    if (line.indexOf(managingCompany) !== -1 && data[line].TransportType == modeOfTransport){
      allRoutes.push(data[line].LinePublicNumber)
    }
  }
  let uniqueRoutes = Array.from(new Set(allRoutes)).sort();
  return uniqueRoutes
}

function renderRoutes(routes){
  //if buttons or results were already rendered in a previous search, remove them
  if (document.getElementById("list-for-route-buttons") !== null){
    document.getElementById("list-for-route-buttons").remove();
  }
  if (document.getElementById("list-for-destination-buttons") !== null){
    document.getElementById("list-for-destination-buttons").remove();
    document.getElementById("destination-buttons").style.display = "none";
  }
   if (document.getElementById("list-for-stop-buttons") !== null){
    document.getElementById("list-for-stop-buttons").remove();
    document.getElementById("stop-buttons").style.display = "none";
  }
  if (stopsOnLine.length !== 0){
    stopsOnLine.length = 0;
  }
  if (document.getElementById("results") !== null){
    document.getElementById("results").innerHTML = ""
    document.getElementById("results").innerHTML = ""
    document.getElementById("results1").innerHTML = ""
    document.getElementById("results2").innerHTML = ""
    document.getElementById("results3").innerHTML = ""
    document.getElementById("refresh").style.display = "none"
  }

  //create and render the list of route buttons
  let buttonList = document.createElement("div")
  buttonList.id = "list-for-route-buttons"
  document.getElementById("route-buttons").append(buttonList)
  for(route of routes){
    newButton = document.createElement("button")
    newButton.id = route
    newButton.classList.add("route-buttons")
    newButton.innerHTML = route
    newButton.addEventListener("click", function(){startDestinationPicker(this.id)});
    document.getElementById("list-for-route-buttons").append(newButton)
  }
}

function startDestinationPicker(route){

  for(button of document.getElementsByClassName("route-buttons")){
    button.style.backgroundColor = ""
  }
  document.getElementById(route).style.backgroundColor = "#960084"

  if (document.getElementById("list-for-destination-buttons") !== null){
    document.getElementById("list-for-destination-buttons").remove();
  }
  if (document.getElementById("list-for-stop-buttons") !== null){
    stopsOnLine.length = 0;
    document.getElementById("list-for-stop-buttons").remove();
    document.getElementById("stop-buttons").style.display = "none";
  }
  if (stopsOnLine.length !== 0){
    stopsOnLine.length = 0;
  }
  if (document.getElementById("results") !== null){
    document.getElementById("results").innerHTML = ""
    document.getElementById("results").innerHTML = ""
    document.getElementById("results1").innerHTML = ""
    document.getElementById("results2").innerHTML = ""
    document.getElementById("results3").innerHTML = ""
    document.getElementById("refresh").style.display = "none"
  }

  document.getElementById("destination-buttons").style.display = "block";
  $('html, body').animate({scrollTop: $("#destination-buttons").offset().top -scrollOffset}, 500);

  routeNumber = route
  let buttonList = document.createElement("div")
  buttonList.id = "list-for-destination-buttons"
  document.getElementById("destination-buttons").append(buttonList)
  destinations = getDestinations(linesData)
  let i = 1;
  for (end of destinations){
    newButton = document.createElement("button")
    newButton.id = end
    newButton.classList.add("destination-buttons")
    newButton.innerHTML = end
    newButton.directionCode = i;
    newButton.style.display = "block"
    i++;
    newButton.addEventListener("click", function(){startStopPicker(this.id, this.directionCode)});
    document.getElementById("list-for-destination-buttons").append(newButton)
  }
  //document.getElementById("list-for-destination-buttons").style.display = "block"

}

function startStopPicker(end, destination){

  if (document.getElementById("list-for-stop-buttons") !== null){
    stopsOnLine.length = 0;
    document.getElementById("list-for-stop-buttons").remove();
  }
  if (stopsOnLine.length !== 0){
    stopsOnLine.length = 0;
  }
  if (document.getElementById("results") !== null){
    document.getElementById("results").innerHTML = ""
    document.getElementById("results").innerHTML = ""
    document.getElementById("results1").innerHTML = ""
    document.getElementById("results2").innerHTML = ""
    document.getElementById("results3").innerHTML = ""
    document.getElementById("refresh").style.display = "none"
  }
  document.getElementById("stop-buttons").style.display = "block";
  direction = destination

  for(button of document.getElementsByClassName("destination-buttons")){
    button.style.backgroundColor = ""
  }
  document.getElementById(end).style.backgroundColor = "#960084"
  startLoadingAnimation();
  $('html, body').animate({scrollTop: $("#stop-buttons").offset().top -scrollOffset}, 500);
  grabLineDetails()
}

function renderStopButtons(){
  let buttonList = document.createElement("div")
  buttonList.id = "list-for-stop-buttons"
  document.getElementById("stop-buttons").append(buttonList)
  for (stop in stopsOnLine){
    newButton = document.createElement("button")
    newButton.stopCode = stopsOnLine[stop].code
    newButton.stopName = stopsOnLine[stop].name
    newButton.id = stopsOnLine[stop].name
    newButton.classList.add("stop-buttons")
    newButton.innerHTML = stopsOnLine[stop].name
    newButton.addEventListener("click", function(){startResults(this.stopCode, this.stopName)});
    document.getElementById("list-for-stop-buttons").append(newButton)
  }
}

function startResults(stopCode, stopName){
  for(button of document.getElementsByClassName("stop-buttons")){
    button.style.backgroundColor = ""
  }
  document.getElementById(stopName).style.backgroundColor = "#960084"
  document.getElementById("results").innerHTML = ""
  document.getElementById("results1").innerHTML = ""
  document.getElementById("results2").innerHTML = ""
  document.getElementById("results3").innerHTML = ""
  document.getElementById("refresh").style.display = "none"
  startLoadingAnimation()
  $('html, body').animate({scrollTop: $("#results-container").offset().top -scrollOffset}, 500);
  tpc = stopCode
  tpcName = stopName

  grabTimes()
}

function renderFavourites(){
  departures = getDepartures(departuresData)
  document.getElementById("results").innerHTML = modeOfTransport.toLowerCase() + " #" + routeNumber + " is leaving from " + tpcName + " at:"
  document.getElementById("results1").innerHTML = departures[0]
  document.getElementById("results2").innerHTML = departures[1]
  document.getElementById("results3").innerHTML = departures[2]
}

function renderResults(){
  departures = getDepartures(departuresData)
  document.getElementById("results").innerHTML = modeOfTransport.toLowerCase() + " #" + routeNumber + " is leaving from " + tpcName + " at:"
  document.getElementById("results1").innerHTML = departures[0]
  document.getElementById("results2").innerHTML = departures[1]
  document.getElementById("results3").innerHTML = departures[2]
  document.getElementById("refresh").style.display = "block"
  /*newButton = document.createElement("button")
  newButton.id = "refresh"
  newButton.classList.add("refresh-button")
  newButton.innerHTML = "new search"
  newButton.addEventListener("click", function(){window.location.reload()});
  document.getElementById("results-container").append(newButton)
  newButton = document.createElement("button")
  newButton.id = "cookie-setter"
  newButton.classList.add("cookie-button")
  newButton.innerHTML = "save route"
  newButton.addEventListener("click", function(){setFavourite()});
  document.getElementById("results-container").append(newButton)*/
}

function setFavourite(){
  document.cookie = "modeOfTransport=" + modeOfTransport + ";"
  document.cookie = "tpcName=" + tpcName + ";"
  document.cookie = "tpc=" + tpc + ";"
  document.cookie = "routeNumber=" + routeNumber +";"
  document.cookie = "direction=" + direction + ";"
}

function getFavourite(){

  if (getCookie("modeOfTransport") !== null){
    document.getElementById("transport-type-buttons").style.display = "none"
    startLoadingAnimation()
    modeOfTransport = getCookie("modeOfTransport")
    tpcName = getCookie("tpcName")
    tpc = getCookie("tpc")
    routeNumber = getCookie("routeNumber")
    direction = getCookie("direction")

    grabAllData()
    grabLineDetails()
    grabTimes()
  }
}

function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}

function getStops(data){
  newString = managingCompany + "_" + routeNumber + '_' + direction

  for (thing in data[newString].Network){
    chosenThing = thing;
    break
  }
  for (stop in data[newString].Network[chosenThing]){
    thisStop = {name: data[newString].Network[chosenThing][stop].TimingPointName, code: data[newString].Network[chosenThing][stop].TimingPointCode}
    stopsOnLine.push(thisStop)
  }
}



function getDestinations(data){
  let routeString1 = managingCompany + "_" + routeNumber + "_1"
  let routeString2 = managingCompany + "_" + routeNumber + "_2"
  let destinationOptions = [data[routeString1].DestinationName50, data[routeString2].DestinationName50]
  return destinationOptions

}


function getDepartures(data){
  upcomingDepartures = []
  for (pass in data[tpc].Passes){
    let departure = data[tpc].Passes[pass].TargetArrivalTime
    upcomingDepartures.push(departure)
  }
  sortedDepartures = upcomingDepartures.sort();
  sortedDepartures.length = 3
  let threeUpcomingDepartures = []
  for (pass of sortedDepartures){
    dateRemoved = pass.split("T")[1]
    let departure = dateRemoved.split(":")[0] + ":" + dateRemoved.split(":")[1]
    threeUpcomingDepartures.push(departure)
  }
  return threeUpcomingDepartures
}



function grabAllData() {
  const xhr = new XMLHttpRequest()
  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) return
    linesData = JSON.parse(xhr.response)
    stopLoadingAnimation();
    renderRoutes(determineRoutes(linesData))
  }
  requestLineString = OV_URL + "line/"
  xhr.open('GET', requestLineString)
  xhr.send()
}



function grabTimes() {
  const xhr = new XMLHttpRequest()
  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) return
    departuresData = JSON.parse(xhr.response)
    stopLoadingAnimation()
    renderResults()
  }
  requestTPCString = OV_URL + "tpc/" + tpc + "/departures"
  xhr.open('GET', requestTPCString)
  xhr.send()
}



function grabLineDetails() {
  const xhr = new XMLHttpRequest()

  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) return
    detailsData = JSON.parse(xhr.response)
    stopLoadingAnimation();
    getStops(detailsData)
    renderStopButtons()
  }
  requestRouteString = OV_URL + "line/" + managingCompany + "_" + routeNumber + '_' + direction
  xhr.open('GET', requestRouteString)
  xhr.send()
}


function init() {
  $('html, body').animate({scrollTop: $("#title").offset().top -260}, 500);
  //getFavourite()
}

init()








