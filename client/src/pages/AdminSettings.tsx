import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Store, Phone, MapPin, Share2, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getStoreSettings, saveStoreSettings, type StoreSettings } from "@/lib/storeSettings";

export default function AdminSettings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [settings, setSettings] = useState<StoreSettings>(getStoreSettings());
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    try {
      saveStoreSettings(settings);
      toast({ title: "Settings saved successfully" });
    } catch (error) {
      toast({
        title: "Error saving settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof StoreSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (method: keyof StoreSettings['paymentMethods']) => {
    setSettings((prev) => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        [method]: !prev.paymentMethods[method],
      },
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/admin")}
              data-testid="button-back-to-admin"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-serif font-bold">Store Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your store information and preferences</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving} data-testid="button-save-settings">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Tabs defaultValue="store" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="store">Store Info</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="payment">Payments</TabsTrigger>
          </TabsList>

          {/* Store Info Tab */}
          <TabsContent value="store">
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Store Information
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Store Name</Label>
                  <Input
                    value={settings.storeName}
                    onChange={(e) => handleChange("storeName", e.target.value)}
                    placeholder="Your store name"
                    data-testid="input-store-name"
                  />
                </div>

                <div>
                  <Label>Main Branch Address</Label>
                  <Textarea
                    value={settings.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="Street address"
                    rows={2}
                    data-testid="textarea-address"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input
                      value={settings.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      placeholder="City"
                      data-testid="input-city"
                    />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input
                      value={settings.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                      placeholder="State"
                      data-testid="input-state"
                    />
                  </div>
                  <div>
                    <Label>ZIP Code</Label>
                    <Input
                      value={settings.zipCode}
                      onChange={(e) => handleChange("zipCode", e.target.value)}
                      placeholder="ZIP"
                      data-testid="input-zipcode"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact">
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={settings.storeEmail}
                    onChange={(e) => handleChange("storeEmail", e.target.value)}
                    placeholder="support@example.com"
                    data-testid="input-email"
                  />
                </div>

                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={settings.storePhone}
                    onChange={(e) => handleChange("storePhone", e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    data-testid="input-phone"
                  />
                </div>

                <Separator className="my-4" />

                <div>
                  <h4 className="font-semibold mb-3">Shipping Rates</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Free Shipping Above (₹)</Label>
                      <Input
                        type="number"
                        value={settings.shippingFree}
                        onChange={(e) => handleChange("shippingFree", e.target.value)}
                        placeholder="2000"
                        data-testid="input-free-shipping"
                      />
                    </div>
                    <div>
                      <Label>Standard Shipping (₹)</Label>
                      <Input
                        type="number"
                        value={settings.shippingStandard}
                        onChange={(e) => handleChange("shippingStandard", e.target.value)}
                        placeholder="100"
                        data-testid="input-standard-shipping"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Social Media Tab */}
          <TabsContent value="social">
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Social Media Links
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Facebook URL</Label>
                  <Input
                    value={settings.facebookUrl}
                    onChange={(e) => handleChange("facebookUrl", e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                    data-testid="input-facebook"
                  />
                </div>

                <div>
                  <Label>Instagram URL</Label>
                  <Input
                    value={settings.instagramUrl}
                    onChange={(e) => handleChange("instagramUrl", e.target.value)}
                    placeholder="https://instagram.com/yourprofile"
                    data-testid="input-instagram"
                  />
                </div>

                <div>
                  <Label>Twitter URL</Label>
                  <Input
                    value={settings.twitterUrl}
                    onChange={(e) => handleChange("twitterUrl", e.target.value)}
                    placeholder="https://twitter.com/yourhandle"
                    data-testid="input-twitter"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payment">
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Methods
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">UPI (GPay, PhonePe, Paytm)</p>
                    <p className="text-sm text-muted-foreground">Enable UPI payments</p>
                  </div>
                  <Switch
                    checked={settings.paymentMethods.upi}
                    onCheckedChange={() => handlePaymentChange("upi")}
                    data-testid="switch-upi"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">Credit/Debit Card</p>
                    <p className="text-sm text-muted-foreground">Enable card payments</p>
                  </div>
                  <Switch
                    checked={settings.paymentMethods.card}
                    onCheckedChange={() => handlePaymentChange("card")}
                    data-testid="switch-card"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">Net Banking</p>
                    <p className="text-sm text-muted-foreground">Enable net banking</p>
                  </div>
                  <Switch
                    checked={settings.paymentMethods.netBanking}
                    onCheckedChange={() => handlePaymentChange("netBanking")}
                    data-testid="switch-netbanking"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">Cash on Delivery</p>
                    <p className="text-sm text-muted-foreground">Enable COD option</p>
                  </div>
                  <Switch
                    checked={settings.paymentMethods.cod}
                    onCheckedChange={() => handlePaymentChange("cod")}
                    data-testid="switch-cod"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
