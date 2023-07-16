import React, { useState, useEffect } from "react";
import { Feature, Map as OlMap } from "ol";
import Vector from "ol/layer/Vector";
import Vectors from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import Select from "ol/interaction/Select";
import "ol/ol.css";
import axios from "axios";
import Button from "@mui/material/Button";
import Map from "./map";
import { styleButton, styleFunction } from "../style/styleFunction";
import { Stack } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocationOffIcon from "@mui/icons-material/LocationOff";
import ExploreOffIcon from "@mui/icons-material/ExploreOff";
import ExploreIcon from "@mui/icons-material/Explore";
import { FeatureObject, Features } from "../../typs/featuresType";
import ButtonSelectEvent from "./button/buttonSelectEvent";
import MapComponent from "./button/createPolygon";
import polygonIcon from "../../images/polygonIcon.png";
import polygonNotIcon from "../../images/polygonNotIcon.png";
import SearchGeomtry from "./button/searchGeometry";
import { click } from "ol/events/condition";
import DeleteIcon from "@mui/icons-material/Delete";
import { Geometry } from "ol/geom";
import SimpleBackdrop from "./util/simpleBackdrop";
import { io } from "socket.io-client";
const format = new GeoJSON({ featureProjection: "EPSG:3857" });

interface Options {
  label: string;
  id: number;
}

