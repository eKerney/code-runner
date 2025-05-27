import type React from 'react';
import { Accordion, Checkbox } from '@mantine/core';
import { useSelector } from 'react-redux';
import { selectedWebmapTitleSelector } from '../../store/slices/downloadKMZSlice';

const LayerType = {
  GROUP_LAYER: 'GroupLayer',
  FEATURE_LAYER: 'ArcGISFeatureLayer',
  UNKNOWN_LAYER: 'UnknownLayerType',
} as const;

type LayerType = (typeof LayerType)[keyof typeof LayerType];

export interface GroupLayer {
  id: string;
  title: string;
  layerType: typeof LayerType.GROUP_LAYER;
  layers: (GroupLayer | ArcGISFeatureLayer)[];
}

export interface ArcGISFeatureLayer {
  id: string;
  title: string;
  url: string;
  layerType: typeof LayerType.FEATURE_LAYER;
  fieldInfos?: any[];
  formInfo?: Record<string, any>;
  popupInfo?: Record<string, any>;
}

export interface UnknownLayerType {
  id: string;
  title: string;
  url: string;
  layerType: typeof LayerType.UNKNOWN_LAYER;
}

export type Layer = GroupLayer | ArcGISFeatureLayer | UnknownLayerType;
export type NestedArrayItem = Array<Layer> | Layer;

export const RenderLayers = ({
  nestedLayers,
  onLayerSelect,
  index,
  layerStates,
}: {
  nestedLayers: NestedArrayItem;
  onLayerSelect: void;
  index: number;
  layerStates: any;
}) => {
  const webmapTitle = useSelector(selectedWebmapTitleSelector);

  function layerRenderer(layers0: NestedArrayItem): React.JSX.Element {
    switch (true) {
      case layers0 !== null && Array.isArray(layers0):
        console.log('Array', layers0);
        return (
          <>
            {layers0.map((layers1: NestedArrayItem, i) => (
              <div key={`layerArray-${i}`} className='group'>
                <RenderLayers
                  nestedLayers={layers1}
                  index={i}
                  onLayerSelect={onLayerSelect}
                  layerStates={layerStates}
                />
              </div>
            ))}
          </>
        );

      case typeof layers0 === 'object' &&
        layers0 !== null &&
        'layerType' in layers0 &&
        layers0.layerType === LayerType.GROUP_LAYER:
        if (!('layers' in layers0)) return <>Invalid GroupLayer: missing layers</>;
        return (
          <Accordion key={`${layers0.id}-`} value={`${layers0.id}`}>
            <Accordion.Item key={`${layers0.id}-`} value={`${layers0.id}`}>
              <Accordion.Control>
                <div className='webmap-accordian-title'>Group: {webmapTitle}</div>
                {layers0.title}
              </Accordion.Control>
              {layers0.layers.map((layers1: Layer, z) => (
                <RenderLayers
                  nestedLayers={layers1}
                  index={z}
                  onLayerSelect={onLayerSelect}
                  layerStates={layerStates}
                />
              ))}
            </Accordion.Item>
          </Accordion>
        );

      case typeof layers0 === 'object' &&
        layers0 !== null &&
        'layerType' in layers0 &&
        layers0.layerType === LayerType.FEATURE_LAYER:
        if (!('url' in layers0)) return <>Invalid ArcGISFeatureLayer: missing url</>;
        return (
          <Accordion.Panel key={`${layers0.id}-${index}`}>
            <Checkbox
              style={{ marginTop: '5px' }}
              key={`${layers0.id}-${index}`}
              id={layers0.id}
              label={layers0.title}
              checked={false}
              onChange={(event) => onLayerSelect(event, layers0)}
            />
          </Accordion.Panel>
        );

      case typeof layers0 === 'object' &&
        layers0 !== null &&
        'layerType' in layers0 &&
        'id' in layers0 &&
        'title' in layers0 &&
        layers0.layerType !== LayerType.FEATURE_LAYER &&
        layers0.layerType !== LayerType.GROUP_LAYER:
        if (!('url' in layers0)) return <>Invalid Layer: missing url</>;
        return (
          <Accordion.Panel key={`${layers0.id}-${index}`}>
            UNKNOWN LAYER TYPE
            <Checkbox
              style={{ marginTop: '5px' }}
              key={`${layers0.id}-${index}`}
              id={layers0.id}
              label={layers0.title}
              checked={false}
              onChange={(event) => onLayerSelect(event, layers0)}
            />
          </Accordion.Panel>
        );
      default:
        return <>Unknown Layer Type</>;
    }
  }

  return <>{layerRenderer(nestedLayers)}</>;
};

export default RenderLayers;

