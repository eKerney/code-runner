import type React from "react";

const LayerType = {
  GROUP_LAYER: 'GroupLayer',
  FEATURE_LAYER: 'ArcGISFeatureLayer'
} as const;

type LayerType = typeof LayerType[keyof typeof LayerType];

interface GroupLayer {
  id: string;
  title: string;
  layerType: typeof LayerType.GROUP_LAYER;
  layers: (GroupLayer | ArcGISFeatureLayer)[];
}

interface ArcGISFeatureLayer {
  id: string | number;
  title: string;
  url: string;
  itemId: string;
  layerType: typeof LayerType.FEATURE_LAYER;
  fieldInfos?: any[];
  formInfo?: Record<string, any>;
  popupInfo?: Record<string, any>;
}

type Layer = GroupLayer | ArcGISFeatureLayer;
type NestedArrayItem = Array<Layer> | Layer;

export const RenderLayers = ({ nestedLayers }: { nestedLayers: NestedArrayItem }) => {

  function layerRenderer(layers0: NestedArrayItem): React.JSX.Element {
    switch (true) {
      case layers0 !== null
        && Array.isArray(layers0):
        console.log('Array', layers0)
        return (
          <>
            {layers0.map((layers1: NestedArrayItem, i) => (
              <div key={`layerArray-${i}`} className="group">
                <RenderLayers nestedLayers={layers1} />
              </div>
            ))}
          </>);

      case typeof layers0 === 'object'
        && layers0 !== null
        && 'layerType' in layers0
        && layers0.layerType === LayerType.GROUP_LAYER:
        if (!('layers' in layers0)) return (<>Invalid GroupLayer: missing layers</>);
        console.log('GroupLayer', layers0.title)
        return (
          <div key={layers0.id} className="group-children">
            <h3>{layers0.title} - {layers0.id}</h3>
            {layers0.layers.map((layers1: GroupLayer | ArcGISFeatureLayer) => <RenderLayers nestedLayers={layers1} />)}
          </div>
        )

      case typeof layers0 === 'object'
        && layers0 !== null
        && 'layerType' in layers0
        && layers0.layerType === LayerType.FEATURE_LAYER:
        if (!('url' in layers0)) return (<>Invalid ArcGISFeatureLayer: missing url</>);
        console.log('ArcGISFeatureLayer', layers0.title)
        return (<div key={layers0.id} className="layer"> {layers0.id} - {layers0.title} - {layers0.layerType} <br /></div>)
      default:
        return <>`Other: ${typeof layers0}`</>;
    }
  }

  return (
    <>
      <div className="layer-container">
        {layerRenderer(nestedLayers)}
      </div>
    </>
  )
}

export default RenderLayers;
