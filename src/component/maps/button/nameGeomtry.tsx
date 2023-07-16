import React from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle,  Grid,  TextField } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import rtlPlugin from "stylis-plugin-rtl";
import { prefixer } from 'stylis';
import { CacheProvider } from '@emotion/react';
import createCache from "@emotion/cache";
import CloseIcon from '@mui/icons-material/Close';



const theme = createTheme({
    direction: 'rtl', // Both here and <body dir="rtl">
  });
  // Create rtl cache
  const cacheRtl = createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
  });
  
  type OpenProps = {
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    open: boolean;
    setName: React.Dispatch<React.SetStateAction<string>>
  };

export default function NameGeomtry({ setOpen , open, setName}: OpenProps)  {
    // const [open, setOpen] = React.useState<boolean>(true);
   
    

      const handleClickOpen = () => {
        setOpen(true);
      };
    
      const handleClose = () => {
        setOpen(false);
        console.log(1111111);
        
      };

  return (
    <div>
    <Button variant="outlined" onClick={handleClickOpen}>
      Open alert dialog
    </Button>
    <Dialog
      open={open}
      // onClose={handleClosee}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <Grid
  container
  direction="row"
  justifyContent="space-between"
  alignItems="center"
>
       <Button onClick={handleClose}><CloseIcon /></Button>
      <DialogTitle id="alert-dialog-title">
        {"אנה הזן שם לאתר/פוליגון"}
      </DialogTitle>
 
      </Grid>
      <DialogContent>
      <CacheProvider value={cacheRtl}>
   
   <ThemeProvider theme={theme}>
   <div dir="rtl">
      <TextField
          id="name"
          margin='normal'
          fullWidth label="שם האתר/הפוליגון"
          defaultValue={"פוליגון מס 1"}
          helperText="Some important text"
          onChange={(e)=>setName(e.target.value)}
      
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
  )
}