function MapContainer() {
  const [map, setMap] = useState<OlMap | null>(null);
  const [isPoint, setIsPoint] = useState<boolean>(false);
  const [isPolygon, setIsPolygon] = useState<boolean>(false);
  const [eventesFeatures, setEventesFeatures] = useState<Features[]>([]);
  const [isGeomtry, setIsGeomtry] = useState<boolean>(false);
  const [isAddPolygon, setIsAddPolygon] = useState<boolean>(false);
  const [optionsLayers, setOptionsLayers] = useState<Options[]>([]);
  const [optionsPolygon, setOptionsPolygon] = useState<Options[]>([]);
  const [optionsPoint, setOptionsPoint] = useState<Options[]>([]);
  const [isDeletePolygon, setIsDeletePolygon] = useState<boolean>(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [copyPolygonSource, setCopyPolygonSource] =useState<Vectors<Geometry> | null>(null);
  const [openLoading, setOpenLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<Options[]>([]);
  const [indexOptions, setIndexOptions] = useState<number>(0);

  useEffect(() => {
    getApiEvents();

    // getAllNameOfProperties()
  }, []);

  // useEffect(() => {
  //   if (isPolygon) {
  //     setOpenLoading(true);
  //     console.log(polygonSource);
  //     handleAddLayerPolygon();
  //     setIsAddPolygon(false);
  //     handleAddLayerPolygon();
  //     setOpenLoading(false);
  //   }
  // }, [isAddPolygon]);
  useEffect(() => {
    console.log("gsgs", options);
  }, [options]);

  const getApiEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/eventesFeatures");
      setEventesFeatures(res.data);
      console.log(res.data);
      console.log(1212);
    } catch (error) {
      throw error;
    }
    // await getAllNameOfProperties()
  };

  const vectorLoaderPolygon = async () => {
    setOpenLoading(true);

    // Establish a socket connection
    const socket = io("http://localhost:5000")
//     , { extraHeaders:{
// ['Authorzation']: 'Brear '+ "jdjskd"
//     }});

    socket.on("deletePolygon", (deletedPolygonId) => {
      // Remove the polygon from the map
      const feature = polygonSource.getFeatureById(deletedPolygonId);
      if (feature) {
        polygonSource.removeFeature(feature);
      }
    });

   

    // Listen for the "newPolygon" event
    socket.on("newPolygon", (newPolygon: any) => {
      console.log(
        newPolygon
      );
      
      // Add the new polygon to the map
      const feature = format.readFeature(newPolygon);
      polygonSource.addFeature(feature);
    });

    axios
      .get("http://localhost:5000/polygonFeatures")
      .then((res) => {
        console.log(25142, res.data);
        const features = format.readFeatures(res.data);
        polygonSource.addFeatures(features);
        map!.addInteraction(selectInteraction);
        setOpenLoading(false);

        console.log(isDeletePolygon);
        const arr = getAllNameOfProperties(res.data.features);
        setOptionsPolygon(arr);
        setOptions((option) => [...option, ...arr]);

        // setOptions(arr);
      })
      .catch((error) => console.log(error));
    console.log(options);

    // Clean up the socket connection when done
    return () => {
      socket.disconnect();
    };
  };

  const handleSelectPolygon = (event: any) => {
    const selectedFeatures = event.target.getFeatures();
    console.log(polygonSource);
    if (selectedFeatures.getLength() > 0) {
      setSelectedFeature(selectedFeatures.item(0));
      setCopyPolygonSource(polygonSource);

      setIsDeletePolygon(true);

      console.log("true");
    } else {
      setSelectedFeature(null); // Set selectedFeature to null when no polygon is selected
      setIsDeletePolygon(false);
      console.log(555);
      console.log("false");
    }
  };

  let polygonSource = new Vectors({
    format: new GeoJSON(),
    // url:"http://localhost:9000/geojson"
    loader: vectorLoaderPolygon!,
  });

  let vectorLayerPolygon = new Vector({
    source: polygonSource,
    style: styleFunction,
  });

  const selectInteraction = new Select({
    condition: click,
    layers: [vectorLayerPolygon], // Only select features from the vector layer
  });
  selectInteraction.on("select", handleSelectPolygon);

  const deletePolygon = async () => {
    console.log(copyPolygonSource);
    try {
      let resp = await axios({
        url: `http://localhost:5000/polygonFeatures/${selectedFeature?.getId()}`,
        method: "delete",
        headers: {
          "content-type": "application/json",
        },
      });

      console.log(selectedFeature);

      // Remove the feature from the vector source
      copyPolygonSource!.removeFeature(selectedFeature!);
      map!.updateSize();
      setSelectedFeature(null);
      setIsDeletePolygon(false);

      return resp;
    } catch (error) {
      throw error;
    }
  };

  const handleAddLayerPolygon = () => {
    if (map) {
      const layers = map.getLayers().getArray();
      const targetLayer = layers.find(
        (layer) => layer.get("id") === "your-layer-id-2"
      );
      if (targetLayer) {
        // Layer exists, remove it
        map.removeLayer(targetLayer);
        {
          optionsPolygon.map((options) => deleteArray(options.id));
        }
        setOptionsPolygon([]);

        setIsPolygon(false);
      } else {
        // Layer doesn't exist, add it
        setIsPolygon(true);
        vectorLayerPolygon.set("id", "your-layer-id-2");
        map.addLayer(vectorLayerPolygon);
      }
    }
  };

  const vectorLoaderPoint = async () => {
    setOpenLoading(true);
    axios
      .get("http://localhost:5000/pointFeatres")
      .then((res) => {
        console.log(25142, res.data);
        const features = format.readFeatures(res.data);
        pointSource.addFeatures(features);
        const arr = getAllNameOfProperties(res.data.features);
        setOptionsPoint(arr);
        setOptions((option) => [...option, ...arr]);

        console.log(polygonSource);

        setOptionsLayers([]);
        setOpenLoading(false);
      })
      .catch((error) => console.log(error));
  };

  let pointSource = new Vectors({
    format: new GeoJSON(),
    // url:"http://localhost:9000/geojson"
    loader: vectorLoaderPoint!,
  });

  let vectorLayerPoint = new Vector({
    source: pointSource,
    style: styleFunction,
  });

  const handleAddLayerPoint = () => {
    if (map) {
      const layers = map.getLayers().getArray();
      const targetLayer = layers.find(
        (layer) => layer.get("id") === "your-layer-id-1"
      );

      if (targetLayer) {
        // Layer exists, remove it
        map.removeLayer(targetLayer);

        {
          optionsPoint.map((options) => deleteArray(options.id));
        }
        setOptionsPoint([]);
        setIsPoint(false);
      } else {
        // Layer doesn't exist, add it

        vectorLayerPoint.set("id", "your-layer-id-1");
        map.addLayer(vectorLayerPoint);

        setIsPoint(true);
      }
    }
  };

  const displayGeomtry = () => {
    setIsGeomtry(!isGeomtry);
  };

  const getAllNameOfProperties = (data: FeatureObject[]) => {
    const arr: Options[] = [];

    if (Array.isArray(data)) {
      data.forEach((item: FeatureObject) => {
        const nameOfData: Options = {
          label: item.properties.name,
          id: indexOptions,
        };
        setIndexOptions(indexOptions + 1);
        arr.push(nameOfData);
        console.log(item.properties.name); // Print each item inside the function
      });
    } else {
      console.error("Data is not an array:", data);
    }
    return arr;
  };
  const deleteArray = (arrayId: number) => {
    // Remove the identified array from the state
    console.log(arrayId);

    setOptions((prevOptions) =>
      prevOptions.filter((option) => option.id !== arrayId)
    );
  };
  return (
    <div>
      {openLoading && <SimpleBackdrop openLoading={openLoading} />}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={2}
      >
        <Stack spacing={2} direction="row">
          <Button
            style={styleButton}
            variant="text"
            onClick={handleAddLayerPoint}
          >
            {isPoint ? (
              <>
                הסתר אתרים
                <LocationOffIcon />
              </>
            ) : (
              <>
                הצג אתרים
                <LocationOnIcon />
              </>
            )}
          </Button>
          <Button
            style={styleButton}
            variant="text"
            onClick={handleAddLayerPolygon}
          >
            {isPolygon ? (
              <>
                הסתר גיזרות
                <ExploreOffIcon />
              </>
            ) : (
              <>
                הצג גיזרות
                <ExploreIcon />
              </>
            )}
          </Button>

          {/* <Button
            style={styleButton}
            variant="text"
            onClick={handleAddLayerPolygon}
          >
            {isPolygon ? (
              <>
                הסתר מפה צהלית
                <LayersClearIcon />
              </>
            ) : (
              <>
                הצג מפה צהלית
                <LayersIcon />
              </>
            )}
          </Button> */}
          {/* <Button style={styleButton} variant="text" onClick={displayEvent}>
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
          </Button> */}

          <ButtonSelectEvent map={map} />
          <Button style={styleButton} variant="text" onClick={displayGeomtry}>
            {isGeomtry && eventesFeatures.length > 0 ? (
              <>
                הסתרת כלי סירטוט
                <img src={polygonNotIcon} alt="not geomtry" />
              </>
            ) : (
              <>
                הוספת גזרות ואתרים
                <img src={polygonIcon} alt="geomtry" />
              </>
            )}
          </Button>
          {isGeomtry && (
            <MapComponent
              setMap={setMap}
              map={map}
              setIsAddPolygon={setIsAddPolygon}
            />
          )}
          {/* {isGeomtry && <SelectGeomtry setMap={setMap} map={map} /> } */}

          {isDeletePolygon && (
            <Button style={styleButton} variant="text" onClick={deletePolygon}>
              מחק פוליגון
              <DeleteIcon />
            </Button>
          )}
        </Stack>

        {(isPoint || isPolygon) && (
          <SearchGeomtry setMap={setMap} map={map} options={options} />
        )}
      </Stack>
      <Map setMap={setMap} map={map} />
    </div>
  );
}

export default MapContainer;
