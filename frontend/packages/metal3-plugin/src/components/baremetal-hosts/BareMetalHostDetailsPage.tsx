import * as React from 'react';
import { referenceForModel } from '@console/internal/module/k8s';
import { DetailsPage } from '@console/internal/components/factory';
import { navFactory, FirehoseResource } from '@console/internal/components/utils';
import { MachineModel, MachineSetModel, NodeModel, BareMetalHostModel } from '@console/internal/models';
import { ResourceEventStream } from '@console/internal/components/events';
import { useFlag } from '@console/shared/src/hooks/flag';
import { NodeMaintenanceModel } from '../../models';
import BareMetalHostDashboard from './dashboard/BareMetalHostDashboard';
import BareMetalHostNICs from './BareMetalHostNICs';
import { menuActionsCreator } from './host-menu-actions';
import BareMetalHostDisks from './BareMetalHostDisks';
import BareMetalHostDetails from './BareMetalHostDetails';
import { NODE_MAINTENANCE_FLAG } from '../../features';

type BareMetalHostDetailsPageProps = {
  namespace: string;
  name: string;
  match: any;
};

const BareMetalHostDetailsPage: React.FC<BareMetalHostDetailsPageProps> = (props) => {
  const hasNodeMaintenanceCapability = useFlag(NODE_MAINTENANCE_FLAG);
  const resources: FirehoseResource[] = [
    {
      kind: referenceForModel(MachineModel),
      namespaced: true,
      isList: true,
      prop: 'machines',
    },
    {
      kind: referenceForModel(MachineSetModel),
      namespaced: true,
      isList: true,
      prop: 'machineSets',
    },
    {
      kind: NodeModel.kind,
      namespaced: false,
      isList: true,
      prop: 'nodes',
    },
  ];

  if (hasNodeMaintenanceCapability) {
    resources.push({
      kind: referenceForModel(NodeMaintenanceModel),
      namespaced: false,
      isList: true,
      prop: 'nodeMaintenances',
      optional: true,
    });
  }

  const nicsPage = {
    href: 'nics',
    name: 'Network Interfaces',
    component: BareMetalHostNICs,
  };
  const disksPage = {
    href: 'disks',
    name: 'Disks',
    component: BareMetalHostDisks,
  };
  const dashboardPage = {
    href: '',
    name: 'Overview',
    component: BareMetalHostDashboard,
  };
  const detailsPage = {
    href: 'details',
    name: 'Details',
    component: BareMetalHostDetails,
  };
  return (
    <DetailsPage
      {...props}
      pagesFor={() => [
        dashboardPage,
        detailsPage,
        navFactory.editYaml(),
        nicsPage,
        disksPage,
        navFactory.events(ResourceEventStream),
      ]}
      kind={referenceForModel(BareMetalHostModel)}
      resources={resources}
      menuActions={menuActionsCreator}
      customData={{ hasNodeMaintenanceCapability }}
    />
  );
};
export default BareMetalHostDetailsPage;
