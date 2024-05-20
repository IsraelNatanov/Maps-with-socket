import { Map as OlMap, } from 'ol';

import "ol/ol.css";
import "./maps.css"
import { useOlMap } from '../hooks/useOlMap';


type MapProps = {
  onMapCreated: (map: OlMap) => void;

};

function Map({ onMapCreated }: MapProps) {

  const ref = useOlMap(onMapCreated)

  return (
    <div
      ref={ref}
      style={{ minWidth: "100vh", height: "90vh" }}
    />

  );
};

export default Map


