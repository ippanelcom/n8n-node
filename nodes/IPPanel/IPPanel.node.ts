import { IExecuteFunctions } from 'n8n-workflow';
import {
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
  NodeOperationError,
  IHttpRequestOptions,
} from 'n8n-workflow';

// Direct implementation of IPPanel client functionality based on the SDK
interface IPPanelClient {
  sendWebservice: (message: string, sender: string, recipients: string[]) => Promise<any>;
  sendPattern: (patternCode: string, sender: string, recipient: string, patternParams: Record<string, any>) => Promise<any>;
}

// Create IPPanel client function based on the SDK implementation
function createIPPanelClient(apiKey: string, helpers: IExecuteFunctions): IPPanelClient {
  const baseUrl = 'https://edge.ippanel.com/v1/api';

  /**
   * Private method to make POST requests to the API
   */
  const _post = async (path: string, payload: any): Promise<any> => {
    const options: IHttpRequestOptions = {
      method: 'POST',
      url: `${baseUrl}${path}`,
      body: payload,
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      json: true,
    };

    try {
      // این خط کلیدی است
      return await (helpers.helpers.request as Function).call(helpers, options);
    } catch (error: any) {
      if (error.response) {
        throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        throw new Error('No response received from the API');
      } else {
        throw new Error(`Request failed: ${error.message || 'Unknown error'}`);
      }
    }
  };

  return {
    sendWebservice: async (message: string, sender: string, recipients: string[]): Promise<any> => {
      const payload = {
        from_number: sender,
        params: {
          recipients
        },
        message,
        sending_type: 'webservice'
      };

      return _post('/send', payload);
    },

    sendPattern: async (patternCode: string, sender: string, recipient: string, params: Record<string, any>): Promise<any> => {
      const payload = {
        from_number: sender,
        recipients: [recipient],
        code: patternCode,
        params,
        sending_type: 'pattern'
      };

      return _post('/send', payload);
    },
  };
}

