import React, { useRef, useEffect, useState } from "react";
import { Feature, Map as OlMap, View } from "ol";
import Vectors from "ol/source/Vector";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MenuIcon from "@mui/icons-material/Menu";
import "./search.css";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import rtlPlugin from "stylis-plugin-rtl";
import { prefixer } from 'stylis';
import { CacheProvider } from '@emotion/react';
import createCache from "@emotion/cache";
import { fromLonLat, toLonLat } from "ol/proj";
// import { faEllipsisV } from '@fortawesome/free-solid-svg-icons/faEllipsisV';
// import { faInfo } from '@fortawesome/free-solid-svg-icons/faInfo';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Button from "@mui/material/Button";

import Vector from "ol/layer/Vector";

type MapProps = {
  setMap: React.Dispatch<React.SetStateAction<OlMap | null>>;
  map: OlMap | null;
  options: Options[];
};

interface Options {
    label: string;
    id: number;
};

const theme = createTheme({
    direction: 'rtl', // Both here and <body dir="rtl">
  });
  // Create rtl cache
  const cacheRtl = createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
  });

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

const SearchGeomtry: React.FC<MapProps> = ({ map, options }) => {
    
   
    useEffect(()=>{
    
        console.log(options);
        
    },[])
    

    
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
    

  return (
    <div>
   <CacheProvider value={cacheRtl}>
   
   <ThemeProvider theme={theme}>
   <div dir="rtl">
   <Autocomplete
      disablePortal
      id="combo-box-demo"
      
      options={options}
      autoHighlight
      getOptionLabel={(option) => option.label}
      sx={{ width: 200 }}
      onChange={async (event, value) => {
        searchByName(value!.label)
     
      }}
      renderInput={(params) => <TextField {...params} label="חפש" />}
    />
          </div>
        </ThemeProvider>
       </CacheProvider>
    </div>
  );
}
export default SearchGeomtry