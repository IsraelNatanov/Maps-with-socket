import React, { useEffect } from "react";
import { Feature, Map as OlMap } from "ol";
import "ol/ol.css";
import Select from "ol/interaction/Select";
import Vector from "ol/layer/Vector";
import Vectors from "ol/source/Vector";
import { Draw, Modify, Snap } from "ol/interaction";
import Geometry, { Type } from "ol/geom/Geometry";
import NameGeomtry from "./nameGeomtry";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import rtlPlugin from "stylis-plugin-rtl";
import { prefixer } from "stylis";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import CloseIcon from "@mui/icons-material/Close";

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
export default function SelectInteraction({ setMap, map }: MapProps) {
  const [open, setOpen] = React.useState<boolean>(false);

  // useEffect(() => {
  //   if (draw) {
  //     draw!.on("drawend", function () {
  //       map!.removeInteraction(draw!);
  //       console.log(17);
  //       setOpen(true);
  //     });
  //   }
  // }, [open]);


  //   useEffect(()=>{
  // map!.addLayer(vectorUse)
  // map!.addInteraction(modify);
  //   },[])
let i = 0; 
  let draw: Draw | null = null;
  let snap: Snap | null = null;
  // global so we can remove it later
  function addInteractionUse(e: string) {
    select = new Select({
      layers: [vectorUse],
    });


    map!.addInteraction(select);

    map!.addInteraction(modify);

    if (e !== "None") {
     

      draw = new Draw({
        source: sourceUse,
        type: e as Type,
      });

      // map!.removeOverlay(overlay!);
      map!.addInteraction(draw);
     
      snap = new Snap({ source: sourceUse });
      map!.addInteraction(snap);
      

    } else {
      // map!.addOverlay(overlay!);
    }
    map!.addLayer(vectorUse);

    draw!.on("drawend", function () {
      // map!.removeInteraction(draw!);
      console.log(17);
     
   
      // i++;
      setOpen(true);
     
   
    });

    
  }

  /**
   * Handle change event.
   */
  const polygonFeatures: Feature[] = [];

  const selectTypeValue = (e: string) => {

    
    map!.removeInteraction(draw!);
    map!.removeInteraction(snap!);

    addInteractionUse(e);
    console.log(11);
  };

  const sourceUse = new Vectors({ wrapX: false, features: polygonFeatures });
  let vectorUse = new Vector({
    source: sourceUse,
    style: {
      "fill-color": "rgba(255, 255, 255, 0.2)",
      "stroke-color": "#ffcc33",
      "stroke-width": 2,
      "circle-radius": 7,
      "circle-fill-color": "#ffcc33",
    },
  });

  const modify = new Modify({ source: sourceUse });

  let select = new Select();

  const undoClick = () => {
    const selectedFeatures = select.getFeatures();
 map!.removeInteraction(draw!);
    // map!.addLayer(vectorUse);
  };

  const deletePolygon = () => {
    let selectedFeatures = select.getFeatures();
    selectedFeatures = select.getFeatures();
    console.log("selectedFeatures", selectedFeatures);

    if (selectedFeatures.getLength() > 0) {
      const selectedFeature = selectedFeatures.item(0);
      sourceUse.removeFeature(selectedFeature);
      polygonFeatures.splice(polygonFeatures.indexOf(selectedFeature), 1);
    }
  };
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    console.log(1111111);
  };
  return (
    <div>
      <div className="row-box">
        <button className="button-delete-geomtery" onClick={deletePolygon}>
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
      <div>
        <Dialog
          open={open}
          // onClose={handleClosee}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <Grid
            container
            direction="row"
           justifyContent={'center'}
            alignItems="center"
          >
            <Button onClick={handleClose}>
              <CloseIcon />
            </Button>
            <DialogTitle id="alert-dialog-title" >
              {"אנה הזן שם "}
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
                    label="שם"
                    defaultValue={"פוליגון מס 1"}
                    helperText="Some important text"
                  />
                </div>
              </ThemeProvider>
            </CacheProvider>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>שמור</Button>
            {/* <Button onClick={handleClose} autoFocus>
          שמור
        </Button> */}
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}
