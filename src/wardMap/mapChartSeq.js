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
import "./../App.css";
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
  const [choice, setchoice] = useState("air_quality");
  const [data, setData] = useState([]);
  const [socialDemo, setsocialDemo] = useState([]);
  const [health, sethealth] = useState([]);
  const [layer, setLayer] = useState([]);
  //square brackets used to destructure array, curly brackets for objects
  //useState([]) is a React hook which returns the state variable eg:data and a function to update it eg:setData
  const switchParam = (e) => {
    loadContent(e.target.name, e.target.value);
  };

  const loadContent = (name, value) => {
    // console.log(name);
    if (value !== "") {
      const docs = [];

      const events = db.collection("wards");
      events
        .doc("2q0Z3Lumg7zlyEIvj9kK")
        .collection("data")
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            if (
              doc.id === "air_quality" ||
              doc.id === "social_demo" ||
              doc.id === "health"
            ) {
              docs.push();
            } else {
              docs.push(doc.id);
            }
          });
        });

      events.get().then((querySnapshot) => {
        const tempDoc = [];

        querySnapshot.forEach((doc) => {
          let events1 = null;
          //  events.doc(doc.id).collection("data").get().then((snapshot)=>)

          if (name === "social_demo" || name === "health") {
            events1 = events
              .doc(doc.id)
              .collection("data")
              .doc(name)
              .collection("year")
              .doc(value);
          } else {
            events1 = events.doc(doc.id).collection("data").doc(name);

            events
              .doc(doc.id)
              .collection("data")
              .doc("social_demo")
              .collection("year")
              .get()
              .then((querySnapshot) => {
                let socialdemo = [];
                querySnapshot.forEach((doc) => {
                  socialdemo.push(doc.id);
                  // setsocialDemo(socialDemo.push(doc.id));
                });
                if (socialDemo !== socialdemo) {
                  setsocialDemo(socialdemo);
                }
              });

            events
              .doc(doc.id)
              .collection("data")
              .doc("health")
              .collection("year")
              .get()
              .then((querySnapshot) => {
                let Health = [];

                querySnapshot.forEach((doc) => {
                  // sethealth(health.push(doc.id));
                  Health.push(doc.id);
                });
                if (health !== Health) {
                  sethealth(Health);
                }
              });
          }
          events1.get().then((i) => {
            tempDoc.push(i.data());
          });
        });
        setData(tempDoc);
        settingValues(name);
        // console.log(docs.length);

        // docs.filter((key) => {
        //   console.log(key);
        //   return (
        //     key === "air_quality" || key === "social_demo" || key === "health"
        //   );
        // });
        if (docs !== layer || docs !== []) {
          setLayer(docs);
        }
        // }
      });
    }
  };

  const settingValues = (name) => {
    setchoice(name);
  };

  useEffect(() => {
    async function anyNameFunction() {
      await loadContent("air_quality", "Air Quality");
    }
    // Execute the created function directly
    anyNameFunction();
  }, []);

  // setting center for zoom
  const [position, setPosition] = useState({
    coordinates: [72.8777, 19.089],
    // zoom: 1,
  });

  const [zoom, setzoom] = useState(1);
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
    default:
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

  const card = (bar) => {
    let data = [];
    data = { ...bar[0] };

    // console.log(Object.keys(data));

    return (
      <div>
        <h2>Ward:{data["ward"]}</h2>
        {
          Object.keys(data)
            .sort()
            .map((key, i) => {
              return key !== "ward" ? (
                <h4>
                  {key.toUpperCase()}:{data[key]}
                </h4>
              ) : null;
            })
          // <h2>Ward: {data.ward}</h2>
          // <h4>Population: {data.population}</h4>
          // <h4>Sex Ratio: {data.sex_ratio}</h4>
          // <h4>Literacy: {data.literacy}</h4>
          // <h4>Literacy Female: {data.literacy_female}</h4>
          // <h4>Literacy Male: {data.literacy_male}</h4>
          // <h4>Work Participation Female: {data.work_participation_female}</h4>
          // <h4>Work Participation Male: {data.work_participation_male}</h4>
          // <h4>Scheduled Caste: {data.scheduled_caste}</h4>
          // <h4>Scheduled Tribe: {data.scheduled_tribe}</h4>
        }
      </div>
    );
  };

  const colour = ["#ff6600", "#ff66ff", "#00ffff", "#ffcccc", "#ffff00", "#ffffff","#00ccff","#66ff66"];
  return (
    <div style={{ border: "2px black solid" }}>
      {data ? (
        <>
          <div
            style={{
              padding: "5px 10px",
              position: "fixed",
              top: "40%",
              backgroundColor: "#eee8",
              border: "1px solid black",
            }}
          >
            <h4 style={{ margin: "5px" }}>Zoom: {zoom}x</h4>
            <input
              type="range"
              max={3}
              min={0.5}
              step={0.5}
              value={zoom}
              onChange={(e) => {
                setzoom(+e.target.value);
              }}
            />
            {/*
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
              <br />
             
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
              </button> */}
          </div>
          <div
            style={{
              position: "fixed",
              backgroundColor: "#aaab",
              top: 0,
              left: 0,
              borderBottom: "1px solid #222",
              padding: ".5em",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-evenly",
                alignItems: "center",
              }}
            >
              <div className="Holder">
                <label for="1">Social Demo</label>
                <select
                  id="1"
                  name="social_demo"
                  onChange={(e) => switchParam(e)}
                  onClick={(e) => switchParam(e)}
                  // checked={choice === 1 ? true : false}
                >
                  <option defaultValue="" disabled>
                    Select
                  </option>
                  {/* <option value="2011">2011</option> */}
                  {socialDemo !== []
                    ? socialDemo.map((e) => {
                        return <option value={e}>{e}</option>;
                      })
                    : null}
                </select>
              </div>
              <div className="Holder">
                <label for="2">Health</label>
                <select
                  id="2"
                  name="health"
                  onChange={(e) => switchParam(e)}
                  // checked={choice === 2 ? true : false}
                >
                  <option defaultValue="" disabled>
                    Select
                  </option>
                  {health !== []
                    ? health.map((e) => {
                        return <option value={e}>{e}</option>;
                      })
                    : null}

                  {/* <option value="2014">2014</option>
              <option value="2015">2015</option> */}
                  {/* {
                  if()
                } */}
                </select>
              </div>
              <input
                style={{
                  fontSize: "1em",
                  fontWeight: "bold",
                  backgroundColor: "#3399ff",
                  borderRadius: "10px",
                  border: "1px solid black",
                  padding: ".6em 1em",
                  color:"white"
                }}
                id="3"
                type="button"
                name="air_quality"
                onClick={(e) => switchParam(e)}
                value="Air Quality"
              />
              {layer !== []
                ? layer.map((key, i) => {
                    return (
                      <input
                        key={key + i}
                        value={key.toUpperCase()}
                        name={key}
                        type="button"
                        style={{
                          fontSize: "1em",
                          fontWeight: "bold",
                          backgroundColor: "#3399ff",
                          borderRadius: "10px",
                          border: "1px solid black",
                          padding: ".6em 1em",
                          color:"white"
                        }}
                        onClick={(e) => switchParam(e)}
                      />
                    );
                  })
                : null}
            </div>
            <hr />
            <h2
              style={{
                margin: 0,
                padding: 0,
                textAlign: "center",
                textTransform: "uppercase",
              }}
            >
              {choice}
            </h2>
          </div>
          <ComposableMap
            data-tip=""
            projectionConfig={{
              center: [72.8777, 19.089], // Approximately the coordinates of Mumbai (slightly North)
              scale: 90000,
              translate: [1060 / 2, 310],
            }}
            width={1060}
            height={800}
            style={{ border: "1px solid black" }}
          >
            <ZoomableGroup
              zoom={zoom}
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
                            // console.log(health, socialDemo);

                            // if (choice === "social_demo") {
                            //   setTooltipContent("Loading");
                            //   if (cur) {
                            //     let bar = [];
                            //     bar.push(cur);
                            //     setTooltipContent(card(bar));
                            //   }
                            // }
                            if (choice === "air_quality") {
                              setTooltipContent("Loading");
                              if (cur) {
                                let bar = [];
                                bar.push(cur);
                                let Bart = { ...bar[0] };
                                // console.log(Bart);

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
                                      {Object.keys(Bart)
                                        .sort()
                                        .map((key, i) => {
                                          return (
                                            <Bar dataKey={key} fill={colour[i]}>
                                              <LabelList
                                                fill="#fff"
                                                datakey="ward"
                                                content={Bart[key]}
                                                fontWeight="bold"
                                                strokeWidth=".5px"
                                                stroke="black"
                                              />
                                            </Bar>
                                          );
                                        })}
                                      {/* <Bar dataKey="O3" fill="darkgreen">
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
                                      </Bar> */}
                                    </BarChart>
                                  </div>
                                );
                              }
                            } else if (choice === "health") {
                              setTooltipContent("Loading");
                              if (cur) {
                                let bar = [];
                                bar.push(cur);
                                let Bart = { ...bar[0] };
                                // console.log(Bart);
                                setTooltipContent(
                                  <BarChart width={500} height={400} data={bar}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="ward" fontSize="16px" />
                                    <YAxis />
                                    <Legend />
                                    {Object.keys(Bart)
                                      .sort()
                                      .map((key, i) => {
                                        return (
                                          <Bar dataKey={key} fill={colour[i]}>
                                            <LabelList
                                              fill="#fff"
                                              datakey="ward"
                                              content={Bart[key]}
                                              fontWeight="bold"
                                              strokeWidth=".3px"
                                              stroke="black"
                                            />
                                          </Bar>
                                        );
                                      })}
                                    {/* <Bar dataKey="diabetes" fill="darkgreen">
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
                                    </Bar> */}
                                  </BarChart>
                                );
                              }
                            } else {
                              setTooltipContent("Loading");
                              if (cur) {
                                let bar = [];
                                bar.push(cur);
                                setTooltipContent(card(bar));
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
                            choice === "air_quality" || choice === "social_demo"
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
        </>
      ) : (
        <h2>Loading</h2>
      )}
    </div>
  );
};

export default MapChart;
