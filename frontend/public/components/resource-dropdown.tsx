import * as React from 'react';
import * as _ from 'lodash-es';
import { connect } from 'react-redux';
import { Map as ImmutableMap, OrderedMap, Set as ImmutableSet } from 'immutable';
import * as classNames from 'classnames';
import * as fuzzy from 'fuzzysearch';

import { Dropdown, ResourceIcon } from './utils';
import { apiVersionForReference, K8sKind, K8sResourceKindReference, K8sVerb, kindToAbbr, modelFor, pluralizeKind, referenceForModel } from '../module/k8s';
import { Badge, Checkbox } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { coFetchJSON } from '@console/internal/co-fetch';
import { isSingleClusterPerspective } from '@console/internal/hypercloud/perspectives';
// Blacklist known duplicate resources.
const blacklistGroups = ImmutableSet([
  // Prefer rbac.authorization.k8s.io/v1, which has the same resources.
  'authorization.openshift.io',
]);

const blacklistResources = ImmutableSet([
  // Prefer core/v1
  'events.k8s.io/v1beta1.Event',
]);

const ADMIN_RESOURCES = new Set(['roles', 'rolebindings', 'clusterroles', 'clusterrolebindings', 'thirdpartyresources', 'nodes', 'secrets']);

const DropdownItem: React.SFC<DropdownItemProps> = ({ model, showGroup, checked }) => (
  <>
    <span className={'co-resource-item'}>
      <Checkbox tabIndex={-1} id={`${model.apiGroup}:${model.apiVersion}:${model.kind}`} checked={checked} />
      <span className="co-resource-icon--fixed-width">
        <ResourceIcon kind={referenceForModel(model)} />
      </span>
      <span className="co-resource-item__resource-name">
        <span>
          {model.kind}
          {model.badge && <span className="co-resource-item__tech-dev-preview">{model.badge}</span>}
        </span>
        {showGroup && (
          <span className="co-resource-item__resource-api text-muted co-truncate show co-nowrap small">
            {model.apiGroup || 'core'}/{model.apiVersion}
          </span>
        )}
      </span>
    </span>
  </>
);

const DropdownResourceItem: React.SFC<DropdownResourceItemProps> = ({ name, checked, kind }) => (
  <>
    <span className={'co-resource-item'}>
      <Checkbox tabIndex={-1} id={name} checked={checked} />
      <span className="co-resource-icon--fixed-width">
        <ResourceIcon kind={kind} />
      </span>
      <span className="co-resource-item__resource-name">
        <span>{name}</span>
      </span>
    </span>
  </>
);

