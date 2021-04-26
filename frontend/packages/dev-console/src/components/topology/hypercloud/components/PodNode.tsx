import * as React from 'react';
import { connect } from 'react-redux';
import { calculateRadius } from '@console/shared';
import { Node, observer, WithCreateConnectorProps, WithDragNodeProps, WithSelectionProps, WithDndDropProps, WithContextMenuProps } from '@console/topology';
import { RootState } from '@console/internal/redux';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { Decorator } from '../../components/nodes/Decorator';
import PodSet, { podSetInnerRadius } from '../../components/nodes/PodSet';
import BuildDecorator from './build-decorators/BuildDecorator';
import { BaseNode } from '../../components/nodes/BaseNode';

export type PodNodeProps = {
  element: Node;
  hover?: boolean;
  dragging?: boolean;
  highlight?: boolean;
  canDrop?: boolean;
  dropTarget?: boolean;
  urlAnchorRef?: React.Ref<SVGCircleElement>;
} & WithSelectionProps &
  WithDragNodeProps &
  WithDndDropProps &
  WithContextMenuProps &
  WithCreateConnectorProps 

  const ObservedPodNode: React.FC<PodNodeProps> = ({element, urlAnchorRef, canDrop, dropTarget, ...rest})=> {
    const { width, height } = element.getDimensions();
    const podData = element.getData().data;
    const size = Math.min(width, height);
    const {donutStatus} = podData;
    const { radius, decoratorRadius } = calculateRadius(size);
    const cx = width / 2;
    const cy = height / 2;
  }