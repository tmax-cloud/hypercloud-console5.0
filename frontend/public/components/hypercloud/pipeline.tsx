import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';

import { K8sKind } from '../../module/k8s';
import { DetailsPage, ListPage, Table, TableRow, TableData, RowFunction } from '../factory';
import { Kebab, KebabAction, detailsPage, Timestamp, navFactory, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
import { PipelineModel, TaskModel, ClusterTaskModel } from '../../models';
import PipelineVisualization from '../../../packages/dev-console/src/components/pipelines/detail-page-tabs/pipeline-details/PipelineVisualization';
import DynamicResourceLinkList from '../../../packages/dev-console/src/components/pipelines/resource-overview/DynamicResourceLinkList';
import { Pipeline } from '../../../packages/dev-console/src/utils/pipeline-augment';
import { getPipelineKebabActions } from '../../../packages/dev-console/src/utils/pipeline-actions';
import { PipelineForm, PipelineParametersForm, PipelineResourcesForm, parametersValidationSchema, resourcesValidationSchema } from '../../../packages/dev-console/src/components/pipelines/detail-page-tabs';
import { PipelineRunsPage } from './pipeline-run';
import PipelineRowKebabActions from '../../../packages/dev-console/src/components/pipelines/list-page/PipelineRowKebabActions';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { ResourceLabel, ResourceLabelPlural } from '../../models/hypercloud/resource-plural';

export const menuActions: KebabAction[] = getPipelineKebabActions();

const kind = PipelineModel.kind;

const tableColumnClasses = [
  'col-xs-6 col-sm-4', // name
  'col-xs-6 col-sm-4', // namespace
  'col-sm-4 hidden-xs', // created
  Kebab.columnClass,
];

const PipelineTableHeader = (t?: TFunction) => {
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
      title: t('COMMON:MSG_MAIN_TABLEHEADER_12'),
      sortField: 'metadata.creationTimestamp',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[3] },
    },
  ];
};

PipelineTableHeader.displayName = 'PipelineTableHeader';

const PipelineTableRow: RowFunction<Pipeline> = ({ obj: pipeline, index, key, style }) => {
  return (
    <TableRow id={pipeline.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={pipeline.metadata?.name} namespace={pipeline.metadata?.namespace} title={pipeline.metadata?.uid} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={pipeline.metadata?.namespace} title={pipeline.metadata?.namespace} />
      </TableData>
      <TableData className={tableColumnClasses[2]}>
        <Timestamp timestamp={pipeline.metadata.creationTimestamp} />
      </TableData>
      <TableData className={tableColumnClasses[3]}>
        <PipelineRowKebabActions pipeline={pipeline} />
      </TableData>
    </TableRow>
  );
};

export const getResourceModelFromTaskKind = (kind: string): K8sKind => (kind === ClusterTaskModel.kind ? ClusterTaskModel : TaskModel);

export const PipelineDetailsList: React.FC<PipelineDetailsListProps> = ({ ds: pipeline }) => {
  const taskLinks = pipeline.spec.tasks
    .filter((pipelineTask: PipelineTask) => !!pipelineTask.taskRef)
    .map(task => ({
      model: getResourceModelFromTaskKind(task.taskRef.kind),
      name: task.taskRef.name ? task.taskRef.name : task.name,
      displayName: task.name,
    }));

  const { t } = useTranslation();
  return (
    <dl className="co-m-pane__details">
      <DynamicResourceLinkList namespace={pipeline.metadata.namespace} links={taskLinks} title={ResourceLabelPlural(TaskModel, t)} />
    </dl>
  );
};

const PipelineDetails: React.FC<PipelineDetailsProps> = ({ obj: pipeline }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(pipeline, t) })} />
        <PipelineVisualization pipeline={pipeline} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={pipeline} />
          </div>
          <div className="col-lg-6">
            <PipelineDetailsList ds={pipeline} />
          </div>
        </div>
      </div>
    </>
  );
};

const { details, editResource, editYaml } = navFactory;

export const Pipelines: React.FC = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="Pipelines" Header={PipelineTableHeader.bind(null, t)} Row={PipelineTableRow} virtualize />;
};

export const PipelinesPage: React.FC<PipelinesPageProps> = props => {
  const { t } = useTranslation();

  return <ListPage title={t('COMMON:MSG_LNB_MENU_59')} createButtonText={t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('COMMON:MSG_LNB_MENU_59') })} canCreate={true} ListComponent={Pipelines} kind={kind} {...props} />;
};

const PipelineRunsTab: React.FC<PipelineDetailsProps> = props => {
  return <PipelineRunsPage showTitle={false} canCreate={false} namespace={props.obj.metadata.namespace} selector={{ 'tekton.dev/pipeline': props.obj.metadata.name }} inPipelinePage={true} />;
};
const PipelineParametersTab: React.FC<PipelineDetailsProps> = props => {
  return <PipelineForm PipelineFormComponent={PipelineParametersForm} formName="parameters" validationSchema={parametersValidationSchema} obj={props.obj} {...props} />;
};
const PipelineResourcesTab: React.FC<PipelineDetailsProps> = props => {
  return <PipelineForm PipelineFormComponent={PipelineResourcesForm} formName="resources" validationSchema={resourcesValidationSchema} obj={props.obj} {...props} />;
};

export const PipelinesDetailsPage: React.FC<PipelinesDetailsPageProps> = props => {
  return (
    <DetailsPage
      {...props}
      kind={kind}
      menuActions={menuActions}
      pages={[
        details(detailsPage(PipelineDetails)),
        editResource(),
        editYaml(),
        {
          href: 'runs',
          name: 'SINGLE:MSG_PIPELINES_PIPELINEDETAILS_TABPIPELINERUNS_1',
          component: PipelineRunsTab,
        },
        {
          href: 'parameters',
          name: 'SINGLE:MSG_PIPELINES_PIPELINEDETAILS_TABPARAMETERS_1',
          component: PipelineParametersTab,
        },
        {
          href: 'resources',
          name: 'SINGLE:MSG_PIPELINES_PIPELINEDETAILS_TABRESOURCES_1',
          component: PipelineResourcesTab,
        },
      ]}
    />
  );
};

type PipelineDetailsListProps = {
  ds: Pipeline;
};

type PipelinesPageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
};

type PipelineDetailsProps = {
  obj: Pipeline;
};

type PipelinesDetailsPageProps = {
  match: any;
};
export interface PipelineTaskRef {
  kind?: string;
  name: string;
}

export interface PipelineTaskParam {
  name: string;
  value: any;
}
export interface PipelineTaskResources {
  inputs?: PipelineTaskResource[];
  outputs?: PipelineTaskResource[];
}
export interface PipelineTaskResource {
  name: string;
  resource?: string;
  from?: string[];
}
export interface PipelineTask {
  name: string;
  runAfter?: string[];
  taskRef: PipelineTaskRef;
  params?: PipelineTaskParam[];
  resources?: PipelineTaskResources;
}
