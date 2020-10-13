import * as React from 'react';
// import { Link } from 'react-router-dom';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';

import { K8sResourceKind } from '../module/k8s';
import { DetailsPage, ListPage, Table, TableRow, TableData, RowFunction } from './factory';
import {
  // AsyncComponent,
  // DetailsItem,
  Kebab,
  KebabAction,
  detailsPage,
  LabelList,
  navFactory,
  NodesComponent,
  ResourceKebab,
  ResourceLink,
  ResourceSummary,
  SectionHeading,
  Selector,
} from './utils';
import { ResourceEventStream } from './events';
import { ClusterModel } from '../models';

export const menuActions: KebabAction[] = [
  ...Kebab.getExtensionsActionsForKind(ClusterModel),
  ...Kebab.factory.common,
];

const kind = 'Cluster';

const tableColumnClasses = [
  '',
  '',
  classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'pf-u-w-16-on-lg'),
  classNames('pf-m-hidden', 'pf-m-visible-on-lg'),
  classNames('pf-m-hidden', 'pf-m-visible-on-lg'),
  Kebab.columnClass,
];

const ClusterTableHeader = () => {
  return [
    {
      title: 'Name',
      sortField: 'metadata.name',
      transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: 'Namespace',
      sortField: 'metadata.namespace',
      transforms: [sortable],
      props: { className: tableColumnClasses[1] },
    },
    {
      title: 'Labels',
      sortField: 'metadata.labels',
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    {
      title: 'Pod Selector',
      sortField: 'spec.selector',
      transforms: [sortable],
      props: { className: tableColumnClasses[4] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[5] },
    },
  ];
};
ClusterTableHeader.displayName = 'ClusterTableHeader';

const ClusterTableRow: RowFunction<K8sResourceKind> = ({ obj: cluster, index, key, style }) => {
  return (
    <TableRow id={cluster.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink
          kind={kind}
          name={cluster.metadata.name}
          namespace={cluster.metadata.namespace}
          title={cluster.metadata.uid}
        />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink
          kind="Namespace"
          name={cluster.metadata.namespace}
          title={cluster.metadata.namespace}
        />
      </TableData>
      <TableData className={tableColumnClasses[3]}>
        <LabelList kind={kind} labels={cluster.metadata.labels} />
      </TableData>
      <TableData className={tableColumnClasses[4]}>
        <Selector selector={cluster.spec.selector} namespace={cluster.metadata.namespace} />
      </TableData>
      <TableData className={tableColumnClasses[5]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={cluster} />
      </TableData>
    </TableRow>
  );
};

const ClusterNodes: React.FC<ClusterNodesProps> = (props) => (
  <NodesComponent {...props} customData={{ showNodes: true }} />
);

export const ClusterDetailsList: React.FC<ClusterDetailsListProps> = ({ cl }) => (
  <dl className="co-m-pane__details">
  </dl>
);

const ClusterDetails: React.FC<ClusterDetailsProps> = ({ obj: cluster }) => (
  <>
    <div className="co-m-pane__body">
      <SectionHeading text="Cluster Details" />
      <div className="row">
        <div className="col-lg-6">
          <ResourceSummary resource={cluster} />
        </div>
        <div className="col-lg-6">
          <ClusterDetailsList cl={cluster} />
        </div>
      </div>
    </div>
  </>
);


const { details, nodes, editYaml, events } = navFactory;
export const Clusters: React.FC = (props) => (
  <Table
    {...props}
    aria-label="Clusters"
    Header={ClusterTableHeader}
    Row={ClusterTableRow}
    virtualize
  />
);

export const ClustersPage: React.FC<ClustersPageProps> = (props) => (
  <ListPage canCreate={true} ListComponent={Clusters} kind={kind} {...props} />
);

export const ClustersDetailsPage: React.FC<ClustersDetailsPageProps> = (props) => (
  <DetailsPage
    {...props}
    kind={kind}
    menuActions={menuActions}
    pages={[
      details(detailsPage(ClusterDetails)),
      editYaml(),
      nodes(ClusterNodes),
      events(ResourceEventStream),
    ]}
  />
);

type ClusterDetailsListProps = {
  cl: K8sResourceKind;
};


type ClusterDetailsProps = {
  obj: K8sResourceKind;
};

type ClustersPageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
};

type ClustersDetailsPageProps = {
  match: any;
};

type ClusterNodesProps = {
  obj: K8sResourceKind;
};