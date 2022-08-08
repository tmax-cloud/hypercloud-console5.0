import * as React from 'react';
import * as classNames from 'classnames';
import { connect } from 'react-redux';
import * as _ from 'lodash';
import { sortable } from '@patternfly/react-table';
import { getName, getUID } from '@console/shared';
import { getNodeRole } from '@console/shared/src/selectors/node';
import { NodeModel } from '@console/internal/models';
import { NodeKind, referenceForModel } from '@console/internal/module/k8s';
import { Table, TableRow, TableData, ListPage, RowFunctionArgs } from '@console/internal/components/factory';
import { Kebab, ResourceKebab, ResourceLink, Timestamp, humanizeBinaryBytes, formatCores } from '@console/internal/components/utils';
import { NodeMetrics, setNodeMetrics } from '@console/internal/actions/ui';
import { PROMETHEUS_BASE_PATH } from '@console/internal/components/graphs';
import { coFetchJSON } from '@console/internal/co-fetch';
import { getPrometheusURL, PrometheusEndpoint } from '@console/internal/components/graphs/helpers';
import { nodeStatus } from '../../status/node';
import NodeRoles from './NodeRoles';
import { MarkAsSchedulable, MarkAsUnschedulable } from './menu-actions';
import { useTranslation } from 'react-i18next';
import NodeStatus from './NodeStatus';

const tableColumnClasses = ['', '', '', classNames('pf-m-hidden', 'pf-m-visible-on-xl'), classNames('pf-m-hidden', 'pf-m-visible-on-xl'), classNames('pf-m-hidden', 'pf-m-visible-on-xl'), classNames('pf-m-hidden', 'pf-m-visible-on-xl'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), Kebab.columnClass];

