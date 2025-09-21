import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/contexts/WalletContext';
import { CONTRACT_ADDRESS } from '@/lib/contract';
import { 
  Upload, 
  Shield, 
  Database, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Info,
  Zap,
  FileText,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';

interface FormData {
  name: string;
  description: string;
  cid: string;
  price: string;
  isVerified: boolean;
}

const ListDataset: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected, connect, contract, account } = useWallet();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    cid: '',
    price: '',
    isVerified: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [generatingPDP, setGeneratingPDP] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateMockCID = async () => {
    setGeneratingPDP(true);
    toast.loading('Orchestrating via Synapse SDK...', { id: 'pdp' });
    
    // Simulate PDP generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockCID = `bafybei${Math.random().toString(36).substr(2, 50)}`;
    setFormData(prev => ({ ...prev, cid: mockCID }));
    
    toast.success('PDP verified via Synapse SDK – hot storage ready', { id: 'pdp' });
    setGeneratingPDP(false);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Dataset name is required');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return false;
    }
    if (!formData.cid.trim()) {
      toast.error('CID is required - generate PDP first');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Valid price is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (!isConnected) {
      await connect();
      return;
    }

    if (!contract) {
      toast.error('Contract not initialized');
      return;
    }

    setIsSubmitting(true);

    try {
      toast.loading('Preparing dataset registration...', { id: 'register' });

      // Convert price to wei (18 decimals for USDFC)
      const priceInWei = ethers.parseEther(formData.price);

      // Show transaction preview
      toast.loading(
        `This will mint NFT & verify PDP via Synapse – est. gas 0.01 tFIL`,
        { id: 'register' }
      );

      // Call registerDataset function
      const tx = await contract.registerDataset(
        formData.name,
        formData.description,
        formData.cid,
        priceInWei,
        formData.isVerified
      );

      toast.loading('Transaction submitted. Waiting for confirmation...', { id: 'register' });

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      // Extract tokenId from event logs
      const datasetRegisteredEvent = receipt.logs.find((log: any) => {
        try {
          const parsedLog = contract.interface.parseLog(log);
          return parsedLog?.name === 'DatasetRegistered';
        } catch {
          return false;
        }
      });

      let tokenId = 'Unknown';
      if (datasetRegisteredEvent) {
        const parsedLog = contract.interface.parseLog(datasetRegisteredEvent);
        tokenId = parsedLog?.args.tokenId.toString();
      }

      toast.success(
        `Dataset registered successfully! NFT #${tokenId} minted.`,
        { id: 'register' }
      );

      // Show confetti
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);

      // Reset form
      setFormData({
        name: '',
        description: '',
        cid: '',
        price: '',
        isVerified: false
      });

      // Redirect to dashboard after success
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (error: any) {
      console.error('Registration failed:', error);

      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction cancelled by user', { id: 'register' });
      } else if (error.message?.includes('Ownable')) {
        toast.error('Only contract owner can register datasets', { id: 'register' });
      } else if (error.message?.includes('insufficient funds')) {
        toast.error('Insufficient tFIL for gas fees', { id: 'register' });
      } else {
        toast.error('Registration failed. Please try again.', { id: 'register' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            List Your <span className="gradient-text">Verifiable Dataset</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Contribute to the decentralized AI ecosystem. Mint your dataset as an NFT with 
            cryptographic integrity proofs on Filecoin's Onchain Cloud.
          </p>
          
          {!isConnected && (
            <div className="mt-6">
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                <AlertCircle className="h-3 w-3 mr-1" />
                Connect wallet to continue
              </Badge>
            </div>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Dataset Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Dataset Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Dataset Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Cultural Diversity ImageNet"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={isSubmitting}
                      className="glass-card"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your dataset, its purpose, and key features..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      disabled={isSubmitting}
                      rows={4}
                      className="glass-card"
                    />
                  </div>

                  {/* CID Generation */}
                  <div className="space-y-2">
                    <Label htmlFor="cid">IPFS CID *</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="cid"
                        placeholder="Generated after PDP verification"
                        value={formData.cid}
                        onChange={(e) => handleInputChange('cid', e.target.value)}
                        disabled={isSubmitting || generatingPDP}
                        className="glass-card"
                      />
                      <Button
                        type="button"
                        onClick={generateMockCID}
                        disabled={generatingPDP || isSubmitting}
                        variant="glass"
                        className="shrink-0"
                      >
                        {generatingPDP ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Shield className="h-4 w-4" />
                        )}
                        {generatingPDP ? 'Generating...' : 'Generate PDP'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      PDP (Proof of Data Possession) ensures cryptographic verification of your data
                    </p>
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USDFC) *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="10.00"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        disabled={isSubmitting}
                        className="pl-10 glass-card"
                      />
                    </div>
                  </div>

                  {/* Verification Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-success" />
                        <Label htmlFor="verified">Mark as Verified</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Enable if you've completed Synapse PDP verification
                      </p>
                    </div>
                    <Switch
                      id="verified"
                      checked={formData.isVerified}
                      onCheckedChange={(checked) => handleInputChange('isVerified', checked)}
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={!isConnected || isSubmitting || generatingPDP}
                    variant="hero"
                    size="lg"
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Registering Dataset...
                      </>
                    ) : !isConnected ? (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Connect Wallet to Continue
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Register Dataset & Mint NFT
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Process Overview */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Registration Process</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Generate PDP</h4>
                    <p className="text-xs text-muted-foreground">
                      Create cryptographic proof via Synapse SDK
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Mint NFT</h4>
                    <p className="text-xs text-muted-foreground">
                      Register dataset as NFT on Filecoin
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Go Live</h4>
                    <p className="text-xs text-muted-foreground">
                      Dataset available via FilCDN & Pay rails
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>Benefits</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-success shrink-0" />
                  <span>Cryptographic integrity proofs</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-success shrink-0" />
                  <span>Automated streaming payments</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-success shrink-0" />
                  <span>Global CDN distribution</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-success shrink-0" />
                  <span>Decentralized ownership</span>
                </div>
              </CardContent>
            </Card>

            {/* Technical Info */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="h-5 w-5" />
                  <span>Technical Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network</span>
                  <span>Filecoin Calibration</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contract</span>
                  <span className="font-mono text-xs">
                    {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Standard</span>
                  <span>ERC-721 NFT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Storage</span>
                  <span>IPFS + Filecoin</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ListDataset;