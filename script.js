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

function startLoadingAnimation(){
  console.log('start animation')
  document.getElementById("loading").style.display = 'block';
}

function stopLoadingAnimation(){
  console.log('stop animation')
  document.getElementById("loading").style.display = 'none';
}

function travelType(type){
  modeOfTransport = type;
  //document.getElementById("transport-type-buttons").style.display = "none";
  startRoutePicker();
}

async function startRoutePicker(){
  startLoadingAnimation()
  grabAllData();
}


function determineRoutes(data) {
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
  let buttonList = document.createElement("ul")
  buttonList.id = "list-for-buttons"
  document.getElementById("route-buttons").append(buttonList)
  for(route of routes){
    newButton = document.createElement("button")
    newButton.id = route
    newButton.class = "route-buttons"
    newButton.innerHTML = route
    newButton.addEventListener("click", function(){startDestinationPicker(this.id)});
    document.getElementById("list-for-buttons").append(newButton)
  }
}

function startDestinationPicker(route){
  routeNumber = route
  let buttonList = document.createElement("ul")
  buttonList.id = "list-for-destination-buttons"
  document.getElementById("destination-buttons").append(buttonList)
  destinations = getDestinations(linesData)
  let i = 1;
  for (end of destinations){
    newButton = document.createElement("button")
    newButton.id = end
    newButton.class = "destination-buttons"
    newButton.innerHTML = end
    newButton.directionCode = i;
    i++;
    newButton.addEventListener("click", function(){startStopPicker(this.id, this.directionCode)});
    document.getElementById("list-for-destination-buttons").append(newButton)
  }
}

function startStopPicker(end, destination){

  direction = destination
  startLoadingAnimation();
  grabLineDetails()
}

function renderStopButtons(){
  let buttonList = document.createElement("ul")
  buttonList.id = "list-for-stop-buttons"
  document.getElementById("stop-buttons").append(buttonList)
  for (stop in stopsOnLine){
    newButton = document.createElement("button")
    newButton.stopCode = stopsOnLine[stop].code
    newButton.stopName = stopsOnLine[stop].name
    newButton.class = "stop-buttons"
    newButton.innerHTML = stopsOnLine[stop].name
    newButton.addEventListener("click", function(){startResults(this.stopCode, this.stopName)});
    document.getElementById("list-for-stop-buttons").append(newButton)
  }
}

function startResults(stopCode, stopName){
  tpc = stopCode
  tpcName = stopName
  startLoadingAnimation()
  grabTimes()
}

function renderResults(){
  departures = getDepartures(departuresData)
  document.getElementById("results").innerHTML = "The next 3 departures for line #" + routeNumber + " are at " + departures[0] + ", " + departures[1] + ", and " + departures[2]
}

function getStops(data){
  newString = managingCompany + "_" + routeNumber + '_' + direction
  //console.log(data[newString].Network)

  for (thing in data[newString].Network){
    //console.log(thing)
    chosenThing = thing;
    break
  }
  for (stop in data[newString].Network[chosenThing]){
    //console.log(data[newString].Network[chosenThing][stop].TimingPointName + data[newString].Network[chosenThing][stop].TimingPointCode)
    thisStop = {name: data[newString].Network[chosenThing][stop].TimingPointName, code: data[newString].Network[chosenThing][stop].TimingPointCode}
    stopsOnLine.push(thisStop)
  }
  //console.log(stopsOnLine)
  //return stopsOnLine
}



function getDestinations(data){
  let routeString1 = managingCompany + "_" + routeNumber + "_1"
  let routeString2 = managingCompany + "_" + routeNumber + "_2"
  let destinationOptions = [data[routeString1].DestinationName50, data[routeString2].DestinationName50]
  //console.log(destinationOptions)
  return destinationOptions

}


function getDepartures(data){
  //console.log(data)
  upcomingDepartures = []
  for (pass in data[tpc].Passes){
    let departure = data[tpc].Passes[pass].TargetArrivalTime.split("T")[1]
    let departureMinuteLevel = departure.split(":")[0] + ":" + departure.split(":")[1]
    upcomingDepartures.push(departureMinuteLevel)
  }
  sortedDepartures = upcomingDepartures.sort()
  sortedDepartures.length = 3
  return sortedDepartures
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

  //renderRoutes()
  //grabLineDetails()
  //grabTimes()

}

init()

/*
let typeButtons = document.getElementsByClassName("type-buttons")
for (button of typeButtons){
  button.addEventListener("click", function(){travelType("BUS")})
}*/





