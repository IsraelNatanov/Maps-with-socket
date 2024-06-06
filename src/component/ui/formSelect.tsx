import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Vector as VectorLayer } from "ol/layer";
import { Draw, Modify, Snap } from "ol/interaction";
import Overlay from "ol/Overlay";
import "ol/ol.css";
import { Feature, Map as OlMap } from "ol";
import Geometry, { Type } from "ol/geom/Geometry";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import rtlPlugin from "stylis-plugin-rtl";
import { prefixer } from "stylis";
import MessageCartoon from "../ui/messageCartoon";
import { IFeatures, IGeoJson } from "../../../../types/FeatureType";
import { DrawEvent } from "ol/interaction/Draw";
import { getMessageContent } from "../../utils/getMessageContent";
import { DrawInteractionType } from "../../typs/buttonsDataType";
import AlertDialog from "./alertDialog";
import { AddFeatureParams, useAddFeature } from "../../hooks/useFeaturesData";
import { transform } from "ol/proj";
import { Coordinate } from "ol/coordinate";
import SnackbarMessage from "./snackbarMessage";
import { Point, Polygon } from "ol/geom";
import VectorSource from "ol/source/Vector";
import { convertToMapFeature, createOlGeometry } from "../../utils/createOlGeometry";


interface MapComponentProps {
    setMap: React.Dispatch<React.SetStateAction<OlMap | null>>;
    map: OlMap | null;
    addFeatureMutate: (params: AddFeatureParams) => void
}

interface PolygonData {
    nameFeature: string;
    feature: any; // You can replace 'any' with the appropriate type for the feature
    // overlay: Overlay;
}
const FormSelect: React.FC<MapComponentProps> = ({ map, setMap, addFeatureMutate  }) => {

    const drawInteractionRef = useRef<Draw | null>(null);
    const modifyInteractionRef = useRef<Modify | null>(null);
    const snapInteractionRef = useRef<Snap | null>(null);
    const vectorSourceRef = useRef<VectorSource<Geometry> | null>(null);
    const [polygons, setPolygons] = useState<PolygonData[]>([]);
    const [openAlertDialog, setOpenAlertDialog] = useState<boolean>(false);
    const [openMessage, setOpenMessage] = useState<boolean>(false);
    const [openAlertSnackbar, setOpenAlertSnackbar] = useState<boolean>(false);
    const [drawInteractionType, setDrawInteractionType] = useState<DrawInteractionType>('None');
    const [nameFeature, setNameFeature] = useState('שם הגזרה');
    const [geometry, setGeometry] = useState<IGeoJson>();
    const [currentFeature, setCurrentFeature] = useState<any>();
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

    const { subjectText, descriptionText } = useMemo(() => getMessageContent(drawInteractionType), [drawInteractionType]);
    console.log('subjectText', subjectText);

    const handleStartDrawing = async (e: string) => {

        if (e != 'None' && map && vectorSourceRef.current) {
            console.log('e', e);

            setDrawInteractionType(e as DrawInteractionType)
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
        else if (e === 'None') {
            map!.removeInteraction(drawInteractionRef.current!);
            setOpenMessage(false)
        }
    };


    console.log(subjectText, descriptionText);


    const closeButtonMessage = () => {
        setOpenMessage(false)
        vectorSourceRef.current!.removeFeature(currentFeature!);
        if (selectRef.current !== null) {
            selectRef.current.value = 'None';

        }
        map!.removeInteraction(drawInteractionRef.current!);
    }







    // const postApiCreateGeometry = async (
    //     body:Feature,
    //     partUrl: string,
    // ) => {

    //     try {
    //         setOpenAlertSnackbar(true);
    //         // Ensure the body object matches the IFeatures type
   
    //         const feature = convertToMapFeature(body);
    //         await addFeatureMutate({ partUrl, body });
    //         // Use a promise to handle the success and error cases
            
       

    //         console.log('openAlertSnackbar', openAlertSnackbar);
    //         setOpenMessage(false);

    //         // Store the timeout ID so it can be cleared if necessary
    //         const timeoutId = setTimeout(() => {
    //             setOpenAlertSnackbar(false);
    //         }, 6000);

    //         // Return a function to clear the timeout if necessary
    //         return () => clearTimeout(timeoutId);
    //     } catch (error) {
    //         console.error('Failed to add feature:', error);
    //         // Handle the error as needed
    //         setOpenMessage(true);
    //     }
    // };

    const handleClose = () => {
        if (selectRef.current !== null) {
            selectRef.current.value = 'None';

        }
        if (currentFeature) {
            // Remove the current feature from the vector source
            vectorSourceRef.current!.removeFeature(currentFeature);
            setOpenMessage(false)
            // Remove the current feature's overlay from the map
            // const deletedOverlay = polygons.find(polygon => polygon.feature === currentFeature)?.overlay;
            // if (deletedOverlay) {
            //     map!.removeOverlay(deletedOverlay);

            // }
        }

        setOpenAlertDialog(false);
    };

    const handleSave = async () => {
        setOpenAlertDialog(false)
        const idFeature = Date.now().toString();
        if (nameFeature && currentFeature) {
          const geometryFeature = currentFeature.getGeometry();
          let geoJson: IGeoJson | null = null;
          const feature = convertToMapFeature(currentFeature, idFeature, nameFeature);
        addFeatureMutate({ layer: drawInteractionType === 'Polygon' ? 'polygonsLayer' : 'eventsLayer', feature });
        //   if (drawInteractionType==='Polygon') {
        //     const coordinates = (geometryFeature as Polygon).getCoordinates()[0];
        //     const convertedCoordinates = coordinates.map((coord) => {
        //       const [lon, lat] = transform(coord, 'EPSG:3857', 'EPSG:4326');
        //       return [Number(lon), Number(lat)];
        //     }) as Array<[number, number]>;
      
        //     geoJson = {
        //       type: 'Polygon',
        //       coordinates: convertedCoordinates,
        //     };
        
    
        //   } else if (drawInteractionType === 'Point') {
        //     const coordinates = (geometryFeature as Point).getCoordinates();
        //     const olTargetCoordinate = transform(coordinates, 'EPSG:3857', 'EPSG:4326') as [number, number];
      
        //     geoJson = {
        //       type: 'Point',
        //       coordinates: olTargetCoordinate,
        //     };
        //   }
        //   if (geoJson) {
        //     const olGeometry = createOlGeometry(geoJson);
      
        //     const feature = new Feature({
        //       geometry: olGeometry,
        //       id: idFeature,
        //       name: nameFeature,
        //       type: 'Feature',
        //       properties: {
        //         name,
        //         typeStyle: 'style1',
        //         typeEvent: 'event1',
        //       },
        //     });
        //     await postApiCreateGeometry(feature,drawInteractionType === 'Polygon' ? 'polygonsLayer' : 'eventsLayer' );
        // }
        handleClose()
        }

    };
    

       
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNameFeature(event.target.value);
    };


    return (
        <div className="create-polygon">

            <div className="row-box">

                <button
                    className="form-control"
                    onClick={() => setOpenAlertDialog(true)}
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

            <AlertDialog openAlertDialog={openAlertDialog} setOpenAlertDialog={setOpenAlertDialog} handleSave={handleSave} handleClose={handleClose} handleChange={handleChange} subjectText="אנה הזן שם לאתר/פוליגון" labelText="שם האתר/הפוליגון"/>
            {openMessage && <MessageCartoon closeButtonMessage={closeButtonMessage} subjectText={subjectText} descriptionText={descriptionText} />}
            <SnackbarMessage openAlertSnackbar={openAlertSnackbar} />
        </div>
    )
}
export default FormSelect;