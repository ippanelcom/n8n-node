# IPPanel SMS Node for n8n

This node allows you to send SMS messages through the IPPanel service in n8n.

## Features

- Send simple SMS messages
- Send pattern-based SMS messages

## Installation

To install this node, copy its files to the following directory:

```
~/.n8n/custom/
```

Or if you're using Docker:

```
/home/node/.n8n/custom/
```

Then restart your n8n service.

## Credential Setup

Before using this node, you need to create a credential in n8n:

1. Go to the Credentials section in n8n
2. Click on "Add Credential"
3. Select "IPPanel API"
4. Enter your API Key obtained from your IPPanel dashboard
5. Save the credential

## How to Use

### Sending Simple SMS

1. Add the IPPanel SMS node to your workflow
2. Set Resource to "Message"
3. Set Operation to "Send SMS"
4. Enter the following information:
   - **Message Text**: The SMS content
   - **Sender Number**: Your sender number (e.g., +983000505)
   - **Recipients**: Recipient phone numbers (separate multiple numbers with commas)
5. Select your created credential
6. Execute the workflow

### Sending Pattern-based SMS

1. Add the IPPanel SMS node to your workflow
2. Set Resource to "Message" 
3. Set Operation to "Send Pattern"
4. Enter the following information:
   - **Pattern Code**: The pattern code defined in your IPPanel account
   - **Sender Number**: Your sender number
   - **Recipient**: Recipient phone number
   - **Pattern Parameters**: Pattern parameters as JSON (e.g., `{"name": "John", "code": "1234"}`)
5. Select your created credential
6. Execute the workflow

### Using Dynamic Pattern Code

If you want to use a pattern code that comes from an input field:

1. Enable "Use Pattern From Field"
2. Enter the name of the field containing the pattern code in "Pattern Code Field"

## Output

On success, the node output will include:

```json
{
  "success": true,
  "response": {
    // IPPanel API response
  },
  "patternCode": "your-pattern-code" // Only for pattern messages
}
```

On error:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Troubleshooting

If you encounter any issues, try the following:

1. Check that your API Key is correct
2. Make sure your sender number is valid and assigned to your account
3. If using patterns, verify the pattern code and its parameters
4. Check the n8n system logs for more details on potential errors

## Compatibility

This node is compatible with n8n version 0.150.0 and above.
