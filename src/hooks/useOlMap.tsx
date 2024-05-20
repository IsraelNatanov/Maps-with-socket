import { MapBrowserEvent, Overlay, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { fromLonLat } from "ol/proj";
import { useEffect, useRef } from "react";
import { Map as OlMap } from "ol";
import { OSM } from "ol/source";

export const useOlMap = (onMapCreated: (map: OlMap) => void) => {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';

    const ref = useRef<HTMLDivElement>(null);

    const displayTooltip = (map: OlMap,overlay:Overlay, evt: MapBrowserEvent< 
        PointerEvent>) => {
        const pixel = map.getEventPixel(evt.originalEvent);
  
        const feature = map.forEachFeatureAtPixel(pixel, (feature) => feature);
        tooltip.style.display = feature ? '' : 'none';
  
        if (feature) {
          if (feature.get('name') != undefined) {
            overlay.setPosition(evt.coordinate);
            tooltip.innerHTML = feature.get('name');
          } else {
            tooltip.style.display = 'none';
          }
        }
      };

    useEffect(() => {
        const baseLayer = new TileLayer({
            preload: Infinity,
            source: new OSM(),

            properties: {
                name: "base-layer",
            },
        });

        const defaultView = new View({
            center: fromLonLat([35.616728941000076, 31.706401219000043]),
            zoom: 8,
        });

        const overlay = new Overlay({
            element: tooltip,
            offset: [10, 0],
            positioning: 'bottom-left',
          });
      
          
      

      

        const map = new OlMap({
            target: ref.current!,
            view: defaultView,
            layers: [baseLayer],
            overlays:[overlay]
        });

      
    map.on('pointermove', (evt) => displayTooltip(map,overlay, evt));
   
        onMapCreated(map);

        return () => {
            map.setTarget(undefined);
        };
    }, [onMapCreated]);

    return ref;
};
