import * as React from 'react';
import { K8sResourceKind, referenceForModel } from '../../module/k8s';
import { DetailsPage, ListPage, DetailsPageProps } from '../factory';
import { DetailsItem, KebabAction, detailsPage, Timestamp, navFactory, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
import { DeploymentModel } from '../../models';
import { useTranslation } from 'react-i18next';
import { TableProps } from './utils/default-list-component';

const kind = DeploymentModel.kind;
const plural = 'schemaregistries';

const menuActions: KebabAction[] = []; // TODO: 액션 정의 필요

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
      title: 'COMMON:MSG_MAIN_TABLEHEADER_139',
      sortField: 'spec.replicas',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_12',
      sortField: 'metadata.creationTimestamp',
    },
    // {
    //   title: '',
    //   transforms: null,
    //   props: { className: Kebab.columnClass },
    // },
  ],
  row: (obj: K8sResourceKind) => [
    {
      children: <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.uid} customPath={`/k8s/ns/${obj.metadata.namespace}/${plural}/${encodeURIComponent(obj.metadata.name)}`} />,
    },
    {
      className: 'co-break-word',
      children: <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />,
    },
    {
      children: obj.spec.replicas,
    },
    {
      children: <Timestamp timestamp={obj.metadata.creationTimestamp} />,
    },
    // {
    //   className: Kebab.columnClass,
    //   children: <ResourceKebab actions={menuActions} kind={kind} resource={obj} />,
    // },
  ],
  ariaLabel: 'schemaregistries resource list',
};

const SchemaRegistriesDetails: React.FC<SchemaRegistriesDetailsProps> = ({ obj }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: t('COMMON:MSG_LNB_MENU_238') })} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={obj} showOwner={false} />
          </div>
          <div className="col-sm-6">
            <dl className="co-m-pane__details">
              <DetailsItem label={t('MULTI:MSG_DEVELOPER_SCHEMAREGISTRIES_SCHEMAREGISTRYDETAILS_TABDETAILS_1')} obj={obj}>
                {obj.spec?.template?.spec?.containers?.map((container, index) => {
                  return <div key={`image-${index}`}>{container.image}</div>;
                })}
              </DetailsItem>
              <DetailsItem label={t('MULTI:MSG_DEVELOPER_SCHEMAREGISTRIES_SCHEMAREGISTRYDETAILS_TABDETAILS_3')} obj={obj}>
                {obj.spec?.replicas}
              </DetailsItem>
            </dl>
          </div>
        </div>
      </div>
    </>
  );
};

const { details, editResource } = navFactory;

export const SchemaRegistriesPage: React.FC = props => {
  const { t } = useTranslation();
  return <ListPage {...props} canCreate={false} kind={kind} tableProps={tableProps} title={t('COMMON:MSG_LNB_MENU_238')} selector={{ 'app.kubernetes.io/name': 'schema-registry' }} />;
};

export const SchemaRegistriesDetailsPage: React.FC<DetailsPageProps> = props => {
  const { t } = useTranslation();
  return (
    <DetailsPage
      {...props}
      title={t('COMMON:MSG_LNB_MENU_238')}
      kind={kind}
      menuActions={menuActions}
      pages={[details(detailsPage(SchemaRegistriesDetails)), editResource()]}
      name={props.match.params.name}
      namespace={props.match.params.ns}
      resources={[
        {
          kind: referenceForModel(DeploymentModel),
          name: props.match.params.name,
          namespace: props.match.params.ns,
          isList: false,
          prop: 'obj',
        },
      ]}
      breadcrumbsFor={() => [
        { name: t('COMMON:MSG_LNB_MENU_231'), path: `/k8s/ns/${props.match.params.ns}/${plural}` },
        { name: t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: t('COMMON:MSG_LNB_MENU_238') }), path: `${props.match.url}` },
      ]}
    />
  );
};

type SchemaRegistriesDetailsProps = {
  obj: K8sResourceKind;
};
