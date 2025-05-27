import React, { ChangeEvent } from 'react';
import { Accordion, Checkbox } from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import {
  setCheckedItems,
  checkedItemsSelector,
  selectedFeatureServiceSelector,
  selectedFeatureServiceLayersSelector,
  selectedWebmapLayersSelector,
  selectedWebmapTitleSelector,
} from '../../store/slices/downloadKMZSlice';
import { tokenSelector } from '../../store/slices/appSlice';
import RenderLayers, { ArcGISFeatureLayer } from './RenderLayers';

interface Props {
  layerStates: any;
  setLayerStates: any;
}

const ComponentTest = (allLayers: any) => {
  if (!allLayers?.length) return null;

  return <Accordion.Panel> </Accordion.Panel>;
};

const LayerCheckboxes = ({ layerStates, setLayerStates }: Props) => {
  const dispatch = useDispatch();
  const checkedItems = useSelector(checkedItemsSelector);
  const selectedWebmapLayers = useSelector(selectedWebmapLayersSelector);
  const selectedFeatureServiceLayers = useSelector(selectedFeatureServiceLayersSelector);
  const selectedFeatureService = useSelector(selectedFeatureServiceSelector);
  const token = useSelector(tokenSelector);
  const webmapTitle = useSelector(selectedWebmapTitleSelector);

  const handleSelectAllChange = (isChecked: boolean) => {
    const allLayers = [...(selectedWebmapLayers ?? []), ...(selectedFeatureServiceLayers ?? [])];
    const newLayerStates = { ...layerStates };
    allLayers.forEach((layer) => {
      newLayerStates[layer.id] = isChecked;
      if (layer.layerType === 'GroupLayer') {
        layer.layers.forEach((subLayer: any) => {
          if (subLayer.layerType === 'GroupLayer') {
            subLayer.layers.forEach((subSubLayer: any) => {
              newLayerStates[subSubLayer.id] = isChecked;
            });
          } else {
            newLayerStates[subLayer.id] = isChecked;
          }
        });
      } else if (layer.layerType === 'ArcGISFeatureLayer') {
        newLayerStates[`${layer.serviceItemId}_${layer.id}`] = isChecked;
      } else {
        newLayerStates[`${layer.serviceItemId}_${layer.id}`] = isChecked;
      }
    });
    setLayerStates(newLayerStates);

    if (isChecked) {
      dispatch(
        setCheckedItems(
          allLayers.flatMap((layer: any) => {
            if (layer.layerType === 'GroupLayer') {
              return layer.layers.flatMap((subLayer: any) => {
                if (subLayer.layerType === 'GroupLayer') {
                  return subLayer.layers.map((subSubLayer: any) => ({
                    label: subSubLayer.title,
                    url: `${subSubLayer.url}?token=${token}`,
                  }));
                } else {
                  return {
                    label: subLayer.title,
                    url: `${subLayer.url}?token=${token}`,
                  };
                }
              });
            } else {
              const url = layer?.layerType
                ? `${layer.url}?token=${token}`
                : `${selectedFeatureService}/${layer.id}?token=${token}`;

              const result = [
                {
                  id: `${layer?.serviceItemId}_${layer.id}`,
                  label: layer.title || layer.name,
                  url,
                },
              ];
              return result;
            }
          })
        )
      );
    } else {
      dispatch(setCheckedItems([]));
    }
  };

  const allLayers = [...(selectedWebmapLayers ?? []), ...(selectedFeatureServiceLayers ?? [])];

  const onLayerSelect = (event: ChangeEvent<HTMLInputElement>, layer: ArcGISFeatureLayer) => {
    const isChecked = event.target.checked;
    setLayerStates({ ...layerStates, [layer.id]: isChecked });
    console.log(isChecked, layer.title);
    if (isChecked) {
      dispatch(setCheckedItems([...checkedItems, { label: layer.title, url: `${layer.url}?token=${token}` }]));
    } else dispatch(setCheckedItems(checkedItems.filter((item) => item.label !== layer.title)));
  };

  return (
    <>
      {allLayers.length > 0 && (
        <div className='top-buttons'>
          <Checkbox
            className='select-all'
            label='Select All'
            checked={allLayers.every((layer) => layerStates[layer.id])}
            onChange={(event) => handleSelectAllChange(event.target.checked)}
          />
        </div>
      )}

      {
        <Accordion key='LayerAccordionRoot' value='LayerAccordionRoot'>
          <Accordion.Item key='LayerAccordionRoot' value='LayerAccordionRoot'>
            <RenderLayers nestedLayers={allLayers} onLayerSelect={onLayerSelect} index={0} />
          </Accordion.Item>
        </Accordion>
      }

      {/* allLayers.map((layer: any, index: number) => {
        const l = layer;
        if (layer?.title === 'Mortenson Design') {
          console.log('layer', layer);
        }
        if (layer.layerType === 'GroupLayer') {
          return (
            <Accordion key={`${layer.id}-${index}`}>
              <Accordion.Item key={`${layer.id}-${index}`} value={`${layer.id}-${index}`}>
                <Accordion.Control>
                  <div className='webmap-accordian-title'>Group: {webmapTitle}</div>
                  {layer.title}
                </Accordion.Control>

                {layer.layers.map((subLayer: any, index: number) => {
                  const sbb = subLayer;
                  if (subLayer?.layerType !== 'GroupLayer') {
                    return (
                      <Accordion.Panel key={`${layer.id}-${index}`}>
                        <Checkbox
                          style={{ marginTop: '5px' }}
                          key={`${subLayer.id}-${index}`}
                          id={subLayer.id}
                          label={subLayer.title}
                          checked={layerStates[subLayer.id] || false}
                          onChange={(event) => {
                            const isChecked = event.target.checked;
                            setLayerStates({ ...layerStates, [subLayer.id]: isChecked });
                            if (isChecked) {
                              dispatch(
                                setCheckedItems([
                                  ...checkedItems,
                                  { label: subLayer.title, url: `${subLayer.url}?token=${token}` },
                                ])
                              );
                            } else {
                              dispatch(setCheckedItems(checkedItems.filter((item) => item.label !== subLayer.title)));
                            }
                          }}
                        />
                      </Accordion.Panel>
                    );
                  }
                  return subLayer?.layers?.map((subSubLayer: any, index: number) => {
                    const subElse = subSubLayer;
                    //console.log('subSubLayer', subSubLayer);

                    if (subSubLayer?.layerType !== 'GroupLayer') {
                      return (
                        <Accordion.Panel key={`${subSubLayer.id}-${index}`}>
                          <Checkbox
                            style={{ marginTop: '5px' }}
                            key={`${subSubLayer.id}-${index}`}
                            id={subSubLayer.id}
                            label={subSubLayer.title}
                            checked={layerStates[subSubLayer.id] || false}
                            onChange={(event) => {
                              const isChecked = event.target.checked;
                              setLayerStates({ ...layerStates, [subSubLayer.id]: isChecked });
                              if (isChecked) {
                                dispatch(
                                  setCheckedItems([
                                    ...checkedItems,
                                    { label: subSubLayer.title, url: `${subSubLayer.url}?token=${token}` },
                                  ])
                                );
                              } else {
                                dispatch(
                                  setCheckedItems(checkedItems.filter((item) => item.label !== subSubLayer.title))
                                );
                              }
                            }}
                          />
                        </Accordion.Panel>
                      );
                    }

                    return subSubLayer?.layers?.map((innerSub: any, index: number) => {
                      const innnnn = innerSub;
                      //console.log('innerSub', innerSub);

                      if (innerSub?.layerType !== 'GroupLayer') {
                        return (
                          <Accordion.Panel key={`${innerSub.id}-${index}`}>
                            <Checkbox
                              style={{ marginTop: '5px' }}
                              key={`${innerSub.id}-${index}`}
                              id={innerSub.id}
                              label={innerSub.title}
                              checked={layerStates[innerSub.id] || false}
                              onChange={(event) => {
                                const isChecked = event.target.checked;
                                setLayerStates({ ...layerStates, [innerSub.id]: isChecked });
                                if (isChecked) {
                                  dispatch(
                                    setCheckedItems([
                                      ...checkedItems,
                                      { label: innerSub.title, url: `${innerSub.url}?token=${token}` },
                                    ])
                                  );
                                } else {
                                  dispatch(
                                    setCheckedItems(checkedItems.filter((item) => item.label !== innerSub.title))
                                  );
                                }
                              }}
                            />
                          </Accordion.Panel>
                        );
                      }
                      return innerSub?.layers?.map((v4Nested: any, index: number) => {
                        const v4ttt = v4Nested;
                        //console.log('v4Nested', v4Nested);
                        return (
                          <Accordion.Panel key={`${v4Nested.id}-${index}`}>
                            <Checkbox
                              style={{ marginTop: '5px' }}
                              key={`${v4Nested.id}-${index}`}
                              id={v4Nested.id}
                              label={v4Nested.title}
                              checked={layerStates[v4Nested.id] || false}
                              onChange={(event) => {
                                const isChecked = event.target.checked;
                                setLayerStates({ ...layerStates, [v4Nested.id]: isChecked });
                                if (isChecked) {
                                  dispatch(
                                    setCheckedItems([
                                      ...checkedItems,
                                      { label: v4Nested.title, url: `${v4Nested.url}?token=${token}` },
                                    ])
                                  );
                                } else {
                                  dispatch(
                                    setCheckedItems(checkedItems.filter((item) => item.label !== v4Nested.title))
                                  );
                                }
                              }}
                            />
                          </Accordion.Panel>
                        );
                      });
                    });
                  });

                })}
              </Accordion.Item>
            </Accordion>
          );
        } else {
          return (
            <Checkbox
              className='webmap-layer-checkbox'
              style={{ marginTop: '5px' }}
              key={`${layer.id}-${index}`}
              id={layer.id}
              label={layer.title || layer.name}
              checked={layerStates[`${layer.serviceItemId}_${layer.id}`] || false}
              onChange={(event) => {
                const isChecked = event.target.checked;
                setLayerStates({ ...layerStates, [`${layer.serviceItemId}_${layer.id}`]: isChecked });

                if (isChecked) {
                  const url = layer?.layerType
                    ? `${layer.url}?token=${token}`
                    : `${selectedFeatureService}/${layer.id}?token=${token}`;
                  dispatch(
                    setCheckedItems([
                      ...checkedItems,
                      {
                        id: `${layer?.serviceItemId || layer?.id}_${layer.id}`,
                        label: layer.title || layer.name,
                        url,
                      },
                    ])
                  );
                } else {
                  dispatch(
                    setCheckedItems(checkedItems.filter((item) => item.id !== `${layer.serviceItemId}_${layer.id}`))
                  );
                }
              }}
            />
          );
        }

      }) */}
    </>
  );
};

export default LayerCheckboxes;

