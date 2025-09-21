import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MOCK_DATASETS, Dataset, formatPrice } from '@/lib/contract';
import { 
  Search, 
  Filter, 
  Shield, 
  ShieldAlert, 
  Database, 
  Eye,
  ArrowRight,
  SortAsc,
  SortDesc,
  Sparkles
} from 'lucide-react';

const Browse: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>(MOCK_DATASETS);
  const [filteredDatasets, setFilteredDatasets] = useState<Dataset[]>(MOCK_DATASETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'verified'>('newest');
  const [filterBy, setFilterBy] = useState<'all' | 'verified' | 'unverified'>('all');

  // Filter and sort datasets
  useEffect(() => {
    let filtered = datasets.filter(dataset => 
      dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply category filter
    if (filterBy === 'verified') {
      filtered = filtered.filter(dataset => dataset.isVerified);
    } else if (filterBy === 'unverified') {
      filtered = filtered.filter(dataset => !dataset.isVerified);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'verified':
        filtered.sort((a, b) => Number(b.isVerified) - Number(a.isVerified));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => b.id - a.id);
        break;
    }

    setFilteredDatasets(filtered);
  }, [datasets, searchQuery, sortBy, filterBy]);

  const generateDatasetImage = (id: number) => {
    const colors = ['from-blue-500 to-purple-600', 'from-green-500 to-blue-500', 'from-purple-500 to-pink-500', 'from-yellow-500 to-red-500', 'from-indigo-500 to-purple-500'];
    return colors[id % colors.length];
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover <span className="gradient-text">Verifiable Datasets</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore bias-free, cryptographically verified AI training datasets with PDP proofs and instant access via FilCDN.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col lg:flex-row gap-4 mb-8"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search datasets by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-card"
            />
          </div>

          {/* Sort By */}
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-full lg:w-48 glass-card">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="verified">Verified First</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter By */}
          <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
            <SelectTrigger className="w-full lg:w-48 glass-card">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Datasets</SelectItem>
              <SelectItem value="verified">Verified Only</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-8"
        >
          <p className="text-muted-foreground">
            Found {filteredDatasets.length} dataset{filteredDatasets.length !== 1 ? 's' : ''}
          </p>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-success" />
            <span>PDP Verified</span>
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          </div>
        </motion.div>

        {/* Dataset Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDatasets.map((dataset, index) => (
            <motion.div
              key={dataset.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="group"
            >
              <Card className="glass-card h-full hover:shadow-xl transition-all duration-300 border-white/10 hover:border-primary/30">
                <CardHeader className="p-0">
                  {/* Dataset Image Placeholder */}
                  <div className={`h-48 bg-gradient-to-br ${generateDatasetImage(dataset.id)} rounded-t-lg relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute top-4 left-4">
                      {dataset.isVerified ? (
                        <Badge className="pdp-verified">
                          <Shield className="h-3 w-3 mr-1" />
                          PDP Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-400/30">
                          <ShieldAlert className="h-3 w-3 mr-1" />
                          Pending Verification
                        </Badge>
                      )}
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-black/50 text-white border-white/20">
                        {formatPrice(dataset.price)}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button variant="glass" size="sm" asChild>
                        <Link to={`/dataset/${dataset.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="mb-3">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {dataset.name}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {dataset.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Database className="h-4 w-4" />
                      <span>IPFS: {dataset.cid.slice(0, 8)}...</span>
                    </div>
                    {dataset.isVerified && (
                      <div className="flex items-center space-x-1 text-success">
                        <Sparkles className="h-4 w-4" />
                        <span>Hot Storage</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-0">
                  <Button asChild variant="ai" className="w-full group">
                    <Link to={`/dataset/${dataset.id}`} className="flex items-center justify-center space-x-2">
                      <span>View Details</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredDatasets.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No datasets found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search criteria or browse all available datasets.
            </p>
            <Button 
              variant="ghost" 
              onClick={() => {
                setSearchQuery('');
                setFilterBy('all');
                setSortBy('newest');
              }}
            >
              Clear Filters
            </Button>
          </motion.div>
        )}

        {/* Load More (Mock) */}
        {filteredDatasets.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <Button variant="glass" size="lg" disabled>
              <div className="animate-pulse">Loading more datasets...</div>
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Fetching from Filecoin network...
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Browse;