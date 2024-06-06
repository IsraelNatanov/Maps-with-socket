import React from 'react'
import Box from "@mui/material/Box";
import CloseIcon from "@mui/icons-material/Close";
import Paper from "@mui/material/Paper";
import Geometry, { Type } from "ol/geom/Geometry";
type IPropsMessage = {

  closeButtonMessage: () => void
  subjectText:string
  descriptionText:string

}

export default function MessageCartoon({ closeButtonMessage ,subjectText, descriptionText}: IPropsMessage) {
  // console.log('drawInteractionType', drawInteractionType);

  return (
    <Box
      sx={{
        position: "absolute",
        top: "620px",
        left: '50%',

        // left: "30px",
        zIndex: 12,
        width: 312,
        height: 85,

      }}
    >
      <Paper elevation={3} sx={{ overflow: "hidden" }}>
      <div className="box-peper">

          <div className="row-box-subject">
            <div className="button-close" onClick={closeButtonMessage}>
              <CloseIcon />
            </div>
            <div className="subject-text">{subjectText}</div>

          </div>
          <div className="description">{descriptionText}</div>

        </div>
        {/* {drawInteractionType === 'Point' && <div className="box-peper">

          <div className="row-box-subject">
            <div className="button-close" onClick={closeButtonMessage}>
              <CloseIcon />
            </div>
            <div className="subject-text"> בחר מיקום</div>{" "}

          </div>
          <div className="description">הנך נדרש ללחוץ על מיקום במפה</div>

        </div>} */}
      </Paper>
    </Box>
  )
}
