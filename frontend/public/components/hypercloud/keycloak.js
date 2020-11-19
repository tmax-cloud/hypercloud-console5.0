import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'https://172.22.6.11/auth/',
  realm: 'tmax',
  clientId: 'multicluster',
});

keycloak.logout = keycloak.logout.bind(keycloak, { rediretUri: document.location.origin });

export default keycloak;
