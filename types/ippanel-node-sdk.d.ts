declare module 'ippanel-node-sdk' {
  interface IPPanelClient {
    sendWebservice: (message: string, sender: string, recipients: string[]) => Promise<any>;
    sendPattern: (patternCode: string, sender: string, recipient: string, patternParams: Record<string, any>) => Promise<any>;
    httpClient?: any;
  }

  export function createClient(apiKey: string): IPPanelClient;
}