const ResourceListDropdown_: React.SFC<ResourceListDropdownProps> = props => {
  const { selected, onChange, allModels, showAll, className, preferredVersions, type } = props;
  const { t } = useTranslation();
  const [models, setModels] = React.useState(allModels);
  const [preferredVersionsState, setPreferredVersionsState] = React.useState(preferredVersions);
  async function inSingle() {
    await coFetchJSON(`/api/kubernetes/apis`).then(res => {
      const preferredVersions = res.groups.map(group => group.preferredVersion);
      const all: Promise<APIResourceList>[] = _.flatten(res.groups.map(group => group.versions.map(version => `/apis/${version.groupVersion}`)))
        .concat(['/api/v1'])
        .map(p => coFetchJSON(`/api/kubernetes${p}`).catch(err => err));
      return Promise.all(all).then(data => {
        const resourceSet = new Set<string>();
        const namespacedSet = new Set<string>();
        data.forEach(
          d =>
            d.resources &&
            d.resources.forEach(({ namespaced, name }) => {
              resourceSet.add(name);
              namespaced && namespacedSet.add(name);
            }),
        );
        const allResources = [...resourceSet].sort();

        const safeResources = [];
        const adminResources = [];

        const defineModels = (list: APIResourceList): K8sKind[] => {
          const groupVersionParts = list.groupVersion.split('/');
          const apiGroup = groupVersionParts.length > 1 ? groupVersionParts[0] : null;
          const apiVersion = groupVersionParts.length > 1 ? groupVersionParts[1] : list.groupVersion;
          return list.resources
            .filter(({ name }) => !name.includes('/'))
            .map(({ name, singularName, namespaced, kind, verbs, shortNames }) => {
              return {
                kind,
                namespaced,
                verbs,
                shortNames,
                label: kind,
                plural: name,
                apiVersion,
                abbr: kindToAbbr(kind),
                ...(apiGroup ? { apiGroup } : {}),
                labelPlural: pluralizeKind(kind),
                path: name,
                id: singularName,
                crd: true,
              };
            });
        };
        allResources.forEach(r => (ADMIN_RESOURCES.has(r.split('/')[0]) ? adminResources.push(r) : safeResources.push(r)));
        const singleModels = _.flatten(data.filter(d => d.resources).map(defineModels));
        let obj = {};
        singleModels.forEach(element => {
          obj[element.apiGroup + '~' + element.apiVersion + '~' + element.kind] = element;
        });
        setModels(ImmutableMap(obj));
        setPreferredVersionsState(preferredVersions);
      });
    });
  }
  React.useEffect(() => {
    isSingleClusterPerspective() && inSingle();
  }, []);

  const resources = models
    .filter(({ apiGroup, apiVersion, kind, verbs }) => {
      // Remove blacklisted items.
      if (blacklistGroups.has(apiGroup) || blacklistResources.has(`${apiGroup}/${apiVersion}.${kind}`)) {
        return false;
      }

      // Only show resources that can be listed.
      if (!_.isEmpty(verbs) && !_.includes(verbs, 'list')) {
        return false;
      }
      // Only show preferred version for resources in the same API group.
      const preferred = (m: K8sKind) => preferredVersionsState.some(v => v.groupVersion === apiVersionForReference(referenceForModel(m)));
      const sameGroupKind = (m: K8sKind) => m.kind === kind && m.apiGroup === apiGroup && m.apiVersion !== apiVersion;

      return !models.find(m => sameGroupKind(m) && preferred(m));
    })
    .toOrderedMap()
    .sortBy(({ kind, apiGroup }) => `${kind} ${apiGroup}`);
  // Track duplicate names so we know when to show the group.
  const kinds = resources.groupBy(m => m.kind);
  const isDup = kind => kinds.get(kind).size > 1;

  const isKindSelected = (kind: string) => {
    return _.includes(selected, kind);
  };

  // Create dropdown items for each resource.
  const items = resources.map(model => <DropdownItem key={referenceForModel(model)} model={model} showGroup={isDup(model.kind)} checked={isKindSelected(referenceForModel(model))} />) as OrderedMap<string, JSX.Element>;
  // Add an "All" item to the top if `showAll`.
  const allItems = (showAll
    ? OrderedMap({
        All: (
          <>
            <span className="co-resource-item">
              <Checkbox id="all-resources" isChecked={isKindSelected('All')} />
              <span className="co-resource-icon--fixed-width">
                <ResourceIcon kind="All" />
              </span>
              <span className="co-resource-item__resource-name">All Resources</span>
            </span>
          </>
        ),
      }).concat(items)
    : items
  ).toJS() as { [s: string]: JSX.Element };

  const autocompleteFilter = (text, item) => {
    const { model } = item.props;
    if (!model) {
      return false;
    }

    return fuzzy(_.toLower(text), _.toLower(model.kind));
  };

  const handleSelected = (value: string) => {
    value === 'All' ? onChange('All') : onChange(referenceForModel(modelFor(value)));
  };

  return (
    <Dropdown
      menuClassName="dropdown-menu--text-wrap"
      className={classNames('co-type-selector', className)}
      items={allItems}
      title={
        <div key="title-resource">
          {t('COMMON:MSG_COMMON_FILTER_1')} <Badge isRead>{selected.length === 1 && selected[0] === 'All' ? 'All' : selected.length}</Badge>
        </div>
      }
      onChange={handleSelected}
      autocompleteFilter={autocompleteFilter}
      autocompletePlaceholder={t('COMMON:MSG_COMMON_FILTER_2')}
      type={type}
    />
  );
};

