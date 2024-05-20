import React from "react";
import { Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface PolygonItemProps {
  name: string;
  onDelete: () => void;
}

const PolygonItem: React.FC<PolygonItemProps> = ({ name, onDelete }) => {
  return (
    <div>
      <span>{name}</span>
      <Button onClick={onDelete}>
        <CloseIcon />
      </Button>
    </div>
  );
};

export default PolygonItem;
