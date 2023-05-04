import * as _ from 'lodash-es';
import * as React from 'react';
// import { connect } from 'react-redux';
// import { Link } from 'react-router-dom';
// import { Button } from '@patternfly/react-core';

import { FLAGS } from '@console/shared/src/constants';
// import { createProjectMessageStateToProps } from '../reducers/ui';
// import { Disabled, HintBlock, ExternalLink, openshiftHelpBase, LinkifyExternal } from './utils';
import { Disabled, HintBlock, HyperCloudManualLink } from './utils';
import { connectToFlags } from '../reducers/features';
import { ProjectModel, RoleModel, StorageClassModel } from '../models';
// import { createProjectModal } from './modals/create-namespace-modal';

const WHITELIST = [RoleModel.kind, StorageClassModel.kind];

export const HypercloudGettingStarted = () => (
  <>
    <p>HyperCloud helps you quickly develop, host, and scale applications. To get started, you'll need a namespace. Currently, you can't create or access any namespaces. You'll need to contact a cluster administrator for help.</p>
    <p>
      To learn more, visit the HyperCloud <HyperCloudManualLink href={'https://technet.tmaxsoft.com/upload/download/online/hypercloud/pver-20221209-000001/hypercloud/5-ko/welcome/intro.html'} text="manual" />
    </p>
  </>
);

// export const OpenShiftGettingStarted = () => (
//   <>
//     <p>we don't have any namespace. </p>
//     {canCreateProject ? (
//       <p>OpenShift helps you quickly develop, host, and scale applications. To get started, create a project for your application.</p>
//     ) : (
//       <p>
//         OpenShift helps you quickly develop, host, and scale applications. To get started, you'll need a project. Currently, you can't create or access any projects.
//         {!createProjectMessage && " You'll need to contact a cluster administrator for help."}
//       </p>
//     )}
//     {createProjectMessage && (
//       <p className="co-pre-line">
//         <LinkifyExternal>{createProjectMessage}</LinkifyExternal>
//       </p>
//     )}
//     <p>
//       To learn more, visit the OpenShift <ExternalLink href={openshiftHelpBase} text="documentation" />.
//     </p>
//     <p>
//       Download the <Link to="/command-line-tools">command-line tools</Link>
//     </p>
//     {canCreateProject && (
//       <Button variant="link" onClick={() => createProjectModal({ blocking: true })}>
//         Create a new project
//       </Button>
//     )}
//   </>
// );

export const withStartGuide = (WrappedComponent, disable: boolean = true) =>
  connectToFlags(
    FLAGS.SHOW_OPENSHIFT_START_GUIDE,
    FLAGS.CAN_CREATE_PROJECT,
  )(({ flags, ...rest }: any) => {
    const { kindObj } = rest;
    const kind = _.get(kindObj, 'kind', rest.kind);

    const isClusterScope = location.pathname.indexOf('k8s/cluster') >= 0 ? true : false;

    // The start guide does not need to be shown on the Projects list page.
    if (kind === ProjectModel.kind) {
      return <WrappedComponent {...rest} />;
    }

    if (flags[FLAGS.SHOW_OPENSHIFT_START_GUIDE]) {
      return (
        <>
          {isClusterScope ? (
            <WrappedComponent {...rest} noProjectsAvailable />
          ) : (
            <>
              <div className="co-m-pane__body">
                <HintBlock title="Getting Started">
                  <HypercloudGettingStarted />
                </HintBlock>
              </div>
              {// Whitelist certain resource kinds that should not be disabled when no projects are
              // available. Disabling should also be optional
              !disable || WHITELIST.includes(kind) ? (
                <WrappedComponent {...rest} noProjectsAvailable />
              ) : (
                <Disabled>
                  <WrappedComponent {...rest} noProjectsAvailable />
                </Disabled>
              )}
            </>
          )}
        </>
      );
    }
    return <WrappedComponent {...rest} />;
  });

// type OpenShiftGettingStartedProps = {
//   canCreateProject: boolean;
//   createProjectMessage: string;
// };

export type WithStartGuideProps = {
  noProjectsAvailable?: boolean;
};
