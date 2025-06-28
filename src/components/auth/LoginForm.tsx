import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from './AuthContext';
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff, Mail, Lock, User, ArrowRight, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onToggleMode: () => void;
  isRegister: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode, isRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let success = false;
      if (isRegister) {
        success = await register(formData.name, formData.email, formData.password);
      } else {
        success = await login(formData.email, formData.password);
      }

      if (success) {
        toast({
          title: "Welcome to NyayChain! 🎉",
          description: `Successfully ${isRegister ? 'registered' : 'logged in'}. Let's build transparency together.`,
        });
        // Navigate to main app immediately after successful authentication
        navigate('/app');
      } else {
        toast({
          title: "Authentication Failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast({
        title: "Authentication Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-emerald-600/5"></div>
      <div className="absolute top-20 left-10 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Back to Home Button */}
        <div className="absolute -left-4 -top-4 z-20 animate-fade-in-down" style={{ animationDelay: '0.5s' }}>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full pl-2 pr-3 py-5 bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-md border-white hover:border-blue-200 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 shadow-lg shadow-blue-500/10 transition-all duration-300 flex items-center gap-2 group"
            onClick={() => navigate('/')}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-inner">
              <ArrowLeft className="h-4 w-4 text-white group-hover:animate-pulse" />
            </div>
            <span className="font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700">Home</span>
          </Button>
        </div>
        
        <Card className="border-0 shadow-2xl shadow-blue-500/10 bg-white/90 backdrop-blur-xl">
          <CardHeader className="text-center pb-6">
            <div 
              className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25 cursor-pointer hover:scale-110 hover:shadow-xl transition-all duration-300" 
              onClick={() => navigate('/')}
              title="Return to home page"
            >
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-700 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
              {isRegister ? 'Join NyayChain' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="text-lg text-slate-600">
              {isRegister 
                ? 'Create your account to start building transparent governance'
                : 'Sign in to access your civic dashboard'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {isRegister && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required={isRegister}
                      className="pl-10 py-3 border-2 border-slate-200 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="pl-10 py-3 border-2 border-slate-200 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="pl-10 pr-10 py-3 border-2 border-slate-200 focus:border-blue-500 transition-colors"
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
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl text-lg font-semibold" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Please wait...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-500 font-semibold">or</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-600">
                {isRegister ? 'Already have an account?' : "Don't have an account?"}
              </p>
              <Button 
                variant="link" 
                onClick={onToggleMode}
                className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                {isRegister ? 'Sign In' : 'Create Account'}
              </Button>
            </div>

            {!isRegister && (
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-center text-slate-500">
                  By signing in, you agree to our transparent governance principles and commitment to civic accountability.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Secured by blockchain technology • Transparent • Immutable
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
