

export interface FeaturesState {
    features: Features[]

  }
   export interface FeatureObject {
    type: string
    geometry: Geometry
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
  
  interface Geometry {
    coordinates: [number] | [[number],[number]];
    type: string
  }