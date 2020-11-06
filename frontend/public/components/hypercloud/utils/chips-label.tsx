import * as _ from 'lodash-es';
import * as React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { SelectorInput } from '../../utils';

export const ChipsLabel: React.FC<ChipsLabelType> = ({ name, labelClassName, tags, labelPlaceholder }) => {
    const { control } = useFormContext();
    return (
        <div>
            <Controller name={name} id="tags-input" defaultValue={tags} labelClassName={labelClassName} as={<SelectorInput />} control={control} tags={tags} labelPlaceholder={labelPlaceholder}>
            </Controller>
        </div>
    );
}

type ChipsLabelType = {
    name: string,
    tags?: string[],
    labelClassName?: string,
    labelPlaceholder?: string
}

ChipsLabel.defaultProps = {
    tags: [],
    labelClassName: "co-text-pod"
}

