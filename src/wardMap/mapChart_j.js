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
// import axios from "axios";
import { db } from "../firebase";
class MapChart extends React.Component {
  state = {
    data: [],
    // position:{
    coordinates: [72.8777, 19.089],
    zoom: 1,
    setData: false,
    // }
    parameter: 1,
  };

  componentDidMount() {
    const events = db.collection("pop_health");
    events.get().then((querySnapshot) => {
      const tempDoc = [];
      querySnapshot.forEach((doc) => {
        tempDoc.push(doc.data());
      });
      this.setState({ data: tempDoc, setData: true });
    });
  }

  render() {
    let param = {};
    switch (this.state.parameter) {
      case 1:
        param.domain = [100000, 1000000];
        param.attr = "Population";
        break;
      case 2:
        param.domain = [20, 300];
        param.attr = "Malaria";
        break;
      case 3:
        param.domain = [0, 150];
        param.attr = "Dengue";
        break;
      case 4:
        param.domain = [90, 500];
        param.attr = "Tuberculosis";
        break;
      case 5:
        param.domain = [100, 1000];
        // need to change color scheme range
        param.attr = "Diarrhoea";
        break;
      case 6:
        param.domain = [200, 1500];
        param.attr = "Diabetes";
        break;
      case 7:
        param.domain = [100, 1800];
        param.attr = "Hypertension";
        break;
      default:
        param.domain = [100000, 1000000];
        param.attr = "Population";
        break;
    }

    const switchParam = (val) => {
      this.setState({ parameter: val });
    };

    const geoUrl = "./mumbai_wards.json";

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

    const handleZoomIn = () => {
      if (this.state.zoom >= 4) {
        this.setState({ zoom: this.state.zoom * 2 });
      }
    };

    const handleZoomOut = () => {
      if (this.state.zoom <= 1) {
        this.setState({ zoom: this.state.zoom / 2 });
      }
    };

    const handleMoveEnd = () => {
      let zoom = this.state.zoom;
      this.setState({ zoom: zoom });
    };
    let setTooltipContent = this.props.setTooltipContent;

    return (
      <div>
        {this.state.setData ? (
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
                zoom={this.state.zoom}
                center={this.state.coordinates}
                onMoveEnd={handleMoveEnd}
              >
                <Geographies geography={geoUrl}>
                  {({ geographies }) => (
                    <>
                      {geographies.map((geo) => {
                        const cur = this.state.data.find(
                          (data) => data.Ward === geo.properties.name
                        );
                        console.log(cur);
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            onMouseEnter={() => {
                              setTooltipContent(
                                `${param.attr}: ${cur[param.attr]}`
                              );
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
                            fill={colorScale(cur ? cur[param.attr] : "#eee")}
                          />
                        );
                      })}
                      {geographies.map((geo) => {
                        const centroid = geoCentroid(geo);
                        const cur = this.state.data.find(
                          (data) => data.Ward === geo.properties.name
                        );

                        return (
                          <g key={geo.rsmKey}>
                            {
                              <Marker coordinates={centroid}>
                                <text y="2" fontSize={8} textAnchor="middle">
                                  {cur.Ward}
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
          </div>
        ) : (
          <span>Loading</span>
        )}
        <div>
          <input
            id="1"
            type="radio"
            name="parameter"
            onClick={() => switchParam(1)}
            checked={this.state.parameter === 1 ? true : false}
          />{" "}
          <label for="1">Population</label>
          <br />
          <input
            id="2"
            type="radio"
            name="parameter"
            onClick={() => switchParam(2)}
            checked={this.state.parameter === 2 ? true : false}
          />{" "}
          <label for="2">Malaria</label>
          <br />
          <input
            id="3"
            type="radio"
            name="parameter"
            onClick={() => switchParam(3)}
            checked={this.state.parameter === 3 ? true : false}
          />{" "}
          <label for="3">Dengue</label>
          <br />
          <input
            id="4"
            type="radio"
            name="parameter"
            onClick={() => switchParam(4)}
            checked={this.state.parameter === 4 ? true : false}
          />{" "}
          <label for="4">Tuberculosis</label>
          <br />
          <input
            id="5"
            type="radio"
            name="parameter"
            onClick={() => switchParam(5)}
            checked={this.state.parameter === 5 ? true : false}
          />{" "}
          <label for="5">Diarrhoea</label>
          <br />
          <input
            id="6"
            type="radio"
            name="parameter"
            onClick={() => switchParam(6)}
            checked={this.state.parameter === 6 ? true : false}
          />{" "}
          <label for="6">Diabetes</label>
          <br />
          <input
            id="7"
            type="radio"
            name="parameter"
            onClick={() => switchParam(7)}
            checked={this.state.parameter === 7 ? true : false}
          />{" "}
          <label for="7">Hypertension</label>
          <br />
        </div>
      </div>
    );
  }
}

export default MapChart;