export class IPPanel implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'IPPanel SMS',
    name: 'ipPanelSms',
    icon: 'file:sms.svg',
    group: ['output'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Send SMS messages via IPPanel,This node support iranian phone numbers and operators only',
    defaults: {
      name: 'IPPanel SMS',
    },
    inputs: ['main'] as unknown as INodeTypeDescription['inputs'],
    outputs: ['main'] as unknown as INodeTypeDescription['outputs'],
    credentials: [
      {
        name: 'ipPanelApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Message',
            value: 'message',
          },
        ],
        default: 'message',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['message'],
          },
        },
        options: [
          {
            name: 'Send SMS',
            value: 'sendSMS',
            description: 'Send a simple SMS message',
            action: 'Send a simple SMS message',
          },
          {
            name: 'Send Pattern',
            value: 'sendPattern',
            description: 'Send a message using a predefined pattern',
            action: 'Send a message using a predefined pattern',
          },
        ],
        default: 'sendSMS',
      },
      // Fields for sendSMS operation
      {
        displayName: 'Message Text',
        name: 'message',
        type: 'string',
        default: '',
        required: true,
        placeholder: 'Hello from n8n!',
        displayOptions: {
          show: {
            resource: ['message'],
            operation: ['sendSMS'],
          },
        },
        description: 'Text content of the message',
      },
      {
        displayName: 'Sender Number',
        name: 'sender',
        type: 'string',
        default: '',
        required: true,
        placeholder: '+983000505',
        displayOptions: {
          show: {
            resource: ['message'],
            operation: ['sendSMS', 'sendPattern'],
          },
        },
        description: 'Sender phone number',
      },
      {
        displayName: 'Recipients',
        name: 'recipients',
        type: 'string',
        default: '',
        required: true,
        placeholder: '+989123456789, +989356789012',
        displayOptions: {
          show: {
            resource: ['message'],
            operation: ['sendSMS'],
          },
        },
        description: 'Comma-separated list of recipient phone numbers',
      },
      // Fields for sendPattern operation
      {
        displayName: 'Pattern Code',
        name: 'patternCode',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            resource: ['message'],
            operation: ['sendPattern'],
          },
        },
        description: 'The pattern code defined in your IPPanel account (you can use expressions to make it dynamic)',
        hint: 'You can find your pattern codes in your IPPanel dashboard',
      },
      {
        displayName: 'Use Pattern From Field',
        name: 'usePatternFromField',
        type: 'boolean',
        default: false,
        displayOptions: {
          show: {
            resource: ['message'],
            operation: ['sendPattern'],
          },
        },
        description: 'Whether to use a pattern code from an input field instead of directly entering it',
      },
      {
        displayName: 'Pattern Code Field',
        name: 'patternCodeField',
        type: 'string',
        default: 'patternCode',
        required: true,
        displayOptions: {
          show: {
            resource: ['message'],
            operation: ['sendPattern'],
            usePatternFromField: [true],
          },
        },
        description: 'The name of the input field containing the pattern code',
      },
      {
        displayName: 'Recipient',
        name: 'recipient',
        type: 'string',
        default: '',
        required: true,
        placeholder: '+989123456789',
        displayOptions: {
          show: {
            resource: ['message'],
            operation: ['sendPattern'],
          },
        },
        description: 'Recipient phone number for the pattern message',
      },
      {
        displayName: 'Pattern Parameters',
        name: 'patternParams',
        placeholder: '{ "param1": "value1", "param2": "value2" }',
        type: 'json',
        default: '{}',
        required: true,
        displayOptions: {
          show: {
            resource: ['message'],
            operation: ['sendPattern'],
          },
        },
        description: 'Parameters for the pattern template (as JSON object)',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    // Get credentials
    const credentials = await this.getCredentials('ipPanelApi');

    if (!credentials?.apiKey) {
      throw new NodeOperationError(this.getNode(), 'IPPanel API key is required!');
    }

    // Create our own implementation of the IPPanel client
    const client = createIPPanelClient(credentials.apiKey as string, this);

    for (let i = 0; i < items.length; i++) {
      try {
        const resource = this.getNodeParameter('resource', i) as string;
        const operation = this.getNodeParameter('operation', i) as string;

        if (resource === 'message') {
          if (operation === 'sendSMS') {
            // Send SMS using web service
            const message = this.getNodeParameter('message', i) as string;
            const sender = this.getNodeParameter('sender', i) as string;
            const recipientsRaw = this.getNodeParameter('recipients', i) as string;
            const recipients = recipientsRaw.split(',').map((num) => num.trim());

            try {
              const response = await client.sendWebservice(
                message,
                sender,
                recipients,
              );

              returnData.push({
                json: {
                  success: true,
                  response,
                },
                pairedItem: { item: i },
              });
            } catch (apiError: any) {
              throw new NodeOperationError(
                this.getNode(),
                `IPPanel SMS sending failed: ${apiError.message || 'Unknown API error'}`,
                { itemIndex: i }
              );
            }
          } else if (operation === 'sendPattern') {
            // Send Pattern
            let patternCode: string;
            const usePatternFromField = this.getNodeParameter('usePatternFromField', i) as boolean;

            if (usePatternFromField) {
              const patternCodeField = this.getNodeParameter('patternCodeField', i) as string;
              patternCode = items[i].json[patternCodeField] as string;

              if (!patternCode) {
                throw new NodeOperationError(
                  this.getNode(),
                  `No pattern code found in field "${patternCodeField}"!`,
                  { itemIndex: i }
                );
              }
            } else {
              patternCode = this.getNodeParameter('patternCode', i) as string;
            }

            const sender = this.getNodeParameter('sender', i) as string;
            const recipient = this.getNodeParameter('recipient', i) as string;
            const patternParamsRaw = this.getNodeParameter('patternParams', i) as string;

            let patternParams: IDataObject = {};
            try {
              patternParams = JSON.parse(patternParamsRaw);
            } catch (e) {
              throw new NodeOperationError(
                this.getNode(),
                'Pattern parameters must be a valid JSON object!',
                { itemIndex: i }
              );
            }

            try {
              const response = await client.sendPattern(
                patternCode,
                sender,
                recipient,
                patternParams,
              );

              returnData.push({
                json: {
                  success: true,
                  response,
                  patternCode,
                },
                pairedItem: { item: i },
              });
            } catch (apiError: any) {
              throw new NodeOperationError(
                this.getNode(),
                `IPPanel pattern message sending failed: ${apiError.message || 'Unknown API error'}`,
                { itemIndex: i }
              );
            }
          }
        }
      } catch (error: any) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              success: false,
              error: error.message || 'Unknown error occurred',
            },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
