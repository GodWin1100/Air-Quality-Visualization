import React, { useState, useEffect } from "react";
import { 
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker } from "react-simple-maps";
import * as scale from "d3-scale";
import { csv } from "d3-fetch";
import { geoCentroid } from "d3-geo";

const geoUrl = "./mumbai_wards.json";

const colorScale = scale
  .scaleQuantize()
  .domain([100000, 1000000])
  .range([
    "#ffedea",
    "#ffcec5",
    "#ffad9f",
    "#ff8a75",
    "#ff5533",
    "#e2492d",
    "#be3d26",
    "#9a311f",
    "#782618",
  ]);

const MapChart = ({ setTooltipContent }) => {
  const [data, setData] = useState([]); //square brackets used to destructure array, curly brackets for objects
  //useState([]) is a React hook which returns the state variable eg:data and a function to update it eg:setData
  useEffect(() => {
    csv("/pop_health_2018.csv").then((mumbai_wards) => {
      setData(mumbai_wards);
    });
  }, []);
  
  // setting center for zoom 
  const [position, setPosition] = useState({ coordinates: [72.8777, 19.089], zoom: 1 });

  function handleZoomIn() {
    if (position.zoom >= 4) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom * 2 }));
  }

  function handleZoomOut() {
    if (position.zoom <= 1) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom / 2 }));
  }

  function handleMoveEnd(position) {
    setPosition(position);
  }

  return (
    <div>
      <ComposableMap
        data-tip=""
        projectionConfig={{
          center: [72.8777, 19.089], // Approximately the coordinates of Mumbai (slightly North)
          scale: 90000,
          translate: [1060 / 2, 310],
        }}
        width={1060}
        height={800}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) => (
              <>
              {geographies.map((geo) => {
                const cur = data.find((s) => s.Ward === geo.properties.name);
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => {
                    setTooltipContent(`Population: ${cur.Population}`);
                    }}
                    onMouseLeave={() => {
                      setTooltipContent("");
                    }}
                    style={{
                      hover: {
                        fill: "#459CAF",
                        outline: "none"
                      },
                    }}
                  fill={colorScale(cur ? cur.Population : "#eee")}
                  />
                );
              })}
              {geographies.map(geo => {
                const centroid = geoCentroid(geo);
                const cur = data.find((s) => s.Ward === geo.properties.name);
                
                return (
                  <g key={geo.rsmKey}>
                    {(
                        <Marker coordinates={centroid}>
                          <text y="2" fontSize={8} textAnchor="middle">
                            {cur.Ward}
                          </text>
                        </Marker>
                      )}
                    </g> 
                );
              })}
              </>
              )
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      <div className="controls">
        <button onClick={handleZoomIn}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="3"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button onClick={handleZoomOut}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="3"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    </div> 
  );
};

export default MapChart;
