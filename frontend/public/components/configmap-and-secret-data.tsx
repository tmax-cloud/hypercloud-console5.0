import * as React from 'react';
import { saveAs } from 'file-saver';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';
import { Button } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

import { CopyToClipboard, EmptyBox, SectionHeading } from './utils';

export const MaskedData: React.FC<{}> = () => (
  <>
    <span className="sr-only">Value hidden</span>
    <span aria-hidden="true">&bull;&bull;&bull;&bull;&bull;</span>
  </>
);

const downloadBinary = (key, value) => {
  const rawBinary = window.atob(value);
  const rawBinaryLength = rawBinary.length;
  const array = new Uint8Array(new ArrayBuffer(rawBinaryLength));
  for (let i = 0; i < rawBinaryLength; i++) {
    array[i] = rawBinary.charCodeAt(i);
  }
  const blob = new Blob([array], { type: 'data:application/octet-stream;' });
  saveAs(blob, key);
};

export const ConfigMapBinaryData: React.FC<DownloadValueProps> = ({ data }) => {
  const dl = [];
  Object.keys(data || {})
    .sort()
    .forEach(k => {
      const value = data[k];
      dl.push(<dt key={`${k}-k`}>{k}</dt>);
      dl.push(
        <dd key={`${k}-v`}>
          <Button className="pf-m-link--align-left" type="button" onClick={() => downloadBinary(k, value)} variant="link">
            Save File
          </Button>
        </dd>,
      );
    });
  return dl.length ? <dl>{dl}</dl> : <EmptyBox label="Binary Data" />;
};
ConfigMapBinaryData.displayName = 'ConfigMapBinaryData';

export const ConfigMapData: React.FC<ConfigMapDataProps> = ({ data, label }) => {
  const dl = [];
  Object.keys(data || {})
    .sort()
    .forEach(k => {
      const value = data[k];
      dl.push(<dt key={`${k}-k`}>{k}</dt>);
      dl.push(
        <dd key={`${k}-v`}>
          <CopyToClipboard value={value} />
        </dd>,
      );
    });
  return dl.length ? <dl>{dl}</dl> : <EmptyBox label={label} />;
};
ConfigMapData.displayName = 'ConfigMapData';

export const SecretValue: React.FC<SecretValueProps> = ({ value, reveal, encoded = true }) => {
  if (!value) {
    return <span className="text-muted">No value</span>;
  }

  const visibleValue = reveal ? value : <MaskedData />;
  return <CopyToClipboard value={value} visibleValue={visibleValue} />;
};
SecretValue.displayName = 'SecretValue';

export const SecretData: React.FC<SecretDataProps> = ({ data, title = 'Data', encoded }) => {
  const { t } = useTranslation();
  const [reveal, setReveal] = React.useState(false);

  const dl = [];
  Object.keys(data || {})
    .sort()
    .forEach(k => {
      dl.push(<dt key={`${k}-k`}>{k}</dt>);
      dl.push(
        <dd key={`${k}-v`}>
          <SecretValue value={data[k]} reveal={reveal} encoded={encoded} />
        </dd>,
      );
    });

  return (
    <>
      <SectionHeading text={t('COMMON:MSG_DETAILS_TABDETAILS_DATA_1')}>
        {dl.length ? (
          <Button type="button" onClick={() => setReveal(!reveal)} variant="link" className="pf-m-link--align-right">
            {reveal ? (
              <>
                <EyeSlashIcon className="co-icon-space-r" />
                {t('COMMON:MSG_COMMON_BUTTON_ETC_3')}
              </>
            ) : (
              <>
                <EyeIcon className="co-icon-space-r" />
                {t('COMMON:MSG_COMMON_BUTTON_ETC_2')}
              </>
            )}
          </Button>
        ) : null}
      </SectionHeading>
      {dl.length ? <dl className="secret-data">{dl}</dl> : <EmptyBox label={t('COMMON:MSG_DETAILS_TABDETAILS_DATA_1')} />}
    </>
  );
};
SecretData.displayName = 'SecretData';

type KeyValueData = {
  [key: string]: string;
};

type ConfigMapDataProps = {
  data: KeyValueData;
  label: string;
};

type DownloadValueProps = {
  data: KeyValueData;
};

type SecretValueProps = {
  value: string;
  encoded?: boolean;
  reveal: boolean;
};

type SecretDataProps = {
  data: KeyValueData;
  title?: string;
  encoded?: boolean;
};
