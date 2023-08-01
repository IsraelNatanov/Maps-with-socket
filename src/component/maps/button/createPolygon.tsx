import React, { useState, useEffect, useRef } from "react";
import { Map, View } from "ol";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Draw, Modify, Snap } from "ol/interaction";
import Overlay from "ol/Overlay";
import "ol/ol.css";
import { Feature, Map as OlMap } from "ol";
import NameGeomtry from "./nameGeomtry";
import polygonIcon from "../../../images/polygonIcon.png"
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import Geometry, { Type } from "ol/geom/Geometry";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import rtlPlugin from "stylis-plugin-rtl";
import { prefixer } from "stylis";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import CloseIcon from "@mui/icons-material/Close";
import { styleButton } from "../../style/styleFunction";
import { fromLonLat, transform } from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";
import { GeometryType, GeometryTypePolygon } from "../../../typs/featuresType";
import { Coordinate, CoordinateFormat } from "ol/coordinate";
import SnackbarPolygon from "./snackbarPolygon";
import MessageCartoon from "../util/messageCartoon";
import Grid from '@mui/material/Grid';
// import "../maps.css"

const theme = createTheme({
  direction: "rtl", // Both here and <body dir="rtl">
});
// Create rtl cache
const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});

interface MapComponentProps {
  setMap: React.Dispatch<React.SetStateAction<OlMap | null>>;
  map: OlMap | null;
  setIsAddPolygon :React.Dispatch<React.SetStateAction<boolean>>;
}

interface PolygonData {
  name: string;
  feature: any; // You can replace 'any' with the appropriate type for the feature
  overlay: Overlay;
}

