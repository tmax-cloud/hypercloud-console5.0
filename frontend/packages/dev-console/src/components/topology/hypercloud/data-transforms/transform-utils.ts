import * as _ from 'lodash';
import { K8sResourceKind, referenceFor } from '@console/internal/module/k8s';
import { TransformResourceData } from '@console/shared';
import { ClusterServiceVersionKind } from '@console/operator-lifecycle-manager';
import { getImageForIconClass } from '@console/internal/components/catalog/catalog-item-icon';
import { TopologyDataModel, TopologyDataResources, TopologyDataObject, Node, Edge, Group, ConnectsToData } from '../topology-types';

/**
 * create instance of TransformResourceData, return object containing all methods
 */
export const createInstanceForResource = (resources: TopologyDataResources, utils?: Function[], installedOperators?: ClusterServiceVersionKind[]) => {
  const transformResourceData = new TransformResourceData(resources, utils, installedOperators);

  return {
    deployments: transformResourceData.createDeploymentItems,
    daemonSets: transformResourceData.createDaemonSetItems,
    statefulSets: transformResourceData.createStatefulSetItems,
  };
};

export const getTopologyGroupItems = (res: K8sResourceKind): Group => {
  const groupName = _.get(res, ['metadata', 'name']);

  return {
    id: `group:${res.kind}:${groupName}`,
    type: res.kind,
    name: groupName,
    nodes: [_.get(res, ['metadata', 'uid'])],
  };
};

export const createTopologyGroupNodeData  = (res: )