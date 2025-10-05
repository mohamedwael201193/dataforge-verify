import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/contexts/WalletContext';
import { initializeSynapse, getUploadHistory } from '@/lib/synapse';
import { getExplorerTxUrl } from '@/lib/config';
import { Upload as UploadIcon, FileText, Loader2, CheckCircle, ExternalLink, AlertCircle, Clock } from 'lucide-react';

export default function Upload() {
  const { isConnected, connect, account } = useWallet();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [history, setHistory] = useState(getUploadHistory());

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !isConnected) {
      if (!isConnected) {
        await connect();
      }
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      // Initialize Synapse
      const synapse = await initializeSynapse();
      
      // Create storage context with CDN enabled
      const storageContext = await synapse.storage.createStorage({ withCDN: true });
      
      // Preflight check
      toast({
        title: 'Checking allowance...',
        description: 'Verifying storage approval'
      });
      
      const preflight = await storageContext.preflightUpload(selectedFile.size);
      
      if (!preflight.canUpload) {
        toast({
          title: 'Insufficient allowance',
          description: preflight.reason || 'Please approve more funds in the Funding page',
          variant: 'destructive'
        });
        
        // Redirect to fund page
        setTimeout(() => {
          navigate('/fund');
        }, 2000);
        
        setUploading(false);
        return;
      }
      
      // Upload file
      toast({
        title: 'Uploading...',
        description: `Starting upload of ${selectedFile.name}`
      });
      
      const result = await storageContext.upload(selectedFile, {
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
        onComplete: (result) => {
          setUploadResult(result);
          setHistory(getUploadHistory());
          
          toast({
            title: 'Upload successful!',
            description: (
              <div className="space-y-1">
                <p>File uploaded to Filecoin Warm Storage</p>
                <p className="font-mono text-xs">{result.pieceCid}</p>
              </div>
            )
          });
        },
        onError: (error) => {
          toast({
            title: 'Upload failed',
            description: error.message,
            variant: 'destructive'
          });
        }
      });
      
      console.log('Upload result:', result);
    } catch (error: any) {
      toast({
        title: 'Upload error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
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
              Connect your wallet to upload files to Filecoin Warm Storage
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
          <h1 className="text-4xl font-bold mb-2">Upload to Warm Storage</h1>
          <p className="text-muted-foreground">
            Upload files with PDP proofs and CDN-backed retrieval
          </p>
        </div>

        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle>Select File</CardTitle>
            <CardDescription>
              Choose a file to store on Filecoin with cryptographic verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {selectedFile ? (
                <div className="space-y-2">
                  <FileText className="h-12 w-12 mx-auto text-primary" />
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    Change File
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <UploadIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="font-medium">Click to select a file</p>
                  <p className="text-sm text-muted-foreground">
                    Any file type, up to 5GB
                  </p>
                </div>
              )}
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {uploadResult && (
              <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <p className="font-medium text-green-900 dark:text-green-100">
                      Upload Successful!
                    </p>
                    <div className="text-sm space-y-1">
                      <div>
                        <span className="text-muted-foreground">Piece CID (CommP):</span>
                        <p className="font-mono text-xs break-all">{uploadResult.pieceCid}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Size:</span>
                        <span className="ml-2">{formatFileSize(uploadResult.size)}</span>
                      </div>
                    </div>
                    <a
                      href={getExplorerTxUrl(uploadResult.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      View Transaction <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Upload to Warm Storage
                </>
              )}
            </Button>

            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded text-sm">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <p className="text-blue-900 dark:text-blue-100">
                Files are stored with PDP proofs and available via FilCDN for fast retrieval
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upload History */}
        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Uploads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.slice(0, 5).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.fileName}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {item.pieceCid}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(item.timestamp)} • {formatFileSize(item.size)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/retrieve?cid=${item.pieceCid}`)}
                    >
                      Retrieve
                    </Button>
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
