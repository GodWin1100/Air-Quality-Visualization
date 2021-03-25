import React, { useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from "react-simple-maps";
import * as scale from "d3-scale";
import { csv } from "d3-fetch";
import { geoCentroid } from "d3-geo";
import { db } from "../firebase";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LabelList,
} from "recharts";

const geoUrl = "./mumbai_wards.json";

const MapChart = ({ setTooltipContent }) => {
  const [choice, setchoice] = useState("social_demo");
  const [data, setData] = useState([]); //square brackets used to destructure array, curly brackets for objects
  //useState([]) is a React hook which returns the state variable eg:data and a function to update it eg:setData
  const switchParam = (e) => {
    loadContent(e.target.name, e.target.value);
  };

  const loadContent = (name, value) => {
    console.log(name);
    if (value !== "") {
      const events = db.collection("wards");

      events.get().then((querySnapshot) => {
        const tempDoc = [];

        querySnapshot.forEach((doc) => {
          let events1 = null;
          if (name === "air_quality") {
            events1 = events.doc(doc.id).collection("data").doc(name);
          } else {
            events1 = events
              .doc(doc.id)
              .collection("data")
              .doc(name)
              .collection("year")
              .doc(value);
          }
          events1.get().then((i) => {
            tempDoc.push(i.data());
          });
        });
        setData(tempDoc);
        settingValues(name);
      });
    }
  };

  const settingValues = (name) => {
    setchoice(name);
  };

  useEffect(() => {
    async function anyNameFunction() {
      await loadContent("social_demo", "2011");
    }
    // Execute the created function directly
    anyNameFunction();
  }, []);

  // setting center for zoom
  const [position, setPosition] = useState({
    coordinates: [72.8777, 19.089],
    zoom: 1,
  });

  function handleZoomIn() {
    if (position.zoom >= 4) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 2 }));
  }

  function handleZoomOut() {
    if (position.zoom <= 1) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 2 }));
  }

  function handleMoveEnd(position) {
    setPosition(position);
  }
  let param = {};
  switch (choice) {
    case "social_demo":
      param.domain = [100000, 1000000];
      param.attr = "population";
      break;
    case "health":
      param.domain = [20, 100];
      param.attr = "malaria";
      break;
    case "air_quality":
      param.domain = [100, 250];
      param.attr = "AQI";
      break;
  }
  const colorScale = scale
    .scaleQuantize()
    .domain(param.domain)
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

  const card = (data) => (
    <div>
      <h2>Ward: {data.ward}</h2>
      <h4>Population: {data.population}</h4>
      <h4>Sex Ratio: {data.sex_ratio}</h4>
      <h4>Literacy: {data.literacy}</h4>
      <h4>Literacy Female: {data.literacy_female}</h4>
      <h4>Literacy Male: {data.literacy_male}</h4>
      <h4>Work Participation Female: {data.work_participation_female}</h4>
      <h4>Work Participation Male: {data.work_participation_male}</h4>
      <h4>Scheduled Caste: {data.scheduled_caste}</h4>
      <h4>Scheduled Tribe: {data.scheduled_tribe}</h4>
    </div>
  );

  return (
    <div style={{ border: "2px black solid" }}>
      {data ? (
        <>
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
                      const cur = data.find(
                        (data) => data.ward === geo.properties.name
                      );
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onMouseEnter={() => {
                            if (choice === "social_demo") {
                              setTooltipContent("Loading");
                              if (cur) {
                                setTooltipContent(card(cur));
                              }
                            } else if (choice === "air_quality") {
                              setTooltipContent("Loading");
                              if (cur) {
                                let bar = [];
                                bar.push(cur);
                                setTooltipContent(
                                  <div style={{ textAlign: "center" }}>
                                    <h2>Ward: {cur?.ward}</h2>
                                    <h3>AQI: {cur?.AQI}</h3>
                                    <BarChart
                                      width={500}
                                      height={400}
                                      data={bar}
                                    >
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="ward" fontSize="16px" />
                                      <YAxis />
                                      <Legend />
                                      <Bar dataKey="NO2" fill="#f00">
                                        <LabelList
                                          fill="#fff"
                                          datakey="ward"
                                          content={cur.NO2}
                                          fontWeight="bold"
                                          strokeWidth=".5px"
                                          stroke="black"
                                        />
                                      </Bar>
                                      <Bar dataKey="O3" fill="darkgreen">
                                        <LabelList
                                          fill="#fff"
                                          datakey="ward"
                                          content={cur.O3}
                                          fontWeight="bold"
                                          strokeWidth=".3px"
                                          fontSize="16px"
                                          stroke="black"
                                        />
                                      </Bar>
                                      <Bar dataKey="PM2.5" fill="#00f">
                                        <LabelList
                                          fill="#fff"
                                          datakey="ward"
                                          content={cur["PM2.5"]}
                                          fontWeight="bold"
                                          strokeWidth=".3px"
                                          fontSize="16px"
                                          stroke="black"
                                        />
                                      </Bar>
                                      <Bar dataKey="PM10" fill="purple">
                                        <LabelList
                                          fill="#fff"
                                          datakey="ward"
                                          content={cur.PM10}
                                          fontWeight="bold"
                                          strokeWidth=".3px"
                                          fontSize="16px"
                                          stroke="black"
                                        />
                                      </Bar>
                                      <Bar dataKey="SO2" fill="orange">
                                        <LabelList
                                          fill="#fff"
                                          datakey="ward"
                                          content={cur.SO2}
                                          fontWeight="bold"
                                          strokeWidth=".3px"
                                          fontSize="16px"
                                          stroke="black"
                                        />
                                      </Bar>
                                    </BarChart>
                                  </div>
                                );
                              }
                            } else if (choice === "health") {
                              setTooltipContent("Loading");
                              if (cur) {
                                let bar = [];
                                bar.push(cur);
                                setTooltipContent(
                                  <BarChart width={500} height={400} data={bar}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="ward" fontSize="16px" />
                                    <YAxis />
                                    <Legend />
                                    <Bar dataKey="dengue" fill="#f00">
                                      <LabelList
                                        fill="#fff"
                                        datakey="ward"
                                        content={cur.dengue}
                                        fontWeight="bold"
                                        strokeWidth=".5px"
                                        stroke="black"
                                      />
                                    </Bar>
                                    <Bar dataKey="diabetes" fill="darkgreen">
                                      <LabelList
                                        fill="#fff"
                                        datakey="ward"
                                        content={cur.diabetes}
                                        fontWeight="bold"
                                        strokeWidth=".3px"
                                        fontSize="16px"
                                        stroke="black"
                                      />
                                    </Bar>
                                    <Bar dataKey="hypertension" fill="#00f">
                                      <LabelList
                                        fill="#fff"
                                        datakey="ward"
                                        content={cur.hypertension}
                                        fontWeight="bold"
                                        strokeWidth=".3px"
                                        fontSize="16px"
                                        stroke="black"
                                      />
                                    </Bar>
                                    <Bar dataKey="malaria" fill="purple">
                                      <LabelList
                                        fill="#fff"
                                        datakey="ward"
                                        content={cur.malaria}
                                        fontWeight="bold"
                                        strokeWidth=".3px"
                                        fontSize="16px"
                                        stroke="black"
                                      />
                                    </Bar>
                                    <Bar dataKey="tuberculosis" fill="orange">
                                      <LabelList
                                        fill="#fff"
                                        datakey="ward"
                                        content={cur.tuberculosis}
                                        fontWeight="bold"
                                        strokeWidth=".3px"
                                        fontSize="16px"
                                        stroke="black"
                                      />
                                    </Bar>
                                    <Bar dataKey="diarrhoea" fill="#f0f">
                                      <LabelList
                                        fill="#fff"
                                        datakey="ward"
                                        content={cur.diarrhoea}
                                        fontWeight="bold"
                                        strokeWidth=".3px"
                                        fontSize="16px"
                                        stroke="black"
                                      />
                                    </Bar>
                                  </BarChart>
                                );
                              }
                            }
                          }}
                          onMouseLeave={() => {
                            setTooltipContent("");
                          }}
                          style={{
                            hover: {
                              fill: "#459CAF",
                              outline: "none",
                            },
                          }}
                          fill={
                            choice !== "health"
                              ? colorScale(cur ? cur[param.attr] : "#eee")
                              : "#aaa"
                          }
                        />
                      );
                    })}
                    {geographies.map((geo) => {
                      const centroid = geoCentroid(geo);
                      const cur = data.find(
                        (data) => data.ward === geo.properties.name
                      );
                      return (
                        <g key={geo.rsmKey}>
                          {
                            <Marker coordinates={centroid}>
                              <text
                                y="2"
                                fontSize={8}
                                textAnchor="middle"
                                style={{ userSelect: "none" }}
                              >
                                {cur?.ward}
                              </text>
                            </Marker>
                          }
                        </g>
                      );
                    })}
                  </>
                )}
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
          <div>
            <select
              id="1"
              name="social_demo"
              onChange={(e) => switchParam(e)}
              // checked={choice === 1 ? true : false}
            >
              <option defaultValue="">Select</option>
              <option value="2011">2011</option>
            </select>
            <label for="1">Social Demo</label>
            <br />
            <select
              id="2"
              name="health"
              onChange={(e) => switchParam(e)}
              // checked={choice === 2 ? true : false}
            >
              <option defaultValue="">Select</option>

              <option value="2014">2014</option>
              <option value="2015">2015</option>
            </select>

            <label for="2">Health</label>
            <br />
            <input
              id="3"
              type="button"
              name="air_quality"
              onClick={(e) => switchParam(e)}
              value="Air Quality"
            />
            {/* <label for="3">Air Quality</label> */}
            <br />
            {/* <input
              id="4"
              type="radio"
              name="parameter"
              onClick={() => switchParam(4)}
              checked={choice === 4 ? true : false}
            />{" "}
            <label for="4">Tuberculosis</label>
            <br />
            <input
              id="5"
              type="radio"
              name="parameter"
              onClick={() => switchParam(5)}
              checked={choice === 5 ? true : false}
            />{" "}
            <label for="5">Diarrhoea</label>
            <br />
            <input
              id="6"
              type="radio"
              name="parameter"
              onClick={() => switchParam(6)}
              checked={choice === 6 ? true : false}
            />{" "}
            <label for="6">Diabetes</label>
            <br />
            <input
              id="7"
              type="radio"
              name="parameter"
              onClick={() => switchParam(7)}
              checked={choice === 7 ? true : false}
            />{" "}
            <label for="7">Hypertension</label>
            <br /> */}
          </div>
        </>
      ) : (
        <h2>Loading</h2>
      )}
    </div>
  );
};

export default MapChart;
