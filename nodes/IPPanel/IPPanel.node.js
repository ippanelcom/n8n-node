// IPPanel.node.js
const { createClient } = require('ippanel-node-sdk');
const axios = require('axios');

class IPPanel {
    constructor() {
        this.description = {
            displayName: 'IPPanel SMS',
            name: 'ipPanelSms',
            icon: 'file:sms.svg',
            group: ['output'],
            version: 1,
            subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
            description: 'Send SMS messages via IPPanel',
            defaults: {
                name: 'IPPanel SMS',
            },
            inputs: ['main'],
            outputs: ['main'],
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
    }

    async execute() {
        const items = this.getInputData();
        const returnData = [];

        // Get credentials
        const credentials = await this.getCredentials('ipPanelApi');

        if (!credentials?.apiKey) {
            throw new Error('IPPanel API key is required!');
        }

        // Properly format the API key - ensure it's a clean string without any whitespace
        const apiKey = credentials.apiKey.toString().trim();
        console.log('Using API key (first few chars):', apiKey.substring(0, 4) + '...');

        // Create a client with special handling for API key format
        let client;
        try {
            // Create custom axios instance first for better control
            const axiosInstance = axios.create({
                baseURL: 'https://rest.ippanel.com/v1',
                timeout: 120000,
                headers: {
                    // Send API key directly in the Authorization header without any prefix
                    'Authorization': apiKey,
                    'Content-Type': 'application/json',
                    'Connection': 'close',
                    'User-Agent': 'n8n-node-ippanel/0.1.0'
                }
            });

            // Log every request for debugging
            axiosInstance.interceptors.request.use(request => {
                console.log('Making request to:', request.url);
                console.log('With headers:', JSON.stringify({
                    ...request.headers,
                    'Authorization': apiKey ? apiKey.substring(0, 4) + '...' : 'undefined' // Mask most of the API key for security
                }));
                return request;
            });

            // Create client with this custom axios instance
            client = createClient(apiKey);
            // Replace the http client with our custom one
            client.httpClient = axiosInstance;

            console.log('IPPanel client initialized successfully');
        } catch (error) {
            console.error('IPPanel client initialization error:', error);
            throw new Error(`Failed to initialize IPPanel client: ${error.message}. Check your API key format and network connection.`);
        }

        for (let i = 0; i < items.length; i++) {
            try {
                const resource = this.getNodeParameter('resource', i);
                const operation = this.getNodeParameter('operation', i);

                if (resource === 'message') {
                    if (operation === 'sendSMS') {
                        // Send SMS using web service
                        const message = this.getNodeParameter('message', i);
                        const sender = this.getNodeParameter('sender', i);
                        const recipientsRaw = this.getNodeParameter('recipients', i);
                        const recipients = recipientsRaw.split(',').map((num) => num.trim());

                        console.log(`Sending SMS from ${sender} to ${recipients.join(', ')}: "${message}"`);

                        try {
                            const response = await client.sendWebservice(
                                message,
                                sender,
                                recipients,
                            );

                            console.log('IPPanel API response:', JSON.stringify(response));

                            returnData.push({
                                json: {
                                    success: true,
                                    response,
                                },
                                pairedItem: { item: i },
                            });
                        } catch (apiError) {
                            console.error('IPPanel sendWebservice error:', apiError);
                            throw new Error(`IPPanel SMS sending failed: ${apiError.message || 'Unknown API error'}`);
                        }
                    } else if (operation === 'sendPattern') {
                        // Send Pattern
                        let patternCode;
                        const usePatternFromField = this.getNodeParameter('usePatternFromField', i);

                        if (usePatternFromField) {
                            const patternCodeField = this.getNodeParameter('patternCodeField', i);
                            patternCode = items[i].json[patternCodeField];

                            if (!patternCode) {
                                throw new Error(`No pattern code found in field "${patternCodeField}"!`);
                            }
                        } else {
                            patternCode = this.getNodeParameter('patternCode', i);
                        }

                        const sender = this.getNodeParameter('sender', i);
                        const recipient = this.getNodeParameter('recipient', i);
                        const patternParamsRaw = this.getNodeParameter('patternParams', i);

                        let patternParams = {};
                        try {
                            patternParams = JSON.parse(patternParamsRaw);
                        } catch (e) {
                            throw new Error('Pattern parameters must be a valid JSON object!');
                        }

                        console.log(`Sending pattern message with code ${patternCode} from ${sender} to ${recipient}`);
                        console.log('Pattern parameters:', JSON.stringify(patternParams));

                        try {
                            const response = await client.sendPattern(
                                patternCode,
                                sender,
                                recipient,
                                patternParams,
                            );

                            console.log('IPPanel API response:', JSON.stringify(response));

                            returnData.push({
                                json: {
                                    success: true,
                                    response,
                                    patternCode,
                                },
                                pairedItem: { item: i },
                            });
                        } catch (apiError) {
                            console.error('IPPanel sendPattern error:', apiError);
                            throw new Error(`IPPanel pattern message sending failed: ${apiError.message || 'Unknown API error'}`);
                        }
                    }
                }
            } catch (error) {
                console.error(`Error in IPPanel node execution:`, error);
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

module.exports = { IPPanel };
