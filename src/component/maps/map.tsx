import React, { useEffect, useRef } from 'react';
import { Map as OlMap, Overlay, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat } from 'ol/proj';
import OSM from "ol/source/OSM";
import FullScreen from 'ol/control/FullScreen';
import "ol/ol.css";
import "./maps.css"

type MapProps = {
  setMap: React.Dispatch<React.SetStateAction<OlMap | null>>;
  map: OlMap | null
};

function Map({ setMap }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const map = new OlMap({
      target: mapContainerRef.current!,
      view: new View({
        center: fromLonLat([34.84517762144668, 32.167921158434325]),
        zoom: 8,
        // extent,
      }),
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
       
      ],
      // Add your desired map configuration options here
    });

    // map.addInteraction(modify);

    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    document.body.appendChild(tooltip);

    const overlay = new Overlay({
      element: tooltip,
      offset: [10, 0],
      positioning: 'bottom-left',
    });

    map.addOverlay(overlay);

    const displayTooltip = (evt: any) => {
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

    map.on('pointermove', displayTooltip);

    setMap(map); // Set the map instance in the parent component

    

    // Clean up the map instance when the component is unmounted
    return () => {
      map.setTarget(undefined);
      // document.body.removeChild(tooltip);
    };
  }, [setMap]);

  // return <div ref={mapContainerRef} style={{ height: "77vh", width: "100%" }}  />;
  return(
    <div>
    <div ref={mapContainerRef} style={{ width: '100%', height: '87vh' }} />
    <div id="tooltip" className='tooltip hover' ref={tooltipRef} style={{ display: 'none' }} />
  </div>
  )
}

export default Map;
