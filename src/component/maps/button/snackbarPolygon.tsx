import * as React from "react";
import Stack from "@mui/material/Stack";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { Snackbar } from "@mui/material";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
type OpenProps = {
  setOpenAlert: React.Dispatch<React.SetStateAction<boolean>>;
  openAlert: boolean;
};

export default function SnackbarPolygon({ setOpenAlert, openAlert }: OpenProps) {


  return (
    <Snackbar open={openAlert} >
        <Alert  severity="success" sx={{ width: '100%' }}>
       ! נוסף בהצלחה
        </Alert>
      </Snackbar>
  );
}
