import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/contexts/WalletContext';
import { 
  createOrUpdateRail, 
  settle, 
  terminate, 
  getActiveRails,
  getSettlementHistory,
  formatRate,
  calculateExpectedPayment
} from '@/lib/filpay';
import { getExplorerTxUrl, PROVIDER_ADDRESS } from '@/lib/config';
import { Loader2, Play, DollarSign, XCircle, ExternalLink, Clock, CheckCircle } from 'lucide-react';

export default function Access() {
  const { isConnected, connect, signer, account } = useWallet();
  const { toast } = useToast();
  
  const [providerAddress, setProviderAddress] = useState(PROVIDER_ADDRESS || '');
  const [railConfig, setRailConfig] = useState({
    maxRate: '0.001', // USDFC per epoch
    lockupPeriod: '86400' // 1 day in seconds
  });
  
  const [loading, setLoading] = useState({
    create: false,
    settle: false,
    terminate: false
  });
  
  const [activeRails, setActiveRails] = useState(getActiveRails());
  const [settlementHistory, setSettlementHistory] = useState(getSettlementHistory());

  useEffect(() => {
    loadRails();
  }, []);

  const loadRails = () => {
    setActiveRails(getActiveRails());
    setSettlementHistory(getSettlementHistory());
  };

  const handleCreateRail = async () => {
    if (!isConnected || !signer || !account) {
      await connect();
      return;
    }

    if (!providerAddress) {
      toast({
        title: 'Invalid provider',
        description: 'Please enter a provider address',
        variant: 'destructive'
      });
      return;
    }

    setLoading(prev => ({ ...prev, create: true }));
    
    try {
      const maxRate = BigInt(Math.floor(parseFloat(railConfig.maxRate) * 10 ** 18));
      const lockupPeriod = BigInt(railConfig.lockupPeriod);
      
      toast({
        title: 'Creating payment rail...',
        description: 'Please confirm the transaction in MetaMask'
      });
      
      const { railId, txHash } = await createOrUpdateRail(signer, {
        payer: account,
        payee: providerAddress,
        maxRate,
        lockupPeriod
      });
      
      toast({
        title: 'Rail created!',
        description: (
          <div className="space-y-1">
            <p>7-day streaming access activated</p>
            <p className="font-mono text-xs">{railId}</p>
            <a 
              href={getExplorerTxUrl(txHash)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              View Transaction <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )
      });
      
      loadRails();
    } catch (error: any) {
      toast({
        title: 'Failed to create rail',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  };

  const handleSettle = async (railId: string) => {
    if (!signer) return;
    
    setLoading(prev => ({ ...prev, settle: true }));
    
    try {
      toast({
        title: 'Settling rail...',
        description: 'Processing payment settlement'
      });
      
      const txHash = await settle(signer, railId);
      
      toast({
        title: 'Settlement successful!',
        description: (
          <div className="flex items-center gap-2">
            <span>Payment settled</span>
            <a 
              href={getExplorerTxUrl(txHash)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              View <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )
      });
      
      loadRails();
    } catch (error: any) {
      toast({
        title: 'Settlement failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, settle: false }));
    }
  };

  const handleTerminate = async (railId: string) => {
    if (!signer) return;
    
    setLoading(prev => ({ ...prev, terminate: true }));
    
    try {
      toast({
        title: 'Terminating rail...',
        description: 'Closing payment rail'
      });
      
      const txHash = await terminate(signer, railId);
      
      toast({
        title: 'Rail terminated',
        description: (
          <div className="flex items-center gap-2">
            <span>Access ended</span>
            <a 
              href={getExplorerTxUrl(txHash)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              View <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )
      });
      
      loadRails();
    } catch (error: any) {
      toast({
        title: 'Termination failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, terminate: false }));
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const estimateWeeklyCost = (): string => {
    const ratePerEpoch = BigInt(Math.floor(parseFloat(railConfig.maxRate) * 10 ** 18));
    const weekInSeconds = BigInt(7 * 24 * 60 * 60);
    const cost = calculateExpectedPayment(ratePerEpoch, weekInSeconds);
    return (Number(cost) / 10 ** 18).toFixed(4);
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to manage streaming payment rails
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={connect} className="w-full">
              Connect MetaMask
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Streaming Access</h1>
          <p className="text-muted-foreground">
            Create USDFC payment rails for continuous dataset access
          </p>
        </div>

        {/* Create Rail Card */}
        <Card>
          <CardHeader>
            <CardTitle>Start 7-Day Access</CardTitle>
            <CardDescription>
              Create a streaming payment rail to a dataset provider
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Provider Address</Label>
              <Input
                id="provider"
                value={providerAddress}
                onChange={(e) => setProviderAddress(e.target.value)}
                placeholder="0x..."
                className="font-mono"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxRate">Max Rate (USDFC/epoch)</Label>
                <Input
                  id="maxRate"
                  type="number"
                  value={railConfig.maxRate}
                  onChange={(e) => setRailConfig(prev => ({ ...prev, maxRate: e.target.value }))}
                  placeholder="0.001"
                  step="0.0001"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lockupPeriod">Lockup Period (seconds)</Label>
                <Input
                  id="lockupPeriod"
                  type="number"
                  value={railConfig.lockupPeriod}
                  onChange={(e) => setRailConfig(prev => ({ ...prev, lockupPeriod: e.target.value }))}
                  placeholder="86400"
                  step="3600"
                  min="0"
                />
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Estimated 7-day cost: <span className="font-bold">{estimateWeeklyCost()} USDFC</span>
              </p>
            </div>

            <Button
              onClick={handleCreateRail}
              disabled={loading.create || !providerAddress}
              className="w-full"
            >
              {loading.create ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Rail...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Streaming Access
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Active Rails */}
        {activeRails.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Active Payment Rails</CardTitle>
              <CardDescription>
                Manage your streaming subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeRails.map((rail, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Rail ID</p>
                        <p className="text-xs font-mono text-muted-foreground break-all">
                          {rail.railId || 'Pending...'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-green-600">
                        <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                        <span className="text-xs">Active</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Provider</p>
                        <p className="font-mono text-xs">{rail.payee.slice(0, 10)}...{rail.payee.slice(-8)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Max Rate</p>
                        <p className="font-mono">{(Number(rail.maxRate) / 10 ** 18).toFixed(6)}/epoch</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Created</p>
                        <p>{formatTimestamp(rail.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Lockup</p>
                        <p>{(Number(rail.lockupPeriod) / 3600).toFixed(0)} hours</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSettle(rail.railId)}
                        disabled={loading.settle || !rail.railId}
                        className="flex-1"
                      >
                        <DollarSign className="mr-2 h-4 w-4" />
                        Settle Now
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleTerminate(rail.railId)}
                        disabled={loading.terminate || !rail.railId}
                        className="flex-1"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Terminate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settlement History */}
        {settlementHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Settlement History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {settlementHistory.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">
                        {item.railId.slice(0, 20)}...
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(item.timestamp)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <a
                        href={getExplorerTxUrl(item.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        View
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
