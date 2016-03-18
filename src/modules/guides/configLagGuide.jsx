import React from 'react';
import Box from 'grommet/components/Box';
import Anchor from 'grommet/components/Anchor';
import CfgIcon from 'grommet/components/icons/base/Configuration';


const MENU_TEXT = 'How to configure a LAG...';

const COMPONENT = (
  <Box pad={{horizontal: 'small'}}>
    <b>Configure a Logical Aggregation Group (LAG)</b>
    <br/>
    <ul>
      <li>Navigate to the page:</li>
      <Anchor primary href="#/lag">LAGs</Anchor>
      <li>TBD.</li>
      <li>TBD icon:</li>
      <CfgIcon/>
      <li>Configure the interface attributes from within the slide-in pane.</li>
      <li><b>Deploy</b> the new configuration to the device.</li>
    </ul>
  </Box>
);

export default {
  MENU_TEXT,
  COMPONENT,
};
