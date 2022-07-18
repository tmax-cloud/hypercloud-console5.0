import * as React from 'react';
import { K8sResourceKind } from 'public/module/k8s';
import { ConsoleYAMLSampleModel } from '../../models';
import { Kebab, KebabAction, ResourceKebab, ResourceLink, Timestamp } from '../utils';
import { TableProps } from './utils/default-list-component';
import { ListPage } from '../factory';



const kind = ConsoleYAMLSampleModel.kind;

const menuActions: KebabAction[] = [...Kebab.getExtensionsActionsForKind(ConsoleYAMLSampleModel), ...Kebab.factory.common];

const tableProps: TableProps = {
  header: [
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_1',
      sortField: 'metadata.name',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_12',
      sortField: 'metadata.creationTimestamp',
    },
    {
      title: '타켓리소스',
      sortField: 'spec.targetResource.kind',
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
      children: <Timestamp timestamp={obj.metadata.creationTimestamp} />,
    },
    {
      children: obj.spec.targetResource.kind,
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
