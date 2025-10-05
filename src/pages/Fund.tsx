import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/contexts/WalletContext';
import { initializeSynapse, formatUSDFC, parseUSDFC } from '@/lib/synapse';
import { getExplorerTxUrl, WARM_STORAGE_ADDRESS } from '@/lib/config';
import { Loader2, CheckCircle, AlertCircle, ExternalLink, Wallet, ShieldCheck } from 'lucide-react';

export default function Fund() {
  const { isConnected, connect, account } = useWallet();
  const { toast } = useToast();
  
  const [balances, setBalances] = useState({
    filBalance: '0',
    usdfcWallet: '0',
    usdfcPaymentsAccount: '0'
  });
  
  const [allowance, setAllowance] = useState({
    rate: BigInt(0),
    lockup: BigInt(0),
    period: BigInt(0),
    approved: false
  });
  
  const [depositAmount, setDepositAmount] = useState('10');
  const [approvalParams, setApprovalParams] = useState({
    rateAllowance: '1',
    lockupAllowance: '10',
    maxLockupPeriod: '86400'
  });
  
  const [loading, setLoading] = useState({
    balances: false,
    deposit: false,
    approve: false
  });

  useEffect(() => {
    if (isConnected && account) {
      loadBalances();
      loadAllowance();
    }
  }, [isConnected, account]);

  const loadBalances = async () => {
    setLoading(prev => ({ ...prev, balances: true }));
    try {
      const synapse = await initializeSynapse();
      const balanceData = await synapse.payments.getBalance();
      
      const filBal = await synapse.provider.getBalance(account!);
      
      setBalances({
        filBalance: (Number(filBal) / 10 ** 18).toFixed(4),
        usdfcWallet: formatUSDFC(balanceData.wallet),
        usdfcPaymentsAccount: formatUSDFC(balanceData.paymentsAccount)
      });
    } catch (error: any) {
      toast({
        title: 'Error loading balances',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, balances: false }));
    }
  };

  const loadAllowance = async () => {
    try {
      const synapse = await initializeSynapse();
      const allowanceData = await synapse.payments.getAllowance(WARM_STORAGE_ADDRESS);
      
      setAllowance({
        ...allowanceData,
        approved: allowanceData.rate > BigInt(0)
      });
    } catch (error: any) {
      console.error('Error loading allowance:', error);
    }
  };

  const handleDeposit = async () => {
    if (!isConnected) {
      await connect();
      return;
    }

    setLoading(prev => ({ ...prev, deposit: true }));
    try {
      const synapse = await initializeSynapse();
      const amount = parseUSDFC(depositAmount);
      
      toast({
        title: 'Depositing USDFC',
        description: 'Please confirm the transaction in MetaMask...'
      });
      
      const txHash = await synapse.payments.deposit(amount);
      
      toast({
        title: 'Deposit successful!',
        description: (
          <div className="flex items-center gap-2">
            <span>Transaction confirmed</span>
            <a 
              href={getExplorerTxUrl(txHash)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              View on Explorer <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )
      });
      
      await loadBalances();
    } catch (error: any) {
      toast({
        title: 'Deposit failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, deposit: false }));
    }
  };

  const handleApprove = async () => {
    if (!isConnected) {
      await connect();
      return;
    }

    setLoading(prev => ({ ...prev, approve: true }));
    try {
      const synapse = await initializeSynapse();
      
      const rateAllowance = parseUSDFC(approvalParams.rateAllowance);
      const lockupAllowance = parseUSDFC(approvalParams.lockupAllowance);
      const maxLockupPeriod = BigInt(approvalParams.maxLockupPeriod);
      
      toast({
        title: 'Approving Warm Storage',
        description: 'Please confirm the transaction in MetaMask...'
      });
      
      const txHash = await synapse.payments.approveService(
        WARM_STORAGE_ADDRESS,
        rateAllowance,
        lockupAllowance,
        maxLockupPeriod
      );
      
      toast({
        title: 'Approval successful!',
        description: (
          <div className="flex items-center gap-2">
            <span>Warm Storage approved</span>
            <a 
              href={getExplorerTxUrl(txHash)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              View on Explorer <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )
      });
      
      await loadAllowance();
    } catch (error: any) {
      toast({
        title: 'Approval failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, approve: false }));
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to manage funding and approvals for Filecoin services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={connect} className="w-full">
              <Wallet className="mr-2 h-4 w-4" />
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
          <h1 className="text-4xl font-bold mb-2">Funding & Approvals</h1>
          <p className="text-muted-foreground">
            Manage your USDFC balance and approve services for seamless Filecoin operations
          </p>
        </div>

        {/* Balances Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Account Balances</span>
              <Button
                variant="outline"
                size="sm"
                onClick={loadBalances}
                disabled={loading.balances}
              >
                {loading.balances ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Refresh'
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">FIL (Gas)</p>
              <p className="text-2xl font-bold">{balances.filBalance} tFIL</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">USDFC Wallet</p>
              <p className="text-2xl font-bold">{balances.usdfcWallet}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">USDFC in Synapse</p>
              <p className="text-2xl font-bold">{balances.usdfcPaymentsAccount}</p>
            </div>
          </CardContent>
        </Card>

        {/* Deposit Card */}
        <Card>
          <CardHeader>
            <CardTitle>Deposit USDFC</CardTitle>
            <CardDescription>
              Deposit USDFC into Synapse payments account for storage and streaming payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="depositAmount">Amount (USDFC)</Label>
              <Input
                id="depositAmount"
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="10"
                min="0"
                step="0.1"
              />
            </div>
            <Button
              onClick={handleDeposit}
              disabled={loading.deposit || !depositAmount || parseFloat(depositAmount) <= 0}
              className="w-full"
            >
              {loading.deposit ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Depositing...
                </>
              ) : (
                `Deposit ${depositAmount} USDFC`
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Approval Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Approve Warm Storage
              {allowance.approved && (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Approved
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Grant Warm Storage permission to use your USDFC for storage deals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {allowance.approved && (
              <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                  Current Allowance
                </p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Rate</p>
                    <p className="font-mono">{formatUSDFC(allowance.rate)}/epoch</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Lockup</p>
                    <p className="font-mono">{formatUSDFC(allowance.lockup)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Period</p>
                    <p className="font-mono">{allowance.period.toString()}s</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rateAllowance">Rate Allowance (USDFC/epoch)</Label>
                <Input
                  id="rateAllowance"
                  type="number"
                  value={approvalParams.rateAllowance}
                  onChange={(e) => setApprovalParams(prev => ({ ...prev, rateAllowance: e.target.value }))}
                  placeholder="1"
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lockupAllowance">Lockup (USDFC)</Label>
                <Input
                  id="lockupAllowance"
                  type="number"
                  value={approvalParams.lockupAllowance}
                  onChange={(e) => setApprovalParams(prev => ({ ...prev, lockupAllowance: e.target.value }))}
                  placeholder="10"
                  min="0"
                  step="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxLockupPeriod">Max Period (seconds)</Label>
                <Input
                  id="maxLockupPeriod"
                  type="number"
                  value={approvalParams.maxLockupPeriod}
                  onChange={(e) => setApprovalParams(prev => ({ ...prev, maxLockupPeriod: e.target.value }))}
                  placeholder="86400"
                  min="0"
                  step="3600"
                />
              </div>
            </div>
            
            <Button
              onClick={handleApprove}
              disabled={loading.approve}
              className="w-full"
            >
              {loading.approve ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                'Approve Warm Storage'
              )}
            </Button>
            
            <p className="text-xs text-muted-foreground">
              💡 Tip: Rate allowance controls spending per epoch, lockup is reserved funds, and period sets the maximum duration
            </p>
          </CardContent>
        </Card>

        {!allowance.approved && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-900 dark:text-yellow-100">Approval Required</p>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                You need to approve Warm Storage before you can upload files. This is a one-time setup.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
