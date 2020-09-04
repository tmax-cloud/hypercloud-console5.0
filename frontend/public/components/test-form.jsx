import React from 'react';
import {
    Form,
    FormGroup,
    TextInput,
    TextArea,
    FormSelect,
    Checkbox,
    Popover,
    ActionGroup,
    Button,
    Radio
} from '@patternfly/react-core';
import HelpIcon from '@patternfly/react-icons/dist/js/icons/help-icon';
class SimpleForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value1: '',
            value2: '',
            value3: ''
        };
        this.handleTextInputChange1 = value1 => {
            this.setState({ value1 });
        };
        this.handleTextInputChange2 = value2 => {
            this.setState({ value2 });
        };
        this.handleTextInputChange3 = value3 => {
            this.setState({ value3 });
        };
    }

    render() {
        const { value1, value2, value3 } = this.state;

        return (
            <Form>
                <FormGroup
                    label="Name"
                    labelIcon={
                        <Popover
                            headerContent={
                                <div>
                                    The <a href="https://schema.org/name">name</a> of a <a href="https://schema.org/Person">Person</a>
                                </div>
                            }
                            bodyContent={
                                <div>
                                    Often composed of{' '}
                                    <a href="https://schema.org/givenName" target="_blank">
                                        givenName
                  </a>{' '}
                  and{' '}
                                    <a href="https://schema.org/familyName" target="_blank">
                                        familyName
                  </a>
                  .
                </div>
                            }
                        >
                            <button
                                aria-label="More info for name field"
                                onClick={e => e.preventDefault()}
                                aria-describedby="simple-form-name"
                                className="pf-c-form__group-label-help"
                            >
                                <HelpIcon noVerticalAlign />
                            </button>
                        </Popover>
                    }
                    isRequired
                    fieldId="simple-form-name"
                    helperText="Please provide your full name"
                >
                    <TextInput
                        isRequired
                        type="text"
                        id="simple-form-name"
                        name="simple-form-name"
                        aria-describedby="simple-form-name-helper"
                        value={value1}
                        onChange={this.handleTextInputChange1}
                    />
                </FormGroup>
                <FormGroup label="Email" isRequired fieldId="simple-form-email">
                    <TextInput
                        isRequired
                        type="email"
                        id="simple-form-email"
                        name="simple-form-email"
                        value={value2}
                        onChange={this.handleTextInputChange2}
                    />
                </FormGroup>
                <FormGroup label="Phone number" isRequired fieldId="simple-form-number">
                    <TextInput
                        isRequired
                        type="tel"
                        id="simple-form-number"
                        placeholder="555-555-5555"
                        name="simple-form-number"
                        value={value3}
                        onChange={this.handleTextInputChange3}
                    />
                </FormGroup>
                <FormGroup isInline label="How can we contact you?" isRequired>
                    <Checkbox label="Email" aria-label="Email" id="inlinecheck1" />
                    <Checkbox label="Phone" aria-label="Phone" id="inlinecheck2" />
                    <Checkbox label="Please don't contact me" aria-label="Please don't contact me" id="inlinecheck3" />
                </FormGroup>
                <FormGroup label="Additional Note" fieldId="simple-form-note">
                    <TextInput isDisabled type="text" id="simple-form-note" name="simple-form-number" value="disabled" />
                </FormGroup>
                <FormGroup fieldId="checkbox1">
                    <Checkbox label="I'd like updates via email" id="checkbox1" name="checkbox1" aria-label="Update via email" />
                </FormGroup>
                <ActionGroup>
                    <Button variant="primary">Submit form</Button>
                    <Button variant="link">Cancel</Button>
                </ActionGroup>
            </Form>
        );
    }
}
export default SimpleForm;