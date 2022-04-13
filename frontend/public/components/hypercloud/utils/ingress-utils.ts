import * as _ from 'lodash-es';
import { IngressModel } from '@console/internal/models';
import { Selector } from '@console/internal/module/k8s';
import { coFetchJSON } from '@console/internal/co-fetch';
import { selectorToString } from '@console/internal/module/k8s/selector';
import { initializationForMenu } from '@console/internal/components/hypercloud/utils/menu-utils';
import { getServicePort } from '@console/internal/actions/ui';

export const DoneMessage = 'done';

export const DEFAULT_INGRESS_LABEL_KEY = 'ingress.tmaxcloud.org/name';

export const ingressUrlWithLabelSelector = labelSelector => {
  const { apiGroup, apiVersion, plural } = IngressModel;
  const labelSelectorString = selectorToString(labelSelector as Selector);
  const query = `&${encodeURIComponent('labelSelector')}=${encodeURIComponent(labelSelectorString)}`;
  return `/api/console/apis/${apiGroup}/${apiVersion}/${plural}?${query}`;
};

const getIngressHost = async (label: string) => {
  const url = ingressUrlWithLabelSelector({ [DEFAULT_INGRESS_LABEL_KEY]: label });
  try {
    const response = await coFetchJSON(url);
    const { items } = response;
    if (items?.length > 0) {
      const host = items[0].spec?.rules?.[0]?.host;
      if (host) {
        return host;
      }
    }
  } catch (error) {
    console.error(error);
  }
  return null;
};

export const getIngressUrl = async (label: string) => {
  const host = await getIngressHost(label);
  if (host) {
    const port = getServicePort();
    return `https://${host}${port}`;
  }
  return null;
};

const setSingleClusterBasePath = async () => {
  const host = await getIngressHost('multicluster');
  if (host) {
    window.SERVER_FLAGS.singleClusterBasePath = `https://${host}/`;
  }
};

export const setUrlFromIngresses = async () => {
  await setSingleClusterBasePath();
  await initializationForMenu();
};
