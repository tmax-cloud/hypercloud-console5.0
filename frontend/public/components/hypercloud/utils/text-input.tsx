import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import { useFormContext } from 'react-hook-form';

export const TextInput: React.FC<TextInputProps> = ({ id, methods, style, inputClassName, defaultValue, placeholder, type, isDisabled = false, valid = true, validation = {}, hidden= false }) => {
  const { register } = methods ? methods : useFormContext();
  return <input className={classNames(inputClassName, { ['error-text']: !valid })} style={style} placeholder={placeholder} defaultValue={defaultValue} name={id} ref={register(validation)} disabled={isDisabled} type={type} hidden={hidden}></input>;
};

type TextInputProps = {
  id: string;
  methods?: any;
  inputClassName?: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  valid?: boolean;
  validation?: any;
  isDisabled?: boolean;
  style?: any;
  hidden?: boolean;
} & React.HTMLProps<HTMLInputElement>;
