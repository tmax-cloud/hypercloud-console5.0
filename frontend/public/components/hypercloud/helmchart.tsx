import * as React from 'react';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { SectionHeading, Timestamp, detailsPage, navFactory, ResourceLink } from '@console/internal/components/utils';
import { TableProps } from './utils/default-list-component';
import { DetailsPage, ListPage, DetailsPageProps } from '../factory';
import { HelmChartModel, HelmRepositoryModel } from '@console/internal/models/hypercloud/helm-model';

const kind = HelmChartModel.kind;

type HelmchartPageProps = {
  match?: any;
};
export const HelmchartPage: React.FC<HelmchartPageProps> = props => {
  return <ListPage {...props} canCreate={false} tableProps={tableProps} kind={kind} hideLabelFilter={true} customData={{ nonK8sResource: true, kindObj: HelmChartModel }} isK8sResource={false} />;
};

const tableProps: TableProps = {
  header: [
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_1',
      sortField: 'name',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_130',
      sortField: 'repo.name',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_131',
      sortField: 'repo.url',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_141',
      sortField: 'version',
    },
    {
      title: 'COMMON:MSG_MAIN_TABLEHEADER_12',
      sortField: 'created',
    },
  ],
  row: (obj: any) => {
    return [
      {
        children: <ResourceLink manualPath={`/helmcharts/${obj.repo?.name}/${obj.name}`} kind={HelmChartModel.kind} name={obj.name} />,
      },
      {
        children: <ResourceLink manualPath={`/helmrepositories/${obj.repo?.name}`} kind={HelmRepositoryModel.kind} name={obj.repo?.name} />,
      },
      {
        children: obj.repo?.url,
      },
      {
        children: obj.version,
      },
      {
        children: <Timestamp timestamp={obj.created} />,
      },
    ];
  },
};

const { details } = navFactory;
export const HelmchartDetailsPage: React.FC<DetailsPageProps> = props => {
  const { t } = useTranslation();
  return (
    <DetailsPage
      {...props}
      kind={kind}
      pages={[details(detailsPage(HelmChartDetails))]}
      customData={{ helmRepo: props.match?.params?.repo, nonK8sResource: true, kindObj: HelmChartModel }}
      name={props.match?.params?.name}
      isK8sResource={false}
      breadcrumbsFor={() => {
        return [
          { name: t(HelmChartModel.i18nInfo.labelPlural), path: '/helmcharts' },
          { name: t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: t(HelmChartModel.i18nInfo.label) }), path: '' },
        ];
      }}
    />
  );
};
const HelmChartDetails: React.FC<HelmChartDetailsProps> = ({ obj: entry }) => {
  const { t } = useTranslation();
  return (
    <div className="co-m-pane__body">
      <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_1', { 0: t(HelmChartModel.i18nInfo.label) })} />
      <div className="row">
        <div className="col-lg-6">
          <dl data-test-id="resource-summary" className="co-m-pane__details">
            <dt>{t('COMMON:MSG_DETAILS_TABDETAILS_DETAILS_5')}</dt>
            <dd>{entry.name}</dd>
          </dl>
        </div>
        <div className="col-lg-6">
          <HelmChartDetailsList entry={entry} />
        </div>
      </div>
    </div>
  );
};
type HelmChartDetailsProps = {
  obj: any;
};
export const HelmChartDetailsList: React.FC<HelmChartDetailsListProps> = ({ entry }) => {
  const { t } = useTranslation();
  return (
    <dl className="co-m-pane__details">
      <dt>{t('MULTI:MSG_DEVELOPER_ADD_CREATEFORM_SIDEPANEL_2')}</dt>
      <dd>
        <div>{entry.version}</div>
      </dd>
      <dt>{t('MULTI:MSG_DEVELOPER_ADD_CREATEFORM_SIDEPANEL_3')}</dt>
      <dd>
        <div>{entry.appVersion}</div>
      </dd>
      {entry.sources && (
        <>
          <dt>{t('MULTI:MSG_DEVELOPER_ADD_CREATEFORM_SIDEPANEL_4')}</dt>
          <dd>
            <div>
              {entry.sources?.map(source => {
                return <p key={`source-${source}`}>{source}</p>;
              })}
            </div>
          </dd>
        </>
      )}
      <dt>{t('SINGLE:MSG_HELMCHARTS_HELMCHARTDETAILS_TABDETAILS_1')}</dt>
      <dd>
        <div>{t('SINGLE:MSG_HELMCHARTS_HELMCHARTDETAILS_TABDETAILS_2') + ' : ' + entry.repo.name}</div>
        <div>{'URL : ' + entry.repo.url}</div>
      </dd>
      <dt>{t('SINGLE:MSG_HELMCHARTS_HELMCHARTDETAILS_TABDETAILS_6')}</dt>
      <dd>
        {entry.maintainers?.map(m => {
          return <div key={'mainatainer-key-' + m.name}>{m.name}</div>;
        })}
      </dd>
      <dt>{t('MULTI:MSG_DEVELOPER_ADD_CREATEFORM_SIDEPANEL_9')}</dt>
      <dd>
        <a href={entry.home} target="_blank">
          {entry.home}
        </a>
      </dd>
      <dt>{t('SINGLE:MSG_HELMCHARTS_HELMCHARTDETAILS_TABDETAILS_5')}</dt>
      <dd>
        <Timestamp timestamp={entry.created} />
      </dd>
    </dl>
  );
};
type HelmChartDetailsListProps = {
  entry: any;
};

const chartTableProps = (repoName: string): TableProps => {
  return {
    header: [
      {
        title: 'COMMON:MSG_MAIN_TABLEHEADER_1',
        sortField: 'name',
      },
      {
        title: 'COMMON:MSG_MAIN_TABLEHEADER_141',
        sortField: 'version',
      },
    ],
    row: (obj: any) => {
      return [
        {
          children: <ResourceLink manualPath={`/helmcharts/${repoName}/${obj.name}`} kind={HelmChartModel.kind} name={obj.name} />,
        },
        {
          children: obj.version,
        },
      ];
    },
  };
};
export const ChartListPage: React.FC<ChartListPageProps> = props => {
  const { repoName } = props;
  return <ListPage tableProps={chartTableProps(repoName)} kind={HelmChartModel.kind} hideLabelFilter={true} customData={{ nonK8sResource: true, kindObj: HelmChartModel, helmRepo: name }} isK8sResource={false} />;
};
type ChartListPageProps = {
  match?: any;
  repoName?: string;
};
