import * as React from 'react';
import * as _ from 'lodash-es';

import { Status, PodRingController } from '@console/shared';
import PodRingSet from '@console/shared/src/components/pod/PodRingSet';
import { AddHealthChecks, EditHealthChecks } from '@console/app/src/actions/modify-health-checks';
import { k8sCreate, K8sKind, K8sResourceKind } from '../module/k8s';
import { errorModal } from './modals';
import { DeploymentConfigModel } from '../models';
import { Conditions } from './conditions';
import { ResourceEventStream } from './events';
import { VolumesTable } from './volumes-table';
import { DetailsPage, ListPage } from './factory';
import { AsyncComponent, ContainerTable, DetailsItem, Kebab, KebabAction, LoadingInline, ResourceSummary, SectionHeading, WorkloadPausedAlert, getExtensionsKebabActionsForKind, navFactory, pluralize, togglePaused } from './utils';
import { ReplicationControllersPage } from './replication-controller';

import { WorkloadTableProps } from './workload-table';

const kind = DeploymentConfigModel.kind;

const rollout = (dc: K8sResourceKind): Promise<K8sResourceKind> => {
  const req = {
    kind: 'DeploymentRequest',
    apiVersion: 'apps.openshift.io/v1',
    name: dc.metadata.name,
    latest: true,
    force: true,
  };
  const opts = {
    name: dc.metadata.name,
    ns: dc.metadata.namespace,
    path: 'instantiate',
  };
  return k8sCreate(DeploymentConfigModel, req, opts);
};

const RolloutAction: KebabAction = (kind: K8sKind, obj: K8sResourceKind) => ({
  label: 'Start Rollout',
  callback: () =>
    rollout(obj).catch((err) => {
      const error = err.message;
      errorModal({ error });
    }),
  accessReview: {
    group: kind.apiGroup,
    resource: kind.plural,
    subresource: 'instantiate',
    name: obj.metadata.name,
    namespace: obj.metadata.namespace,
    verb: 'create',
  },
});

const PauseAction: KebabAction = (kind: K8sKind, obj: K8sResourceKind) => ({
  label: obj.spec.paused ? 'Resume Rollouts' : 'Pause Rollouts',
  callback: () => togglePaused(kind, obj).catch((err) => errorModal({ error: err.message })),
  accessReview: {
    group: kind.apiGroup,
    resource: kind.plural,
    name: obj.metadata.name,
    namespace: obj.metadata.namespace,
    verb: 'patch',
  },
});

const { ModifyCount, AddStorage, common } = Kebab.factory;

export const menuActions: KebabAction[] = [
  RolloutAction,
  PauseAction,
  ModifyCount,
  AddHealthChecks,
  AddStorage,
  ...getExtensionsKebabActionsForKind(DeploymentConfigModel),
  EditHealthChecks,
  ...common,
];

export const DeploymentConfigDetailsList = ({ dc }) => {
  const timeout = _.get(dc, 'spec.strategy.rollingParams.timeoutSeconds');
  const updatePeriod = _.get(dc, 'spec.strategy.rollingParams.updatePeriodSeconds');
  const interval = _.get(dc, 'spec.strategy.rollingParams.intervalSeconds');
  const triggers = _.map(dc.spec.triggers, 'type').join(', ');
  return (
    <dl className="co-m-pane__details">
      <DetailsItem label="Latest Version" obj={dc} path="status.latestVersion" />
      <DetailsItem label="Message" obj={dc} path="status.details.message" hideEmpty />
      <DetailsItem label="Update Strategy" obj={dc} path="spec.strategy.type" />
      {dc.spec.strategy.type === 'RollingUpdate' && (
        <>
          <DetailsItem
            label="Timeout"
            obj={dc}
            path="spec.strategy.rollingParams.timeoutSeconds"
            hideEmpty
          >
            {pluralize(timeout, 'second')}
          </DetailsItem>
          <DetailsItem
            label="Update Period"
            obj={dc}
            path="spec.strategy.rollingParams.updatePeriodSeconds"
            hideEmpty
          >
            {pluralize(updatePeriod, 'second')}
          </DetailsItem>
          <DetailsItem
            label="Interval"
            obj={dc}
            path="spec.strategy.rollingParams.intervalSeconds"
            hideEmpty
          >
            {pluralize(interval, 'second')}
          </DetailsItem>
          <DetailsItem
            label="Max Unavailable"
            obj={dc}
            path="spec.strategy.rollingParams.maxUnavailable"
          >
            {dc.spec.strategy.rollingUpdate.maxUnavailable ?? 1} of{' '}
            {pluralize(dc.spec.replicas, 'pod')}
          </DetailsItem>
          <DetailsItem label="Max Surge" obj={dc} path="spec.strategy.rollingParams.maxSurge">
            {dc.spec.strategy.rollingUpdate.maxSurge ?? 1} greater than{' '}
            {pluralize(dc.spec.replicas, 'pod')}
          </DetailsItem>
        </>
      )}
      <DetailsItem label="Min Ready Seconds" obj={dc} path="spec.minReadySeconds">
        {dc.spec.minReadySeconds ? pluralize(dc.spec.minReadySeconds, 'second') : 'Not Configured'}
      </DetailsItem>
      <DetailsItem label="Triggers" obj={dc} path="spec.triggers" hideEmpty>
        {triggers}
      </DetailsItem>
    </dl>
  );
};

