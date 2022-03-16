import * as React from 'react';
import { Base64 } from 'js-base64';
import { saveAs } from 'file-saver';
import { Alert, AlertActionLink, Button } from '@patternfly/react-core';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { CompressIcon, ExpandIcon, DownloadIcon } from '@patternfly/react-icons';
import * as classNames from 'classnames';
import { FLAGS } from '@console/shared/src/constants';
import { LoadingInline, LogWindow, TogglePlay, ExternalLink } from '.';
import { K8sResourceKind, modelFor, resourceURL } from '../../module/k8s';
import { WSFactory } from '../../module/ws-factory';
import { LineBuffer } from './line-buffer';
import * as screenfull from 'screenfull';
import { k8sGet, k8sList } from '@console/internal/module/k8s';
import { ConsoleExternalLogLinkModel, ProjectModel } from '@console/internal/models';
import { useFlag } from '@console/shared/src/hooks/flag';
import { usePrevious } from '@console/shared/src/hooks/previous';

export const STREAM_EOF = 'eof';
export const STREAM_LOADING = 'loading';
export const STREAM_PAUSED = 'paused';
export const STREAM_ACTIVE = 'streaming';

export const LOG_SOURCE_RESTARTING = 'restarting';
export const LOG_SOURCE_RUNNING = 'running';
export const LOG_SOURCE_TERMINATED = 'terminated';
export const LOG_SOURCE_WAITING = 'waiting';

const DEFAULT_BUFFER_SIZE = 1000;

// Messages to display for corresponding log status
const streamStatusMessages = {
  [STREAM_EOF]: 'COMMON:MSG_DETAILS_TABLOGS_9',
  [STREAM_LOADING]: 'COMMON:MSG_DETAILS_TABLOGS_7',
  [STREAM_PAUSED]: 'COMMON:MSG_DETAILS_TABLOGS_10',
  [STREAM_ACTIVE]: 'COMMON:MSG_DETAILS_TABLOGS_11',
};

const replaceVariables = (template: string, values: any): string => {
  return _.reduce(
    values,
    (result, value, name) => {
      // Replace all occurrences of template expressions like "${name}" with the URL-encoded value.
      // eslint-disable-next-line prefer-template
      const pattern = _.escapeRegExp('${' + name + '}');
      return result.replace(new RegExp(pattern, 'g'), encodeURIComponent(value));
    },
    template,
  );
};

// Build a log API url for a given resource
const getResourceLogURL = (resource: K8sResourceKind, containerName?: string, bufferSize?: number): string => {
  return resourceURL(modelFor(resource.kind), {
    name: resource.metadata.name,
    ns: resource.metadata.namespace,
    path: 'log',
    queryParams: {
      container: containerName || '',
      follow: 'true',
      tailLines: `${bufferSize}`,
    },
  });
};

