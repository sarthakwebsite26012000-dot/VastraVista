import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import Home from "@/pages/Home";
import ProductListing from "@/pages/ProductListing";
import ProductDetail from "@/pages/ProductDetail";
import Checkout from "@/pages/Checkout";
import OrderTracking from "@/pages/OrderTracking";
import AdminPage from "@/pages/Admin";
import NotFound from "@/pages/not-found";

function Router({ onCartClick }: { onCartClick: () => void }) {
  return (
    <>
      <Header onCartClick={onCartClick} />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/products">
          {() => <ProductListing />}
        </Route>
        <Route path="/products/sarees">
          {() => <ProductListing category="sarees" />}
        </Route>
        <Route path="/products/salwar-suits">
          {() => <ProductListing category="salwar-suits" />}
        </Route>
        <Route path="/products/kurtis">
          {() => <ProductListing category="kurtis" />}
        </Route>
        <Route path="/products/lehengas">
          {() => <ProductListing category="lehengas" />}
        </Route>
        <Route path="/product/:id" component={ProductDetail} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/order/:id" component={OrderTracking} />
        <Route path="/admin" component={AdminPage} />
        <Route component={NotFound} />
      </Switch>
      <Footer />
    </>
  );
}

function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router onCartClick={() => setCartOpen(true)} />
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
