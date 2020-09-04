import * as React from 'react';
export const Section = ({ label, children, isRequired }) => {
    return (
        <div className={'row form-group ' + (isRequired ? 'required' : '')}>
            <div className="col-xs-2 control-label">
                <strong>{label}</strong>
            </div>
            <div className="col-xs-10">{children}</div>
        </div>
    );
};