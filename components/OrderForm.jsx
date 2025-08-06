"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Plus,
  Minus,
  ArrowLeft,
  User,
  Hash,
  UtensilsCrossed,
  CheckCircle,
} from "lucide-react";
import menuJson from "@/data/menuData.json";

import { getTokens, addOrderToToken } from "@/utils/tokenUtils";

export default function OrderForm() {
  const menuData = menuJson.menu;
  const [step, setStep] = useState("token"); // token, user, type, category, items, cart, confirm
  const [tokenId, setTokenId] = useState("");
  const [userName, setUserName] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [cart, setCart] = useState([]);
  const [alert, setAlert] = useState(null);
  const [isValidToken, setIsValidToken] = useState(false);

  const validateToken = () => {
    const tokens = getTokens();
    const token = tokens[tokenId];
    console.log(token);
    if (!token) {
      showAlert("Invalid token ID", "error");
      return false;
    }

    if (!token.isActive) {
      showAlert("This token is no longer active", "error");
      return false;
    }

    setIsValidToken(true);
    return true;
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const addToCart = (item, size, price) => {
    const cartItem = {
      id: `${item.name}_${size || "default"}_${Date.now()}`,
      name: item.name,
      size: size || "default",
      price: price,
      quantity: 1,
    };
    setCart([...cart, cartItem]);
    showAlert("Item added to cart!", "success");
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      setCart(cart.filter((item) => item.id !== id));
    } else {
      setCart(
        cart.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleSubmitOrder = () => {
    if (cart.length === 0) {
      showAlert("Your cart is empty", "error");
      return;
    }

    try {
      addOrderToToken(tokenId.toUpperCase(), userName, {
        items: cart,
        total: getTotalPrice(),
      });

      setStep("success");
      showAlert("Order placed successfully!", "success");
    } catch (error) {
      showAlert("Error placing order", "error");
    }
  };

  const resetForm = () => {
    setStep("token");
    setTokenId("");
    setUserName("");
    setSelectedType("");
    setSelectedCategory("");
    setCart([]);
    setIsValidToken(false);
  };

  const renderTokenInput = () => (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Hash className="w-5 h-5" />
          <span>Enter Token ID</span>
        </CardTitle>
        <CardDescription>
          Enter the token provided by your admin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="token">Token ID</Label>
          <Input
            id="token"
            placeholder="Enter 8-character token"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            maxLength={8}
            className="text-center font-mono text-lg"
          />
        </div>
        <Button
          onClick={() => {
            if (validateToken()) {
              setStep("user");
            }
          }}
          className="w-full"
          disabled={tokenId.length !== 8}
        >
          Continue
        </Button>
      </CardContent>
    </Card>
  );

  const renderUserInput = () => (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => setStep("token")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Badge variant="outline">Token: {tokenId}</Badge>
        </div>
        <CardTitle className="flex items-center justify-center space-x-2">
          <User className="w-5 h-5" />
          <span>Your Name</span>
        </CardTitle>
        <CardDescription>
          Enter your name to identify your order
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="userName">Your Name</Label>
          <Input
            id="userName"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <Button
          onClick={() => setStep("type")}
          className="w-full"
          disabled={!userName.trim()}
        >
          Start Ordering
        </Button>
      </CardContent>
    </Card>
  );

  const renderTypeSelection = () => (
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => setStep("user")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Badge variant="outline">
          Token: {tokenId} | {userName}
        </Badge>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle>Choose Your Preference</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => {
              setSelectedType("vegetarian");
              setStep("category");
            }}
            className="w-full h-16 bg-green-500 hover:bg-green-600 text-white text-lg"
          >
            🥬 Vegetarian
          </Button>
          <Button
            onClick={() => {
              setSelectedType("non_vegetarian");
              setStep("category");
            }}
            className="w-full h-16 bg-red-500 hover:bg-red-600 text-white text-lg"
          >
            🍗 Non-Vegetarian
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderCategorySelection = () => {
    const categories = Object.keys(menuData[selectedType]);

    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => setStep("type")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Badge variant="outline">
            Token: {tokenId} | {userName}
          </Badge>
          {cart.length > 0 && (
            <Button variant="outline" onClick={() => setStep("cart")}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart ({getTotalItems()})
            </Button>
          )}
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>
              Select Category (
              {selectedType === "vegetarian" ? "Vegetarian" : "Non-Vegetarian"})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setStep("items");
                  }}
                  variant="outline"
                  className="h-16 text-center"
                >
                  {category.replace("_", " ")}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderItemSelection = () => {
    const items = menuData[selectedType][selectedCategory];

    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => setStep("category")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Badge variant="outline">
            Token: {tokenId} | {userName}
          </Badge>
          {cart.length > 0 && (
            <Button variant="outline" onClick={() => setStep("cart")}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart ({getTotalItems()})
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{selectedCategory.replace("_", " ")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {items.map((item, index) => (
                  <Card key={index} className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{item.name}</h3>

                    {item.prices ? (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(item.prices).map(([size, price]) => (
                          <Button
                            key={size}
                            onClick={() => addToCart(item, size, price)}
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                          >
                            {size}: ₹{price}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <Button
                        onClick={() => addToCart(item, null, item.price)}
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                      >
                        Add: ₹{item.price}
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCart = () => (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => setStep("category")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Badge variant="outline">
          Token: {tokenId} | {userName}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5" />
            <span>Your Cart</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cart.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Your cart is empty
            </div>
          ) : (
            <div className="space-y-4">
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {cart.map((item) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          {item.size !== "default" && (
                            <p className="text-sm text-gray-600">
                              Size: {item.size}
                            </p>
                          )}
                          <p className="text-green-600 font-medium">
                            ₹{item.price}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              <Separator />

              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span>₹{getTotalPrice()}</span>
              </div>

              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setStep("category")}
                  className="flex-1"
                >
                  Continue Shopping
                </Button>
                <Button onClick={handleSubmitOrder} className="flex-1">
                  Place Order
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderSuccess = () => (
    <div className="max-w-md mx-auto text-center">
      <Card>
        <CardContent className="pt-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            Order Placed!
          </h2>
          <p className="text-gray-600 mb-4">
            Your order has been successfully added to token{" "}
            <strong>{tokenId}</strong>
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-2">Order Summary:</p>
            <p className="font-semibold">Total Items: {getTotalItems()}</p>
            <p className="font-semibold">Total Amount: ₹{getTotalPrice()}</p>
          </div>
          <Button onClick={resetForm} className="w-full">
            Place Another Order
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert && (
        <Alert
          className={
            alert.type === "error" ? "border-red-500" : "border-green-500"
          }
        >
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      {step === "token" && renderTokenInput()}
      {step === "user" && renderUserInput()}
      {step === "type" && renderTypeSelection()}
      {step === "category" && renderCategorySelection()}
      {step === "items" && renderItemSelection()}
      {step === "cart" && renderCart()}
      {step === "success" && renderSuccess()}
    </div>
  );
}
