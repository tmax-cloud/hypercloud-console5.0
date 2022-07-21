import { K8sResourceCommon, K8sResourceKind, Selector } from '../../k8s';
import { MenuInfo } from '../../../hypercloud/menu/menu-types';
import { I18nInfo } from '../../../models/hypercloud/resource-plural';
import { BadgeType } from '@console/shared';

export type ApprovalKind = K8sResourceCommon & {
  namespace?: string;
  apiGroup?: string;
};

export type ClusterTemplateClaimKind = K8sResourceKind & {
  resourceName?: string;
};

export type K8sClaimResourceKind = K8sResourceKind & {
  resourceName?: string;
  roleRef?: any;
};

export type ServiceBindingApplication = {
  bindingPath?: {
    containersPath: string;
    secretPath: string;
  };
  group: string;
  kind?: string;
  labelSelector?: Selector;
  name?: string;
  resource?: string;
  version: string;
};

export type ServiceBindingMapping = {
  name: string;
  value: string;
};

export type ServiceBindingService = {
  group: string;
  id?: string;
  kind?: string;
  name?: string;
  namespace?: string;
  resource?: string;
  version: string;
};

export type ServiceBindingKind = K8sResourceCommon & {
  spec: {
    application: ServiceBindingApplication;
    bindAsFiles?: boolean;
    detectBindingResources?: boolean;
    mappings?: ServiceBindingMapping[];
    name?: string;
    namingStrategy?: string;
    services: ServiceBindingService[];
  };
  status?: { [key: string]: any };
};

export type HyperCloudExtension = {
  menuInfo?: MenuInfo;
  i18nInfo?: I18nInfo;
};

export type NonK8sKind = {
  abbr: string;
  kind: string;
  label: string;
  labelPlural: string;
  plural: string;
  namespaced?: boolean;
  badge?: BadgeType;
  color?: string;
  menuInfo?: MenuInfo;
  i18nInfo?: I18nInfo;
  nonK8SResource?: boolean;
};
