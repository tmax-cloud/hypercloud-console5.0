import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { Status } from '@console/shared';
import { K8sResourceKind, K8sKind } from '../../module/k8s';
import { DetailsPage, ListPage } from '../factory';
import { DetailsItem, Kebab, KebabAction, detailsPage, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading, Timestamp } from '../utils';
import { ClusterManagerModel } from '../../models';
import { configureClusterNodesModal } from './modals';
import { MembersPage } from './members';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { ResourceEventStream } from '../events';
import { TableProps } from './utils/default-list-component';

const ModifyClusterNodes: KebabAction = (kind: K8sKind, obj: any) => {
  const { t } = useTranslation();
  return {
    label: 'COMMON:MSG_COMMON_ACTIONBUTTON_78',
    callback: () =>
      configureClusterNodesModal({
        resourceKind: kind,
        resource: obj,
        title: t('COMMON:MSG_MAIN_POPUP_11'),
        message: t('COMMON:MSG_MAIN_POPUP_12'),
        buttonText: t('COMMON:MSG_MAIN_POPUP_15'),
      }),
    accessReview: {
      group: kind.apiGroup,
      resource: kind.plural,
      name: obj.metadata.name,
      verb: 'patch',
    },
  };
};

const kind = ClusterManagerModel.kind;

const getMenuActions = type => {
  let menuActions: any[];
  if (type === ClusterType.CREATED) {
    menuActions = [ModifyClusterNodes, ...Kebab.getExtensionsActionsForKind(ClusterManagerModel), ...Kebab.factory.common];
  } else {
    menuActions = [...Kebab.getExtensionsActionsForKind(ClusterManagerModel), ...Kebab.factory.common];
  }
  return menuActions;
};

const ClusterType = {
  CREATED: 'created',
  REGISTERED: 'registered',
};

const TypeColumnItem = (props: TypeColumnItemProps) => {
  const { type } = props;
  const { t } = useTranslation();
  return <>{type === ClusterType.CREATED ? t('MULTI:MSG_MULTI_CLUSTERS_TABLECONTENTS_TYPE_1') : type === ClusterType.REGISTERED ? t('MULTI:MSG_MULTI_CLUSTERS_TABLECONTENTS_TYPE_2') : '-'}</>;
};

const tableProps: TableProps = {
  header: [
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_58',
      sortField: 'metadata.name',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_2',
      sortField: 'metadata.namespace',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_59',
      sortField: 'spec.provider',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_60',
      sortField: 'spec.provider',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_61',
      sortField: 'status.ready',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_62',
      sortField: 'spec.version',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_94',
      sortField: 'spec.masterNum',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_95',
      sortField: 'spec.workerNum',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_12',
      sortField: 'metadata.creationTimestamp',
    },
    {
      title: '',
      transforms: null,
      props: { className: Kebab.columnClass },
    },
  ],
  row: (cluster: K8sResourceKind) => {
    const type = cluster.metadata.labels?.type;
    return [
      {
        children: <ResourceLink kind={kind} name={cluster.metadata.name} displayName={cluster.metadata.name} title={cluster.metadata.uid} namespace={cluster.metadata.namespace} />,
      },
      {
        className: 'co-break-word',
        children: <ResourceLink kind="Namespace" name={cluster.metadata.namespace} title={cluster.metadata.namespace} />,
      },
      {
        children: cluster.spec.provider,
      },
      {
        children: <TypeColumnItem type={type} />,
      },
      {
        children: cluster.status?.phase,
      },
      {
        children: cluster.spec.version,
      },
      {
        children: `${cluster.status?.masterRun ?? 0} / ${cluster.spec?.masterNum ?? 0}`,
      },
      {
        children: `${cluster.status?.workerRun ?? 0} / ${cluster.spec?.workerNum ?? 0}`,
      },
      {
        children: <Timestamp timestamp={cluster.metadata.creationTimestamp} />,
      },
      {
        className: Kebab.columnClass,
        children: <ResourceKebab actions={getMenuActions(type)} kind={kind} resource={cluster} />,
      },
    ];
  },
};

