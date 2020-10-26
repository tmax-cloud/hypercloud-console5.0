import { K8sKind } from '../../module/k8s';

// 추가
export const ApprovalModel: K8sKind = {
  label: 'Approval',
  labelPlural: 'Approvals',
  apiVersion: 'v1',
  apiGroup: 'tmax.io',
  plural: 'approvals',
  abbr: 'A',
  kind: 'Approval',
  id: 'approval',
  namespaced: true,
};

export const HyperClusterResourceModel: K8sKind = {
  label: 'Cluster',
  labelPlural: 'Clusters',
  apiVersion: 'v1',
  apiGroup: 'hyper.multi.tmax.io',
  plural: 'hyperclusterresources',
  abbr: 'C',
  kind: 'HyperClusterResource',
  id: 'hyperclusterresource',
  namespaced: false,
};

export const FederatedConfigMapModel: K8sKind = {
  label: 'Config Map',
  labelPlural: 'Config Maps',
  apiVersion: 'v1beta1',
  apiGroup: 'types.kubefed.io',
  plural: 'federatedconfigmaps',
  abbr: 'FC',
  kind: 'FederatedConfigMap',
  id: 'federatedconfigmap',
  namespaced: true,
};

export const FederatedDeploymentModel: K8sKind = {
  label: 'Deployment',
  labelPlural: 'Deployments',
  apiVersion: 'v1beta1',
  apiGroup: 'types.kubefed.io',
  plural: 'federateddeployments',
  abbr: 'FC',
  kind: 'FederatedDeployment',
  id: 'federateddeployment',
  namespaced: true,
};

export const FederatedIngressModel: K8sKind = {
  label: 'Ingress',
  labelPlural: 'Ingresses',
  apiVersion: 'v1beta1',
  apiGroup: 'types.kubefed.io',
  plural: 'federatedingresses',
  abbr: 'I',
  kind: 'FederatedIngress',
  id: 'federatedingress',
  namespaced: true,
};

export const FederatedJobModel: K8sKind = {
  label: 'Job',
  labelPlural: 'Jobs',
  apiVersion: 'v1beta1',
  apiGroup: 'types.kubefed.io',
  plural: 'federatedjobs',
  abbr: 'J',
  kind: 'FederatedJob',
  id: 'federatedjob',
  namespaced: true,
};

export const FederatedNamespaceModel: K8sKind = {
  label: 'Namespace',
  labelPlural: 'Namespaces',
  apiVersion: 'v1beta1',
  apiGroup: 'types.kubefed.io',
  plural: 'federatednamespaces',
  abbr: 'N',
  kind: 'FederatedNamespace',
  id: 'federatednamespace',
  namespaced: true,
};

export const FederatedReplicaSetModel: K8sKind = {
  label: 'Replica Set',
  labelPlural: 'Replica Sets',
  apiVersion: 'v1beta1',
  apiGroup: 'types.kubefed.io',
  plural: 'federatedreplicasets',
  abbr: 'R',
  kind: 'FederatedReplicaSet',
  id: 'federatedreplicaset',
  namespaced: true,
};

export const FederatedSecretModel: K8sKind = {
  label: 'Secret',
  labelPlural: 'Secrets',
  apiVersion: 'v1beta1',
  apiGroup: 'types.kubefed.io',
  plural: 'federatedsecrets',
  abbr: 'S',
  kind: 'FederatedSecret',
  id: 'federatedsecret',
  namespaced: true,
};

export const FederatedServiceModel: K8sKind = {
  label: 'Service',
  labelPlural: 'Services',
  apiVersion: 'v1beta1',
  apiGroup: 'types.kubefed.io',
  plural: 'federatedservices',
  abbr: 'S',
  kind: 'FederatedService',
  id: 'federatedservice',
  namespaced: true,
};