export const DeploymentConfigsDetails: React.FC<{ obj: K8sResourceKind }> = ({ obj: dc }) => {
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text="Deployment Config Details" />
        {dc.spec.paused && <WorkloadPausedAlert obj={dc} model={DeploymentConfigModel} />}
        <PodRingController
          namespace={dc.metadata.namespace}
          kind={dc.kind}
          render={(d) => {
            return d.loaded ? (
              <PodRingSet
                key={dc.metadata.uid}
                podData={d.data[dc.metadata.uid]}
                obj={dc}
                resourceKind={DeploymentConfigModel}
                path="/spec/replicas"
              />
            ) : (
              <LoadingInline />
            );
          }}
        />
        <div className="co-m-pane__body-group">
          <div className="row">
            <div className="col-sm-6">
              <ResourceSummary resource={dc} showPodSelector showNodeSelector showTolerations>
                <dt>Status</dt>
                <dd>
                  {dc.status.availableReplicas === dc.status.updatedReplicas &&
                  dc.spec.replicas === dc.status.availableReplicas ? (
                    <Status status="Up to date" />
                  ) : (
                    <Status status="Updating" />
                  )}
                </dd>
              </ResourceSummary>
            </div>
            <div className="col-sm-6">
              <DeploymentConfigDetailsList dc={dc} />
            </div>
          </div>
        </div>
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text="Containers" />
        <ContainerTable containers={dc.spec.template.spec.containers} />
      </div>
      <div className="co-m-pane__body">
        <VolumesTable resource={dc} heading="Volumes" />
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text="Conditions" />
        <Conditions conditions={dc.status.conditions} />
      </div>
    </>
  );
};

const EnvironmentPage = (props) => (
  <AsyncComponent
    loader={() => import('./environment.jsx').then((c) => c.EnvironmentPage)}
    {...props}
  />
);

const envPath = ['spec', 'template', 'spec', 'containers'];
const environmentComponent = (props) => (
  <EnvironmentPage
    obj={props.obj}
    rawEnvData={props.obj.spec.template.spec}
    envPath={envPath}
    readOnly={false}
  />
);

const ReplicationControllersTab: React.FC<ReplicationControllersTabProps> = ({ obj }) => {
  const {
    metadata: { namespace, name },
  } = obj;

  // Hide the create button to avoid confusion when showing replication controllers for an object.
  return (
    <ReplicationControllersPage
      showTitle={false}
      namespace={namespace}
      selector={{
        'openshift.io/deployment-config.name': name,
      }}
      canCreate={false}
    />
  );
};

const pages = [
  navFactory.details(DeploymentConfigsDetails),
  navFactory.editYaml(),
  {
    href: 'replicationcontrollers',
    name: 'Replication Controllers',
    component: ReplicationControllersTab,
  },
  navFactory.pods(),
  navFactory.envEditor(environmentComponent),
  navFactory.events(ResourceEventStream),
];

export const DeploymentConfigsDetailsPage: React.FC<DeploymentConfigsDetailsPageProps> = props => {
  return <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={pages} />;
};
DeploymentConfigsDetailsPage.displayName = 'DeploymentConfigsDetailsPage';

export const DeploymentConfigsPage: React.FC<DeploymentConfigsPageProps> = props => <ListPage kind={kind} tableProps={WorkloadTableProps({ kind: kind, menuActions: menuActions })} canCreate={true} {...props} />;
DeploymentConfigsPage.displayName = 'DeploymentConfigsListPage';

type ReplicationControllersTabProps = {
  obj: K8sResourceKind;
};

type DeploymentConfigsPageProps = {
  filterLabel: string;
  namespace: string;
};

type DeploymentConfigsDetailsPageProps = {
  match: any;
};
