import * as React from 'react';
import * as _ from 'lodash';
import * as classNames from 'classnames';
import { observer, Node, useAnchor, RectAnchor, useCombineRefs, useHover, useDragNode, WithDndDropProps, WithSelectionProps, WithContextMenuProps, createSvgIdUrl } from '@console/topology';
import { useSearchFilter } from '../../../filters/useSearchFilter';
import { NodeShadows, NODE_SHADOW_FILTER_ID, NODE_SHADOW_FILTER_ID_HOVER } from '../../NodeShadows';
import { getTopologyResourceObject } from '../../../topology-utils';
import { GroupNode } from '../../groups/GroupNode';
import { DeploymentModel } from '@console/internal/models';

type DeploymentNodeProps = {
  element: Node;
  canDrop?: boolean;
  dropTarget?: boolean;
  dragging?: boolean;
} & WithSelectionProps &
  WithDndDropProps &
  WithContextMenuProps;

const DeploymentNode: React.FC<DeploymentNodeProps> = ({ element, selected, onSelect, dndDropRef, canDrop, dropTarget, onContextMenu, contextMenuOpen, dragging }) => {
  useAnchor(React.useCallback((node: Node) => new RectAnchor(node, 1.5), []));
  const [hover, hoverRef] = useHover();
  const dragNodeRef = useDragNode()[1];
  const refs = useCombineRefs<SVGRectElement>(dragNodeRef, hoverRef);
  const [filtered] = useSearchFilter(element.getLabel());
  const { width, height } = element.getDimensions();

  const resourcesData = {};
  _.forEach(element.getData().groupResources, res => {
    const a = getTopologyResourceObject(res);
    resourcesData[a.kind] = [...(resourcesData[a.kind] ? resourcesData[a.kind] : []), a];
  });

  return (
    <g
      ref={refs}
      onContextMenu={onContextMenu}
      onClick={onSelect}
      className={classNames('odc-deployment-group', {
        'is-dragging': dragging,
        'is-selected': selected,
        'is-dropTarget': canDrop && dropTarget,
        'is-filtered': filtered,
      })}
    >
      <NodeShadows />
      <rect ref={dndDropRef} filter={createSvgIdUrl(hover || dragging || contextMenuOpen || dropTarget ? NODE_SHADOW_FILTER_ID_HOVER : NODE_SHADOW_FILTER_ID)} className="odc-deployment-group__bg" x={0} y={0} width={width} height={height} rx="5" ry="5" />
      <GroupNode element={element} kind={DeploymentModel.kind} groupResources={element.getData().groupResources} />
    </g>
  );
};

export default observer(DeploymentNode);
