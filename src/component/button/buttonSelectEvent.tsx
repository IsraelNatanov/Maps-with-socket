import React, { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField/TextField";
import { Feature, Map as OlMap } from 'ol';
import createCache from "@emotion/cache";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import rtlPlugin from "stylis-plugin-rtl";
import { prefixer } from "stylis";
import Button from "@mui/material/Button";
import { useAppSelector } from "../../../store/hooks";
import { Features } from "../../../typs/featuresType";
import { styleButton, styleFunction } from "../../../style/styleFunction";
import Vector from "ol/layer/Vector";
import Vectors from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { useRef } from "react";
import { Geometry } from "ol/geom";
import eventIconNot from "../../../images/eventIconNot.png";
import eventIcon from "../../../images/eventIcon.png";
import { CacheProvider } from "@emotion/react";


interface Iprops {
  isEvent: boolean;
  setIsEvent: React.Dispatch<React.SetStateAction<boolean>>;
}

type MapProps = {
 
  map:OlMap | null

};

const format = new GeoJSON({ featureProjection: "EPSG:3857" });

export default function ButtonSelectEvent({ map}: MapProps) {
  const [isEvent, setIsEvent] = useState<boolean>(false);

  const featureIndexRef = useRef<Vector<Vectors<Geometry>> | null>(null);
  const eventSourceRef = useRef <Vectors<Geometry> | null>(null);
  const featuresOfStore = useAppSelector((state) => state.feature.features);
  console.log(featuresOfStore);

  const theme = createTheme({
    direction: "rtl", // Both here and <body dir="rtl">
  });
  // Create rtl cache
  const cacheRtl = createCache({
    key: "muirtl",
    stylisPlugins: [prefixer, rtlPlugin],
  });

  const removEvent = () => {
    map!.removeLayer(featureIndexRef.current!);
    return;
  };


  let eventSource = new Vectors();
  let featureOfIndex: Feature[] | null = null;

  let featureIndex = new Vector({
    source: eventSource,
    style: styleFunction,
  });

  const playEvent = async (index: number) => {
    if (index == null) {
      map!.removeLayer(featureIndexRef.current!);
      return;
    }
    map!.removeLayer( featureIndexRef.current!);

    eventSourceRef.current?.clear();

    featureOfIndex = format.readFeatures(featuresOfStore[index]);
    featureIndexRef.current = featureIndex
    eventSource.addFeatures(featureOfIndex);


    if (index >= 0) {
      map!.addLayer(featureIndex);

    }
    eventSourceRef.current = eventSource
  };
  const displayEvent = () => {
    if(isEvent){
      removEvent();
    }
    setIsEvent(!isEvent);
  };
  return (
    <div dir="rtl" className="text-alin">
       <Button style={styleButton} variant="text" onClick={displayEvent}>
            {isEvent ? (
              <>
                הסתר אירועים
                <img src={eventIconNot} alt="not event" />
              </>
            ) : (
              <>
                הצג אירועים
                <img src={eventIcon} alt="event" />
              </>
            )}
          </Button>
          {isEvent&& 
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <Autocomplete 
        
      id="combo-box-demo"
          disablePortal
          size="medium"
          

    
          options={featuresOfStore}

          sx={{ width: 130, marginRight:2}}
          onChange={async (event, value) => {
            if (value == null) {
              removEvent();
            } else {
              playEvent(value.id - 1);
            }
          }}
          renderInput={(params) => (
            <TextField {...params} placeholder="בחר אירוע" color="primary"   InputProps={{
                ...params.InputProps,
               
              }}/>
            
          )}
        />
      </ThemeProvider>
    </CacheProvider>}
    </div>
  );
}