export const ClusterDetailsList: React.FC<ClusterDetailsListProps> = ({ cl }) => {
  const { t } = useTranslation();
  return (
    <dl className="co-m-pane__details">
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_1')} obj={cl} path="spec.provider" />
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_2')} obj={cl} path="spec.provider">
        {cl.spec.provider ? t('MULTI:MSG_MULTI_CLUSTERS_TABLECONTENTS_TYPE_1') : t('MULTI:MSG_MULTI_CLUSTERS_TABLECONTENTS_TYPE_2')}
      </DetailsItem>
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_13')} obj={cl} path="status.ready">
        <Status status={cl.status.ready ? t('MULTI:MSG_MULTI_CLUSTERS_TABLECONTENTS_STATUS_1') : t('MULTI:MSG_MULTI_CLUSTERS_TABLECONTENTS_STATUS_2')} />
      </DetailsItem>
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_55')} obj={cl} path="spec.version" />
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_56')} obj={cl} path="spec.region" />
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_62')} obj={cl} path="spec.masterNum">
        {`${cl.status?.masterRun ?? 0} / ${cl.spec.masterNum ?? 0}`}
      </DetailsItem>
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_59')} obj={cl} path="spec.masterType" />
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_63')} obj={cl} path="spec.workerNum">
        {`${cl.status?.workerRun ?? 0} / ${cl.spec.workerNum ?? 0}`}
      </DetailsItem>
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_60')} obj={cl} path="spec.workerType" />
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_61')} obj={cl} path="spec.sshKey" />
    </dl>
  );
};

interface TypeColumnItemProps {
  type: string;
}

interface KeyValuePrintProps {
  obj: any;
  key: string;
}

const KeyValuePrint: React.FC<KeyValuePrintProps> = ({ obj, key }) => {
  return <div>{`${key} / ${obj[key]}`}</div>;
};

const ClusterDetails: React.FC<ClusterDetailsProps> = ({ obj: cluster }) => {
  // const owner = cluster.status.owner && Object.keys(cluster.status.owner)[0];
  const members = cluster.status.members && Object.keys(cluster.status.members);
  const groups = cluster.status.groups && Object.keys(cluster.status.groups);
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(cluster, t) })} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={cluster} />
            {cluster.status.members && <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_39')} obj={cluster} children={members.map(member => KeyValuePrint({ obj: cluster.status.members, key: member }))} />}
            {cluster.status.groups && <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_40')} obj={cluster} children={groups.map(group => KeyValuePrint({ obj: cluster.status.groups, key: group }))} />}
          </div>
          <div className="col-lg-6">
            <ClusterDetailsList cl={cluster} />
          </div>
        </div>
      </div>
    </>
  );
};

const { /* nodes, */ editResource, events } = navFactory;

export const ClustersPage: React.FC = props => {
  const pages = [
    {
      href: 'clustermanagers',
      name: 'COMMON:MSG_LNB_MENU_84',
    },
    {
      href: 'clusterclaims',
      name: 'COMMON:MSG_LNB_MENU_105',
    },
    {
      href: 'clusterregistrations',
      name: 'COMMON:MSG_MAIN_TAB_3',
    },
  ];
  return <ListPage multiNavPages={pages} tableProps={tableProps} kind={kind} {...props} />;
};

export const ClustersDetailsPage: React.FC<ClustersDetailsPageProps> = props => {
  const [type, setType] = React.useState('');

  return (
    <DetailsPage
      {...props}
      titleFunc={(obj: any) => obj.metadata.name}
      kind={kind}
      menuActions={getMenuActions(type)}
      setCustomState={setType}
      customStatePath="metadata.labels.type"
      pages={[
        {
          href: '',
          name: 'COMMON:MSG_DETAILS_TABOVERVIEW_3',
          component: detailsPage(ClusterDetails),
        },
        editResource() /* nodes(ClusterNodes),  events(ResourceEventStream) */,
        /*{
          href: 'node',
          name: 'Node',
          component: pageProps => <MembersPage resource={pageProps.obj} title="Members" userHeading="Users" userGroupHeading="User Groups" />,
        },
        {
          href: 'namespace',
          name: 'Namespace',
          component: pageProps => <MembersPage resource={pageProps.obj} title="Members" userHeading="Users" userGroupHeading="User Groups" />,
        },
        {
          href: 'federation',
          name: 'Federation',
          component: pageProps => <MembersPage resource={pageProps.obj} title="Members" userHeading="Users" userGroupHeading="User Groups" />,
        },*/
        events(ResourceEventStream),
        {
          href: 'access',
          name: 'COMMON:MSG_DETAILS_TABACCESSPERMISSIONS_1',
          component: pageProps => <MembersPage clusterName={pageProps.obj.metadata.name} namespace={pageProps.obj.metadata.namespace} owner={pageProps.obj.metadata.annotations.owner} title="Members" />,
        },
      ]}
    />
  );
};

type ClusterDetailsListProps = {
  cl: K8sResourceKind;
};

type ClusterDetailsProps = {
  obj: K8sResourceKind;
};

type ClustersDetailsPageProps = {
  match: any;
};
