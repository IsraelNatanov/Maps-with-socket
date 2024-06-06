export interface ButtonsDataType{
    id: string,
    text: string,
    icon: JSX.Element,
    onClick: () => void
  }

  export type DrawInteractionType = 'Polygon' | 'Point' | 'None';
  