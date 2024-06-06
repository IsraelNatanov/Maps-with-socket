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
  openAlertSnackbar: boolean;
};

export default function SnackbarMessage({  openAlertSnackbar }: OpenProps) {


  return (
    <Snackbar open={openAlertSnackbar} >
        <Alert  severity="success" sx={{ width: '100%' }}>
       ! נוסף בהצלחה
        </Alert>
      </Snackbar>
  );
}
