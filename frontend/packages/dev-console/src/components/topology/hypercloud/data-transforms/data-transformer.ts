import * as _ from 'lodash';
import { K8sResourceKind, isGroupVersionKind, kindForReference, apiVersionForReference } from '@console/internal/module/k8s';
import { getImageForIconClass } from '@console/internal/components/catalog/catalog-item-icon';
import { TopologyDataModel, TopologyDataResources, Edge } from '../topology-types';
import { allowedHyperCloudResources } from '../topology-utils';
import { addToTopologyDataModel, createInstanceForResource, createTopologyNodeData, getTopologyEdgeItems, getTopologyGroupItems, getTopologyNodeItem, mergeGroup } from './transform-utils';

const getBaseTopologyDataModel = (resources: TopologyDataResources, allResources: K8sResourceKind, installedOperators, utils: Function[], transformBy: string[]): TopologyDataModel => {
  const baseDataModel: TopologyDataModel = {
    graph: { nodes: [], edges: [], groups: [] },
    topology: {},
  };
  const transformResourceData = createInstanceForResource(resources, utils, installedOperators);

  _.forEach(transformBy, key => {
    if (!_.isEmpty(resources[key]?.data)) {
      const typedDataModel: TopologyDataModel = {
        graph: { nodes: [], edges: [], groups: [] },
        topology: {},
      };

      transformResourceData[key](resources[key]?.data).forEach(item => {
          const {obj} = item;
          const uid = _.get(obj, ['metadata', 'uid']);
          typedDataModel.topology[uid] = createTopologyNodeData
      })
    }
  });
};
