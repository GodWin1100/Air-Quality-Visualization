import React, { Component } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import * as d3 from "d3";
// url to a valid topojson file
const geoUrl = "./mumbai_wards.json";

const wardMap = () => {
  return (
    <div>
      <ComposableMap
        projectionConfig={{
          center: [72.8777, 19.089], // Approximately the coordinates of Mumbai (slightly North)
          scale: 90000,
          translate: [1060 / 2, 310],
        }}
        width={1060}
        height={800}
        // style={{
        //   color: "black",
        // }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography key={geo.rsmKey} geography={geo} />
            ))
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
};

export default wardMap;
