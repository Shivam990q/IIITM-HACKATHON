import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { adminService } from '@/services/api';

const AdminLoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: 'admin@nyaychain.com',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');
    
    try {
      const response = await adminService.login(formData.email, formData.password);
      
      if (response.status === 'success') {
        toast({
          title: "Admin Login Successful",
          description: "Redirecting to the Administrative Dashboard.",
        });
        navigate('/admin/dashboard');
      } else {
        // This path may not be taken if the service throws an error, but it's a safe fallback.
        setLoginError(response.message || 'Invalid administrator credentials.');
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      setLoginError(error.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50/30 to-slate-100 p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-slate-600/5"></div>
      <div className="absolute top-20 left-10 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Back to Home Button */}
        <div className="absolute -left-4 -top-4 z-20">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full pl-2 pr-3 py-5 bg-white backdrop-blur-md border-slate-200 hover:border-blue-200 hover:bg-blue-50 shadow-lg shadow-blue-500/10 transition-all duration-300 flex items-center gap-2 group"
            onClick={() => navigate('/')}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-inner">
              <ArrowLeft className="h-4 w-4 text-white" />
            </div>
            <span className="font-medium">Back to Home</span>
          </Button>
        </div>
        
        <Card className="border-0 shadow-2xl shadow-blue-500/10 bg-white/90 backdrop-blur-xl">
          <CardHeader className="text-center pb-6 space-y-4">
            <div 
              className="w-20 h-20 bg-gradient-to-br from-blue-700 via-purple-700 to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-blue-700/25"
            >
              <Shield className="h-10 w-10 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-800 via-purple-800 to-slate-800 bg-clip-text text-transparent">
                Administrator Access
              </CardTitle>
              <CardDescription className="text-lg text-slate-600 mt-2">
                Secure login for authorized personnel only
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {loginError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  {loginError}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Administrator Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="pl-10 py-3 border-2 border-slate-200 focus:border-blue-500 transition-colors bg-slate-50"
                    disabled
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Administrator Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your secure password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="pl-10 pr-10 py-3 border-2 border-slate-200 focus:border-blue-500 transition-colors bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full py-3 bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-800 hover:to-purple-800 shadow-lg shadow-blue-700/25 transition-all duration-300 hover:shadow-xl text-lg font-semibold" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Access Admin Dashboard</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="text-center text-sm text-slate-500 pt-2 pb-6">
            <p>This is a secure area. Unauthorized access attempts are logged and monitored.</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminLoginForm; 