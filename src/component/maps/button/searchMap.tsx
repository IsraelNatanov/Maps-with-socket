import React, { useRef, useEffect, useState } from "react";
import { Feature, Map as OlMap, View } from "ol";
import Vectors from "ol/source/Vector";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MenuIcon from "@mui/icons-material/Menu";
import "./search.css";

import { fromLonLat, toLonLat } from "ol/proj";
// import { faEllipsisV } from '@fortawesome/free-solid-svg-icons/faEllipsisV';
// import { faInfo } from '@fortawesome/free-solid-svg-icons/faInfo';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Button from "@mui/material/Button";

import Vector from "ol/layer/Vector";

type MapProps = {
  setMap: React.Dispatch<React.SetStateAction<OlMap | null>>;
  map: OlMap | null;
};
const SearchMap: React.FC<MapProps> = ({ map }) => {
 

  function searchByName(name: string) {
    const layers = map!.getLayers().getArray();

    // Iterate through each layer
    layers.forEach(function (layer) {
      // Check if the layer is a vector layer
      if (layer instanceof Vector) {
        // Get the source of the vector layer
        const source = layer.getSource();

        // Get all features in the source
        const features = source.getFeatures();

        // Iterate through each feature
        features.forEach(function (feature: { getProperties: () => any }) {
          // Access the feature's properties
          const properties = feature.getProperties().name;
          // Log the properties to the console or perform any desired actions
          console.log(properties);
          if (
            properties.toLowerCase() === name.toLowerCase() ||
            properties === name.toLowerCase() ||
            properties.toLowerCase() === name
          ) {
            console.log(feature.getProperties());

            const point = feature.getProperties().geometry.flatCoordinates;
            let lonLat = toLonLat(point);
            console.log(lonLat);
            map!.setView(
              new View({
                projection: "EPSG:3857",
                center: fromLonLat(lonLat),
                zoom: 18,
              })
            );
          }
        });
      }
    });
  }

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="container">
      <div className="search-box">
        <Button
          className="iconsButton"
          variant="text"
          sx={{ color: "inherit", minWidth:70, minHeight:70}}
        >
          <ArrowDropDownIcon/>
          <MenuIcon  />
        </Button>

        <input
          ref={inputRef}
          type="text"
          className="form-control"
          placeholder="חיפוש אתר/גיזרה"
          name="q"
        />

        <button
          type="submit"
          className="button"
          onClick={() => searchByName(inputRef.current!.value)}
        >
          <img src="src/images/icons-search.png" />
        </button>
      </div>
    </div>
  );
};

export default SearchMap;
