import { useQuery, useMutation, useQueryClient, UseMutationResult } from 'react-query';

import { request } from '../utils/axios-utils';
import { Feature } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { MapFeature, createOlGeometry } from '../utils/createOlGeometry';
import { Geometry } from 'ol/geom';

const fetchData = (featureType: string): Promise<IFeatureCollection> => {
  return request({ url: `/${featureType}` }).then(response => response.data);
};

export const useGetFeaturesData = (
  featureType: string,
  onSuccess?: (data: IFeatureCollection) => void,
  onError?: (error: unknown) => void
) => {
  return useQuery<IFeatureCollection>([`${featureType}`], () => fetchData(featureType), {
    onSuccess,
    onError,
    keepPreviousData: true,
  });
};

interface IGeoJson {
  type: 'Point' | 'Polygon';
  coordinates: [number, number] | [number, number][][];
}

interface Properties {
  name: string;
  typeStyle: string;
  typeEvent: string;
}

interface IFeatures {
  id?: string;
  type: string;
  geometry: IGeoJson;
  properties: Properties;
}

export interface IFeatureCollection {
  type: 'FeatureCollection';
  features: IFeatures[];
}


export interface FeatureCollection {
  type: 'FeatureCollection';
  features: MapFeature[];
}



export interface AddFeatureParams {
  feature: MapFeature;
  layer: string;
}

 interface UseAddFeatureResult {
  mutate: (params: AddFeatureParams) => void;
}

export const useAddFeature = (vectorLayers: { [key: string]: VectorLayer<VectorSource<Geometry>> }): UseAddFeatureResult => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ feature, layer }: AddFeatureParams) => {
      // Make the API call to add the feature
      return request({ url: `/${layer}`, method: 'post', data: feature }).then(response => response.data);
    },
    {
      onMutate: async ({ layer, feature }: AddFeatureParams) => {
        await queryClient.cancelQueries(layer);
        const previousFeatures = queryClient.getQueryData<FeatureCollection>(layer);
        
        queryClient.setQueryData<FeatureCollection>(layer, (oldQueryData: FeatureCollection | undefined) => {
          if (!oldQueryData) {
            return { type: 'FeatureCollection', features: [feature] };
          }
          return { type: 'FeatureCollection', features: [...oldQueryData.features, feature] };
        });

        const mapLayer = vectorLayers[layer];
        console.log('mapLayer', mapLayer);
        
        if (mapLayer) {
          const source = mapLayer.getSource();
          console.log('source', source);
          
          const olFeature = new Feature({
            geometry: createOlGeometry(feature.geometry),
            ...feature.properties,
            id: feature.id,
          });
          source!.addFeature(olFeature);
        }

        return { previousFeatures, layer };
      },

      onError: (_err, _newFeature, context) => {
        if (context?.previousFeatures) {
          queryClient.setQueryData(context.layer, context.previousFeatures);
        }
      },

      onSettled: (_, __, { layer }) => {
        queryClient.invalidateQueries(layer);
      }
    }
  );
};


interface DeleteFeatureParams {
  layer: string;
  idFeature: string;
}

interface UseDeleteFeatureResult {
  mutate: (params: DeleteFeatureParams) => void;

}


const deleteFeature = async ({ layer, idFeature }: DeleteFeatureParams) => {
  // Make the API call to delete the feature
  const response = await request({ url: `/polygonsLayer/${idFeature}`, method: 'delete' });
  return response.data;
}

export const useDeleteFeature = (vectorLayers: { [key: string]: VectorLayer<VectorSource> }): UseDeleteFeatureResult => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ layer, idFeature }: DeleteFeatureParams) => {
      // Make the API call to delete the feature
      const response = await request({ url: `/polygonsLayer/${idFeature}`, method: 'delete' });
      return response.data;
    },
    {
      // Optimistic Update Start
      onMutate: async ({ layer, idFeature }: DeleteFeatureParams) => {
        await queryClient.cancelQueries(layer);

        const previousFeatures = queryClient.getQueryData<IFeatureCollection>(layer);

        queryClient.setQueryData<IFeatureCollection>(layer, oldQueryData => {
          if (!oldQueryData) return { type: 'FeatureCollection', features: [] };
          const updatedFeatures = oldQueryData.features.filter(item => item.id !== idFeature);
          return { type: 'FeatureCollection', features: updatedFeatures };
        });

        // Remove the feature from the map layer optimistically
        const mapLayer = vectorLayers[layer];
        if (mapLayer) {
          const source = mapLayer.getSource();
          const feature = source?.getFeatureById(idFeature);
          console.log('source', source);
          console.log('feature', source);
          
          if (feature) {
            source!.removeFeature(feature);
            console.log(`Feature with ID ${idFeature} removed from ${layer}`);
          } else {
            console.error(`Feature with ID ${idFeature} not found in ${layer}`);
          }
        }

        return { previousFeatures, layer, idFeature };
      },
      // Rollback on error
      onError: (_err, _newFeature, context: any) => {
        if (context?.previousFeatures) {
          queryClient.setQueryData(context.layer, context.previousFeatures);
          // Optionally, add the feature back to the map layer
          const mapLayer = vectorLayers[context.layer];
          if (mapLayer) {
            const source = mapLayer.getSource();
            const feature = context.previousFeatures.features.find((f: IFeatures) => f.id === context.idFeature);
            if (feature) {
              source!.addFeature(new Feature(feature)); // Ensure `ol/Feature` is correctly imported
              console.log(`Feature with ID ${context.idFeature} restored in ${context.layer}`);
            }
          }
        }
      },
      // Invalidate the query after mutation
      onSettled: (_, __, { layer }) => {
        queryClient.invalidateQueries(layer);
      }
      // Optimistic Update End
    }
  ) as UseMutationResult<unknown, unknown, DeleteFeatureParams, unknown>;
};