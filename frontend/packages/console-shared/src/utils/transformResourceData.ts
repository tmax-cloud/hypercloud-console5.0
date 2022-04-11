import { DeploymentKind, K8sResourceKind, RouteKind } from '@console/internal/module/k8s';
import { BuildConfigOverviewItem, PodControllerOverviewItem, OverviewItem, PodRCData } from '../types';
import { ClusterServiceVersionKind } from '@console/operator-lifecycle-manager';
import { createDaemonSetItems, createPersistentVolumeClaimItems, createDeploymentConfigItems, createIngressItems, createDeploymentItems, createPodItems, createStatefulSetItems, createReplicaSetItems, createServiceItems, getBuildConfigsForResource, getPodsForDeploymentConfigs, getPodsForDeployments, getReplicaSetsForResource, getRoutesForServices, getServicesForResource } from './resource-utils';

export class TransformResourceData {
  private resources: any;

  constructor(resources: any, public utils?: Function[], public installedOperators?: ClusterServiceVersionKind[]) {
    this.resources = { ...resources };
  }

  public getReplicaSetsForResource = (deployment: K8sResourceKind): PodControllerOverviewItem[] => getReplicaSetsForResource(deployment, this.resources);

  public getBuildConfigsForResource = (resource: K8sResourceKind): BuildConfigOverviewItem[] => getBuildConfigsForResource(resource, this.resources);

  public getRoutesForServices = (services: K8sResourceKind[]): RouteKind[] => getRoutesForServices(services, this.resources);

  public getServicesForResource = (resource: K8sResourceKind): K8sResourceKind[] => getServicesForResource(resource, this.resources);

  public createDeploymentConfigItems = (deploymentConfigs: K8sResourceKind[], operatorsFilter?: boolean): OverviewItem[] => createDeploymentConfigItems(deploymentConfigs, this.resources, this.installedOperators, this.utils, operatorsFilter);

  public createDeploymentItems = (deployments: DeploymentKind[], operatorsFilter?: boolean): OverviewItem<DeploymentKind>[] => createDeploymentItems(deployments, this.resources, this.installedOperators, this.utils, operatorsFilter);

  public createDaemonSetItems = (daemonSets: K8sResourceKind[], operatorsFilter?: boolean): OverviewItem[] => createDaemonSetItems(daemonSets, this.resources, this.installedOperators, this.utils, operatorsFilter);

  public createStatefulSetItems = (statefulSets: K8sResourceKind[]): OverviewItem[] => createStatefulSetItems(statefulSets, this.resources, this.installedOperators);

  public createReplicaSetItems = (replicaSets: K8sResourceKind[]): OverviewItem[] => createReplicaSetItems(replicaSets, this.resources, this.installedOperators);

  public createServiceItems = (services: K8sResourceKind[]): OverviewItem[] => createServiceItems(services);

  public createIngressItems = (ingresses: K8sResourceKind[]): OverviewItem[] => createIngressItems(ingresses);

  public createPersistentVolumeClaimItems = (persistentVolumeClaims: K8sResourceKind[]): OverviewItem[] => createPersistentVolumeClaimItems(persistentVolumeClaims);

  public createPodItems = (): OverviewItem[] => createPodItems(this.resources);

  public getPodsForDeploymentConfigs = (deploymentConfigs: K8sResourceKind[]): PodRCData[] => getPodsForDeploymentConfigs(deploymentConfigs, this.resources);

  public getPodsForDeployments = (deployments: K8sResourceKind[]): PodRCData[] => getPodsForDeployments(deployments, this.resources);
}
