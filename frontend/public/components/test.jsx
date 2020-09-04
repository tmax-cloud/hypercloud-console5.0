import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { connect, Dispatch } from 'react-redux';
import { Alert } from '@patternfly/react-core';
import { Section } from './test-section';
import SimpleForm from "./test-form";
import { RootState } from '../redux';
import { getActivePerspective, getPinnedResources } from '../reducers/ui';
import { setPinnedResources } from '../actions/ui';
import { withStartGuide } from './start-guide';
import {
    PageHeading,
} from './utils';


const TestPage_ = (props) => {

    return (
        <>
            <Helmet>
                <title>Test</title>
            </Helmet>
            <PageHeading detail={true} title="Test" />

            <div>
                <h2>Patternfly Component - Alert</h2>
                <React.Fragment>
                    <Alert title="Default alert title" />
                    <Alert variant="info" title="Info alert title" />
                    <Alert variant="success" title="Success alert title" />
                    <Alert variant="warning" title="Warning alert title" />
                    <Alert variant="danger" title="Danger alert title" />
                </React.Fragment>
            </div>

            <div>
                <h2>Patternfly Component - SimpleForm</h2>
                <SimpleForm />
            </div>

            <div>
                <h2>User Defined Component - Section</h2>
                <Section label="test" isRequired={true} >
                    <input className="form-control " type="text" id="config-map-name" />
                </Section>
            </div>
        </>
    );
};



export const TestPage = connect(mapStateToProps, mapDispatchToProps)(withStartGuide(TestPage_));

