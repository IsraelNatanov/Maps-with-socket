import React, { useState, useEffect, useMemo, useRef, MutableRefObject } from "react";
import { Feature, Map as OlMap } from "ol";
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
import { FeatureObject, Features, SelectedPolygonType, selectFearure } from "../typs/featuresType";
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
import { IFeatureCollection, useAddFeature, useDeleteFeature, useGetFeaturesData } from "../hooks/useFeaturesData";
import { useMapSelect } from "../hooks/useMapSelect";
import FormSelect from "./ui/formSelect";
import { Properties, isVectorLayers } from "../utils/createOlGeometry";

const format = new GeoJSON({ featureProjection: "EPSG:3857" });

interface Options {
  label: string;
  id: number;
}

type DisplayFeaturesState = {
  [key: string]: boolean;
};
export type VectorLayersRef = MutableRefObject<{ [key: string]: VectorLayer<VectorSource<Geometry>> } | {}>;

function MapContainer() {
  const prevVectorLayersRef = useRef<{ [key: string]: VectorLayer<VectorSource<Geometry>> | null }>({});
  const [map, setMap] = useState<OlMap | null>(null);
  const [isDeletePolygon, setIsDeletePolygon] = useState<boolean>(false);
  const [selectedFeature, setSelectedFeature] = useState<selectFearure | null>(null);
  const [isDisplayFeatures, setIsDisplayFeatures] = useState<DisplayFeaturesState>({
    'pointsLayer': false,
    'polygonsLayer': false,
    'eventsLayer': false,
    'createGeomtry': false,

  })
  const onSuccess = (data: IFeatureCollection | undefined) => {
    console.log({ data })
  }

  const onError = (error: unknown) => {
    console.log({ error })
    return <h2>{(error as Error)?.message}</h2>
  }


  // Usage for points
  const { isLoading: isLoadingPoints, data: pointsData, isError: isErrorPoints, error: errorPoints, isPreviousData: isPreviousDataPoints } = useGetFeaturesData(
    'pointsLayer',
    onSuccess,
    onError
  );

  // Usage for polygons
  const { isLoading: isLoadingPolygons, data: polygonsData, isError: isErrorPolygons, error: errorPolygons, isPreviousData: isPreviousDataPolygons } = useGetFeaturesData(
    'polygonsLayer',
    onSuccess,
    onError
  );

  const createVectorLayer = (source: IFeatureCollection, styleFunction: any, nameLayer: string) => {
    let vectorSource: VectorSource | null = null;
  
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
        nameFeature: properties.name
      });
    });
  
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
      nameLayer: 'pointsLayer',
      data: pointsData
    },
    {
      key: '1',
      nameLayer: 'polygonsLayer',
      data: polygonsData
    },
  ], [pointsData, polygonsData]);

  const vectorLayers = useMemo(() => {
    return listVectores
      .filter(obj => obj.data !== undefined)
      .map(obj => {
        const layer = createVectorLayer(obj.data!, styleFunction, obj.nameLayer);
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
  const { mutate: deleteFeatureMutate } = useDeleteFeature(vectorLayers);
  

  useEffect(() => {
   const indexLayer1 = map?.getLayers().getArray()[1]
console.log('indexLayer1', indexLayer1);
console.log('vectorLayers', vectorLayers);

if (isVectorLayers(vectorLayers) && (indexLayer1 === undefined)) {
  console.log(1111);
  
  Object.values(vectorLayers).forEach((layer) => {
    map?.addLayer(layer);
    layer.setVisible(false);
  });
}
console.log(map?.getLayers());

// const layers = map?.getLayers().getArray().forEach((layer)=>{
//   const properties = layer.get
//  console.log( properties.name)
      // });
  }, [vectorLayers]);


  const { mutate: addFeatureMutate } = useAddFeature(vectorLayers);
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

  const handleSelectFeatures = (event: SelectEvent) => {
    console.log('event', event);

    const selected = event.selected;
    // console.log('selectedFeatures', selected[0].getId());
    const selectedFeatures = event.target.getFeatures();
    // console.log('selectedFeatures', selectedFeatures);

    if (selected.length > 0 && selected[0].getId() !== undefined) {
      const selectedProperties = selected[0].getProperties()
      console.log('selectedProperties', selectedProperties);
      const selectedFeatures: selectFearure = {
        indexFeature: selectedProperties.indexFeature,
        indexLayer: selectedProperties.indexLayer,
        name: selectedProperties.name,
        nameFeature: selectedProperties.selectedProperties,
        nameLayer: selectedProperties.nameLayer,
        typeStyle: selectedProperties.nameLayer

      }
      setSelectedFeature(selectedFeatures);
      setIsDeletePolygon(true);
    }
    else {
      setSelectedFeature(null); 
      setIsDeletePolygon(false);
    }
  };

  const deleteFeature = () => {
    if (selectedFeature) {
      deleteFeatureMutate({ layer: selectedFeature.nameLayer, idFeature: selectedFeature.indexFeature })
      setSelectedFeature(null);
      setIsDeletePolygon(false);
    }

  }

  const selectInteractions = useMapSelect(handleSelectFeatures);
  useEffect(() => {
    // if(map) map.removeInteraction(selectInteraction)
    if (map) map.addInteraction(selectInteractions);
  }, [map]);

 
  // const getApiEvents = async () => {
  //   try {
  //     const res = await axios.get("http://localhost:5000/eventesFeatures");
  //     setEventesFeatures(res.data);
  //     console.log(res.data);

  //   } catch (error) {
  //     throw error;
  //   }

  // };


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
  <SimpleBackdrop openLoading={isLoadingPolygons || isLoadingPoints} />
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={2}

      >
        <Stack direction="row">
          <RenderButtons buttonsData={buttonsData} />
          {/* {isDisplayFeatures['eventsLayer'] && <DeviderEvent map={map} setIsPoint={setIsPoint} isPoint={isPoint} handleAddLayerPoint={handleAddLayerPoint} />} */}
          {isDisplayFeatures['createGeomtry'] && (
            <FormSelect
              setMap={setMap}
              map={map}
              addFeatureMutate={addFeatureMutate}
            />
          )}
          {/* {isGeomtry && <SelectGeomtry setMap={setMap} map={map} /> } */}

          {isDeletePolygon && (
            <Button style={styleButton} variant="text" onClick={deleteFeature}>
              מחק פוליגון
              <DeleteIcon />
            </Button>
          )}

        </Stack>

        {(isDisplayFeatures['pointsLayer'] || isDisplayFeatures['polygonsLayer']) && (
          <SearchGeomtry setMap={setMap} map={map} options={getAllFeatureNames} />
        )}

      </Stack>
      <Map onMapCreated={setMap} />
    </div>
  );
}

export default MapContainer;
