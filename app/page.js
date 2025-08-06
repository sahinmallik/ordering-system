"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminPanel from "@/components/AdminPanel";
import OrderForm from "@/components/OrderForm";
import { UtensilsCrossed, Shield, ShoppingCart } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <UtensilsCrossed className="w-12 h-12 text-orange-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">
              House Of Hydrabad Order
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <OrderForm />
      </div>
    </div>
  );
}
