import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';

import { referenceForModel } from '@console/internal/module/k8s';
import { DetailsPage, ListPage, Table, TableRow, TableData, RowFunction } from '../factory';
import { Kebab, detailsPage, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading, viewYamlComponent } from '../utils';
import { PipelineRunModel, PipelineModel, PipelineResourceModel, SecretModel } from '../../models';
import { pipelineRunDuration } from '../../../packages/dev-console/src/utils/pipeline-utils';
import { PipelineRun, pipelineRefExists, PipelineRunReferenceResource } from '../../../packages/dev-console/src/utils/pipeline-augment';
import { pipelineRunFilterReducer } from '../../../packages/dev-console/src/utils/pipeline-filter-reducer';
import LinkedPipelineRunTaskStatus from '../../../packages/dev-console/src/components/pipelineruns/status/LinkedPipelineRunTaskStatus';
import { getPipelineRunKebabActions } from '../../../packages/dev-console/src/utils/pipeline-actions';
import { PipelineRunLogsWithActiveTask } from '../../../packages/dev-console/src/components/pipelineruns/detail-page-tabs/PipelineRunLogs';
import PipelineRunVisualization from '../../../packages/dev-console/src/components/pipelineruns/detail-page-tabs/PipelineRunVisualization';
import ResourceLinkList from '../../../packages/dev-console/src/components/pipelines/resource-overview/ResourceLinkList';
//import TriggeredBySection from '../../../packages/dev-console/src/components/pipelineruns/detail-page-tabs/TriggeredBySection';
import { Status } from '@console/shared';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';

import { PipelineRunReducer } from '@console/dev-console/src/utils/hc-status-reducers';

export const PipelineRunStatus: React.FC<PipelineRunStatusProps> = ({ result }) => <Status status={PipelineRunReducer(result)} />;

const kind = PipelineRunModel.kind;

const tableColumnClasses = [
  '', // name
  '', // namespace
  'pf-m-hidden pf-m-visible-on-sm', // status
  'pf-m-hidden pf-m-visible-on-lg', // task status
  'pf-m-hidden pf-m-visible-on-lg', // started
  'pf-m-hidden pf-m-visible-on-xl', // duration
  Kebab.columnClass,
];

const PipelineRunTableHeader = (t?: TFunction) => {
  return [
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_1'),
      sortField: 'metadata.name',
      transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_2'),
      sortField: 'metadata.namespace',
      transforms: [sortable],
      props: { className: tableColumnClasses[1] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_3'),
      sortFunc: 'pipelineRunFilterReducer',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_78'),
      //sortFunc: 'LinkedPipelineRunTaskStatus',
      //transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    {
      title: t('COMMON:MSG_DETAILS_TABDETAILS_CONTAINERS_TABLEHEADER_6'),
      sortField: 'status.startTime',
      transforms: [sortable],
      props: { className: tableColumnClasses[4] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_81'),
      sortFunc: 'pipelineRunDuration',
      transforms: [sortable],
      props: { className: tableColumnClasses[5] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[6] },
    },
  ];
};

PipelineRunTableHeader.displayName = 'PipelineRunTableHeader';

const PipelineRunTableRow: RowFunction<PipelineRun> = ({ obj: pipelineRun, index, key, style }) => {
  return (
    <TableRow id={pipelineRun.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={pipelineRun.metadata.name} namespace={pipelineRun.metadata.namespace} title={pipelineRun.metadata.uid} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={pipelineRun.metadata.namespace} title={pipelineRun.metadata.namespace} />
      </TableData>
      <TableData className={tableColumnClasses[2]}>
        <PipelineRunStatus result={pipelineRun} />
      </TableData>
      <TableData className={tableColumnClasses[3]}>
        <LinkedPipelineRunTaskStatus pipelineRun={pipelineRun} />
      </TableData>
      <TableData className={tableColumnClasses[4]}>
        <Timestamp timestamp={pipelineRun.status && pipelineRun.status.startTime} />
      </TableData>
      <TableData className={tableColumnClasses[5]}>{pipelineRunDuration(pipelineRun)}</TableData>
      <TableData className={tableColumnClasses[6]}>
        <ResourceKebab actions={getPipelineRunKebabActions()} kind={kind} resource={pipelineRun} />
      </TableData>
    </TableRow>
  );
};
const PipelineRunInPipelinePageTableRow: RowFunction<PipelineRun> = ({ obj: pipelineRun, index, key, style }) => {
  return (
    <TableRow id={pipelineRun.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={pipelineRun.metadata.name} namespace={pipelineRun.metadata.namespace} title={pipelineRun.metadata.uid} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={pipelineRun.metadata.namespace} title={pipelineRun.metadata.namespace} />
      </TableData>
      <TableData className={tableColumnClasses[2]}>
        <PipelineRunStatus result={pipelineRun} />
      </TableData>
      <TableData className={tableColumnClasses[3]}>
        <LinkedPipelineRunTaskStatus pipelineRun={pipelineRun} />
      </TableData>
      <TableData className={tableColumnClasses[4]}>
        <Timestamp timestamp={pipelineRun.status && pipelineRun.status.startTime} />
      </TableData>
      <TableData className={tableColumnClasses[5]}>{pipelineRunDuration(pipelineRun)}</TableData>
      <TableData className={tableColumnClasses[6]}>
        <ResourceKebab actions={getPipelineRunKebabActions(true)} kind={kind} resource={pipelineRun} />
      </TableData>
    </TableRow>
  );
};

export const PipelineRunDetailsList: React.FC<PipelineRunDetailsListProps> = ({ pipelineRun }) => {
  const unfilteredResources = pipelineRun.spec.resources as PipelineRunReferenceResource[];
  const renderResources = unfilteredResources?.filter(({ resourceRef }) => !!resourceRef).map(resource => resource.resourceRef.name) || [];
  const secretObj = pipelineRun.spec?.workspaces?.map(function(data) {
    if (data.secret) {
      return data;
    }
  });
  const { t } = useTranslation();
  return (
    <div className="col-sm-6 odc-pipeline-run-details__customDetails">
      {pipelineRefExists(pipelineRun) && (
        <dl>
          <dt>{ResourceLabel(PipelineModel, t)}</dt>
          <dd>
            <ResourceLink kind={referenceForModel(PipelineModel)} name={pipelineRun.spec.pipelineRef.name} namespace={pipelineRun.metadata.namespace} />
          </dd>
        </dl>
      )}
      {/* <TriggeredBySection pipelineRun={pipelineRun} /> */}
      <br />
      <ResourceLinkList model={PipelineResourceModel} links={renderResources} namespace={pipelineRun.metadata.namespace} />
      {secretObj && secretObj[0] && (
        <dl>
          <dt>{ResourceLabel(SecretModel, t)}</dt>
          <dd>
            <ResourceLink kind={referenceForModel(SecretModel)} name={secretObj[0].secret.secretName} namespace={pipelineRun.metadata.namespace} />
          </dd>
        </dl>
      )}
    </div>
  );
};

const PipelineRunDetails: React.FC<PipelineRunDetailsProps> = ({ obj: pipelineRun }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(pipelineRun, t) })} />
        <PipelineRunVisualization pipelineRun={pipelineRun} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={pipelineRun} />
          </div>
          <div className="col-lg-6">
            <PipelineRunDetailsList pipelineRun={pipelineRun} />
          </div>
        </div>
      </div>
    </>
  );
};

