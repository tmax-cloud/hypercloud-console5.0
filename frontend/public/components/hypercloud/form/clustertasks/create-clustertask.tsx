import * as _ from 'lodash-es';
import * as React from 'react';
import { match as RMatch } from 'react-router';
import { useFormContext, Controller } from 'react-hook-form';
import { WithCommonForm } from '../create-form';
import { Section } from '../../utils/section';
import { SelectorInput } from '../../../utils';
import { ModalLauncher, ModalList, useInitModal, handleModalData, removeModalData } from '../utils';
import { InputResourceModal } from './input-resource-modal';
import { OutputResourceModal } from './output-resource-modal';
import { TaskParameterModal } from './task-parameter-modal';
import { WorkSpaceModal } from './work-space-modal';
import { VolumeModal } from './volume-modal';
import { StepModal } from './step-modal';
import { ClusterTaskModel } from '../../../../models';

const defaultValues = {
  metadata: {
    name: 'example-name',
  },
};

const clusterTaskFormFactory = params => {
  return WithCommonForm(CreateClusterTaskComponent, params, defaultValues);
};

const CreateClusterTaskComponent: React.FC<ClusterTaskFormProps> = props => {
  const methods = useFormContext();
  const { control } = methods;

  const [inputResource, setInputResource] = React.useState([]);
  const [outputResource, setOutputResource] = React.useState([]);
  const [taskParameter, setTaskParameter] = React.useState([]);
  const [workSpace, setWorkSpace] = React.useState([]);
  const [volume, setVolume] = React.useState([]);
  const [step, setStep] = React.useState([]);

  // Modal Form 초기 세팅위한 Hook들 Custom Hook으로 정리
  useInitModal(methods, inputResource, 'spec.resources.inputs');
  useInitModal(methods, outputResource, 'spec.resources.outputs');
  useInitModal(methods, taskParameter, 'spec.params');
  useInitModal(methods, workSpace, 'spec.workspaces');
  useInitModal(methods, volume, 'spec.volumes');
  useInitModal(methods, step, 'spec.steps');

  // 각 모달에서 다루는 data들
  let inputResourceArr = ['name', 'targetPath', 'type', 'optional'];
  let outputResourceArr = ['name', 'targetPath', 'type', 'optional'];
  let taskParameterArr = ['name', 'description', 'type', 'default'];
  let workspaceArr = ['name', 'description', 'mountPath', 'accessMode', 'optional'];
  let volumeArr = ['name', 'type'];
  let stepArr = ['name', 'imageToggle', 'registryRegistry', 'registryImage', 'registryTag', 'image', 'command', 'args', 'env'];

  return (
    <>
      <Section label="Labels" id="label" description="이것은 Label입니다.">
        <Controller name="metadata.labels" id="label" labelClassName="co-text-sample" as={SelectorInput} control={control} tags={[]} />
      </Section>
      <Section label="Input Resource" id="inputResource">
        <>
          <ModalList list={inputResource} id="input-resource" title="Input Resource" children={<InputResourceModal methods={methods} inputResource={inputResource} />} onRemove={removeModalData.bind(null, inputResource, setInputResource)} handleMethod={handleModalData.bind(null, 'input-resource', inputResourceArr, inputResource, setInputResource, false, methods)} methods={methods} description="이 태스크와 연결된 인풋 리소스가 없습니다."></ModalList>
          <span className="open-modal_text" onClick={() => ModalLauncher({ inProgress: false, title: 'Input Resource', id: 'input-resource', handleMethod: handleModalData.bind(null, 'input-resource', inputResourceArr, inputResource, setInputResource, true, methods), children: <InputResourceModal methods={methods} inputResource={inputResource} />, submitText: '추가' })}>
            + 인풋 리소스 추가
          </span>
        </>
      </Section>
      <Section label="Output Resource" id="outputResource">
        <>
          <ModalList list={outputResource} id="output-resource" title="Output Resource" children={<OutputResourceModal methods={methods} outputResource={outputResource} />} onRemove={removeModalData.bind(null, outputResource, setOutputResource)} handleMethod={handleModalData.bind(null, 'output-resource', outputResourceArr, outputResource, setOutputResource, false, methods)} methods={methods} description="이 태스크와 연결된 아웃풋 리소스가 없습니다."></ModalList>
          <span className="open-modal_text" onClick={() => ModalLauncher({ inProgress: false, title: 'Out Resource', id: 'output-resource', handleMethod: handleModalData.bind(null, 'output-resource', outputResourceArr, outputResource, setOutputResource, true, methods), children: <OutputResourceModal methods={methods} outputResource={outputResource} />, submitText: '추가' })}>
            + 아웃풋 리소스 추가
          </span>
        </>
      </Section>
      <Section label="태스크 파라미터 구성" id="taskParamter">
        <>
          <ModalList list={taskParameter} id="task-parameter" title="태스크 파라미터 구성" children={<TaskParameterModal methods={methods} taskParameter={taskParameter} />} onRemove={removeModalData.bind(null, taskParameter, setTaskParameter)} handleMethod={handleModalData.bind(null, 'task-parameter', taskParameterArr, taskParameter, setTaskParameter, false, methods)} methods={methods} description="이 태스크와 연결된 태스크 파라미터 구성이 없습니다."></ModalList>
          <span className="open-modal_text" onClick={() => ModalLauncher({ inProgress: false, title: '태스크 파라미터', id: 'task-parameter', handleMethod: handleModalData.bind(null, 'task-parameter', taskParameterArr, taskParameter, setTaskParameter, true, methods), children: <TaskParameterModal methods={methods} taskParameter={taskParameter} />, submitText: '추가' })}>
            + 태스크 파라미터 추가
          </span>
        </>
      </Section>
      <Section label="워크스페이스 구성" id="workSpace">
        <>
          <ModalList list={workSpace} id="work-space" title="워크스페이스 구성" children={<WorkSpaceModal methods={methods} workSpace={workSpace} />} onRemove={removeModalData.bind(null, workSpace, setWorkSpace)} handleMethod={handleModalData.bind(null, 'workspace', workspaceArr, workSpace, setWorkSpace, false, methods)} methods={methods} description="이 태스크와 연결된 워크스페이스 구성이 없습니다."></ModalList>
          <span className="open-modal_text" onClick={() => ModalLauncher({ inProgress: false, title: '워크스페이스', id: 'work-space', handleMethod: handleModalData.bind(null, 'workspace', workspaceArr, workSpace, setWorkSpace, true, methods), children: <WorkSpaceModal methods={methods} workSpace={workSpace} />, submitText: '추가' })}>
            + 워크스페이스 추가
          </span>
        </>
      </Section>
      <Section label="볼륨" id="volume">
        <>
          <ModalList list={volume} id="volume" title="볼륨 구성" children={<VolumeModal methods={methods} volume={volume} />} onRemove={removeModalData.bind(null, volume, setVolume)} handleMethod={handleModalData.bind(null, 'volume', volumeArr, volume, setVolume, false, methods)} methods={methods} description="이 태스크와 연결된 볼륨이 없습니다."></ModalList>
          <span className="open-modal_text" onClick={() => ModalLauncher({ inProgress: false, title: '볼륨', id: 'volume', handleMethod: handleModalData.bind(null, 'volume', volumeArr, volume, setVolume, true, methods), children: <VolumeModal methods={methods} volume={volume} />, submitText: '추가' })}>
            + 볼륨 추가
          </span>
        </>
      </Section>
      <Section label="스텝" id="step">
        <>
          <ModalList list={step} id="step" title="스텝 구성" children={<StepModal methods={methods} step={step} />} onRemove={removeModalData.bind(null, step, setStep)} handleMethod={handleModalData.bind(null, 'step', stepArr, step, setStep, false, methods)} methods={methods} description="이 태스크와 연결된 스텝이 없습니다."></ModalList>
          <span className="open-modal_text" onClick={() => ModalLauncher({ inProgress: false, title: '스텝', id: 'step', handleMethod: handleModalData.bind(null, 'step', stepArr, step, setStep, true, methods), children: <StepModal methods={methods} step={step} />, submitText: '추가' })}>
            + 스텝 추가
          </span>
        </>
      </Section>
    </>
  );
};

