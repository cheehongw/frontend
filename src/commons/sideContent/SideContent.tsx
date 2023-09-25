import { Card, Icon, Tab, TabProps, Tabs } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';

import { SideContentLocation } from '../redux/workspace/WorkspaceReduxTypes';
import { propsAreEqual } from '../utils/MemoizeHelper';
import { assertType } from '../utils/TypeHelper';
import { generateIconId, getTabId } from './SideContentHelper';
import { SideContentProvider, SideContentProviderProps } from './SideContentProvider';
import { SideContentTab, SideContentType } from './SideContentTypes';

/**
 * @property onChange A function that is called whenever the
 * active tab is changed by the user.
 *
 * @property tabs An array of SideContentTabs.
 *  The tabs will be rendered in order of the array.
 *  If this array is empty, no tabs will be rendered.
 *
 * @property renderActiveTabPanelOnly Set this property to
 * true to enable unmounting of tab panels whenever tabs are
 * switched. If it is left undefined, the value will default
 * to false, and the tab panels will all be loaded with the
 * mounting of the SideContent component. Switching tabs
 * will merely hide them from view.
 */
export type SideContentProps = {
  selectedTabId?: SideContentType; // Optional due to uncontrolled tab component in EditingWorkspace
  renderActiveTabPanelOnly?: boolean;
  editorWidth?: string;
  sideContentHeight?: number;
} & Omit<SideContentProviderProps, 'children'>;

// /**
//  * Adds 'side-content-tab-alert' style to newly spawned module tabs or HTML Display tab
//  */
// const generateClassName = (id: string | undefined) =>
//   id === SideContentType.module || id === SideContentType.htmlDisplay
//     ? 'side-content-tooltip side-content-tab-alert'
//     : 'side-content-tooltip';

const renderTab = (
  tab: SideContentTab,
  shouldAlert: boolean,
  workspaceLocation?: SideContentLocation,
  editorWidth?: string,
  sideContentHeight?: number
) => {
  const iconSize = 20;
  const tabId = getTabId(tab);
  const tabTitle = (
    <Tooltip2 content={tab.label}>
      <div
        className={`side-content-tooltip ${shouldAlert ? 'side-content-tab-alert' : ''}`}
        id={generateIconId(tabId)}
      >
        <Icon icon={tab.iconName} iconSize={iconSize} />
      </div>
    </Tooltip2>
  );
  const tabProps = assertType<TabProps>()({
    id: tabId,
    title: tabTitle,
    disabled: tab.disabled,
    className: 'side-content-tab'
  });

  if (!tab.body) {
    return <Tab key={tabId} {...tabProps} />;
  }

  const tabBody: JSX.Element = workspaceLocation
    ? {
        ...tab.body,
        props: {
          ...tab.body.props,
          workspaceLocation,
          editorWidth,
          sideContentHeight
        }
      }
    : tab.body;
  const tabPanel: JSX.Element = <div className="side-content-text">{tabBody}</div>;

  return <Tab key={tabId} {...tabProps} panel={tabPanel} />;
};

const SideContent: React.FC<SideContentProps> = ({
  selectedTabId,
  renderActiveTabPanelOnly,
  editorWidth,
  sideContentHeight,
  ...otherProps
}) => {
  return (
    <div className="side-content">
      <Card>
        <div className="side-content-tabs">
          <SideContentProvider {...otherProps}>
            {(allTabs, changeTabsCallback, alerts, selectedTabId, sideContentHeight) => (
              <Tabs
                id="side-content-tabs"
                onChange={changeTabsCallback}
                renderActiveTabPanelOnly={renderActiveTabPanelOnly}
                selectedTabId={selectedTabId}
              >
                {allTabs.map(tab => {
                  const tabId = getTabId(tab);
                  return renderTab(
                    tab,
                    alerts.includes(tabId),
                    otherProps.location,
                    editorWidth,
                    sideContentHeight
                  );
                })}
              </Tabs>
            )}
          </SideContentProvider>
        </div>
      </Card>
    </div>
  );
};

export default React.memo(SideContent, propsAreEqual);
