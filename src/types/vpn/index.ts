export interface WireGuardPeer {
  id: string;
  name: string;
  publicKey: string;
  allowedIPs: string;
  endpoint?: string;
  lastHandshake?: Date;
  transferRx: number;
  transferTx: number;
  status: 'connected' | 'disconnected' | 'connecting';
}