const CreatePolygon: React.FC<MapComponentProps> = ({ map, setMap,setIsAddPolygon }) => {
  const drawInteractionRef = useRef<Draw | null>(null);
  const modifyInteractionRef = useRef<Modify | null>(null);
  const snapInteractionRef = useRef<Snap | null>(null);
  const vectorSourceRef = useRef<VectorSource<Geometry> | null>(null);
  const [polygons, setPolygons] = useState<PolygonData[]>([]);
  const [open, setOpen] = useState<boolean>(false);
    const [openMessage, setOpenMessage] = useState<boolean>(false);
  const [openAlert, setOpenAlert] = useState<boolean>(false);
  const [drawInteractionType, setDrawInteractionType] =  useState<Type |null>()
  const [name, setName] = useState('שם הגזרה');
  const [geometry, setGeometry] = useState<GeometryTypePolygon>();
  const [currentFeature, setCurrentFeature] = useState<any>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (map && !modifyInteractionRef.current && !snapInteractionRef.current) {
      const vectorSource = new VectorSource<Geometry>();
      const vectorLayer = new VectorLayer<VectorSource<Geometry>>({
        source: vectorSource,
        style: {
          "fill-color": "rgba(255, 255, 255, 0.2)",
          "stroke-color": "#ffcc33",
          "stroke-width": 2,
          "circle-radius": 7,
          "circle-fill-color": "#ffcc33",
        },
      });

      const modifyInteraction = new Modify({ source: vectorSource });
      modifyInteractionRef.current = modifyInteraction;

      const snapInteraction = new Snap({ source: vectorSource });
      snapInteractionRef.current = snapInteraction;

      setPolygons([]);
      map.addLayer(vectorLayer);
      vectorSourceRef.current = vectorSource;

      map.addInteraction(modifyInteraction);
      map.addInteraction(snapInteraction);

      return () => {
        if (modifyInteractionRef.current && snapInteractionRef.current) {
          // map.removeInteraction(modifyInteractionRef.current);
          // map.removeInteraction(snapInteractionRef.current);
        }
      };
    }
  }, [map, setMap]);


  const handleStartDrawing = (e: string) => {
    if (e != 'None' && map && vectorSourceRef.current) {
      setOpenMessage(true)
      setDrawInteractionType(e as Type)
      const drawInteraction = new Draw({
        source: vectorSourceRef.current,
        type: drawInteractionType!,
      });
      drawInteraction.on("drawend", (event: any) => {
        const feature = event.feature;
        setCurrentFeature(feature);

        map!.removeInteraction(drawInteractionRef.current!);

       
      });

      drawInteractionRef.current = drawInteraction;

      map.addInteraction(drawInteraction);
    }
    else if(e == 'None'){
      map!.removeInteraction(drawInteractionRef.current!);
      setOpenMessage(false)
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };
  
  const closeButtonMessage =()=>{
    setOpenMessage(false)
    if (selectRef.current !== null) {
        selectRef.current.value = 'None';

      }
      map!.removeInteraction(drawInteractionRef.current!);
}



  const handleSave = async () => {
    if (name && currentFeature) {
      console.log(drawInteractionType);
      
      const geometryFeature = currentFeature.getGeometry();
  
      // Get the coordinates of the polygon vertices
      const coordinates = geometryFeature.getCoordinates()[0];
  
      // Convert the coordinates from lon/lat to numbers
      const convertedCoordinates = coordinates.map((coord: Coordinate) => {
        const [lon, lat] = transform(coord, 'EPSG:3857', 'EPSG:4326');
        return [Number(lon), Number(lat)];
      });
  
      // Create the GeoJSON object
      const geoJson = {
        type: 'Polygon',
        coordinates: [convertedCoordinates],
      };
  
      // Convert the GeoJSON object to a string
      const geoJsonString = JSON.stringify(geoJson);
      console.log(geoJsonString);
  
      console.log(JSON.stringify({ name, geoJson }));
      setGeometry(geoJson!);
  
      const overlayElement = document.createElement('div');
      overlayElement.className = 'tooltip';
      overlayElement.innerText = name;
      const feature = currentFeature;
      const overlay = new Overlay(
        {
        // element: overlayElement,
        position: currentFeature.getGeometry().getInteriorPoint().getCoordinates()!,
        positioning: 'center-center',
        offset: [0, -10],
        stopEvent: false,
      }
      );
  
      map!.addOverlay(overlay);
  
      const polygonData: PolygonData = {
        name: name,
        feature: feature,
        overlay: overlay,
      };
  
      setPolygons([...polygons, polygonData]);
      setOpen(false);
      if (selectRef.current !== null) {
        selectRef.current.value = 'None';

      }
      
      // Send the polygon data to the server
      try {
        const response = await fetch('http://localhost:5000/polygonFeatures', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, geoJson }),
        });
  
        if (response.ok) {
          console.log('Polygon data saved successfully');
          setIsAddPolygon(true)
          setOpenAlert(true)
          setOpenMessage(false)
          setTimeout(() => {
            setOpenAlert(false)
            
          }, 6000);
        } else {
          console.error('Error saving polygon data');
        }
      } catch (error) {
        console.error(error);
      }

    }
    handleClose()
  
  
  };

  const handleDeletePolygon = (index: number) => {
    if (map && vectorSourceRef.current) {
      const polygonsCopy = [...polygons];
      const deletedPolygon = polygonsCopy.splice(index, 1)[0];
      map.removeOverlay(deletedPolygon.overlay);
      vectorSourceRef.current.removeFeature(deletedPolygon.feature);
      setPolygons(polygonsCopy);
    }
  };

  const handleClose = () => {
    if (currentFeature) {
      // Remove the current feature from the vector source
      vectorSourceRef.current!.removeFeature(currentFeature);
      setOpenMessage(false)
      // Remove the current feature's overlay from the map
      const deletedOverlay = polygons.find(polygon => polygon.feature === currentFeature)?.overlay;
      if (deletedOverlay) {
        map!.removeOverlay(deletedOverlay);
        
      }
    }

    setOpen(false);
  };


  return (
    <div className="create-polygon">

      <div className="row-box">

        <button
          className="form-control"
          onClick={() => setOpen(true)}
        >
          שמור
        </button>
        <select
          className="form-select"
          id="type"
          ref={selectRef}
          onChange={(e) => handleStartDrawing(e.target.value)}
        >
          <option value="None">None</option>
          {/* <option value="Point">Point</option>
          <option value="LineString">LineString</option> */}
          <option value="Polygon">גזרות</option>
          <option value="Point">אירוע</option>
          {/* <option value="Circle">Circle</option> */}
        </select>
        <label className="inpu-text" htmlFor="type">
          :סוג גאומטרי
        </label>

      </div>

     
      <Dialog
        open={open}
        // onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <Grid
          container
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <DialogTitle id="alert-dialog-title" >
            {"אנה הזן שם לאתר/פוליגון"}
          </DialogTitle>
        </Grid>
        <DialogContent>
          <CacheProvider value={cacheRtl}>
            <ThemeProvider theme={theme}>
              <div dir="rtl">
                <TextField
                  id="name"
                  margin="normal"
                  fullWidth
                  label="שם האתר/הפוליגון"
                  // defaultValue={name}
                  // helperText="Some important text"
                  onChange={handleChange}
                />
              </div>
            </ThemeProvider>
          </CacheProvider>
        </DialogContent>
        <DialogActions sx={{display:'flex',justifyContent:"space-between"}}>
      

          <Button onClick={handleClose}>בטל</Button>
          <Button onClick={handleSave} autoFocus>
            שמור
          </Button>
         
        </DialogActions>
      </Dialog>
      {openMessage && <MessageCartoon  closeButtonMessage={closeButtonMessage}/>}
      {openAlert&& <SnackbarPolygon setOpenAlert={setOpenAlert} openAlert={openAlert}/>}
    </div>
  );
};

export default CreatePolygon;
