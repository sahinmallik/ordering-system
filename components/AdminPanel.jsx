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
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Download,
  Users,
  DollarSign,
  Clock,
  Trash2,
  Copy,
  CheckCircle,
} from "lucide-react";
import {
  generateToken,
  createTokenSession,
  getTokens,
  getOrdersForToken,
  calculateTokenTotal,
  getUserTotalsForToken,
  deactivateToken,
} from "@/utils/tokenUtils";
import { downloadOrderPDF } from "@/utils/pdfUtils";
import { format } from "date-fns";

export default function AdminPanel() {
  const [tokens, setTokens] = useState({});
  const [selectedToken, setSelectedToken] = useState(null);
  const [newTokenDescription, setNewTokenDescription] = useState("");
  const [copiedToken, setCopiedToken] = useState("");
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = () => {
    const savedTokens = getTokens();
    setTokens(savedTokens);
  };

  const handleCreateToken = () => {
    if (!newTokenDescription.trim()) {
      showAlert("Please enter a description for the token", "error");
      return;
    }

    const tokenId = generateToken();
    createTokenSession(tokenId, newTokenDescription);
    setNewTokenDescription("");
    loadTokens();
    showAlert(`Token ${tokenId} created successfully!`, "success");
  };

  const handleCopyToken = (tokenId) => {
    navigator.clipboard.writeText(tokenId);
    setCopiedToken(tokenId);
    setTimeout(() => setCopiedToken(""), 2000);
    showAlert("Token copied to clipboard!", "success");
  };

  const handleGeneratePDF = (tokenId) => {
    try {
      downloadOrderPDF(tokenId);
      showAlert("PDF generated successfully!", "success");
    } catch (error) {
      showAlert("Error generating PDF", "error");
    }
  };

  const handleDeactivateToken = (tokenId) => {
    deactivateToken(tokenId);
    loadTokens();
    showAlert("Token deactivated successfully!", "success");
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const getTokenDetails = (tokenId) => {
    const orders = getOrdersForToken(tokenId);
    const total = calculateTokenTotal(tokenId);
    const userTotals = getUserTotalsForToken(tokenId);

    return {
      orders,
      total,
      userTotals,
      userCount: Object.keys(userTotals).length,
    };
  };

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

      {/* Create New Token */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Create New Token</span>
          </CardTitle>
          <CardDescription>
            Generate a new token for a group order session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="description">Token Description</Label>
            <Input
              id="description"
              placeholder="e.g., Office lunch order, Birthday party, etc."
              value={newTokenDescription}
              onChange={(e) => setNewTokenDescription(e.target.value)}
            />
          </div>
          <Button onClick={handleCreateToken} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Create Token
          </Button>
        </CardContent>
      </Card>

      {/* Active Tokens */}
      <Card>
        <CardHeader>
          <CardTitle>Active Tokens</CardTitle>
          <CardDescription>Manage your active order tokens</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(tokens).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tokens created yet. Create your first token above.
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {Object.values(tokens).map((token) => {
                  const details = getTokenDetails(token.id);
                  return (
                    <Card
                      key={token.id}
                      className="border-l-4 border-l-blue-500"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <code className="bg-gray-100 px-2 py-1 rounded text-lg font-mono font-bold">
                              {token.id}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyToken(token.id)}
                            >
                              {copiedToken === token.id ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                          <Badge
                            variant={token.isActive ? "default" : "secondary"}
                          >
                            {token.isActive ? "Active" : "Closed"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {token.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          Created:{" "}
                          {format(
                            new Date(token.createdAt),
                            "dd/MM/yyyy HH:mm"
                          )}
                        </p>
                      </CardHeader>

                      <CardContent className="pt-0">
                        {/* Token Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <Users className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                            <p className="text-sm font-semibold">
                              {details.userCount}
                            </p>
                            <p className="text-xs text-gray-500">Users</p>
                          </div>
                          <div className="text-center">
                            <Clock className="w-5 h-5 mx-auto mb-1 text-green-500" />
                            <p className="text-sm font-semibold">
                              {details.orders.length}
                            </p>
                            <p className="text-xs text-gray-500">Orders</p>
                          </div>
                          <div className="text-center">
                            <DollarSign className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                            <p className="text-sm font-semibold">
                              ₹{details.total}
                            </p>
                            <p className="text-xs text-gray-500">Total</p>
                          </div>
                        </div>

                        {/* User Breakdown */}
                        {Object.keys(details.userTotals).length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold mb-2">
                              User Breakdown:
                            </h4>
                            <div className="space-y-1">
                              {Object.entries(details.userTotals).map(
                                ([userName, userData]) => (
                                  <div
                                    key={userName}
                                    className="flex justify-between text-sm"
                                  >
                                    <span>{userName}</span>
                                    <span className="font-medium">
                                      ₹{userData.total}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        <Separator className="my-4" />

                        {/* Actions */}
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setSelectedToken(
                                selectedToken === token.id ? null : token.id
                              )
                            }
                          >
                            {selectedToken === token.id
                              ? "Hide Details"
                              : "View Details"}
                          </Button>

                          {details.orders.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGeneratePDF(token.id)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              PDF
                            </Button>
                          )}

                          {token.isActive && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeactivateToken(token.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Close
                            </Button>
                          )}
                        </div>

                        {/* Detailed Orders View */}
                        {selectedToken === token.id &&
                          details.orders.length > 0 && (
                            <div className="mt-4 space-y-3">
                              <Separator />
                              <h4 className="font-semibold">
                                Detailed Orders:
                              </h4>
                              <ScrollArea className="h-64">
                                <div className="space-y-3">
                                  {details.orders.map((order) => (
                                    <Card key={order.id} className="p-3">
                                      <div className="flex justify-between items-start mb-2">
                                        <h5 className="font-medium">
                                          {order.userName}
                                        </h5>
                                        <Badge variant="outline">
                                          ₹{order.total}
                                        </Badge>
                                      </div>
                                      <div className="space-y-1 text-sm">
                                        {order.items.map((item, idx) => (
                                          <div
                                            key={idx}
                                            className="flex justify-between"
                                          >
                                            <span>
                                              {item.name} (
                                              {item.size !== "default"
                                                ? item.size
                                                : "Regular"}
                                              ) x{item.quantity}
                                            </span>
                                            <span>
                                              ₹{item.price * item.quantity}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                      <p className="text-xs text-gray-500 mt-2">
                                        {format(
                                          new Date(order.timestamp),
                                          "dd/MM/yyyy HH:mm"
                                        )}
                                      </p>
                                    </Card>
                                  ))}
                                </div>
                              </ScrollArea>
                            </div>
                          )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
