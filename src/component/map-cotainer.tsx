import React, { useState, useEffect, useMemo } from "react";
import { Feature, Map as OlMap } from "ol";
import Vector from "ol/layer/Vector";
import Vectors from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import Select, { SelectEvent } from "ol/interaction/Select";
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
import { FeatureObject, Features, SelectedPolygonType } from "../typs/featuresType";
import ButtonSelectEvent from "./button/buttonSelectEvent";
import CreateGeomtry from "./button/createGeomtry";
import polygonIcon from "../images/polygonIcon.png";
import polygonNotIcon from "../images/polygonNotIcon.png";
import SearchGeomtry from "./button/searchGeometry";
import { click } from "ol/events/condition";
import DeleteIcon from "@mui/icons-material/Delete";
import { Geometry, Polygon } from "ol/geom";
import SimpleBackdrop from "./ui/simpleBackdrop";
import { io } from "socket.io-client";
import DeviderEvent from "./button/deviderEvent";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsOff from "@mui/icons-material/NotificationsOff";
import RenderButtons from "./button/renderButtons";
import { ButtonsDataType } from "../typs/buttonsDataType";
import { IFeatures } from "../../../types/FeatureType";
import { useGetFeaturesData } from "../hooks/useFeaturesData";
import { useMapSelect } from "../hooks/useMapSelect";

const format = new GeoJSON({ featureProjection: "EPSG:3857" });

interface Options {
  label: string;
  id: number;
}

