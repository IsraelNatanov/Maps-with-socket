import React, { useState, useEffect } from "react";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';

type OpenProps = {
  openLoading: boolean
}
export default function SimpleBackdrop({openLoading}:OpenProps) {
  // const [openLoading, setOpenLoading] = useState(false);
  // const handleClose = () => {
  //   setOpenLoading(false);
  // };
  // const handleOpen = () => {
  //   setOpenLoading(true);
  // };

  return (
    <div>
      {/* <Button onClick={handleOpen}>Show backdrop</Button> */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={openLoading}
        // onClick={handleClose}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}