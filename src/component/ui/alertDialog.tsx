import React from "react";
import "ol/ol.css";

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import rtlPlugin from "stylis-plugin-rtl";
import { prefixer } from "stylis";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import Grid from '@mui/material/Grid';



const theme = createTheme({
    direction: "rtl", // Both here and <body dir="rtl">
});
// Create rtl cache
const cacheRtl = createCache({
    key: "muirtl",
    stylisPlugins: [prefixer, rtlPlugin],
});

interface MapComponentProps {

    openAlertDialog: boolean
    setOpenAlertDialog: React.Dispatch<React.SetStateAction<boolean>>;
    handleSave: ()=> void
    handleClose: ()=> void
    handleChange: (event: React.ChangeEvent<HTMLInputElement>)=>void;
    subjectText:string
    labelText:string
}



const AlertDialog: React.FC<MapComponentProps> = ({  openAlertDialog, handleSave, handleClose, handleChange ,subjectText, labelText}) => {
 

    return (
        <div className="create-polygon">

            <Dialog
                open={openAlertDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <DialogTitle id="alert-dialog-title" >
                        {subjectText}
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
                                    label={labelText}

                                  onChange={handleChange}
                                />
                            </div>
                        </ThemeProvider>
                    </CacheProvider>
                </DialogContent>
                <DialogActions sx={{ display: 'flex', justifyContent: "space-between" }}>


                    <Button onClick={handleClose}>בטל</Button>
                    <Button onClick={handleSave} autoFocus>
                        שמור
                    </Button>

                </DialogActions>
            </Dialog>

        </div>
    );
};

export default AlertDialog;
