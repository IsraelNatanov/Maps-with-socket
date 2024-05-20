import { click } from "ol/events/condition";
import Select, { SelectEvent } from "ol/interaction/Select";
import Layer from "ol/layer/Layer";

export const useMapSelect = (onSelect: (event: SelectEvent) => void, options?: {
    layers?: Layer[]
}) => {
    const select =  new Select({
        condition: click,
        layers: options?.layers, // Only select features from the vector layer
      });

      select.on("select", onSelect);

      return select

}