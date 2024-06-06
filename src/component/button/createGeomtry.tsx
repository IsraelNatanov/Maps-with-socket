import React, { useState, useEffect, useRef } from "react";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Draw, Modify, Snap } from "ol/interaction";
import Overlay from "ol/Overlay";
import "ol/ol.css";
import { Feature, Map as OlMap } from "ol";
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
import { fromLonLat, transform } from "ol/proj";
import { Coordinate, CoordinateFormat } from "ol/coordinate";
import SnackbarPolygon from "../ui/snackbarMessage";
import MessageCartoon from "../ui/messageCartoon";
import Grid from '@mui/material/Grid';
import { useAddFeature } from "../../hooks/useFeaturesData";
import { IFeatures, IGeoJson } from "../../../../types/FeatureType";
import BaseEvent from "ol/events/Event";
import { DrawEvent } from "ol/interaction/Draw";

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

const CreateGeomtry: React.FC<MapComponentProps> = ({ map, setMap,setIsAddPolygon }) => {
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
  const [geometry, setGeometry] = useState<IGeoJson>();
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


  const handleStartDrawing = async(e: string) => {

    if (e != 'None' && map && vectorSourceRef.current) {
      setDrawInteractionType(e as Type)
      setOpenMessage(true)
      
     
      const drawInteraction = new Draw({
        source: vectorSourceRef.current,
        type: e as Type,
      });

      drawInteractionRef.current = drawInteraction;
      drawInteractionRef.current.on("drawend", (event: DrawEvent) => {
        const feature = event.feature;
        setCurrentFeature(feature);

        map!.removeInteraction(drawInteractionRef.current!);

      });
      map.addInteraction(drawInteraction);
    }
    else if(e === 'None'){
      map!.removeInteraction(drawInteractionRef.current!);
      setOpenMessage(false)
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };
  
  const closeButtonMessage =()=>{
    setOpenMessage(false)
    vectorSourceRef.current!.removeFeature(currentFeature);
    if (selectRef.current !== null) {
        selectRef.current.value = 'None';

      }
      map!.removeInteraction(drawInteractionRef.current!);
}



  const handleSave = async () => {
    const idFeature = Date.now().toString()
    if (name && currentFeature) {
     

      
      // console.log(drawInteractionType);
      
      const geometryFeature = currentFeature.getGeometry();
  
      // Get the coordinates of the polygon vertices

      if(drawInteractionType === 'Polygon'){

        const coordinates = geometryFeature.getCoordinates()[0];
      // Convert the coordinates from lon/lat to numbers
      const convertedCoordinates = coordinates.map((coord: Coordinate) => {
        const [lon, lat] = transform(coord, 'EPSG:3857', 'EPSG:4326');
        return [Number(lon), Number(lat)];
      });
  
      // Create the GeoJSON object
      const geoJson = {
        type: 'Polygon',
        coordinates: [convertedCoordinates] ,
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
    
      await postApiCreateGeometry( name, geoJson,idFeature, 'polygonsLayer')
    }
      else if(drawInteractionType === 'Point'){
 
        const coordinates = geometryFeature.getCoordinates();
        const olTargetCoordinate = transform(coordinates, 'EPSG:3857', 'EPSG:4326') as [number, number] | Array<Array<number>>;;
        
        const geoJson = {
          type: 'Point',
          coordinates: olTargetCoordinate,
        };
        await postApiCreateGeometry( name, geoJson, idFeature, 'events')
      }

    }
    setOpen(false);
    if (selectRef.current !== null) {
      selectRef.current.value = 'None';

    }
    handleClose()

  };
  const { mutate: addFeatureMutate } = useAddFeature();

  const postApiCreateGeometry = async (
    name: string,
    geoJson: IGeoJson,
    idFeature: string,
    partUrl: string,

  ) => {
    try {
      // Ensure the body object matches the IFeatures type
      const body = {
        id: idFeature,
        type: 'Feature',
        geometry: geoJson,
        properties: {
          name,
        typeStyle: "style1",
        typeEvent: "event1"
        },
      } as IFeatures;
  
      // Use a promise to handle the success and error cases
      await new Promise((resolve, reject) => {
        addFeatureMutate(
          { layer: partUrl, feature: body },
          {
            onSuccess: () => {
              resolve(true);
            },
            onError: (error) => {
              reject(error);
            },
          }
        );
      });
  
      setOpenAlert(true);
      setOpenMessage(false);
  
      // Store the timeout ID so it can be cleared if necessary
      const timeoutId = setTimeout(() => {
        setOpenAlert(false);
      }, 6000);
  
      // Return a function to clear the timeout if necessary
      return () => clearTimeout(timeoutId);
    } catch (error) {
      console.error('Failed to add feature:', error);
      // Handle the error as needed
      setOpenMessage(true);
    }
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
      {openMessage && <MessageCartoon  closeButtonMessage={closeButtonMessage} drawInteractionType={drawInteractionType!}/>}
      {openAlert&& <SnackbarPolygon setOpenAlert={setOpenAlert} openAlert={openAlert}/>}
    </div>
  );
};

export default CreateGeomtry;
