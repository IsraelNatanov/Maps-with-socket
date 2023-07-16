
export interface Eventes {
    features: Features[]

  }
   export interface FeatureObject {
    type: string
    geometry: GeometryType
    properties: Properties
  }

  
  export interface Features {
    featureObject: FeatureObject[]
    type: string,
    id: number,
    label: string
  }

 
   interface Properties {
    name: string,
    description: string,
    typeStyle: string,
    typeEvent: string
  }
  
  export interface GeometryType {
    coordinates: [number] | [[number],[number]];
    type: string
  }

  export interface GeometryTypePolygon {
    coordinates:  [[number],[number]][];
    type: string
  }
