import * as React from 'react';
import * as _ from 'lodash-es';
import { sortable } from '@patternfly/react-table';
import * as classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

import { Status, FLAGS } from '@console/shared';
import { connectToFlags } from '../reducers/features';
import { Conditions } from './conditions';
import { DetailsPage, ListPage, Table, TableRow, TableData } from './factory';
import { Kebab, navFactory, ResourceKebab, SectionHeading, ResourceLink, ResourceSummary, Selector } from './utils';
import { ResourceEventStream } from './events';
import { PersistentVolumeClaimModel } from '../models';
import { ResourceLabel } from '../models/hypercloud/resource-plural';

import { PersistentVolumeClaimReducer } from '@console/dev-console/src/utils/hc-status-reducers';

const { common, ExpandPVC } = Kebab.factory;
export const menuActions = [...Kebab.getExtensionsActionsForKind(PersistentVolumeClaimModel), ExpandPVC, ...common];

const PVCStatus = ({ pvc }) => <Status status={PersistentVolumeClaimReducer(pvc)} />;

const tableColumnClasses = [
  '', // name
  '', // namespace
  classNames('pf-m-hidden', 'pf-m-visible-on-lg'), // status
  classNames('pf-m-hidden', 'pf-m-visible-on-xl'), // persistence volume
  classNames('pf-m-hidden', 'pf-m-visible-on-xl'), // capacity
  classNames('pf-m-hidden', 'pf-m-visible-on-2xl'), // storage class
  Kebab.columnClass,
];

const PVCTableHeader = t => {
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
      sortField: 'status.phase',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_29'),
      sortField: 'spec.volumeName',
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    {
      title: t('COMMON:MSG_MAIN_TABLEHEADER_14'),
      sortFunc: 'pvcStorage',
      transforms: [sortable],
      props: { className: tableColumnClasses[4] },
    },
    {
      title: t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_63'), // 이거 쓰는거 맞나..
      sortField: 'spec.storageClassName',
      transforms: [sortable],
      props: { className: tableColumnClasses[5] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[6] },
    },
  ];
};
PVCTableHeader.displayName = 'PVCTableHeader';

const kind = 'PersistentVolumeClaim';

const PVCTableRow = ({ obj, index, key, style }) => {
  return (
    <TableRow id={obj.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
      </TableData>
      <TableData className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />
      </TableData>
      <TableData className={tableColumnClasses[2]}>
        <PVCStatus pvc={obj} />
      </TableData>
      <TableData className={tableColumnClasses[3]}>{_.get(obj, 'spec.volumeName') ? <ResourceLink kind="PersistentVolume" name={obj.spec.volumeName} title={obj.spec.volumeName} /> : <div className="text-muted">No Persistent Volume</div>}</TableData>
      <TableData className={tableColumnClasses[4]}>{_.get(obj, 'status.capacity.storage', '-')}</TableData>
      <TableData className={classNames(tableColumnClasses[5])}>{obj?.spec?.storageClassName ? <ResourceLink kind="StorageClass" name={obj.spec.storageClassName} title={obj.spec.storageClassName} /> : '-'}</TableData>
      <TableData className={tableColumnClasses[6]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={obj} />
      </TableData>
    </TableRow>
  );
};

const Details_ = ({ flags, obj: pvc }) => {
  const { t } = useTranslation();

  const canListPV = flags[FLAGS.CAN_LIST_PV];
  const labelSelector = _.get(pvc, 'spec.selector');
  const storageClassName = _.get(pvc, 'spec.storageClassName');
  const volumeName = _.get(pvc, 'spec.volumeName');
  const storage = _.get(pvc, 'status.capacity.storage');
  const accessModes = _.get(pvc, 'status.accessModes');
  const volumeMode = _.get(pvc, 'spec.volumeMode');
  const conditions = _.get(pvc, 'status.conditions');
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(pvc, t) })} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={pvc}>
              <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_38')}</dt>
              <dd data-test-id="pvc-name">
                <Selector selector={labelSelector} kind="PersistentVolume" />
              </dd>
            </ResourceSummary>
          </div>
          <div className="col-sm-6">
            <dl>
              <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_45')}</dt>
              <dd data-test-id="pvc-status">
                <PVCStatus pvc={pvc} />
              </dd>
              {storage && (
                <>
                  <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_60')}</dt>
                  <dd data-test-id="pvc-capacity">{storage}</dd>
                </>
              )}
              {!_.isEmpty(accessModes) && (
                <>
                  <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_61')}</dt>
                  <dd data-test-id="pvc-access-mode">{accessModes.join(', ')}</dd>
                </>
              )}
              <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_62')}</dt>
              <dd data-test-id="pvc-volume-mode">{volumeMode || 'Filesystem'}</dd>
              <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_63')}</dt>
              <dd data-test-id="pvc-storageclass">{storageClassName ? <ResourceLink kind="StorageClass" name={storageClassName} /> : '-'}</dd>
              {volumeName && canListPV && (
                <>
                  <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_64')}</dt>
                  <dd data-test-id="persistent-volume">
                    <ResourceLink kind="PersistentVolume" name={volumeName} />
                  </dd>
                </>
              )}
            </dl>
          </div>
        </div>
      </div>
    </>
  );
};

const Details = connectToFlags(FLAGS.CAN_LIST_PV)(Details_);

export const PERSISTENTVOLUMECLAIM_STATUS_QUERY_PARAM = 'pvc-status';

export const PERSISTENTVOLUMECLAIM_STATUS = { PENDING: 'Pending', BOUND: 'Bound', LOST: 'Lost', TERMINATING: 'Terminating' };

const filters = t => [
  {
    filterGroupName: t('COMMON:MSG_COMMON_FILTER_10'),
    type: PERSISTENTVOLUMECLAIM_STATUS_QUERY_PARAM,
    reducer: pvc => {
      if (pvc?.metadata?.deletionTimestamp) {
        return 'Terminating';
      }
      return pvc.status.phase;
    },
    items: [
      { id: PERSISTENTVOLUMECLAIM_STATUS.PENDING, title: PERSISTENTVOLUMECLAIM_STATUS.PENDING },
      { id: PERSISTENTVOLUMECLAIM_STATUS.BOUND, title: PERSISTENTVOLUMECLAIM_STATUS.BOUND },
      { id: PERSISTENTVOLUMECLAIM_STATUS.LOST, title: PERSISTENTVOLUMECLAIM_STATUS.LOST },
      { id: PERSISTENTVOLUMECLAIM_STATUS.TERMINATING, title: PERSISTENTVOLUMECLAIM_STATUS.TERMINATING },
    ],
  },
];

export const PersistentVolumeClaimsList = props => {
  const { t } = useTranslation();
  return <Table {...props} aria-label="Persistent Volume Claims" Header={PVCTableHeader.bind(null, t)} Row={PVCTableRow} virtualize />;
};

export const PersistentVolumeClaimsPage = props => {
  const { t } = useTranslation();
  return <ListPage {...props} ListComponent={PersistentVolumeClaimsList} kind={kind} title={t('COMMON:MSG_LNB_MENU_52')} createButtonText={t('COMMON:MSG_MAIN_CREATEBUTTON_1', { 0: t('COMMON:MSG_LNB_MENU_52') })} canCreate={true} rowFilters={filters.bind(null, t)()} />;
};
export const PersistentVolumeClaimsDetailsPage = props => <DetailsPage {...props} menuActions={menuActions} pages={[navFactory.details(Details), navFactory.editResource(), navFactory.events(ResourceEventStream)]} />;
