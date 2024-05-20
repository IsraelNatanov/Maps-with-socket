import { Feature } from "ol";
import { Point } from "ol/geom";
import Fill from "ol/style/Fill";
import Icon from "ol/style/Icon";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import styleR from '../images/icons8-map-64.png'
import styleU from '../images/381599_error_icon.svg'
import styleL from '../images/right-arrow.png'
import CSS from "csstype";
// Create a style function that applies the different styles based on a property value
export const styleFunction = (feature: { get: (arg0: string) => string }) => {
  if (feature.get("typeStyle") == "value2") {
    return styleUnique;
  } 
  else if(!feature.get("typeStyle")){
    // console.log(25);
    
    
  }


  else {
    console.log(feature.get("typeStyle"));
    
    // console.log(1111111);

    return styleRegular;
  }
};

// Create two different styles
const styleRegular = new Style({
  image: new Icon({
    src: styleR,
    anchor: [0.5, 1],
  }),
  stroke: new Stroke({
    color: "black",
    width: 3,
  }),
  fill: new Fill({
    color: "rgba(0, 0, 255, 0.1)",
  }),
});
const styleUnique = new Style({
  image: new Icon({
    src: styleU,
    anchor: [0.5, 1],
  }),
  stroke: new Stroke({
    color: "red",
    width: 3,
  }),
});

// Create style fot LineSring
export const styleLineString = function (feature: any) {
  const geometry = feature.getGeometry();
  const styles = [
    // linestring
    new Style({
      stroke: new Stroke({
        color: "#ffcc33",
        width: 3,
      }),
    }),
  ];

  geometry.forEachSegment(function (start: any, end: any) {
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const rotation = Math.atan2(dy, dx);
    // arrows
    styles.push(
      new Style({
        // style icon arrows
        geometry: new Point(end),
        image: new Icon({
          src: styleL,
          anchor: [0.75, 0.5],
          rotateWithView: true,
          rotation: -rotation,
        }),
      })
    );
  });

  return styles;
};
export const styleButton: CSS.Properties = {
  display: "flex",
  flexDirection: "column-reverse",
  fontSize: "16px",
  minWidth:'115px',
};