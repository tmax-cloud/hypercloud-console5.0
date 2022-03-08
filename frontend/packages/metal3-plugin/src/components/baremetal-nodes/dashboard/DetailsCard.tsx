import * as React from 'react';
import DashboardCard from '@console/shared/src/components/dashboard/dashboard-card/DashboardCard';
import DashboardCardHeader from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardHeader';
import DashboardCardTitle from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardTitle';
import DashboardCardBody from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardBody';
import DetailsBody from '@console/shared/src/components/dashboard/details-card/DetailsBody';
import DetailItem from '@console/shared/src/components/dashboard/details-card/DetailItem';
import DashboardCardLink from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardLink';
import { getNodeAddresses } from '@console/shared/src/selectors/node';
import { resourcePathFromModel, ResourceLink } from '@console/internal/components/utils';
import { NodeModel, BareMetalHostModel } from '@console/internal/models';
import { referenceForModel } from '@console/internal/module/k8s';
import NodeIPList from '@console/app/src/components/nodes/NodeIPList';
import { NodeDashboardContext } from '@console/app/src/components/nodes/node-dashboard/NodeDashboardContext';
import NodeRoles from '@console/app/src/components/nodes/NodeRoles';
import { useTranslation } from 'react-i18next';

import { BareMetalNodeDashboardContext } from './BareMetalNodeDashboardContext';

const DetailsCard: React.FC = () => {
  const { obj } = React.useContext(NodeDashboardContext);
  const { host } = React.useContext(BareMetalNodeDashboardContext);
  const detailsLink = `${resourcePathFromModel(NodeModel, obj.metadata.name)}/details`;
  const { t } = useTranslation();
  return (
    <DashboardCard data-test-id="details-card">
      <DashboardCardHeader>
        <DashboardCardTitle>{t('COMMON:MSG_DETAILS_TAB_1')}</DashboardCardTitle>
        <DashboardCardLink to={detailsLink}>{t('SINGLE:MSG_OVERVIEW_MAIN_POPOVEROPERATOR_ALL_1')}</DashboardCardLink>
      </DashboardCardHeader>
      <DashboardCardBody>
        <DetailsBody>
          <DetailItem isLoading={!obj} title={t('SINGLE:MSG_OVERVIEW_MAIN_CARDDETAILS_3')}>
            {obj.metadata.name}
          </DetailItem>
          <DetailItem isLoading={!obj} title={t('SINGLE:MSG_OVERVIEW_MAIN_CARDDETAILS_4')}>
            <NodeRoles node={obj} />
          </DetailItem>
          <DetailItem isLoading={!host} title={t('SINGLE:MSG_OVERVIEW_MAIN_CARDDETAILS_5')}>
            <ResourceLink kind={referenceForModel(BareMetalHostModel)} name={host?.metadata?.name} namespace={host?.metadata?.namespace} />
          </DetailItem>
          <DetailItem isLoading={!obj} title={t('SINGLE:MSG_OVERVIEW_MAIN_CARDDETAILS_2')}>
            <NodeIPList ips={getNodeAddresses(obj)} expand />
          </DetailItem>
        </DetailsBody>
      </DashboardCardBody>
    </DashboardCard>
  );
};

export default DetailsCard;
