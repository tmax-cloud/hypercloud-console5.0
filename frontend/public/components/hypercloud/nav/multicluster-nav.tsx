import * as React from 'react';
import { NavItemSeparator } from '@patternfly/react-core';
// import { referenceForModel } from '../../module/k8s';
// import { ExternalLink, HrefLink, ResourceNSLink, ResourceClusterLink } from './items';
import { ResourceNSLink, ResourceClusterLink } from '../../nav/items';
import { NavSection } from '../../nav/section';

type SeparatorProps = {
  name: string;
  required?: string;
};

const Separator: React.FC<SeparatorProps> = ({ name }) => <NavItemSeparator name={name} />;

const MulticlusterNav = () => (
  <>
    <ResourceClusterLink resource="hyperclusterresources" name="Clusters" />
    <ResourceClusterLink resource="clustergroups" name="Cluster Groups" />
    <NavSection title="Federated Resources">
      <h3 style={{ paddingLeft: '28px' }}>Workloads</h3>
      <ResourceNSLink resource="federatedconfigmaps" name="Config Maps" />
      <ResourceNSLink resource="federateddeployments" name="Deployments" />
      <ResourceNSLink resource="federatedreplicasets" name="Replica Sets" />
      <ResourceNSLink resource="federatedsecrets" name="Secrets" />
      <ResourceNSLink resource="federatedjobs" name="Jobs" />
      <Separator name="WorkloadsSeparator" />
      <h3 style={{ paddingLeft: '28px' }}>Network</h3>
      <ResourceNSLink resource="federatedingresses" name="Ingresses" />
      <ResourceNSLink resource="federatedservices" name="Services" />
      <Separator name="NetworksSeparator" />
      <h3 style={{ paddingLeft: '28px' }}>Management</h3>
      <ResourceClusterLink resource="federatednamespaces" name="Namespaces" />
    </NavSection>
    <ResourceClusterLink resource="customresourcedefinitions" name="Custom Resource Definitions" />
  </>
);

export default MulticlusterNav;
