import React, { useEffect, useState } from "react";
import { Feature, Map as OlMap, View } from "ol";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";
import "ol/ol.css";
import Select from "ol/interaction/Select";
import Vector from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Draw, Modify, Snap } from "ol/interaction";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import rtlPlugin from "stylis-plugin-rtl";
import { prefixer } from "stylis";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import CloseIcon from "@mui/icons-material/Close";
import Geometry, { Type } from "ol/geom/Geometry";

const theme = createTheme({
  direction: "rtl", // Both here and <body dir="rtl">
});
// Create rtl cache
const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});

type MapProps = {
  setMap: React.Dispatch<React.SetStateAction<OlMap | null>>;
  map: OlMap | null;
};

export default function SelectGeomtry({ setMap, map }: MapProps) {
  const [draw, setDraw] = useState<Draw | null>(null);
  const [modify, setModify] = useState<Modify | null>(null);
  const [select, setSelect] = useState<Select | null>(null);
  const [snap, setSnap] = useState<Snap | null>(null);
  const [polygonLayer, setPolygonLayer] = useState<Vector<VectorSource<Geometry>>| null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<Feature<Geometry>[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (map) {
      const vectorSource = new VectorSource();
      const vectorLayer = new Vector({ source: vectorSource });

      setPolygonLayer(vectorLayer);
      map.addLayer(vectorLayer);

      const selectInteraction = new Select({
        layers: [vectorLayer],
        condition: (event) => event.type === "pointermove",
      });

      selectInteraction.on("select", (event) => {
        setSelectedFeatures(event.selected as Feature<Geometry>[]);
      });

      setSelect(selectInteraction);

      const modifyInteraction = new Modify({ source: vectorSource });
      setModify(modifyInteraction);

      const drawInteraction = new Draw({
        source: vectorSource,
        type: "Polygon",
        style: new Style({
          fill: new Fill({
            color: "rgba(255, 255, 255, 0.2)",
          }),
          stroke: new Stroke({
            color: "#ffcc33",
            width: 2,
          }),
          image: new CircleStyle({
            radius: 7,
            fill: new Fill({
              color: "#ffcc33",
            }),
          }),
        }),
      });

      setDraw(drawInteraction);

      const snapInteraction = new Snap({ source: vectorSource });
      setSnap(snapInteraction);

      map.addInteraction(selectInteraction);
      map.addInteraction(modifyInteraction);
      map.addInteraction(drawInteraction);
      map.addInteraction(snapInteraction);

      return () => {
        map.removeInteraction(selectInteraction);
        map.removeInteraction(modifyInteraction);
        map.removeInteraction(drawInteraction);
        map.removeInteraction(snapInteraction);
        map.removeLayer(vectorLayer);
      };
    }
  }, [map]);

  const handleDelete = () => {
    if (polygonLayer && selectedFeatures.length > 0) {
      const source = polygonLayer.getSource();
      selectedFeatures.forEach((feature) => {
        source!.removeFeature(feature);
      });
      setSelectedFeatures([]);
    }
  };

  const undoClick = () => {
    if (draw) {
      draw.removeLastPoint();
    }
  };

  const selectTypeValue = (type: string) => {
    if (draw) {
      map?.removeInteraction(draw);
    }
    const newDrawInteraction = new Draw({
      source: polygonLayer?.getSource()!,
      type: type as Type,
      style: new Style({
        fill: new Fill({
          color: "rgba(255, 255, 255, 0.2)",
        }),
        stroke: new Stroke({
          color: "#ffcc33",
          width: 2,
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: "#ffcc33",
          }),
        }),
      }),
    });
    setDraw(newDrawInteraction);
    map?.addInteraction(newDrawInteraction);
  };


  return (
    <div>
      <div className="row-box">
        <button className="button-delete-geomtery" onClick={handleDelete}>
          מחק גאומטרי
        </button>
        <button className="form-control" onClick={undoClick}>
          הפסק
        </button>
        <select
          className="form-select"
          id="type"
          onChange={(e) => selectTypeValue(e.target.value)}
        >
          <option value="None">None</option>
          <option value="Point">Point</option>
          <option value="LineString">LineString</option>
          <option value="Polygon">Polygon</option>
          <option value="Circle">Circle</option>
        </select>
        <label className="inpu-text" htmlFor="type">
          :סוג גאומטרי
        </label>
        {/* {open&&<NameGeomtry open={open} setOpen={setOpen}/>} */}
      </div>
    </div>
  );
}