const { details, editYaml } = navFactory;

const filters = [
  {
    filterGroupName: 'Status',
    type: 'pipeline-run-status',
    reducer: pipelineRunFilterReducer,
    items: [
      { id: 'Completed', title: 'Completed' },
      { id: 'Running', title: 'Running' },
      { id: 'Failed', title: 'Failed' },
      { id: 'Cancelled', title: 'Cancelled' },
    ],
  },
];

export const PipelineRuns: React.FC = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="Pipeline Runs" Header={PipelineRunTableHeader.bind(null, t)} Row={PipelineRunTableRow} virtualize />;
};
export const PipelineRunsInPipelinePage: React.FC = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="Pipeline Runs" Header={PipelineRunTableHeader.bind(null, t)} Row={PipelineRunInPipelinePageTableRow} virtualize />;
};

export const PipelineRunsPage: React.FC<PipelineRunsPageProps> = props => {
  const { t } = useTranslation();
  const { inPipelinePage } = props;

  return <ListPage title={t('COMMON:MSG_LNB_MENU_60')} createButtonText={t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('COMMON:MSG_LNB_MENU_60') })} canCreate={true} ListComponent={inPipelinePage ? PipelineRunsInPipelinePage : PipelineRuns} kind={kind} rowFilters={filters} {...props} />;
};

export const PipelineRunsDetailsPage: React.FC<PipelineRunsDetailsPageProps> = props => {
  const { t } = useTranslation();
  return (
    <DetailsPage
      {...props}
      kind={kind}
      menuActions={getPipelineRunKebabActions(true)}
      pages={[
        details(detailsPage(PipelineRunDetails)),
        editYaml(viewYamlComponent),
        {
          href: 'logs',
          path: 'logs/:name?',
          name: t('COMMON:MSG_DETAILS_TAB_6'),
          component: PipelineRunLogsWithActiveTask,
        },
      ]}
    />
  );
};

type PipelineRunDetailsListProps = {
  pipelineRun: PipelineRun;
};

type PipelineRunsPageProps = {
  canCreate?: boolean;
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
  inPipelinePage?: boolean;
};

type PipelineRunDetailsProps = {
  obj: PipelineRun;
};

type PipelineRunsDetailsPageProps = {
  match: any;
};

type PipelineRunStatusProps = {
  result: any;
};
