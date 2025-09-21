import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useWallet } from '@/contexts/WalletContext';
import { MOCK_DATASETS, Dataset, formatPrice, generateMockPDPData, generateMockBiasData, truncateAddress } from '@/lib/contract';
import { CalendarHeatmap } from '@/components/CalendarHeatmap';
import { BiasChart } from '@/components/BiasChart';
import { 
  ArrowLeft, 
  Shield, 
  Database, 
  Download, 
  Eye, 
  CreditCard, 
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Zap,
  Clock,
  Globe,
  Users,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';

const DatasetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { contract, isConnected, connect, account } = useWallet();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [pdpData, setPdpData] = useState<any[]>([]);
  const [biasData, setBiasData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      // In production, fetch from contract
      const foundDataset = MOCK_DATASETS.find(d => d.id === parseInt(id));
      setDataset(foundDataset || null);
      setPdpData(generateMockPDPData());
      setBiasData(generateMockBiasData());
    }
  }, [id]);

  const handlePreview = async () => {
    if (!dataset) return;

    if (!isConnected) {
      toast.error('Connect your wallet to preview dataset');
      return;
    }

    setIsPreviewing(true);
    
    try {
      // Mock FilCDN preview fetch
      toast.loading('Fetching preview via FilCDN...', { id: 'preview' });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock preview payment (0.1 USDFC)
      if (contract) {
        toast.loading('Processing preview payment...', { id: 'preview' });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock successful preview
        setPreviewData(`
          Sample Data Preview for ${dataset.name}:
          
          Row 1: [image_001.jpg, "urban scene", lat: 40.7128, lng: -74.0060]
          Row 2: [image_002.jpg, "rural landscape", lat: 51.5074, lng: -0.1278]
          Row 3: [image_003.jpg, "suburban area", lat: 35.6762, lng: 139.6503]
          
          Total Records: 10,247
          Geographic Coverage: 47 countries
          Bias Score: 0.23 (Lower is better)
          PDP Status: ✓ Verified
        `);
        
        toast.success('Preview unlocked! Access granted via FilCDN.', { id: 'preview' });
      }
    } catch (error: any) {
      console.error('Preview failed:', error);
      toast.error('Preview failed. Please try again.', { id: 'preview' });
    } finally {
      setIsPreviewing(false);
    }
  };

  const handlePurchase = async () => {
    if (!dataset) return;

    if (!isConnected) {
      await connect();
      return;
    }

    if (!contract) {
      toast.error('Contract not initialized');
      return;
    }

    setIsLoading(true);

    try {
      toast.loading('Processing payment via Filecoin Pay rail...', { id: 'purchase' });
      
      // Convert price to wei (mock USDFC has 18 decimals like ETH)
      const priceInWei = ethers.parseEther(dataset.price.toString());
      
      // Call processPayment function
      const tx = await contract.processPayment(dataset.id, priceInWei);
      
      toast.loading('Transaction submitted. Waiting for confirmation...', { id: 'purchase' });
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      toast.success(
        `Dataset purchased! Transaction: ${receipt.hash.slice(0, 10)}...`,
        { id: 'purchase' }
      );
      
      // Mock access granted
      setTimeout(() => {
        toast.success('🎉 Full dataset access granted! Download available in Dashboard.');
      }, 2000);
      
    } catch (error: any) {
      console.error('Purchase failed:', error);
      
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction cancelled by user', { id: 'purchase' });
      } else if (error.message?.includes('insufficient funds')) {
        toast.error('Insufficient tFIL balance for purchase', { id: 'purchase' });
      } else {
        toast.error('Purchase failed. Please try again.', { id: 'purchase' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!dataset) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Dataset not found</h2>
          <Button asChild variant="glass">
            <Link to="/browse">Browse Datasets</Link>
          </Button>
        </div>
      </div>
    );
  }

  const pdpSuccessRate = pdpData.filter(d => d.success).length / pdpData.length * 100;
  
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button asChild variant="ghost" className="flex items-center space-x-2">
            <Link to="/browse">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Browse</span>
            </Link>
          </Button>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid lg:grid-cols-2 gap-12 mb-12"
        >
          {/* Dataset Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
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
              <Badge variant="secondary">NFT #{dataset.id}</Badge>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {dataset.name}
            </h1>

            <p className="text-lg text-muted-foreground mb-6">
              {dataset.description}
            </p>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center space-x-2 text-sm">
                <Database className="h-4 w-4 text-primary" />
                <span>IPFS: {dataset.cid}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Globe className="h-4 w-4 text-primary" />
                <span>FilCDN Ready</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Users className="h-4 w-4 text-primary" />
                <span>Provider: {truncateAddress('0x1234...5678')}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span>Updated: 2 hours ago</span>
              </div>
            </div>

            <div className="text-3xl font-bold gradient-text mb-8">
              {formatPrice(dataset.price)}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handlePreview}
                disabled={isPreviewing}
                variant="glass"
                size="lg"
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>
                  {isPreviewing ? 'Loading Preview...' : 'Paid Preview (0.1 USDFC)'}
                </span>
              </Button>

              <Button
                onClick={handlePurchase}
                disabled={isLoading}
                variant="hero"
                size="lg"
                className="flex items-center space-x-2"
              >
                <CreditCard className="h-4 w-4" />
                <span>
                  {isLoading ? 'Processing...' : `Purchase Access`}
                </span>
              </Button>
            </div>

            {!isConnected && (
              <p className="text-sm text-muted-foreground mt-4">
                Connect your wallet to preview or purchase this dataset
              </p>
            )}
          </div>

          {/* Data Integrity Dashboard */}
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShieldCheck className="h-5 w-5 text-success" />
                  <span>PDP Integrity Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Success Rate</span>
                    <span className="text-2xl font-bold text-success">
                      {pdpSuccessRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={pdpSuccessRate} className="h-2" />
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>30-day proof streak active</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span>Access Method</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Retrieval Speed</span>
                    <Badge variant="secondary" className="text-green-400">
                      &lt;1s via FilCDN
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Payment Rail</span>
                    <Badge variant="secondary" className="text-blue-400">
                      Filecoin Pay (USDFC)
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Access Type</span>
                    <Badge variant="secondary">
                      30-day streaming
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Detailed Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="pdp" className="w-full">
            <TabsList className="grid w-full grid-cols-3 glass-card">
              <TabsTrigger value="pdp">PDP Calendar</TabsTrigger>
              <TabsTrigger value="bias">Bias Analysis</TabsTrigger>
              <TabsTrigger value="preview">Data Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="pdp" className="mt-8">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>PDP Proof Calendar (Last 30 Days)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CalendarHeatmap data={pdpData} />
                  <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-success">
                        {pdpData.filter(d => d.success).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Successful Proofs</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-destructive">
                        {pdpData.filter(d => !d.success).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Failed Proofs</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {Math.max(...pdpData.map((_, i, arr) => {
                          let streak = 0;
                          for (let j = i; j < arr.length && arr[j].success; j++) {
                            streak++;
                          }
                          return streak;
                        }))}
                      </div>
                      <div className="text-sm text-muted-foreground">Max Streak</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bias" className="mt-8">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Bias & Diversity Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BiasChart data={biasData} />
                  <div className="mt-6 grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Diversity Metrics</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Geographic Coverage</span>
                          <span className="text-success">47 countries</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Demographic Balance</span>
                          <span className="text-success">78% balanced</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Temporal Distribution</span>
                          <span className="text-warning">Fair</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Quality Scores</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Overall Bias Score</span>
                          <span className="text-success">0.23 (Excellent)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Data Completeness</span>
                          <span className="text-success">94%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Annotation Quality</span>
                          <span className="text-success">High</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="mt-8">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>Dataset Preview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {previewData ? (
                    <div className="bg-black/20 rounded-lg p-4 font-mono text-sm">
                      <pre className="whitespace-pre-wrap text-green-400">
                        {previewData}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Preview Locked</h3>
                      <p className="text-muted-foreground mb-6">
                        Purchase a preview to see sample data from this dataset via FilCDN
                      </p>
                      <Button onClick={handlePreview} disabled={isPreviewing} variant="ai">
                        {isPreviewing ? 'Loading...' : 'Unlock Preview (0.1 USDFC)'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default DatasetDetail;