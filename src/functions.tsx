
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
type NestedArrayItem = Layer | any[] | number | null;

function checkForGroupLayer(value0: NestedArrayItem, depth: number): string {
  switch (true) {
    case Array.isArray(value0):
      console.log('Array', depth, value0)
      value0.map((value1: Array<any>, z) => checkForGroupLayer(value1, depth++))
      return 'Array';
    case typeof value0 === 'object' && 'layerType' in value0 && value0.layerType === LayerType.GROUP_LAYER:
      if (!('layers' in value0)) {
        return 'Invalid GroupLayer: missing layers';
      }
      console.log('GroupLayer', depth, value0)
      value0.layers.map((value1: GroupLayer | ArcGISFeatureLayer, z) => checkForGroupLayer(value1, depth++))
      return `GroupLayer: ${value0.title}`;
    case typeof value0 === 'object' && 'layerType' in value0 && value0.layerType === LayerType.FEATURE_LAYER:
      if (!('url' in value0)) {
        return 'Invalid ArcGISFeatureLayer: missing url';
      }
      console.log('ArcGISFeatureLayer', depth, value0)
      return (
        <>{value0.id} - {value0.layerType} - {value0.url}</>
      )
      return `ArcGISFeatureLayer: ${value0.title}`;
    default:
      return `Other: ${typeof value0}`;
  }
}


export const parseLayers = (layerData: NestedArrayItem): string => {
  const result = checkForGroupLayer(layerData, 0);
  return result;
}

