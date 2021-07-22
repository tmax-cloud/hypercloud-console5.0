import { Map as ImmutableMap } from 'immutable';

import { GroupVersionKind, referenceForModel } from '../../module/k8s';
import { DaemonSetModel, DeploymentModel, DeploymentConfigModel, StatefulSetModel, PodModel, ServiceModel, PersistentVolumeClaimModel } from '../../models';

export const resourceOverviewPages = ImmutableMap<GroupVersionKind | string, () => Promise<React.ComponentType<any>>>()
  .set(referenceForModel(DaemonSetModel), () => import('./daemon-set-overview' /* webpackChunkName: "daemon-set"*/).then(m => m.DaemonSetOverview))
  .set(referenceForModel(DeploymentModel), () => import('./deployment-overview' /* webpackChunkName: "deployment"*/).then(m => m.DeploymentOverviewPage))
  .set(referenceForModel(DeploymentConfigModel), () => import('./deployment-config-overview' /* webpackChunkName: "deployment-config"*/).then(m => m.DeploymentConfigOverviewPage))
  .set(referenceForModel(PodModel), () => import('./pod-overview' /* webpackChunkName: "pod"*/).then(m => m.PodOverviewPage))
  .set(referenceForModel(StatefulSetModel), () => import('./stateful-set-overview' /* webpackChunkName: "stateful-set"*/).then(m => m.StatefulSetOverview))
  .set(referenceForModel(ServiceModel), () => import('./service-overview' /* webpackChunkName: "service"*/).then(m => m.ServiceOverview))
  .set(referenceForModel(PersistentVolumeClaimModel), () => import('./persistent-volume-claim-overview' /* webpackChunkName: "persistent-volume-claim"*/).then(m => m.PersistentVolumeClaimOverview));