type DisplayFeaturesState = {
  [key: string]: boolean;
};
function MapContainer() {
  const [map, setMap] = useState<OlMap | null>(null);
  const [isPoint, setIsPoint] = useState<boolean>(false);
  const [isPolygon, setIsPolygon] = useState<boolean>(false);
  const [isAlerts, setIsAlerts] = useState<boolean>(false);
  const [eventesFeatures, setEventesFeatures] = useState<Features[]>([]);
  const [isGeomtry, setIsGeomtry] = useState<boolean>(false);
  const [isAddPolygon, setIsAddPolygon] = useState<boolean>(false);
  const [optionsLayers, setOptionsLayers] = useState<Options[]>([]);
  const [optionsPolygon, setOptionsPolygon] = useState<Options[]>([]);
  const [optionsPoint, setOptionsPoint] = useState<Options[]>([]);
  const [isDeletePolygon, setIsDeletePolygon] = useState<boolean>(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [copyPolygonSource, setCopyPolygonSource] = useState<Vectors<Geometry> | null>(null);
  const [openLoading, setOpenLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<Options[]>([]);
  const [indexOptions, setIndexOptions] = useState<number>(0);
  const [isDisplayFeatures, setIsDisplayFeatures] = useState<DisplayFeaturesState>({
    'pointsLayer': false,
    'polygonsLayer': false,
    'eventsLayer': false,
    'createGeomtry': false,

  })
  const onSuccess = (data: IFeatures | undefined) => {
    console.log({ data })
  }

  const onError = (error: unknown) => {
    console.log({ error })
    return <h2>{(error as Error)?.message}</h2>
  }

  // Usage for points
  const { isLoading: isLoadingPoints, data: pointsData, isError: isErrorPoints, error: errorPoints, isPreviousData: isPreviousDataPoints } = useGetFeaturesData(
    'points',
    onSuccess,
    onError
  );

  // Usage for polygons
  const { isLoading: isLoadingPolygons, data: polygonsData, isError: isErrorPolygons, error: errorPolygons, isPreviousData: isPreviousDataPolygons } = useGetFeaturesData(
    'polygons',
    onSuccess,
    onError
  );
  // const points = pointsData?.data ?? [];
  // const polygons = polygonsData?.data ?? [];


  // if (isLoadingPoints || isLoadingPolygons) {
  //   return <SimpleBackdrop openLoading={openLoading} />
  // }
  // const new VectorSource({
  //     format: new GeoJSON(),
  //   });
  // };

  // const createVectorLayer = (source: IFeatures, styleFunction: any, nameLayer: string) => {
  //   let vectorSource: VectorSource | null = null;

  //   if (source && source.type === 'FeatureCollection' && Array.isArray(source.features)) {
  //     // Create a new VectorSource instance
  //     vectorSource = new VectorSource({
  //       features: format.readFeatures(source),
  //     });
  //   } else {
  //     console.error('Invalid source object passed to createVectorLayer:', source);
  //   }

  //   if (vectorSource) {
  //     return new VectorLayer({
  //       source: vectorSource,
  //       style: styleFunction,
  //       properties: {
  //         nameLayer: nameLayer,
  //       },
  //     });
  //   } else {
  //     return null;
  //   }
  // };
  // const listVectores = useMemo(() => [
  //   {
  //     key: '0',
  //     layerName: 'pointsLayer',
  //     data: pointsData
  //   },
  //   {
  //     key: '1',
  //     layerName: 'polygonsLayer',
  //     data: polygonsData
  //   },
  // ], [pointsData, polygonsData])

  // const vectorLayers = useMemo(() => {
  //   return listVectores
  //     .filter(obj => obj.data !== undefined)
  //     .map(obj => {
  //       const layer = createVectorLayer(obj.data!, styleFunction, obj.layerName);
  //       if (layer) {
  //         return layer;
  //       } else {
  //         // Handle case where createVectorLayer returns null
  //         // You can return a default layer or handle the null case as needed
  //         return new VectorLayer({
  //           source: undefined
  //         });
  //       }
  //     })
  //     .reduce<{ [key: string]: VectorLayer<VectorSource<Geometry>> }>((acc, layer) => {
  //       if (layer) {
  //         acc[layer.get('nameLayer')] = layer;
  //       }
  //       return acc;
  //     }, {});
  // }, [listVectores, styleFunction]);

  // useEffect(() => {
  //   Object.values(vectorLayers).forEach((layer) => {
  //     map?.addLayer(layer)
  //     layer.setVisible(false)
  //   })

  //   console.log('vectorLayer', vectorLayers);
  // }, [vectorLayers]);
  const createVectorLayer = (source: IFeatures, styleFunction: any, nameLayer: string) => {
    let vectorSource: VectorSource | null = null;
  
    if (source && source.type === 'FeatureCollection' && Array.isArray(source.features)) {
      // Create a new VectorSource instance
      vectorSource = new VectorSource({
        features: format.readFeatures(source),
      });
  
      // Set properties for each feature
      vectorSource.getFeatures().forEach((feature, indexLayer) => {
        const properties = feature.getProperties();
        const id = properties.id || feature.getId();
        feature.setProperties({
          ...properties,
          indexLayer: indexLayer,
       indexFeature: id,
        nameLayer: nameLayer,
        nameFeature:properties.name
        });
      });
    } else {
      console.error('Invalid source object passed to createVectorLayer:', source);
    }
  
    if (vectorSource) {
      return new VectorLayer({
        source: vectorSource,
        style: styleFunction,
        properties: {
          nameLayer: nameLayer,
        },
      });
    } else {
      return null;
    }
  };
  
  const listVectores = useMemo(() => [
    {
      key: '0',
      layerName: 'pointsLayer',
      data: pointsData
    },
    {
      key: '1',
      layerName: 'polygonsLayer',
      data: polygonsData
    },
  ], [pointsData, polygonsData])
  
  const vectorLayers = useMemo(() => {
    return listVectores
      .filter(obj => obj.data !== undefined)
      .map(obj => {
        const layer = createVectorLayer(obj.data!, styleFunction, obj.layerName);
        if (layer) {
          return layer;
        } else {
          // Handle case where createVectorLayer returns null
          // You can return a default layer or handle the null case as needed
          return new VectorLayer({
            source: undefined
          });
        }
      })
      .reduce<{ [key: string]: VectorLayer<VectorSource<Geometry>> }>((acc, layer) => {
        if (layer) {
          acc[layer.get('nameLayer')] = layer;
        }
        return acc;
      }, {});
  }, [listVectores, styleFunction]);
  
  useEffect(() => {
    Object.values(vectorLayers).forEach((layer) => {
      map?.addLayer(layer);
      layer.setVisible(false);
    });
  
    console.log('vectorLayer', vectorLayers);
  }, [vectorLayers]);
  


  const getAllFeatureNames = useMemo(() => {
    const allFeatureNames: Options[] = [];
    let index = 0;
    Object.entries(vectorLayers).forEach(([layerKey, layer]) => {
      if (isDisplayFeatures[layerKey]) {
      layer.getSource()?.forEachFeature((feature) => {
        console.log(isDisplayFeatures[layerKey]);
        const name = feature.getProperties().name;
        allFeatureNames.push({ label: name, id: ++index });
      });
    }
    });
    return allFeatureNames;
  }, [vectorLayers, isDisplayFeatures]); // Include vectorLayers as a dependency

  console.log('All Feature Names:', getAllFeatureNames);


 
  const handleDisplayLayers = (nameLayer: string) => {
    const isVisible = vectorLayers[nameLayer].getVisible()
    vectorLayers[nameLayer].setVisible(!isVisible)
    handleDisplayFeatures(nameLayer)
    // setIsDisplayFeatures(prevState => ({
    //   ...prevState, // Preserve other properties in the state object
    //   [nameLayer]: !isVisible, // Update pointsLayer to true
    // }));

  }
  const handleDisplayFeatures = (nameLayer: string) => {
    setIsDisplayFeatures(prevState => ({
      ...prevState, // Preserve other properties in the state object
      [nameLayer]: !prevState[nameLayer], // Toggle the display state for the specific layer
    }));
  };

  const handleSelectPolygons = (event:any) => {
    const selectedFeatures = event.selected;

    if (selectedFeatures.length > 0) {
      const selectedPolygon = selectedFeatures[0].getProperties() 
      console.log('selectedPolygon',selectedPolygon);
      setSelectedFeature(selectedPolygon);
      // setCopyPolygonSource(polygonSource);

      setIsDeletePolygon(true);
      

      // console.log(121, categoriesByName[`layer-${selectedPolygon.layerIndex}`]);

      // const selectionId = host
      //   .createSelectionIdBuilder()
      //   // This is sorting by the LABEL of the layer.
      //   .withCategory(
      //     categoriesByName[`layer-${selectedPolygon.layerIndex}-Unique-ID`],
      //     selectedPolygon.polygonIndex
      //   )
      //   .createSelectionId();

      // selectionManager.select(selectionId);
    }
    else{
      setSelectedFeature(null); // Set selectedFeature to null when no polygon is selected
      setIsDeletePolygon(false);
    }
  };

  const selectInteractions = useMapSelect(handleSelectPolygons);
  useEffect(() => {
    // if(map) map.removeInteraction(selectInteraction)
    if (map) map.addInteraction(selectInteractions);
  }, [map]);

  // useEffect(() => {
  //   if (!isLoadingPolygons && !isErrorPolygons && polygonsData) {
  //     setOpenLoading(true);

  //     const socket = io("http://localhost:5000");

  //     socket.on("deletePolygon", (deletedPolygonId) => {
  //       const feature = polygonSource.getFeatureById(deletedPolygonId);
  //       if (feature) {
  //         polygonSource.removeFeature(feature);
  //       }
  //     });

  //     socket.on("newPolygon", (newPolygon) => {
  //       const feature = format.readFeature(newPolygon);
  //       polygonSource.addFeature(feature);
  //     });

  //     const features = format.readFeatures(polygonsData);
  //     polygonSource.addFeatures(features);
  //     map!.addInteraction(selectInteraction);
  //     setOpenLoading(false);

  //     const arr = getAllNameOfProperties(polygonsData.features);
  //     setOptionsPolygon(arr);
  //     setOptions((option) => [...option, ...arr]);
  //     return () => {
  //       socket.disconnect();
  //     };
  //   }

  // }, [isLoadingPolygons ,isErrorPolygons, polygonsData]);




  // if (isErrorPoints ||isErrorPolygons) {
  //   return <h2>{(error as Error)?.message}</h2>
  // }


  // useEffect(() => {
  //   getApiEvents();


  // }, []);
  const getApiEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/eventesFeatures");
      setEventesFeatures(res.data);
      console.log(res.data);

    } catch (error) {
      throw error;
    }

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
    socket.on("newPolygon", (newPolygon) => {
      console.log(
        newPolygon
      );

      // Add the new polygon to the map
      const feature = format.readFeature(newPolygon);
      polygonSource.addFeature(feature);
    });

    axios
      .get("http://localhost:5000/polygonsFeatures")
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
    // layers: [vectorLayers], // Only select features from the vector layer
  });
  selectInteraction.on("select", handleSelectPolygon);

  const deletePolygon = async () => {
    console.log(copyPolygonSource);
    try {
      let resp = await axios({
        url: `http://localhost:5000/polygonsFeatures/${selectedFeature?.getId()}`,
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
      .get("http://localhost:5000/pointsFeatres")
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
  const displayAlerts = () => {
    setIsAlerts(!isAlerts);
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
  const buttonsData: ButtonsDataType[] = [
    {
      id: '0',
      text: isDisplayFeatures['eventsLayer'] ? 'הסתר התראות' : 'הצג התראות',
      icon: isDisplayFeatures['eventsLayer'] ? <NotificationsOff /> : <NotificationsIcon />,
      onClick: () => handleDisplayFeatures('eventsLayer')
    },
    {
      id: '1',
      text: isDisplayFeatures['pointsLayer'] ? 'הסתר אתרים' : 'הצג אתרים',
      icon: isDisplayFeatures['pointsLayer'] ? <LocationOffIcon /> : <LocationOnIcon />,
      onClick: () => handleDisplayLayers('pointsLayer')
    },
    {
      id: '2',
      text: isDisplayFeatures['polygonsLayer'] ? 'הסתר גיזרות' : 'הצג גיזרות',
      icon: isDisplayFeatures['polygonsLayer'] ? <ExploreOffIcon /> : <ExploreIcon />,
      onClick: () => handleDisplayLayers('polygonsLayer')
    },
    {
      id: '3',
      text: isDisplayFeatures['createGeomtry'] ? 'הסתרת כלי סירטוט' : 'הוספת גזרות ואתרים',
      icon: isDisplayFeatures['createGeomtry'] ? <img src={polygonNotIcon} alt="not geomtry" /> : <img src={polygonIcon} alt="geomtry" />,
      onClick: () => handleDisplayFeatures('createGeomtry')
    }
  ];


  return (
    <div style={{ position: 'relative' }}>
      {openLoading && <SimpleBackdrop openLoading={openLoading} />}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={2}

      >
        <Stack direction="row">
          <RenderButtons buttonsData={buttonsData} />
          {isDisplayFeatures['eventsLayer'] && <DeviderEvent map={map} setIsPoint={setIsPoint} isPoint={isPoint} handleAddLayerPoint={handleAddLayerPoint} />}
          {isDisplayFeatures['createGeomtry'] && (
            <CreateGeomtry
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

        {(isDisplayFeatures['pointsLayer'] || isDisplayFeatures['polygonsLayer'] ) && (
          <SearchGeomtry setMap={setMap} map={map} options={getAllFeatureNames} />
        )}

      </Stack>
      <Map onMapCreated={setMap} />
    </div>
  );
}

export default MapContainer;
