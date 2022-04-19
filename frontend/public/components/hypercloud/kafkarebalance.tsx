import * as React from 'react';
import { K8sResourceKind } from '../../module/k8s';
import { DetailsPage, ListPage, DetailsPageProps } from '../factory';
import { DetailsItem, Kebab, KebabAction, detailsPage, Timestamp, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from '../utils';
import { KafkaBrokerModel, KafkaRebalanceModel } from '../../models';
import { ResourceLabel } from '../../models/hypercloud/resource-plural';
import { useTranslation } from 'react-i18next';
import { TableProps } from './utils/default-list-component';
import { coFetchJSON } from '@console/internal/co-fetch';
import { Selector } from '@console/internal/module/k8s';
import { selectorToString } from '@console/internal/module/k8s/selector';

const kind = KafkaRebalanceModel.kind;

const menuActions: KebabAction[] = [...Kebab.factory.common];

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
        title: 'COMMON:MSG_MAIN_TABLEHEADER_137',
        sortField: `obj.metadata.labels['strimzi.io/cluster']`,
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
      children: obj.metadata.labels['strimzi.io/cluster'],
    },
    {
      children: <Timestamp timestamp={obj.metadata.creationTimestamp} />,
    },
    {
      className: Kebab.columnClass,
      children: <ResourceKebab actions={menuActions} kind={kind} resource={obj} />,
    },
  ],
};

export const KafkaRebalanceDetailsList: React.FC<KafkaRebalanceDetailsListProps> = ({ obj: kr }) => {
  const { t } = useTranslation();
  const [config, setConfig] = React.useState(new Map);  
  const [loading, setLoading] = React.useState(false);

  const kafkaWithLabelSelector = labelSelector => {
    const { apiGroup, apiVersion, plural } = KafkaBrokerModel;
    const labelSelectorString = selectorToString(labelSelector as Selector);
    const query = `&${encodeURIComponent('labelSelector')}=${encodeURIComponent(labelSelectorString)}`;    
    return `${location.origin}/api/console/apis/${apiGroup}/${apiVersion}/${plural}?${query}`;
  };
  
  React.useEffect(() => {
    const fetchKafkaConfig = async () => {
      await coFetchJSON(kafkaWithLabelSelector({
        'strimzi.io/cluster': kr.metadata?.labels['strimzi.io/cluster'],
      })).then((res) => {
        const { items } = res;
        const kafka = items[0];
        setConfig(kafka.spec?.cruiseControl?.config);
        setLoading(true);
      });
    }
    fetchKafkaConfig();
  }, []);

  return (
    <dl className="co-m-pane__details">
      <DetailsItem label={t('COMMON:MSG_MAIN_TABLEHEADER_137')} obj={kr}>
        {kr.metadata?.labels['strimzi.io/cluster']}
      </DetailsItem>
      <DetailsItem label='브로커 내 파티션 최대 이동 횟수' obj={kr}>
        {kr.spec?.concurrentIntraBrokerPartitionMovements}
      </DetailsItem>
      <DetailsItem label='파티션 리더 최대 변경 수' obj={kr}>
        {kr.spec?.concurrentLeaderMovements}
      </DetailsItem>
      <DetailsItem label='브로커 간 파티션 최대 이동 수' obj={kr}>
        {kr.spec?.concurrentPartitionMovementsPerBroker}
      </DetailsItem>
      <DetailsItem label='목표' obj={kr}>
        {kr.spec?.goals?.map((goal) => {return <p key={`key-${goal}`}>{goal}</p>} )}
      </DetailsItem>
      {loading && config && config.get('hard.goals') &&
        <DetailsItem label='카프카 클러스터 목표' obj={kr}>
          {kr.spec?.skipHardGoalCheck ? '확인함' : '확인하지 않음'}
        </DetailsItem>
      }
    </dl>
  );
};

const KafkaRebalanceDetails: React.FC<KafkaRebalanceDetailsProps> = ({ obj: kr }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: ResourceLabel(kr, t) })} />
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={kr} showOwner={false} />
          </div>
          <div className="col-sm-6">
            <KafkaRebalanceDetailsList obj={kr} />
          </div>
        </div>
      </div>
    </>
  );
};

const { details, editResource } = navFactory;

export const KafkaRebalancesPage: React.FC = props => {
  return <ListPage {...props} canCreate={true} kind={kind} tableProps={tableProps} />;
};

export const KafkaRebalancesDetailsPage: React.FC<DetailsPageProps> = props => {
  return <DetailsPage {...props} kind={kind} menuActions={menuActions} pages={[details(detailsPage(KafkaRebalanceDetails)), editResource()]} />;
};

type KafkaRebalanceDetailsListProps = {
  obj: K8sResourceKind;
};

type KafkaRebalanceDetailsProps = {
  obj: K8sResourceKind;
};