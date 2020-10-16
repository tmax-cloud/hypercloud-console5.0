import * as React from 'react';
import { Nav, NavProps, NavList, PageSidebar } from '@patternfly/react-core';
// import PerspectiveNav from './perspective-nav';
// import NavHeader from './nav-header';
import MulticlusterNav from '../hypercloud/nav/multicluster-nav'

type NavigationProps = {
  onNavSelect: NavProps['onSelect'];
  onPerspectiveSelected: () => void;
  isNavOpen: boolean;
};

export const Navigation: React.FC<NavigationProps> = React.memo(
  ({ isNavOpen, onNavSelect, onPerspectiveSelected }) => (
    <PageSidebar
      nav={
        <Nav aria-label="Nav" onSelect={onNavSelect} theme="dark">
          {/* <NavHeader onPerspectiveSelected={onPerspectiveSelected} /> */}
          <NavList>
            <MulticlusterNav />
          </NavList>
        </Nav>
      }
      isNavOpen={isNavOpen}
      theme="dark"
    />
  ),
);
