import React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Box, Button } from "@mui/material";
import { styleButton, styleFunction } from "../../style/styleFunction";
import { useEffect, useState , useRef} from "react";
import Popover from "@mui/material/Popover";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import rtlPlugin from "stylis-plugin-rtl";
import { prefixer } from "stylis";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { useAppSelector } from "../../../store/hooks";
import Paper from "@mui/material/Paper";
import Vector from "ol/layer/Vector";
import Vectors from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Geometry } from "ol/geom";
import { Feature, Map as OlMap } from 'ol';
import { io } from "socket.io-client";
import {Features} from "../../../typs/featuresType"
import axios from "axios";
import NewEventMessage from "../util/newEventMessage";

const theme = createTheme({
  direction: "rtl", // Both here and <body dir="rtl">
});

// Create rtl cache
const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});

const format = new GeoJSON({ featureProjection: "EPSG:3857" });

type MapProps = {
 
  map:OlMap | null
  setIsPoint: React.Dispatch<React.SetStateAction<boolean>>;
  isPoint: boolean
  handleAddLayerPoint:()=>void

};

export default function DeviderEvent({map, setIsPoint, isPoint, handleAddLayerPoint}:MapProps) {
  const [isBell, setIsBell] = useState<boolean>(false);
  const [isEvent, setIsEvent] = useState<boolean>(false);
  const [isNewEvent, setIsNewEvent] = useState<boolean>(false);
  const featureIndexRef = useRef<Vector<Vectors<Geometry>> | null>(null);
  const eventSourceRef = useRef <Vectors<Geometry> | null>(null);
  const [eventesFeatures, setEventesFeatures] = useState<Features[]>([])
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const socket = io("http://localhost:5000")
  //     , { extraHeaders:{
  // ['Authorzation']: 'Brear '+ "jdjskd"
  //     }});
  
     
  
     
  
      // Listen for the "newPolygon" event
      socket.on("newEvent", (newPolygon: any) => {
        console.log(
          newPolygon
        );
        setIsNewEvent(true)
        setEventesFeatures([...eventesFeatures, newPolygon])

        
        // Add the new polygon to the map
     
      });

      const getApiEvents = async () => {
        try {
          const res = await axios.get("http://localhost:5000/events");
          setEventesFeatures(res.data);
          console.log(res.data);
          console.log(1212);
        } catch (error) {
          throw error;
        }
    
      };

      useEffect(()=>{
        getApiEvents()
      },[])

  const featuresOfStore = useAppSelector((state) => state.feature.features);
  function formatDate(jsonDate:any) {
    // Extract date and time components from the JSON string
    const dateTimeComponents = jsonDate.split("T");
    const dateComponent = dateTimeComponents[0];
    const timeComponent = dateTimeComponents[1];
  
    // Extract year, month, and day from the date component
    const [year, month, day] = dateComponent.split("-");
  
    // Extract hours and minutes from the time component
    const [hours, minutes] = timeComponent.split(":").slice(0, 2);
  
    // Format the date in the desired way
    const formattedDate = `${month}-${day}-${year} ${hours}:${minutes}`;
  
    return formattedDate;
  }

  const jsonDate = "2023-06-20T13:38:38";
  const currentDate = new Date(jsonDate);
  const customFormat = currentDate.toLocaleString("he-IL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  console.log("25",customFormat); 
  
  // Example usage:

  const formattedDate = formatDate(jsonDate);
  console.log(formattedDate); // Output: 06-20-2023 13:38
  

  const handleClick = () => {
    removEvent()
    setIsEvent(!isEvent)
    setIsBell(false);
 
  };



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

  const playEvent = async (index: number = eventesFeatures.length-1) => {
    if (index == null) {
      map!.removeLayer(featureIndexRef.current!);
      return;
    }
    map!.removeLayer( featureIndexRef.current!);
    if(!isPoint){
      handleAddLayerPoint()
    }

    eventSourceRef.current?.clear();

    featureOfIndex = format.readFeatures(eventesFeatures[index])
      
    featureIndexRef.current = featureIndex
    eventSource.addFeatures(featureOfIndex);
    setIsNewEvent(false)
    setIsEvent(true)


    if (index >= 0) {
      map!.addLayer(featureIndex);

    }
    eventSourceRef.current = eventSource
  };

  // sx={{ height: "440px", direction: "ltr", width: "100%",minHeight:410 }}
  return (
    <div >
{isNewEvent && <NewEventMessage setIsNewEvent={setIsNewEvent} playEvent={playEvent}/>}
      <CacheProvider value={cacheRtl}>
        <ThemeProvider theme={theme}>
          <div dir="rtl">
            <Button
              style={styleButton}
              variant="text"
              onClick={handleClick}
              sx={{position:'relative'}}
            >
              התראות
              <NotificationsIcon />
            </Button>
            {isEvent && <div><Box  sx={{position:'absolute', right:0, zIndex:7, width:'150px',height:'500px',  direction: "ltr", backgroundColor:'white', borderBottom:'3px'} } >
     

    <Paper elevation={3} sx={{ overflow: "hidden", height:467, overflowY:'auto',  scrollbarWidth: 'thin', '&::-webkit-scrollbar':{
  width:'0.4em',
    },
    '&::-webkit-scrollbar-track':{
      'backgroundColor':'#f1f1f1'
    },
    '&::-webkit-scrollbar-thumb':{
      'backgroundColor':'#888'
    },
    '&::-webkit-scrollbar-thumb:hover':{
      'backgroundColor':'#555'
    },
    }}>
            <List sx={{ padding: 0 }}>
      {eventesFeatures.map((item, index) => {
        if (!isBell && (index >= eventesFeatures.length - 5)) {
          return (
            <React.Fragment key={index}>
              <ListItem button onClick={()=>playEvent(item.id-1)}>
                {/* Use Typography components with appropriate props */}
                <ListItemText
                  primary={
                    <Typography component="div" variant="body1">
                      {item.label}
                    </Typography>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography component="div" variant="body2">
                        {item.label}
                      </Typography>
                      {item.date && (
                        <Typography component="div" variant="body2">
                   {item.date}
                        </Typography>
                      )}
                    </React.Fragment>
                  }
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          );
        }
        if (isBell) {
          return (
            <React.Fragment key={index}>
              <ListItem   button onClick={()=>playEvent(item.id-1)} >
                {/* Use Typography components with appropriate props */}
                <ListItemText
                  primary={
                    <Typography component="div" variant="body1">
                      {item.label}
                    </Typography>
                  }
            
                  secondary={
                    <React.Fragment>
                      <Typography component="div" variant="body2">
                        {item.label}
                      </Typography>
                      {item.date && (
                        <Typography component="div" variant="body2">
                          {item.date}
                        </Typography>
                      )}
                    </React.Fragment>
                  }
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          );
        }
      })}
   
    </List>
              
              </Paper>
              <Button
                sx={{
                  display: "flex",
                  width: '100%',
                  // justifyContent: 'center',
                  // alignItems: 'center',
                
                  // "&:hover": {
                  //   backgroundColor: "white",
                  // },
                }}
                variant="contained"
                onClick={() => setIsBell(!isBell)}
              >
                {isBell ? <> ראה פחות</> : <> כל האירועים</>}
              </Button>
               </Box></div>}
          </div>
        </ThemeProvider>
      </CacheProvider>
    </div>
  );
}
