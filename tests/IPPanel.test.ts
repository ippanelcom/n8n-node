import { IPPanel } from '../nodes/IPPanel/IPPanel.node';

describe('IPPanel Node', () => {
  let ipPanelNode: IPPanel;

  beforeEach(() => {
    ipPanelNode = new IPPanel();
  });

  it('should have proper node type properties', () => {
    expect(ipPanelNode.description).toBeDefined();
    expect(ipPanelNode.description.displayName).toBe('IPPanel SMS');
    expect(ipPanelNode.description.name).toBe('ipPanelSms');
    expect(ipPanelNode.description.group).toContain('output');
    expect(ipPanelNode.description.version).toBe(1);
  });

  it('should have proper credentials defined', () => {
    expect(ipPanelNode.description.credentials?.length).toBeGreaterThan(0);
    const credentials = ipPanelNode.description.credentials || [];
    expect(credentials[0].name).toBe('ipPanelApi');
    expect(credentials[0].required).toBe(true);
  });
});
