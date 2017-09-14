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
  document.getElementById("loading").style.display = 'block';
}

function stopLoadingAnimation(){
  document.getElementById("loading").style.display = 'none';
}

function travelType(type){
  modeOfTransport = type;
  //document.getElementById("transport-type-buttons").style.display = "none";
  startRoutePicker();
}

function startRoutePicker(){
  document.getElementById("route-buttons").style.display = "block";
  startLoadingAnimation()
  grabAllData();
  $('html, body').animate({scrollTop: $("#route-buttons").offset().top +5}, 500);
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
  }
  let buttonList = document.createElement("div")
  buttonList.id = "list-for-route-buttons"
  //buttonList.style.display = "flex"
  //buttonList.style.number = 4
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
  }

  document.getElementById("destination-buttons").style.display = "block";
  $('html, body').animate({scrollTop: $("#destination-buttons").offset().top +5}, 500);

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
    i++;
    newButton.addEventListener("click", function(){startStopPicker(this.id, this.directionCode)});
    document.getElementById("list-for-destination-buttons").append(newButton)
  }

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
  }
  //console.log(document.getElementById("stop-buttons"))
  document.getElementById("stop-buttons").style.display = "block";
  direction = destination
  startLoadingAnimation();
  $('html, body').animate({scrollTop: $("#stop-buttons").offset().top +5}, 500);
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
    newButton.classList.add("stop-buttons")
    newButton.innerHTML = stopsOnLine[stop].name
    newButton.addEventListener("click", function(){startResults(this.stopCode, this.stopName)});
    document.getElementById("list-for-stop-buttons").append(newButton)
  }
}

function startResults(stopCode, stopName){
  startLoadingAnimation()
  $('html, body').animate({scrollTop: $("#results-container").offset().top +5}, 500);
  tpc = stopCode
  tpcName = stopName

  grabTimes()
}

function renderResults(){
  departures = getDepartures(departuresData)
  document.getElementById("results").innerHTML = modeOfTransport.toLowerCase() + " #" + routeNumber + " is leaving from " + tpcName + " at " + departures[0] + ", " + departures[1] + ", and " + departures[2]
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
  /*upcomingDepartures = []
  for (pass in data[tpc].Passes){
    let departure = data[tpc].Passes[pass].TargetArrivalTime.split("T")[1]
    let departureMinuteLevel = departure.split(":")[0] + ":" + departure.split(":")[1]
    upcomingDepartures.push(departureMinuteLevel)
  }
  upcomingDepartures.length = 3
  sortedDepartures = upcomingDepartures.sort();
  return sortedDepartures*/

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
  $('html, body').animate({scrollTop: $("#title").offset().top -10}, 500);
  //renderRoutes()
  //grabLineDetails()
  //grabTimes()

}

init()








