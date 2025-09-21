import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowRight, 
  Database, 
  Shield, 
  Zap, 
  Globe, 
  TrendingUp, 
  Users,
  CheckCircle,
  ExternalLink,
  Github,
  Brain
} from 'lucide-react';

const Landing: React.FC = () => {
  const features = [
    {
      icon: Shield,
      title: 'PDP Verification',
      description: 'Cryptographic proofs ensure data integrity via Filecoin\'s Proof of Data Possession',
    },
    {
      icon: Zap,
      title: 'FilCDN Speed',
      description: 'Lightning-fast data retrieval with <1s SLA through distributed CDN',
    },
    {
      icon: Database,
      title: 'Filecoin Pay Rails',
      description: 'Streaming payments with automatic settlement on successful proof validation',
    },
    {
      icon: Globe,
      title: 'Decentralized',
      description: 'No single point of failure - data distributed across global Filecoin network',
    },
  ];

  const stats = [
    { label: 'Bias Reduction', value: '80%', description: 'compared to centralized datasets' },
    { label: 'Data Integrity', value: '99.9%', description: 'uptime with PDP proofs' },
    { label: 'Access Speed', value: '<1s', description: 'retrieval via FilCDN' },
    { label: 'Cost Reduction', value: '70%', description: 'vs traditional data markets' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative hero-bg data-pattern py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background/20 to-background/60" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge variant="secondary" className="mb-6 animate-pulse">
              <Zap className="h-3 w-3 mr-1" />
              Wave 2: From Design to Testnet MVP
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance">
              Verifiable AI Datasets: <br />
              <span className="gradient-text">End Bias with Filecoin's</span> <br />
              Onchain Cloud
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto text-balance">
              Break free from centralized data silos. Access bias-free, cryptographically verifiable 
              AI training datasets with PDP proofs, FilCDN speed, and streaming payment rails.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild variant="hero" size="xl">
                <Link to="/browse" className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Browse Datasets</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              
              <Button asChild variant="glass" size="xl">
                <Link to="/list" className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>List Your Dataset</span>
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-2xl md:text-3xl font-bold gradient-text mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-foreground mb-1">
                    {stat.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stat.description}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              The AI Bias Crisis
            </h2>
            <p className="text-lg text-muted-foreground">
              <strong>80% of AI training data</strong> comes from just 5 tech giants, creating 
              systematic bias in AI models worldwide. Centralized data silos lack transparency, 
              verification, and fair access.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                problem: 'Data Silos',
                impact: 'Limited diversity, geographic bias',
                color: 'from-red-500 to-pink-500'
              },
              {
                problem: 'No Verification',
                impact: 'Unclear provenance, potential manipulation',
                color: 'from-orange-500 to-red-500'
              },
              {
                problem: 'High Barriers',
                impact: 'Expensive access, gatekeeping',
                color: 'from-yellow-500 to-orange-500'
              }
            ].map((item, index) => (
              <motion.div
                key={item.problem}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card border-destructive/20 h-full">
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${item.color} mx-auto mb-4 flex items-center justify-center`}>
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-destructive">
                      {item.problem}
                    </h3>
                    <p className="text-muted-foreground">
                      {item.impact}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              The <span className="gradient-text">Filecoin Solution</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              DataForge Hub leverages Filecoin's Onchain Cloud to provide verifiable, 
              bias-free AI datasets with cryptographic integrity proofs and decentralized access.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Card className="glass-card h-full hover:scale-105 transition-transform duration-300">
                    <CardContent className="p-6 text-center">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-12 h-12 bg-gradient-ai rounded-lg mx-auto mb-4 flex items-center justify-center"
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </motion.div>
                      <h3 className="text-xl font-bold mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 hero-bg">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform AI with <br />
              <span className="gradient-text">Verifiable Data?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join the decentralized data revolution. Start building bias-free AI with 
              cryptographically verified datasets on Filecoin's Onchain Cloud.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="hero" size="xl">
                <Link to="/browse">
                  Explore Datasets
                </Link>
              </Button>
              
              <Button asChild variant="glass" size="xl">
                <Link to="/list">
                  Contribute Data
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-primary" />
                <span className="font-bold">DataForge Hub</span>
              </div>
              <Badge variant="secondary">Wave 2 MVP</Badge>
            </div>
            
            <div className="flex items-center space-x-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://docs.filecoin.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
              >
                <span>Filecoin Docs</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <span className="text-sm text-muted-foreground">
                Powered by Filecoin Onchain Cloud
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;