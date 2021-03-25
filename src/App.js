// import React from "react";
// import ReactDOM from "react-dom";
// import {
//   ComposableMap,
//   Geographies,
//   Geography,
//   ZoomableGroup,
// } from "react-simple-maps";
// import * as d3 from "d3";
// // url to a valid topojson file
// const geoUrl = "./mumbai_wards.json";
import React, { useState } from "react";
import ReactTooltip from "react-tooltip";
import MapChart from "./wardMap/mapChartSeq";
import WardMap from "./wardMap/wardMap";

const App = () => {
  //   var featureCollection = topojson.feature(topology, topology.objects.governorates);
  // var bounds = d3.geo.bounds(featureCollection);
  // var centerX = d3.sum(bounds, function(d) {return d[0];}) / 2,
  //     var centerY = d3.sum(bounds, function(d) {return d[1];}) / 2;
  const [content, setContent] = useState("");
  return (
    <div>
      <MapChart setTooltipContent={setContent} />
      <ReactTooltip>{content}</ReactTooltip>
    </div>
  );
};

export default App;
