import * as React from 'react';
import { EditRoleBinding } from '../../../RBAC/bindings';
import { isCreatePage } from '../create-form';
/* MEMO : 기존에 구현된 bindings Page 재사용함. */
export const CreateRoleBinding = props => {  
  if (!!props.obj && !isCreatePage(props.obj)) {
    return <EditRoleBinding kind={props.obj?.kind} {...props} />;
  }
};