export const CreateClusterTask: React.FC<CreateClusterTaskProps> = ({ match: { params }, kind }) => {
  const formComponent = clusterTaskFormFactory(params);
  const ClusterTaskFormComponent = formComponent;
  return <ClusterTaskFormComponent fixed={{ apiVersion: `${ClusterTaskModel.apiGroup}/${ClusterTaskModel.apiVersion}`, kind }} explanation={''} titleVerb="Create" onSubmitCallback={onSubmitCallback} isCreate={true} />;
};

export const onSubmitCallback = data => {
  let labels = SelectorInput.objectify(data.metadata.labels);
  delete data.metadata.labels;
  data = _.defaultsDeep(data, { metadata: { labels: labels } });
  // apiVersion, kind
  data.kind = ClusterTaskModel.kind;
  data.apiVersion = `${ClusterTaskModel.apiGroup}/${ClusterTaskModel.apiVersion}`;
  // workspace
  data.spec.workspaces = data?.spec?.workspaces?.map((cur, idx) => {
    let isReadOnly = cur.accessMode === 'readOnly' ? true : false;
    delete data.spec.workspaces[idx].accessMode;
    if (isReadOnly) {
      return { ...cur, readOnly: true };
    } else {
      return { ...cur, readOnly: false };
    }
  });
  // volume
  data.spec.volumes = data?.spec?.volumes?.map(cur => {
    if (cur.type === 'emptyDir') {
      return { emptyDir: {} };
    } else if (cur.type === 'configMap') {
      return {
        configMap: {
          name: cur?.name,
        },
      };
    } else if (cur.type === 'secret') {
      return {
        secret: {
          secretName: cur?.name,
        },
      };
    }
  });
  // step
  data.spec.steps = data?.spec?.steps?.map((cur, idx) => {
    // command
    cur.command = cur?.command?.map(curCommand => curCommand?.value);
    //args
    cur.args = cur?.args?.map(curArg => curArg?.value);
    //env
    cur.env = cur?.env?.map(curEnv => ({ name: curEnv?.envKey, value: curEnv?.envValue }));

    if (cur.imageToggle === 'registry') {
      cur.image = `${cur.registryRegistry}-${cur.registryImage}-${cur.registryTag}`;

      delete data.spec.steps[idx].registryRegistry;
      delete data.spec.steps[idx].registryImage;
      delete data.spec.steps[idx].registryTag;
    }

    delete data.spec.steps[idx].imageToggle;
    return cur;
  });

  console.log(data);
  return data;
};

type CreateClusterTaskProps = {
  match: RMatch<{
    type?: string;
    ns?: string;
  }>;
  kind: string;
  fixed: object;
  explanation: string;
  titleVerb: string;
  saveButtonText?: string;
  isCreate: boolean;
};

type ClusterTaskFormProps = {
  onChange: Function;
  stringData: {
    [key: string]: string;
  };
  isCreate: boolean;
};