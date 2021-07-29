import * as _ from 'lodash';
import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage, Table, TableRow, TableData, RowFunction } from '../factory';
import { DetailsItem, Kebab, KebabAction, detailsPage, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
import { HyperparameterTuningModel } from '../../models';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { Status } from '@console/shared';

export const menuActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(HyperparameterTuningModel), ...Kebab.factory.common];

const kind = HyperparameterTuningModel.kind;

const tableColumnClasses = ['', '', classNames('pf-m-hidden', 'pf-m-visible-on-sm', 'pf-u-w-16-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), classNames('pf-m-hidden', 'pf-m-visible-on-lg'), Kebab.columnClass];

const HyperparameterTuningTableHeader = (t?: TFunction) => {
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
      title: '알고리즘 이름',
      sortField: 'pec.algorithm.algorithmName',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: '트라이얼 개수',
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    {
      title: '최적화 상태',
      transforms: [sortable],
      props: { className: tableColumnClasses[4] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_3'),
      transforms: [sortable],
      props: { className: tableColumnClasses[5] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[6] },
    },
  ];
};
HyperparameterTuningTableHeader.displayName = 'HyperparameterTuningTableHeader';

const getConditionStatus = obj => {
  const conditions = obj.status?.conditions;
  return !!conditions ? conditions[conditions.length - 1]?.type : '-';
};

const getOptimizationStatus = obj => {
  const objective = obj.spec?.objective;
  const metrics = obj.status?.currentOptimalTrial?.observation?.metrics;

  switch (objective?.objectiveMetricName) {
    case 'accuracy':
    case 'Validation-accuracy': {
      const goal = objective.goal;
      const type = objective.type;
      const metric = metrics?.find(metric => metric.name === 'Validation-accuracy');
      if (!!metric) {
        const value = type === 'maximize' ? metric.max : metric.min;
        return `${value} / ${goal}`;
      } else {
        return `- / ${goal}`;
      }
    }
    case 'loss':
    case 'Validation-loss': {
      const goal = objective.goal;
      const type = objective.type;
      const metric = metrics?.find(metric => metric.name === 'Validation-loss');
      if (!!metric) {
        const value = type === 'maximize' ? metric.max : metric.min;
        return `${value} / ${goal}`;
      } else {
        return `- / ${goal}`;
      }
    }
    default:
      return '-';
  }
};

const HyperparameterTuningTableRow: RowFunction<K8sResourceKind> = ({ obj: hyperparametertuning, index, key, style }) => {
  const trials = hyperparametertuning.status?.trials || '-';
  const maxTrials = hyperparametertuning.spec?.maxTrialCount || '-';
  return (
    <TableRow id={hyperparametertuning.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={hyperparametertuning.metadata.name} namespace={hyperparametertuning.metadata.namespace} title={hyperparametertuning.metadata.uid} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={hyperparametertuning.metadata.namespace} title={hyperparametertuning.metadata.namespace} />
      </TableData>
      <TableData className={tableColumnClasses[2]}>{hyperparametertuning.spec?.algorithm?.algorithmName || '-'}</TableData>
      <TableData className={tableColumnClasses[3]}>{`${trials} / ${maxTrials}`}</TableData>
      <TableData className={tableColumnClasses[4]}>{getOptimizationStatus(hyperparametertuning)}</TableData>
      <TableData className={tableColumnClasses[5]}>
        <Status status={getConditionStatus(hyperparametertuning)} />
      </TableData>
      <TableData className={tableColumnClasses[6]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={hyperparametertuning} />
      </TableData>
    </TableRow>
  );
};

export const HyperparameterTuningDetailsList: React.FC<HyperparameterTuningDetailsListProps> = ({ hyperparametertuning }) => {
  const { t } = useTranslation();
  const trials = hyperparametertuning.status?.trials || '-';
  const maxTrials = hyperparametertuning.spec?.maxTrialCount || '-';
  return (
    <dl className="co-m-pane__details">
      <DetailsItem label={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_45')} obj={hyperparametertuning}>
        <Status status={getConditionStatus(hyperparametertuning)} />
      </DetailsItem>
      <DetailsItem label={t('알고리즘 이름')} obj={hyperparametertuning} path="spec.algorithm.algorithmName">
        {hyperparametertuning.spec?.algorithm?.algorithmName}
      </DetailsItem>
      <DetailsItem label={t('트라이얼 개수')} obj={hyperparametertuning}>
        {`${trials} / ${maxTrials}`}
      </DetailsItem>
      <DetailsItem label={t('최적화 상태')} obj={hyperparametertuning}>
        {getOptimizationStatus(hyperparametertuning)}
      </DetailsItem>
    </dl>
  );
};

const HyperparameterTuningDetails: React.FC<HyperparameterTuningDetailsProps> = ({ obj: hyperparametertuning }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(hyperparametertuning, t) })} />
        <div className="row">
          <div className="col-lg-6">
            <ResourceSummary resource={hyperparametertuning} />
          </div>
          <div className="col-lg-6">
            <HyperparameterTuningDetailsList hyperparametertuning={hyperparametertuning} />
          </div>
        </div>
      </div>
    </>
  );
};

const { details, editYaml } = navFactory;
export const HyperparameterTunings: React.FC = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="HyperparameterTunings" Header={HyperparameterTuningTableHeader.bind(null, t)} Row={HyperparameterTuningTableRow} virtualize />;
};

export const HyperparameterTuningsPage: React.FC<HyperparameterTuningsPageProps> = props => <ListPage canCreate={true} ListComponent={HyperparameterTunings} kind={kind} {...props} />;

export const HyperparameterTuningsDetailsPage: React.FC<HyperparameterTuningsDetailsPageProps> = props => <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={[details(detailsPage(HyperparameterTuningDetails)), editYaml()]} />;

type HyperparameterTuningDetailsListProps = {
  hyperparametertuning: K8sResourceKind;
};

type HyperparameterTuningDetailsProps = {
  obj: K8sResourceKind;
};

type HyperparameterTuningsPageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
};

type HyperparameterTuningsDetailsPageProps = {
  match: any;
};
