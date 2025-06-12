import {
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class IPPanelApi implements ICredentialType {
  name = 'ipPanelApi';
  displayName = 'IPPanel API';
  documentationUrl = 'https://github.com/ippanelcom/node-sdk';
  properties: INodeProperties[] = [
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