const NodeTableHeader = t => {
  return [
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_1'),
      sortField: 'metadata.name',
      transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_3'),
      sortFunc: 'nodeReadiness',
      transforms: [sortable],
      props: { className: tableColumnClasses[1] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_96'),
      sortFunc: 'nodeRoles',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_67'),
      sortFunc: 'nodePods',
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_65'),
      sortFunc: 'nodeMemory',
      transforms: [sortable],
      props: { className: tableColumnClasses[4] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_64'),
      sortFunc: 'nodeCPU',
      transforms: [sortable],
      props: { className: tableColumnClasses[5] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_106'),
      sortFunc: 'nodeFS',
      transforms: [sortable],
      props: { className: tableColumnClasses[6] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_12'),
      sortField: 'metadata.creationTimestamp',
      transforms: [sortable],
      props: { className: tableColumnClasses[7] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[8] },
    },
  ];
};
NodeTableHeader.displayName = 'NodeTableHeader';

const mapStateToProps = ({ UI }) => ({
  metrics: UI.getIn(['metrics', 'node']),
});

type NodesRowMapFromStateProps = {
  metrics: NodeMetrics;
};

const NodesTableRow = connect<NodesRowMapFromStateProps, null, NodesTableRowProps>(mapStateToProps)(({ obj: node, index, rowKey, style, metrics }: NodesTableRowProps & NodesRowMapFromStateProps) => {
  const nodeName = getName(node);
  const nodeUID = getUID(node);

  //node exporter 변경시 확인 필요
  const usedMem = metrics?.usedMemory?.[nodeName];
  const totalMem = metrics?.totalMemory?.[nodeName];
  const memory = Number.isFinite(usedMem) && Number.isFinite(totalMem) ? `${humanizeBinaryBytes(usedMem).string} / ${humanizeBinaryBytes(totalMem).string}` : '-';
  const cores = metrics?.cpu?.[nodeName];
  const usedStrg = metrics?.usedStorage?.[nodeName];
  const totalStrg = metrics?.totalStorage?.[nodeName];
  const storage = Number.isFinite(usedStrg) && Number.isFinite(totalStrg) ? `${humanizeBinaryBytes(usedStrg).string} / ${humanizeBinaryBytes(totalStrg).string}` : '-';
  const pods = metrics?.pods?.[nodeName] ?? '-';
  const { ModifyLabels, ModifyAnnotations, Edit } = Kebab.factory;
  const menuActions = [MarkAsSchedulable, MarkAsUnschedulable, ModifyLabels, ModifyAnnotations, Edit];
  return (
    <TableRow id={nodeUID} index={index} trKey={rowKey} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={referenceForModel(NodeModel)} name={nodeName} title={nodeUID} />
      </TableData>
      <TableData className={tableColumnClasses[1]}>
        <NodeStatus node={node} showPopovers />
      </TableData>
      <TableData className={tableColumnClasses[2]}>
        <NodeRoles node={node} />
      </TableData>
      <TableData className={tableColumnClasses[3]}>{pods}</TableData>
      <TableData className={tableColumnClasses[4]}>{memory}</TableData>
      <TableData className={tableColumnClasses[5]}>{cores ? `${formatCores(cores)} cores` : '-'}</TableData>
      <TableData className={tableColumnClasses[6]}>{storage}</TableData>
      <TableData className={tableColumnClasses[7]}>
        <Timestamp timestamp={node.metadata.creationTimestamp} />
      </TableData>
      <TableData className={tableColumnClasses[8]}>
        <ResourceKebab actions={menuActions} kind={referenceForModel(NodeModel)} resource={node} />
      </TableData>
    </TableRow>
  );
});
NodesTableRow.displayName = 'NodesTableRow';

type NodesTableRowProps = {
  obj: NodeKind;
  index: number;
  rowKey: string;
  style: object;
};

const NodesTable: React.FC<NodesTableProps> = React.memo(props => {
  const { t } = useTranslation();
  const Row = React.useCallback((rowArgs: RowFunctionArgs<NodeKind>) => <NodesTableRow obj={rowArgs.obj} index={rowArgs.index} rowKey={rowArgs.key} style={rowArgs.style} />, []);
  return <Table {...props} aria-label="Nodes" Header={NodeTableHeader.bind(null, t)} Row={Row} virtualize />;
});

type NodesTableProps = React.ComponentProps<typeof Table> & {
  data: NodeKind[];
};

export const NODE_STATUS_QUERY_PARAM = 'node-status';

export enum NODE_STATUS {
  READY = 'Ready',
  NOTREADY = 'Not Ready',
}

const filters = [
  {
    filterGroupName: 'Status',
    type: NODE_STATUS_QUERY_PARAM,
    reducer: nodeStatus,
    items: [
      { id: NODE_STATUS.READY, title: NODE_STATUS.READY },
      { id: NODE_STATUS.NOTREADY, title: NODE_STATUS.NOTREADY },
    ],
  },
  {
    filterGroupName: 'Role',
    type: 'node-role',
    reducer: getNodeRole,
    items: [
      {
        id: 'master',
        title: 'Master',
      },
      {
        id: 'worker',
        title: 'Worker',
      },
    ],
  },
];

const fetchNodeMetrics = (): Promise<NodeMetrics> => {
  const metrics = [
    {
      key: 'usedMemory',
      query: 'sum by (instance) (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes)',
    },
    {
      key: 'totalMemory',
      query: 'sum by (instance) (node_memory_MemTotal_bytes)',
    },
    {
      key: 'usedStorage',
      query: '(node_filesystem_size_bytes{mountpoint="/"} - node_filesystem_free_bytes{mountpoint="/"})',
    },
    {
      key: 'totalStorage',
      query: 'node_filesystem_size_bytes{mountpoint="/"}',
    },
    {
      key: 'cpu',
      query: 'sum by(instance) (instance:node_cpu:rate:sum)',
    },
    {
      key: 'pods',
      query: 'sum by(node)(kube_pod_info)',
    },
  ];
  const promises = metrics.map(({ key, query }) => {
    const url = getPrometheusURL({ endpoint: PrometheusEndpoint.QUERY, query });
    return coFetchJSON(url).then(({ data: { result } }) => {
      return result.reduce((acc, data) => {
        const value = Number(data.value[1]);
        return _.set(acc, [key, data.metric.instance || data.metric.node], value);
      }, {});
    });
  });
  return Promise.all(promises).then((data: any[]) => _.assign({}, ...data));
};

const mapDispatchToProps = (dispatch): MapDispatchToProps => ({
  setNodeMetrics: metrics => dispatch(setNodeMetrics(metrics)),
});

const showMetrics = PROMETHEUS_BASE_PATH && window.innerWidth > 1200;

const NodesPage = connect<{}, MapDispatchToProps>(
  null,
  mapDispatchToProps,
)((props: MapDispatchToProps) => {
  const { setNodeMetrics: setMetrics } = props;

  React.useEffect(() => {
    const updateMetrics = () =>
      fetchNodeMetrics()
        .then(setMetrics)
        .catch(e => {
          // eslint-disable-next-line no-console
          console.error('Error fetching node metrics: ', e);
        });
    updateMetrics();
    if (showMetrics) {
      const id = setInterval(updateMetrics, 30 * 1000);
      return () => clearInterval(id);
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <ListPage {...props} kind="Node" ListComponent={NodesTable} rowFilters={filters} />;
});

type MapDispatchToProps = {
  setNodeMetrics: (metrics) => void;
};

export default NodesPage;
