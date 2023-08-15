import React from 'react'
import Box from "@mui/material/Box";
import CloseIcon from "@mui/icons-material/Close";
import Paper from "@mui/material/Paper";
import {
  Button,
} from "@mui/material";

type PlayEventFunction = (index?: number) => Promise<void>;
type IPropsMessage = {
   
  setIsNewEvent :React.Dispatch<React.SetStateAction<boolean>>;
  playEvent: PlayEventFunction;
  dataNewEvent: string
  }

export default function NewEventMessage({setIsNewEvent, playEvent, dataNewEvent}:IPropsMessage) {


    const ButtonCenterStyles={
  display: 'flex',
  justifyContent: 'center',
  margin:'0 auto'
}  

  return (
    <Box
    sx={{
        position:"absolute",
        top: 80,
    
        left: '50%',
        zIndex:12,
        width: 312,
          height: 85,
    
      }}
  >
    <Paper elevation={3} sx={{ overflow: "hidden"}}>
    
      <div className="box-peper">
        <div className="row-box-subject">
           <div className="button-close" onClick={()=>setIsNewEvent(false)}> 
            <CloseIcon />
          </div>
          <div className="subject-text">הופעל אירוע</div>{" "}
       
        </div>
        <div className="description">אירוע בגזרת {dataNewEvent}</div>
        
      </div>
      <Button
            variant="text"
            size='medium'
            style={ButtonCenterStyles}
            onClick={()=>playEvent()}
            // sx={{display:'flex', justifyContent:'center'}}
            // onClick={handleAddLayerPoint}
          >
           הפעל אירוע
          </Button>
     
    </Paper>
  </Box>
  )
}
