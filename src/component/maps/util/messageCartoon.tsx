import React from 'react'
import Box from "@mui/material/Box";
import CloseIcon from "@mui/icons-material/Close";
import Paper from "@mui/material/Paper";

type IPropsMessage = {
   
    closeButtonMessage:() => void
  }

export default function MessageCartoon({ closeButtonMessage}: IPropsMessage) {

  return (
    <Box
    sx={{
        position:"absolute",
        top: "620px",
        left:'50%',
        
        // left: "30px",
        zIndex:12,
        width: 312,
          height: 85,
    
      }}
  >
    <Paper elevation={3} sx={{ overflow: "hidden"}}>
      {" "}
      <div className="box-peper">
        <div className="row-box-subject">
           <div className="button-close" onClick={closeButtonMessage}> 
            <CloseIcon />
          </div>
          <div className="subject-text">שרטוט גזרה</div>{" "}
       
        </div>
        <div className="description">הנך נדרש לשרטט על המפה</div>
      </div>
    </Paper>
  </Box>
  )
}
