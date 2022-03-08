import * as React from 'react';
import { useK8sWatchResource } from '@console/internal/components/utils/k8s-watch-hook';
import { BareMetalHostKind } from '../../types';
import { BareMetalHostModel } from '@console/internal/models';
import { getNodeMachineName, createBasicLookup } from '@console/shared';
import { getHostMachineName } from '../../selectors';
import BareMetalHostNICs from '../baremetal-hosts/BareMetalHostNICs';
import { referenceForModel, NodeKind } from '@console/internal/module/k8s';
import { PageComponentProps } from '@console/internal/components/utils';

const bareMetalHosts = {
  kind: referenceForModel(BareMetalHostModel),
  namespaced: true,
  isList: true,
};

const NICsPage: React.FC<PageComponentProps<NodeKind>> = ({ obj }) => {
  const [hosts, loaded, loadError] = useK8sWatchResource<BareMetalHostKind[]>(bareMetalHosts);
  let host: BareMetalHostKind;
  if (loaded) {
    const hostsByMachineName = createBasicLookup(hosts, getHostMachineName);
    host = hostsByMachineName[getNodeMachineName(obj)];
  }
  return <BareMetalHostNICs obj={host} loadError={loadError} />;
};

export default NICsPage;
