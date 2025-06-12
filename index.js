const { IPPanel } = require('./nodes/IPPanel/IPPanel.node');
const { IPPanelApi } = require('./credentials/IPPanelApi.credentials');

module.exports = {
    nodes: [
        IPPanel,
    ],
    credentials: [
        IPPanelApi,
    ],
};
