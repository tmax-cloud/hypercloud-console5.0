import * as _ from 'lodash-es';
import { ClusterMenuPolicyModel, ServiceModel } from '@console/internal/models';
import { modelFor, Selector, k8sGet } from '@console/internal/module/k8s';
import { CMP_PRIMARY_KEY, CustomMenusMap, MenuContainerLabels, CUSTOM_LABEL_TYPE } from '@console/internal/hypercloud/menu/menu-types';
import { coFetchJSON } from '@console/internal/co-fetch';
import i18next, { TFunction } from 'i18next';
import { ResourceLabel, getI18nInfo } from '@console/internal/models/hypercloud/resource-plural';
import { DoneMessage, getIngressUrl } from './ingress-utils';
import { selectorToString } from '@console/internal/module/k8s/selector';
import { PerspectiveType } from '@console/internal/hypercloud/perspectives';
import { setServicePort } from '@console/internal/actions/ui';
import store from '@console/internal/redux';

const en = i18next.getFixedT('en');

// TODO: hc-default-menus에서 찾도록 변경
const INGRESS_LABEL_VALUES = [
  { labelValue: 'hyperregistry', menuKey: CustomMenusMap.Harbor.kind, perspectives: [PerspectiveType.MASTER.toString()] },
  { labelValue: 'argocd', menuKey: CustomMenusMap.ArgoCD.kind, perspectives: [PerspectiveType.MASTER.toString()] },
  { labelValue: 'gitlab', menuKey: CustomMenusMap.Git.kind, perspectives: [PerspectiveType.MASTER.toString()] },
  { labelValue: 'grafana', menuKey: CustomMenusMap.Grafana.kind, perspectives: [PerspectiveType.MASTER.toString()] },
  { labelValue: 'kiali', menuKey: CustomMenusMap.Kiali.kind, perspectives: [PerspectiveType.DEVELOPER.toString()] },
  { labelValue: 'kibana', menuKey: CustomMenusMap.Kibana.kind, perspectives: [PerspectiveType.MASTER.toString(), PerspectiveType.SINGLE.toString()] },
];

export const getCmpListFetchUrl = () => {
  const { apiGroup, apiVersion, plural } = ClusterMenuPolicyModel;
  const labelSelectorString = selectorToString({
    [CMP_PRIMARY_KEY]: 'true',
  } as Selector);
  const query = `&${encodeURIComponent('labelSelector')}=${encodeURIComponent(labelSelectorString)}`;

  return `${location.origin}/api/kubernetes/apis/${apiGroup}/${apiVersion}/${plural}?${query}`;
};

const initializeCmpFlag = () => {
  return new Promise(resolve => {
    coFetchJSON(getCmpListFetchUrl())
      .then(res => {
        const policy = res?.items?.[0];
        window.SERVER_FLAGS.showCustomPerspective = policy?.showCustomPerspective || false;
        resolve(DoneMessage);
      })
      .catch(() => {
        window.SERVER_FLAGS.showCustomPerspective = false;
        // eslint-disable-next-line no-console
        console.log(`No cmp resource.`);
        // MEMO : 링크나 메뉴생성에 에러가 나도 일단 app 화면은 떠야 되니 resolve처리함.
        resolve(DoneMessage);
      });
  });
};

const initializeMenuUrl = async (label: string, menuKey: string) => {
  const ingressUrl = await getIngressUrl(label);
  const url = ingressUrl || '';
  const grafanaUrl = ingressUrl ? `${ingressUrl}/login/generic_oauth` : '';
  const menu = _.get(CustomMenusMap, menuKey);
  !!menu && _.assign(menu, { url: menuKey === CustomMenusMap.Grafana.kind ? grafanaUrl : url });
};

const initializePort = async () => {
  try {
    // 서비스 타입이 nodeport일 경우 websecure의 port 값 매핑
    if (window.SERVER_FLAGS.svcType === 'NodePort') {
      const { spec } = await k8sGet(ServiceModel, 'api-gateway', 'api-gateway-system', { basePath: `${location.origin}/api/console` });
      if (spec.type === 'NodePort') {
        store.dispatch(setServicePort(`:${spec.ports.find((port: any) => port.name === 'websecure').port}`));
      }
    }
  } catch (error) {
    console.error(`Failed to get api-gateway service:\n${error}`);
  }
  store.dispatch(setServicePort(''));
};

export const initializeMenuUrls = async (perspective: string) => {
  const promises = [];
  INGRESS_LABEL_VALUES.map(m => {
    if (!m.perspectives || m.perspectives.includes(perspective)) {
      promises.push(initializeMenuUrl(m.labelValue, m.menuKey));
    }
  });
  Promise.all(promises);
};

export const initializationForMenu = async () => {
  await initializeCmpFlag();
  await initializePort();
};

export const getLabelTextByKind = (kind, t: TFunction) => {
  const model = modelFor(kind);
  const label = ResourceLabel(model, t);
  const key = getI18nInfo(model)?.label;
  const type = i18next.exists(key) ? en(key) : CUSTOM_LABEL_TYPE;
  return { label, type };
};

export const getLabelTextByDefaultLabel = (defaultLabel, t: TFunction) => {
  const i18nExists = i18next.exists(defaultLabel);
  let label = '';
  let type = '';
  if (i18nExists) {
    label = t(defaultLabel);
    type = en(defaultLabel);
  } else {
    //user가 추가한 menu이거나 i18n키가 없는경우
    label = defaultLabel;
    type = CUSTOM_LABEL_TYPE;
  }
  return { label, type };
};
export const getMenuTitle = (kind, t: TFunction): { label: string; type: string } => {
  if (modelFor(kind)) {
    return getLabelTextByKind(kind, t);
  }
  const menuInfo = CustomMenusMap[kind];
  if (menuInfo) {
    return getLabelTextByDefaultLabel(menuInfo.defaultLabel, t);
  }
  return { label: '', type: CUSTOM_LABEL_TYPE };
};

export const getContainerLabel = (label, t: TFunction) => {
  const labelText = label?.toLowerCase().replace(' ', '') || '';
  const containerKeyOrLabel = MenuContainerLabels[labelText] ? MenuContainerLabels[labelText] : label;
  const i18nExist = i18next.exists(containerKeyOrLabel);
  let containerLabel = '';
  let type = '';
  if (i18nExist) {
    containerLabel = t(containerKeyOrLabel);
    type = en(containerKeyOrLabel);
  } else {
    containerLabel = labelText;
    type = CUSTOM_LABEL_TYPE;
  }
  return { containerLabel, type };
};
