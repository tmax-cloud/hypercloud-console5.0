export const pluralToKind = (plural) => {
  const convertKind = {
    secrets: 'Secret',
    namespaces: 'Namespace',
    hyperclusterresources: 'HyperClusterResource'
  };
  return convertKind[plural];
}