// Component for log stream controls
export const LogControls = (props: LogControlsProps) => {
  const { t } = useTranslation();
  const { dropdown, onDownload, toggleFullscreen, isFullscreen, status, toggleStreaming, resource, containerName, podLogLinks, namespaceUID } = props;

  return (
    <div className="co-toolbar">
      <div className="co-toolbar__group co-toolbar__group--left">
        <div className="co-toolbar__item">
          {status === STREAM_LOADING && (
            <>
              <LoadingInline />
              &nbsp;
            </>
          )}
          {[STREAM_ACTIVE, STREAM_PAUSED].includes(status) && <TogglePlay active={status === STREAM_ACTIVE} onClick={toggleStreaming} />}
          {t(streamStatusMessages[status])}
        </div>
        {dropdown && <div className="co-toolbar__item">{dropdown}</div>}
      </div>
      <div className="co-toolbar__group co-toolbar__group--right">
        {!_.isEmpty(podLogLinks) &&
          _.map(_.sortBy(podLogLinks, 'metadata.name'), link => {
            const namespace = resource.metadata.namespace;
            const namespaceFilter = link.spec.namespaceFilter;
            if (namespaceFilter) {
              try {
                const namespaceRegExp = new RegExp(namespaceFilter, 'g');
                if (namespace.search(namespaceRegExp)) {
                  return null;
                }
              } catch (e) {
                // eslint-disable-next-line no-console
                console.warn('invalid log link regex', namespaceFilter, e);
                return null;
              }
            }
            const url = replaceVariables(link.spec.hrefTemplate, {
              resourceName: resource.metadata.name,
              resourceUID: resource.metadata.uid,
              containerName,
              resourceNamespace: namespace,
              resourceNamespaceUID: namespaceUID,
              podLabels: JSON.stringify(resource.metadata.labels),
            });
            return (
              <React.Fragment key={link.metadata.uid}>
                <ExternalLink href={url} text={link.spec.text} dataTestID={link.metadata.name} />
                <span aria-hidden="true" className="co-action-divider hidden-xs">
                  |
                </span>
              </React.Fragment>
            );
          })}
        <Button variant="link" isInline onClick={onDownload}>
          <DownloadIcon className="co-icon-space-r" />
          {t('COMMON:MSG_DETAILS_TABLOGS_1')}
        </Button>
        {screenfull.enabled && (
          <>
            <span aria-hidden="true" className="co-action-divider hidden-xs">
              |
            </span>
            <Button variant="link" isInline onClick={toggleFullscreen}>
              {isFullscreen ? (
                <>
                  <CompressIcon className="co-icon-space-r" />
                  {t('COMMON:MSG_DETAILS_TABTERMINAL_10')}
                </>
              ) : (
                <>
                  <ExpandIcon className="co-icon-space-r" />
                  {t('COMMON:MSG_DETAILS_TABTERMINAL_9')}
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

// Resource agnostic log component
export const ResourceLog = (props: ResourceLogProps) => {
  const { bufferSize = DEFAULT_BUFFER_SIZE, containerName, dropdown, resource, resourceStatus } = props;
  const { t } = useTranslation();
  const buffer = React.useRef(new LineBuffer(props.bufferSize));
  const resourceLogRef = React.useRef();
  const ws = React.useRef<any>();
  const externalLogLinkFlag = useFlag(FLAGS.CONSOLE_EXTERNAL_LOG_LINK);

  const [error, setError] = React.useState(false);
  const [lines, setLines] = React.useState([]);
  const [linesBehind, setLinesBehind] = React.useState(0);
  const [totalLineCount, setTotalLineCount] = React.useState(0);
  const [stale, setStale] = React.useState(false);
  const [status, setStatus] = React.useState(STREAM_LOADING);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [namespaceUID, setNamespaceUID] = React.useState('');
  const [podLogLinks, setPodLogLinks] = React.useState();

  const previousResourceStatus = usePrevious(resourceStatus);
  const previousTotalLineCount = usePrevious(totalLineCount);
  const bufferFull = lines.length === bufferSize;
  const watchURL = getResourceLogURL(resource, containerName, bufferSize);

  // Update lines behind while stream is paused, reset when unpaused
  React.useEffect(() => {
    if (status === STREAM_ACTIVE) {
      setLinesBehind(0);
    }

    if (status === STREAM_PAUSED) {
      setLinesBehind(currentLinesBehind => Math.min(currentLinesBehind + (totalLineCount - previousTotalLineCount), bufferSize));
    }
  }, [status, totalLineCount, previousTotalLineCount, bufferSize]);

  // Initialize websocket connection and wire up handlers
  const startWebSocket = React.useCallback(() => {
    // Handler for websocket onopen event
    const onOpen = () => {
      buffer.current.clear();
      setStatus(STREAM_ACTIVE);
    };
    // Handler for websocket onclose event
    const onClose = () => {
      setStatus(STREAM_EOF);
    };
    // Handler for websocket onerror event
    const onError = () => {
      setError(true);
    };
    // Handler for websocket onmessage event
    const onMessage = msg => {
      if (msg) {
        const text = Base64.decode(msg);
        setTotalLineCount(currentLineCount => currentLineCount + buffer.current.ingest(text));
        setLines([...buffer.current.getLines()]);
      }
    };
    setError(false);
    setLines([]);
    setTotalLineCount(0);
    setLinesBehind(0);
    setStale(false);
    setStatus(STREAM_LOADING);
    ws.current?.destroy();
    ws.current = new WSFactory(watchURL, {
      host: 'auto',
      path: watchURL,
      subprotocols: ['base64.binary.k8s.io'],
    })
      .onclose(onClose)
      .onerror(onError)
      .onmessage(onMessage)
      .onopen(onOpen);
  }, [watchURL]);

  // Restart websocket if startWebSocket function changes
  React.useEffect(() => {
    if (!error && !stale && [LOG_SOURCE_RUNNING, LOG_SOURCE_TERMINATED, LOG_SOURCE_RESTARTING].includes(resourceStatus)) {
      startWebSocket();
    }
    return () => ws.current?.destroy();
  }, [error, resourceStatus, stale, startWebSocket]);

  // Toggle currently displayed log content to/from fullscreen
  const toggleFullscreen = () => {
    resourceLogRef.current && screenfull.enabled && screenfull.toggle(resourceLogRef.current);
  };

  // Toggle streaming/paused status
  const toggleStreaming = () => {
    setStatus(currentStatus => (currentStatus === STREAM_ACTIVE ? STREAM_PAUSED : STREAM_ACTIVE));
  };

  React.useEffect(() => {
    if (externalLogLinkFlag && resource.kind === 'Pod') {
      Promise.all([k8sList(ConsoleExternalLogLinkModel), k8sGet(ProjectModel, resource.metadata.namespace)])
        .then(([podLogLinks_, project]) => {
          // Project UID and namespace UID are the same value. Use the projects
          // API since normal OpenShift users can list projects.
          setPodLogLinks(podLogLinks_);
          setNamespaceUID(project.metadata.uid);
        })
        .catch(e => setError(e));
    }
  }, [externalLogLinkFlag, resource.kind, resource.metadata.namespace]);

  React.useEffect(() => {
    if (screenfull.enabled) {
      screenfull.on('change', () => {
        setIsFullscreen(screenfull.isFullscreen);
      });
      screenfull.on('error', () => {
        setIsFullscreen(false);
      });
    }

    return () => {
      if (screenfull.enabled) {
        screenfull.off('change');
        screenfull.off('error');
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // If container comes out of restarting state, currently displayed logs might be stale
  React.useEffect(() => {
    if (previousResourceStatus === LOG_SOURCE_RESTARTING && resourceStatus !== LOG_SOURCE_RESTARTING) {
      setStale(true);
    }
  }, [previousResourceStatus, resourceStatus]);

  // Download currently displayed log content
  const download = () => {
    const blob = buffer.current.getBlob({ type: 'text/plain;charset=utf-8' });
    let filename = props.resource.metadata.name;
    if (props.containerName) {
      filename = `${filename}-${props.containerName}`;
    }
    saveAs(blob, `${filename}.log`);
  };

  return (
    <>
      {error && <Alert isInline className="co-alert" variant="danger" title={t('COMMON:MSG_DETAILS_TABLOGS_4')} action={<AlertActionLink onClick={() => setError(false)}>{t('COMMON:MSG_DETAILS_TABLOGS_15')}</AlertActionLink>} />}
      {stale && <Alert isInline className="co-alert" variant="info" title={t('COMMON:MSG_DETAILS_TABLOGS_3', { something: resource.kind })} action={<AlertActionLink onClick={() => setStale(false)}>{t('COMMON:MSG_DETAILS_TABLOGS_13')}</AlertActionLink>} />}
      <div ref={resourceLogRef} className={classNames('resource-log', { 'resource-log--fullscreen': isFullscreen })}>
        <LogControls dropdown={dropdown} isFullscreen={isFullscreen} onDownload={download} status={status} toggleFullscreen={toggleFullscreen} toggleStreaming={toggleStreaming} resource={resource} containerName={containerName} podLogLinks={podLogLinks} namespaceUID={namespaceUID} />
        <LogWindow lines={lines} linesBehind={linesBehind} bufferFull={bufferFull} isFullscreen={isFullscreen} status={status} updateStatus={setStatus} />
      </div>
    </>
  );
};

type LogControlsProps = {
  isFullscreen: boolean;
  dropdown?: React.ReactNode;
  status?: string;
  resource?: any;
  containerName?: string;
  podLogLinks?: K8sResourceKind[];
  namespaceUID?: string;
  toggleStreaming?: () => void;
  onDownload: () => void;
  toggleFullscreen: () => void;
};

type ResourceLogProps = {
  bufferSize?: number;
  containerName?: string;
  dropdown?: React.ReactNode;
  resource: any;
  resourceStatus: string;
};
