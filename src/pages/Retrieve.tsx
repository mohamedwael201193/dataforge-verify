import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/contexts/WalletContext';
import { initializeSynapse, getFilCDNUrl, getRetrievalHistory, saveRetrievalHistory } from '@/lib/synapse';
import { Download, Loader2, ExternalLink, CheckCircle, Clock, Copy } from 'lucide-react';

export default function Retrieve() {
  const [searchParams] = useSearchParams();
  const { isConnected, connect, account } = useWallet();
  const { toast } = useToast();
  
  const [pieceCid, setPieceCid] = useState(searchParams.get('cid') || '');
  const [retrieving, setRetrieving] = useState(false);
  const [retrievedData, setRetrievedData] = useState<{ blob: Blob; url: string } | null>(null);
  const [history, setHistory] = useState(getRetrievalHistory());

  useEffect(() => {
    const cidFromUrl = searchParams.get('cid');
    if (cidFromUrl) {
      setPieceCid(cidFromUrl);
    }
  }, [searchParams]);

  const handleRetrieve = async () => {
    if (!pieceCid.trim()) {
      toast({
        title: 'Invalid input',
        description: 'Please enter a valid Piece CID',
        variant: 'destructive'
      });
      return;
    }

    if (!isConnected) {
      await connect();
      return;
    }

    setRetrieving(true);
    setRetrievedData(null);

    try {
      const synapse = await initializeSynapse();
      
      toast({
        title: 'Retrieving file...',
        description: 'Downloading from Filecoin with verification'
      });
      
      const storageContext = await synapse.storage.createStorage({ withCDN: true });
      const blob = await storageContext.download(pieceCid);
      
      const url = URL.createObjectURL(blob);
      setRetrievedData({ blob, url });
      
      saveRetrievalHistory(pieceCid, true);
      setHistory(getRetrievalHistory());
      
      toast({
        title: 'Retrieval successful!',
        description: 'File downloaded and verified'
      });
    } catch (error: any) {
      console.error('Retrieval error:', error);
      
      saveRetrievalHistory(pieceCid, false);
      setHistory(getRetrievalHistory());
      
      toast({
        title: 'Retrieval failed',
        description: error.message || 'Could not retrieve file. It may not be available yet.',
        variant: 'destructive'
      });
    } finally {
      setRetrieving(false);
    }
  };

  const handleDownload = () => {
    if (!retrievedData) return;
    
    const a = document.createElement('a');
    a.href = retrievedData.url;
    a.download = `${pieceCid}.bin`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: 'Download started',
      description: 'File is being saved to your downloads'
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'CID copied to clipboard'
    });
  };

  const getCDNUrl = () => {
    if (!account || !pieceCid) return '';
    return getFilCDNUrl(account, pieceCid);
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to retrieve files from Filecoin
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
          <h1 className="text-4xl font-bold mb-2">Retrieve from Storage</h1>
          <p className="text-muted-foreground">
            Download files from Filecoin with CDN-backed fast retrieval
          </p>
        </div>

        {/* Retrieve Card */}
        <Card>
          <CardHeader>
            <CardTitle>Enter Piece CID</CardTitle>
            <CardDescription>
              Provide the CommP (Piece CID) to retrieve your file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pieceCid">Piece CID (CommP)</Label>
              <Input
                id="pieceCid"
                value={pieceCid}
                onChange={(e) => setPieceCid(e.target.value)}
                placeholder="baga6ea4seaq..."
                className="font-mono text-sm"
              />
            </div>

            <Button
              onClick={handleRetrieve}
              disabled={!pieceCid.trim() || retrieving}
              className="w-full"
            >
              {retrieving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Retrieving...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Retrieve File
                </>
              )}
            </Button>

            {retrievedData && (
              <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div className="flex-1 space-y-3">
                    <p className="font-medium text-green-900 dark:text-green-100">
                      File Retrieved Successfully!
                    </p>
                    <div className="text-sm space-y-2">
                      <div>
                        <span className="text-muted-foreground">Size:</span>
                        <span className="ml-2">{(retrievedData.blob.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <span className="ml-2">{retrievedData.blob.type || 'application/octet-stream'}</span>
                      </div>
                    </div>
                    <Button onClick={handleDownload} size="sm" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download File
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* FilCDN URL */}
            {pieceCid && account && (
              <div className="space-y-2">
                <Label>FilCDN Direct URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={getCDNUrl()}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(getCDNUrl())}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(getCDNUrl(), '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  ⚠️ Direct CDN access bypasses SDK verification. Always verify content integrity.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Retrieval History */}
        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Retrievals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground font-mono break-all">
                        {item.pieceCid}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(item.timestamp)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <span className="text-xs text-red-600">Failed</span>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPieceCid(item.pieceCid);
                          handleRetrieve();
                        }}
                      >
                        Retry
                      </Button>
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