const resourceListDropdownStateToProps = ({ k8s }) => ({
  allModels: k8s.getIn(['RESOURCES', 'models']),
  preferredVersions: k8s.getIn(['RESOURCES', 'preferredVersions']),
});

export const ResourceListDropdown = connect(resourceListDropdownStateToProps)(ResourceListDropdown_);

export const RegistryListDropdown_: React.SFC<RegistryListDropdownProps> = props => {
  const { selected, onChange, /*setAllData, */ allData, showAll, className, type } = props;

  const getName = map => {
    return map.get('metadata').get('name');
  };

  const resources = [];
  for (let item of Array.from(allData)) {
    resources.push(getName(item[1]));
  }

  const isResourceSelected = (resource: string) => {
    return _.includes(selected, resource);
  };

  const items = allData.map(resource => <DropdownResourceItem key={getName(resource)} name={getName(resource)} checked={isResourceSelected(getName(resource))} kind="Registry" />) as OrderedMap<string, JSX.Element>;

  const allItems = (showAll
    ? OrderedMap({
        All: (
          <>
            <span className="co-resource-item">
              <Checkbox id="all-resources" isChecked={isResourceSelected('All')} />
              <span className="co-resource-icon--fixed-width">
                <ResourceIcon kind="All" />
              </span>
              <span className="co-resource-item__resource-name">All Registries</span>
            </span>
          </>
        ),
      }).concat(items)
    : items
  ).toJS() as { [s: string]: JSX.Element };

  const autocompleteFilter = (text, item) => {
    const { model } = item.props;
    if (!model) {
      return false;
    }

    return fuzzy(_.toLower(text), _.toLower(model.kind));
  };

  const handleSelected = (value: string) => {
    if (value === 'All') {
      onChange('All');
      // setAllData(resources);
    } else {
      onChange(value.split(')-')[1]);
    }
  };

  return (
    <Dropdown
      menuClassName="dropdown-menu--text-wrap"
      className={classNames('co-type-selector', className)}
      items={allItems}
      title={
        <div key="title-resource">
          Registries <Badge isRead>{selected.length === 1 && selected[0] === 'All' ? 'All' : selected.length}</Badge>
        </div>
      }
      onChange={handleSelected}
      autocompleteFilter={autocompleteFilter}
      autocompletePlaceholder="Select Registry"
      type={type}
    />
  );
};

const registryListDropdownStateToProps = ({ k8s, UI }) => {
  let namespace = UI.getIn(['activeNamespace']);
  let registryKey = 'tmax.io~v1~Registry';
  if (namespace !== '#ALL_NS#') {
    registryKey += `---{"ns":"${namespace}"}`;
  }
  return {
    allData: k8s.getIn([registryKey, 'data']),
  };
};

export const RegistryListDropdown = connect(registryListDropdownStateToProps)(RegistryListDropdown_);

export type RegistryListDropdownProps = {
  selected: K8sResourceKindReference[];
  onChange: (value: string) => void;
  setAllData: (allData: string[]) => void;
  allData: any;
  className?: string;
  id?: string;
  showAll?: boolean;
  type?: string;
};

export type ResourceListDropdownProps = {
  selected: K8sResourceKindReference[];
  onChange: (value: string) => void;
  allModels: ImmutableMap<K8sResourceKindReference, K8sKind>;
  preferredVersions: { groupVersion: string; version: string }[];
  className?: string;
  id?: string;
  showAll?: boolean;
  type?: string;
};

type DropdownItemProps = {
  model: K8sKind;
  showGroup?: boolean;
  checked?: boolean;
};

type DropdownResourceItemProps = {
  name: string;
  checked?: boolean;
  kind: string;
};
export type APIResourceList = {
  kind: 'APIResourceList';
  apiVersion: 'v1';
  groupVersion: string;
  resources?: {
    name: string;
    singularName?: string;
    namespaced?: boolean;
    kind: string;
    verbs: K8sVerb[];
    shortNames?: string[];
  }[];
};
export type DiscoveryResources = {
  adminResources: string[];
  allResources: string[];
  configResources: K8sKind[];
  modelss: K8sKind[];
  namespacedSet: Set<string>;
  preferredVersions: { groupVersion: string; version: string }[];
  safeResources: string[];
};
