import Geometry, { Type } from "ol/geom/Geometry";
import { DrawInteractionType } from "../typs/buttonsDataType";



// Define the type for the message content
interface MessageContent {
  subjectText: string;
  descriptionText: string;
}
export const getMessageContent = (drawInteractionType: DrawInteractionType): MessageContent => {
    switch(drawInteractionType) {
      case 'Polygon':
        return {
          subjectText: 'שרטוט גזרה',
          descriptionText: 'הנך נדרש לשרטט על המפה',
        };
      case 'Point':
        return {
          subjectText: 'בחר מיקום',
          descriptionText: 'הנך נדרש ללחוץ על מיקום במפה',
        };
      default:
        return {
          subjectText: '',
          descriptionText: '',
        };
    }
  };