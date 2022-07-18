import * as React from 'react';
import { K8sResourceKind } from 'public/module/k8s';
import { ConsoleYAMLSampleTestModel } from '../../models';
import { Kebab, KebabAction, ResourceKebab, ResourceLink, Timestamp } from '../utils';
import { TableProps } from './utils/default-list-component';
import { ListPage } from '../factory';



const kind = ConsoleYAMLSampleTestModel.kind;

const menuActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(ConsoleYAMLSampleTestModel), ...Kebab.factory.common];

const tableProps: TableProps = {
  header: [
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_1',
      sortField: 'metadata.name',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_2',
      sortField: 'metadata.namespace',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_12',
      sortField: 'metadata.creationTimestamp',
    },
    {
      title: '',
      transforms: null,
      props: { className: Kebab.columnClass },
    },
  ],
  row: (obj: K8sResourceKind) => [
    {
      children: <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.uid} />,
    },
    {
      className: 'co-break-word',
      children: <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />,
    },
    {
      children: <Timestamp timestamp={obj.metadata.creationTimestamp} />,
    },
    {
      className: Kebab.columnClass,
      children: <ResourceKebab actions={menuActions} kind={kind} resource={obj} customData={{ label: 'URL', url: obj.spec?.tower_hostname ? `https://${obj.spec?.tower_hostname}` : null }} />,
    },
  ],
};

export const ConsoleYAMLSampleTestPage: React.FC = props => {
  return <ListPage {...props} canCreate={true} kind={kind} tableProps={tableProps} />;
};
