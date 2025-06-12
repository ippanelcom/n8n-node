// IPPanelApi.credentials.js
class IPPanelApi {
  constructor() {
    this.name = 'ipPanelApi';
    this.displayName = 'IPPanel API';
    this.documentationUrl = 'https://github.com/ippanelcom/node-sdk';
    this.properties = [
      {
        displayName: 'API Key',
        name: 'apiKey',
        type: 'string',
        default: '',
        required: true,
        description: 'The IPPanel API key',
      },
    ];
  }
}

// Fix the export format to match what n8n expects
module.exports = { IPPanelApi };
