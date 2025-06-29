import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Upload, Send, Clock, CheckCircle, AlertCircle, Camera, Trash2, FileText, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { complaintService, categoryService } from "@/services/api";
import { useAuth } from "@/components/auth/AuthContext";

const ComplaintForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    address: "",
    image: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("details");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await categoryService.getCategories();
        setCategories(response.data.categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: "Error loading categories",
          description: "Could not load complaint categories. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [toast]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setFormData(prev => ({
            ...prev,
            address: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
          }));
          toast({
            title: "Location captured",
            description: "Your current location has been recorded with the complaint.",
          });
        },
        (error) => {
          toast({
            title: "Location access denied",
            description: "Please enter your location manually or enable location services.",
            variant: "destructive"
          });
        }
      );
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a complaint.",
        variant: "destructive",
      });
      return;
    }

    if (!location) {
      toast({
        title: "Location Required",
        description: "Please provide your location before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitProgress(0);

    try {
      // Create FormData object
      const submissionData = new FormData();
      submissionData.append('title', formData.title);
      submissionData.append('description', formData.description);
      submissionData.append('category', formData.category);
      submissionData.append('address', formData.address);
      submissionData.append('location[lat]', location.lat.toString());
      submissionData.append('location[lng]', location.lng.toString());
      
      // Add image if present
      if (formData.image) {
        submissionData.append('images', formData.image);
      }

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setSubmitProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 300);

      // Submit to API
      const response = await complaintService.createComplaint(submissionData);
      
      clearInterval(progressInterval);
      setSubmitProgress(100);

      if (response.status === 'success') {
        toast({
          title: "Complaint submitted successfully! 🎉",
          description: `Your complaint has been recorded on blockchain with transaction: ${response.data.transactionHash?.slice(0, 20)}...`,
        });

        // Reset form
        setFormData({
          title: "",
          description: "",
          category: "",
          address: "",
          image: null
        });
        setLocation(null);
        setPreviewImage(null);
        setActiveTab("details");
        
        // Show success message with blockchain details
        setTimeout(() => {
          toast({
            title: "Blockchain Transaction Confirmed",
            description: "Your complaint is now permanently recorded and publicly visible.",
          });
        }, 2000);
      }
    } catch (error: any) {
      console.error('Complaint submission error:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit complaint. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setSubmitProgress(0);
    }
  };

  // Motion variants
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="max-w-4xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={formVariants}
    >
      <div className="text-center mb-8">
        <motion.h2 
          className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent mb-4"
          variants={itemVariants}
        >
          Submit a Public Grievance
        </motion.h2>
        <motion.p 
          className="text-gray-600"
          variants={itemVariants}
        >
          Your complaint will be permanently recorded on blockchain and made publicly visible for accountability.
        </motion.p>
        <motion.div 
          className="flex justify-center mt-4"
          variants={itemVariants}
        >
          <Badge className="bg-blue-100 text-blue-700 px-4 py-1.5 text-sm flex items-center space-x-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
            <span>🔗 Blockchain-Secured & Immutable</span>
          </Badge>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card className="civic-card overflow-hidden border-0 shadow-2xl shadow-blue-500/10">
          <CardHeader className="bg-gradient-to-r from-blue-600/5 via-purple-500/5 to-emerald-500/5 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Send className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>Complaint Details</CardTitle>
                <CardDescription>
                  Provide clear details about the civic issue. All information will be publicly visible.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="details" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Basic Details</span>
                </TabsTrigger>
                <TabsTrigger value="location" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Location</span>
                </TabsTrigger>
                <TabsTrigger value="evidence" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 flex items-center space-x-2">
                  <Camera className="h-4 w-4" />
                  <span>Evidence</span>
                </TabsTrigger>
              </TabsList>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <TabsContent value="details" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2 group">
                      <Label htmlFor="title" className="group-focus-within:text-blue-600 transition-colors">Complaint Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Pothole on Main Street"
                        required
                        className="focus-visible:ring-blue-500 transition-all"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                        disabled={categoriesLoading}
                      >
                        <SelectTrigger className="focus:ring-blue-500">
                          <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select category"} />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriesLoading ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              <span className="text-sm text-gray-500">Loading categories...</span>
                            </div>
                          ) : categories.length === 0 ? (
                            <div className="flex items-center justify-center p-4">
                              <span className="text-sm text-gray-500">No categories available</span>
                            </div>
                          ) : (
                            categories.map((category) => (
                              <SelectItem 
                                key={category._id} 
                                value={category._id} 
                                className="focus:bg-blue-50 focus:text-blue-700"
                              >
                                <div className="flex items-center space-x-2">
                                  <div 
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: category.color }}
                                  />
                                  <span>{category.name}</span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {!categoriesLoading && categories.length === 0 && (
                        <p className="text-sm text-red-500">
                          Categories could not be loaded. Please refresh the page.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the issue in detail. What is the problem? When did you notice it? How does it affect the community?"
                      rows={4}
                      required
                      className="focus-visible:ring-blue-500 transition-all resize-none"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-slate-200 hover:border-blue-300"
                      onClick={() => setActiveTab("location")}
                    >
                      Next Step
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                      </svg>
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="location" className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="address">Location/Address *</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Enter address or coordinates"
                        className="focus-visible:ring-purple-500"
                        required
                      />
                      <Button 
                        type="button" 
                        onClick={getCurrentLocation} 
                        variant="outline"
                        className="bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 border-slate-200 hover:border-purple-300 transition-all"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Use Current
                      </Button>
                    </div>
                    {location && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-50 text-green-700 p-2 rounded-md flex items-center space-x-2 mt-2"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <p className="text-sm">
                          Location captured: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Map preview placeholder */}
                  <div className="rounded-lg bg-slate-100 h-[200px] flex items-center justify-center">
                    <div className="text-center text-slate-500">
                      <MapPin className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>Map preview would appear here</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="ghost"
                      className="hover:bg-slate-50"
                      onClick={() => setActiveTab("details")}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="m15 18-6-6 6-6"></path>
                      </svg>
                      Previous
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      className="bg-gradient-to-r hover:from-purple-50 hover:to-emerald-50 border-slate-200 hover:border-purple-300"
                      onClick={() => setActiveTab("evidence")}
                    >
                      Next Step
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                      </svg>
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="evidence" className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="image">Upload Evidence (Optional)</Label>
                    
                    {!previewImage ? (
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-400 transition-colors cursor-pointer bg-slate-50/50"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          type="file"
                          id="image"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          ref={fileInputRef}
                        />
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Upload className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">Upload Image</h3>
                        <p className="text-slate-500 mb-4 text-sm">Click to browse or drag and drop</p>
                        <Button type="button" variant="outline" className="bg-white">
                          Select File
                        </Button>
                      </div>
                    ) : (
                      <div className="relative rounded-lg overflow-hidden">
                        <img 
                          src={previewImage} 
                          alt="Preview" 
                          className="w-full h-64 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                          <div className="flex justify-between items-center">
                            <p className="text-white font-medium truncate">{formData.image?.name}</p>
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full"
                              onClick={removeImage}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button 
                      type="button" 
                      variant="ghost"
                      className="hover:bg-slate-50"
                      onClick={() => setActiveTab("location")}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="m15 18-6-6 6-6"></path>
                      </svg>
                      Previous
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          {submitProgress < 100 ? (
                            <>
                              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                              <span>Recording on Blockchain ({submitProgress}%)</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              <span>Complaint Submitted!</span>
                            </>
                          )}
                        </div>
                      ) : (
                        <>Submit Complaint</>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div 
        className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-4 text-blue-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-start space-x-3">
          <div className="mt-0.5">
            <AlertCircle className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Blockchain Transparency Notice</h3>
            <p className="text-sm text-blue-600">
              Your complaint will be recorded on a public blockchain ledger for maximum transparency and accountability. 
              All submitted information will be visible to the general public and cannot be modified or deleted once submitted.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ComplaintForm;
