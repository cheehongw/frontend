import { Colors } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';

import ControlButton from '../ControlButton';

type ControlBarToggleFolderModeButtonProps = {
  isFolderModeEnabled: boolean;
  toggleFolderMode: () => void;
};

export const ControlBarToggleFolderModeButton: React.FC<ControlBarToggleFolderModeButtonProps> = ({
  isFolderModeEnabled,
  toggleFolderMode
}) => {
  const tooltipContent = `${isFolderModeEnabled ? 'Disable' : 'Enable'} Folder mode`;
  return (
    <Tooltip2 content={tooltipContent}>
      <ControlButton
        label="Folder"
        icon={IconNames.FOLDER_CLOSE}
        options={{
          iconColor: isFolderModeEnabled ? Colors.BLUE4 : undefined
        }}
        onClick={toggleFolderMode}
      />
    </Tooltip2>
  );
};