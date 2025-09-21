import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useWallet } from '@/contexts/WalletContext';
import { MOCK_DATASETS, Dataset, formatPrice, truncateAddress } from '@/lib/contract';
import { 
  Wallet,
  Database,
  TrendingUp,
  Shield,
  ShieldCheck,
  Eye,
  Download,
  DollarSign,
  Calendar,
  Users,
  Zap,
  RefreshCw,
  ExternalLink,
  Copy,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { account, balance, isConnected, contract } = useWallet();
  const [ownedDatasets, setOwnedDatasets] = useState<Dataset[]>([]);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [isVerifyingPDP, setIsVerifyingPDP] = useState<number | null>(null);

  // Mock user data - in production, fetch from contract
  useEffect(() => {
    if (isConnected && account) {
      // Mock owned datasets (first 2 from mock data)
      setOwnedDatasets(MOCK_DATASETS.slice(0, 2));
      setTotalEarnings(156.75); // Mock earnings from PaymentProcessed events
    }
  }, [isConnected, account]);

  const handleVerifyPDP = async (datasetId: number) => {
    setIsVerifyingPDP(datasetId);
    
    try {
      toast.loading('Running PDP Challenge via Synapse...', { id: 'pdp-verify' });
      
      // Simulate PDP verification process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update local state
      setOwnedDatasets(prev => prev.map(dataset => 
        dataset.id === datasetId 
          ? { ...dataset, isVerified: true }
          : dataset
      ));
      
      toast.success('PDP verified successfully! Hot storage ready.', { id: 'pdp-verify' });
      
    } catch (error) {
      toast.error('PDP verification failed. Please try again.', { id: 'pdp-verify' });
    } finally {
      setIsVerifyingPDP(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">
            Access your dashboard to manage datasets and view earnings
          </p>
          <Button variant="hero" size="lg">
            Connect Wallet
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, <span className="gradient-text">Data Provider</span>
            </h1>
            <p className="text-muted-foreground">
              Manage your verifiable datasets and track earnings from Filecoin Pay rails
            </p>
          </div>
          
          <div className="mt-4 lg:mt-0">
            <Button asChild variant="hero">
              <Link to="/list">
                <Database className="h-4 w-4 mr-2" />
                List New Dataset
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Wallet Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Wallet Address</p>
                  <p className="font-mono text-lg font-semibold">
                    {truncateAddress(account!)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(account!, 'Address')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">tFIL Balance</p>
                  <p className="text-2xl font-bold">
                    {parseFloat(balance).toFixed(4)}
                  </p>
                </div>
                <Wallet className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold text-success">
                    {formatPrice(totalEarnings)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="datasets" className="w-full">
            <TabsList className="grid w-full grid-cols-2 glass-card">
              <TabsTrigger value="datasets">My Datasets</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
            </TabsList>

            <TabsContent value="datasets" className="mt-8">
              <div className="space-y-6">
                {ownedDatasets.length === 0 ? (
                  <Card className="glass-card">
                    <CardContent className="p-12 text-center">
                      <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No datasets yet</h3>
                      <p className="text-muted-foreground mb-6">
                        Start contributing to the decentralized AI ecosystem by listing your first dataset
                      </p>
                      <Button asChild variant="hero">
                        <Link to="/list">
                          <Database className="h-4 w-4 mr-2" />
                          List Your First Dataset
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6">
                    {ownedDatasets.map((dataset, index) => (
                      <motion.div
                        key={dataset.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="glass-card hover:border-primary/30 transition-colors">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <CardTitle className="text-xl">{dataset.name}</CardTitle>
                                <div className="flex items-center space-x-2">
                                  {dataset.isVerified ? (
                                    <Badge className="pdp-verified">
                                      <Shield className="h-3 w-3 mr-1" />
                                      PDP Verified
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      Verification Pending
                                    </Badge>
                                  )}
                                  <Badge variant="secondary">
                                    NFT #{dataset.id}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold gradient-text">
                                  {formatPrice(dataset.price)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  List Price
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                              {dataset.description}
                            </p>
                            
                            {/* Dataset Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-white/10">
                              <div className="text-center">
                                <div className="text-xl font-bold text-success">24</div>
                                <div className="text-xs text-muted-foreground">Purchases</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xl font-bold text-primary">156</div>
                                <div className="text-xs text-muted-foreground">Previews</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xl font-bold text-warning">95%</div>
                                <div className="text-xs text-muted-foreground">PDP Success</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xl font-bold text-success">
                                  {formatPrice(dataset.price * 24 * 0.65)} {/* Mock earnings */}
                                </div>
                                <div className="text-xs text-muted-foreground">Total Earned</div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-3">
                              <Button asChild variant="ai" size="sm">
                                <Link to={`/dataset/${dataset.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Link>
                              </Button>
                              
                              {!dataset.isVerified && (
                                <Button
                                  onClick={() => handleVerifyPDP(dataset.id)}
                                  disabled={isVerifyingPDP === dataset.id}
                                  variant="pdp"
                                  size="sm"
                                >
                                  {isVerifyingPDP === dataset.id ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <ShieldCheck className="h-4 w-4 mr-2" />
                                  )}
                                  {isVerifyingPDP === dataset.id ? 'Verifying...' : 'Verify PDP'}
                                </Button>
                              )}
                              
                              <Button variant="glass" size="sm">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View on FilScan
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="earnings" className="mt-8">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Earnings Overview */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5" />
                        <span>Revenue Breakdown</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Full Dataset Sales</span>
                          <span className="font-bold text-success">
                            {formatPrice(120.50)}
                          </span>
                        </div>
                        <Progress value={77} className="h-2" />
                        
                        <div className="flex items-center justify-between">
                          <span>Preview Purchases</span>
                          <span className="font-bold text-primary">
                            {formatPrice(36.25)}
                          </span>
                        </div>
                        <Progress value={23} className="h-2" />
                      </div>
                      
                      <div className="pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between text-lg font-bold">
                          <span>Total Earnings</span>
                          <span className="gradient-text">
                            {formatPrice(totalEarnings)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Transactions */}
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5" />
                        <span>Recent Transactions</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { type: 'Purchase', dataset: 'Cultural Diversity ImageNet', amount: 10, time: '2 hours ago' },
                          { type: 'Preview', dataset: 'Cultural Diversity ImageNet', amount: 0.1, time: '4 hours ago' },
                          { type: 'Purchase', dataset: 'Synthetic Speech Corpus', amount: 25, time: '1 day ago' },
                        ].map((tx, index) => (
                          <div key={index} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                            <div>
                              <div className="font-medium">{tx.type}</div>
                              <div className="text-sm text-muted-foreground">{tx.dataset}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-success">
                                +{formatPrice(tx.amount)}
                              </div>
                              <div className="text-xs text-muted-foreground">{tx.time}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Zap className="h-5 w-5" />
                        <span>Payment Rails</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span>Filecoin Pay enabled</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span>USDFC stablecoin rail</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span>Daily settlement</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span>Auto-pause on PDP fail</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>Audience Stats</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Total Buyers</span>
                        <span className="font-bold">24</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Repeat Customers</span>
                        <span className="font-bold">8</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Avg. Purchase Value</span>
                        <span className="font-bold">{formatPrice(17.5)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;