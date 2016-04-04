import React from 'react';
import Box from 'grommet/components/Box';
import Anchor from 'grommet/components/Anchor';
import CfgIcon from 'grommet/components/icons/base/Configuration';
import AddIcon from 'grommet/components/icons/base/Add';
import SubIcon from 'grommet/components/icons/base/Subtract';

const MENU_TEXT = 'How to configure a LAG...';

const COMPONENT = (
  <Box pad={{horizontal: 'small'}}>
    <b>Configure LAG</b>
    <ul>
      <li>Navigate to the page: <Anchor primary href="#/lag">LAGs</Anchor></li>
      <li>To add a new LAG, click on the <AddIcon/>.</li>
      <li>To delete a LAG, select a row from the LAG table and click on the <SubIcon/>.</li>
      <li>To add/remove interfaces from a LAG, select a row from the LAG table and click on the <CfgIcon/></li>
      <ul>
        <li>Move interfaces right-to-left to add them to the LAG.</li>
        <li>Move interfaces left-to-right to remove them from the LAG.</li>
        <li>Click <b>OK</b> to deploy the changes or <b>X</b> to cancel.</li>
      </ul>
    </ul>
  </Box>
);

export default {
  MENU_TEXT,
  COMPONENT,
};
