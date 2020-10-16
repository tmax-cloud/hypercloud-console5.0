import * as React from 'react';
// import { NavItemSeparator } from '@patternfly/react-core';
// import { referenceForModel } from '../../module/k8s';
// import { ExternalLink, HrefLink, ResourceNSLink, ResourceClusterLink } from './items';
import { ResourceNSLink } from '../../nav/items';
import { NavSection } from '../../nav/section';

const MulticlusterNav = () => (
  <>
    <ResourceNSLink resource="clusters" name="Clusters" />
    <ResourceNSLink resource="clustergroups" name="Cluster Groups" />
    <NavSection title="Federated Resources">
      <h3 style={{ paddingLeft: '28px' }}>Workloads</h3>
      <ResourceNSLink resource="pods" name="Pods" />
      <ResourceNSLink resource="deployments" name="Deployments" />
      {/* <ResourceNSLink
        resource="deploymentconfigs"
        name={DeploymentConfigModel.labelPlural}
        required={FLAGS.OPENSHIFT}
      /> */}
      <ResourceNSLink resource="statefulsets" name="Stateful Sets" />
      <ResourceNSLink resource="secrets" name="Secrets" />
      <ResourceNSLink resource="configmaps" name="Config Maps" />
      {/* <Separator name="WorkloadsSeparator" /> */}
      <ResourceNSLink resource="cronjobs" name="Cron Jobs" />
      <ResourceNSLink resource="jobs" name="Jobs" />
      <ResourceNSLink resource="daemonsets" name="Daemon Sets" />
      <ResourceNSLink resource="replicasets" name="Replica Sets" />
      <ResourceNSLink resource="replicationcontrollers" name="Replication Controllers" />
      <ResourceNSLink resource="horizontalpodautoscalers" name="Horizontal Pod Autoscalers" />
    </NavSection>
  </>
)

export default MulticlusterNav;