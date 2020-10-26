import * as _ from 'lodash-es';
import * as React from 'react';
import { match as RMatch } from 'react-router';
import { useFormContext } from 'react-hook-form';
import { WithCommonForm } from '../create-form';
import { SelectorInput } from '../../../utils';
import { Section } from '../../utils/section';

const defaultValues = {};

const hyperclusterresourceFormFactory = params => {
  switch (params.type) {
    case 'enroll':
      return WithCommonForm(CreateHyperClusterResourceComponent, params, defaultValues);
    default:
      return WithCommonForm(CreateHyperClusterResourceComponent, params, defaultValues); //stepper로 바꿔야함<div className=""></div>
  }
};

const CreateHyperClusterResourceComponent: React.FC<HyperClusterResourceFormProps> = props => {
  const { register } = useFormContext();
  return (
    <Section label="kubeconfig파일" isRequired={true} id="config" description="쿠버네티스 구축 후 생성된 설정 파일 내용을 입력해 주세요.">
      <textarea ref={register} id="config" name="metadata.config" cols={100} rows={20}></textarea>
    </Section>
  );
};

export const CreateHyperClusterResource: React.FC<CreateHyperClusterResourceProps> = props => {
  const formComponent = hyperclusterresourceFormFactory(props.match.params);
  const HyperClusterResourceFormComponent = formComponent;
  return <HyperClusterResourceFormComponent fixed={{}} explanation={''} titleVerb="Create" onSubmitCallback={onSubmitCallback} isCreate={true} />;
};

export const onSubmitCallback = data => {
  let labels = SelectorInput.objectify(data.metadata.labels);
  delete data.metadata.labels;
  data = _.defaultsDeep(data, { metadata: { labels: labels } });
  return data;
};

type CreateHyperClusterResourceProps = {
  match: RMatch<{
    params?: string;
  }>;
  fixed: object;
  explanation: string;
  titleVerb: string;
  saveButtonText?: string;
  isCreate: boolean;
};

type HyperClusterResourceFormProps = {
  onChange: Function;
  stringData: {
    [key: string]: string;
  };
  isCreate: boolean;
};
