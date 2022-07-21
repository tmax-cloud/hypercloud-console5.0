import * as React from 'react';
import * as _ from 'lodash';
import { ServiceBindingKind } from '@console/internal/module/k8s';
import { AdditionalFormProps } from '@console/shared/src/components/dynamic-form';
import { Section } from '../../utils/section';
import './_servicebinding.scss';

export const ServiceBindingAdditionalForm = (props: AdditionalFormProps<ServiceBindingKind>) => {
  const { formData, uiSchema, setFormData } = props;

  const schema = uiSchema.spec?.properties;
  const _formData = _.cloneDeep(formData);
  const converted = { application: _formData?.spec?.application, services: _formData?.spec?.services };
  const [serviceBinding, setServiceBinding] = React.useState(converted);

  const onDataChange = data => {
    setServiceBinding(data);
    setFormData(_.merge(formData, { spec: { ...formData.spec, ...data } }));
  };

  const updateApplicationData = data => onDataChange({ ...serviceBinding, application: { ...serviceBinding.application, ...data } });
  const handleApplicationChange = (event: any, key: string) => updateApplicationData({ [key]: event.currentTarget.value });

  const updateServiceData = (data, idx, key) => {
    const newServices = serviceBinding.services ? [...serviceBinding.services] : [{}];
    newServices[idx][key] = data;
    onDataChange({ ...serviceBinding, services: newServices });
  };
  const handleServiceChange = (event: any, idx: number, key: string) => updateServiceData(event.currentTarget.value, idx, key);

  return (
    <div className="pf-c-form">
      <div style={{ backgroundColor: 'lightgray', fontWeight: 'bold', textAlign: 'center' }}>TEST</div>
      <div id="root_spec_application_field-group">
        <Section id="applciation-field-group-label" label="Application" labelClassName="hc-form-title-label" isRequired description={schema.application?.description} />
        <div id="application-field-group" className="hc-form-group-content">
          <Section id="application-group-label" label="group" isRequired description={schema.application?.properties?.group?.description}>
            <input id="application-group-input" className="pf-c-form-control" required type="text" value={serviceBinding.application?.group || ''} onChange={e => handleApplicationChange(e, 'group')} />
          </Section>
          <Section id="application-version-label" label="version" isRequired description={schema.application?.properties?.version?.description}>
            <input id="application-version-input" className="pf-c-form-control" required type="text" value={serviceBinding.application?.version || ''} onChange={e => handleApplicationChange(e, 'version')} />
          </Section>
        </div>
      </div>
      <div id="root_spec_services_field-group">
        <Section id="services-field-group-label" label="Services" labelClassName="hc-form-title-label" isRequired description={schema.services?.description} />
        <div id="services-field-group" className="hc-form-group-content">
          <Section id="services-group-label" label="group" isRequired description={schema.services?.items?.properties?.group?.description}>
            <input id="services-group-input" className="pf-c-form-control" required type="text" value={serviceBinding.services?.[0].group || ''} onChange={e => handleServiceChange(e, 0, 'group')} />
          </Section>
          <Section id="services-version-label" label="version" isRequired description={schema.services?.items?.properties?.version?.description}>
            <input id="services-version-input" className="pf-c-form-control" required type="text" value={serviceBinding.services?.[0].version || ''} onChange={e => handleServiceChange(e, 0, 'version')} />
          </Section>
        </div>
      </div>
    </div>
  );
};
