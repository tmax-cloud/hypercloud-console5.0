import * as _ from 'lodash-es';
import { CustomMenusMap } from '@console/internal/hypercloud/menu/menu-types';
import { getIngressUrl } from '@console/internal/components/hypercloud/utils/ingress-utils';
const getHelmHost = async () => {
  const mapUrl = (CustomMenusMap as any).Helm.url;
  return mapUrl !== '' ? mapUrl : await getIngressUrl('helm-apiserver');
};

export const getKind = (id: string) => {
  return id.substring(0, 9) === 'HelmChart' ? id.substring(0, 9) : id;
}
const getHelmRepo = (id: string) => {
  return id.substring(0, 9) === 'HelmChart' ? id.substring(9) : '';
}

//get object api url 반환
export const nonK8sObjectUrl = async (id: string, namespace: string, name: string) => {
  const helmHost = await getHelmHost();
  const kind = getKind(id);
  const helmRepo = getHelmRepo(id);
  
  switch (kind) {
    case 'HelmRelease':
      return `${helmHost}/helm/ns/${namespace}/releases/${name}`;
    case 'HelmChart':
      return `${helmHost}/helm/charts/${helmRepo}_${name}`;
    default:
      return '';
  }
};

//get object 결과 정리
export const nonK8sObjectResult = (kind: string, response: any) => {
  switch (kind) {
    case 'HelmRelease':
      return response.release[0];
    case 'HelmChart':
      let entriesvalues = Object.values(_.get(response, 'indexfile.entries'));
      return entriesvalues[0][0];
    default:
      return {};
  }
};

//get list api url 반환
export const nonK8sListUrl = async (kind: string, query: any) => {
  const helmHost = await getHelmHost();

  switch (kind) {
    case 'HelmRelease':
      return query?.ns ? `${helmHost}/helm/ns/${query.ns}/releases` : `${helmHost}/helm/all-namespaces/releases`;
    case 'HelmChart':
      return `${helmHost}/helm/charts`;
    default:
      return '';
  }
};
//get list 결과 정리
export const nonK8sListResult = (kind: string, response: any) => {
  switch (kind) {
    case 'HelmRelease':
      return response.release;
    case 'HelmChart':
      let tempList = [];
      let entriesvalues = Object.values(_.get(response, 'indexfile.entries'));
      entriesvalues.map(value => {
        tempList.push(value[0]);
      });
      return tempList;
    default:
      return [];
  }
};
