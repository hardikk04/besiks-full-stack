"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  User,
  Calendar,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Save,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

const OrderDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id;

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  // Load order data
  useEffect(() => {
    const loadOrderData = async () => {
      try {
        setLoading(true);

        // Mock data - replace with actual API call
        // const response = await fetch(`/api/orders/${orderId}`);
        // const order = await response.json();

        // Mock order data based on your schema
        const mockOrderData = {
          _id: orderId,
          user: {
            _id: "user123",
            name: "John Doe",
            email: "john.doe@example.com",
          },
          orderItems: [
            {
              _id: "item1",
              product: {
                _id: "prod1",
                name: "Wireless Headphones",
              },
              name: "Wireless Headphones",
              quantity: 2,
              price: 99.99,
              image: "/placeholder.jpg",
            },
            {
              _id: "item2",
              product: {
                _id: "prod2",
                name: "Smartphone Case",
              },
              name: "Smartphone Case",
              quantity: 1,
              price: 24.99,
              image: "/placeholder.jpg",
            },
          ],
          shippingAddress: {
            street: "123 Main Street, Apt 4B",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            country: "United States",
          },
          paymentMethod: "razorpay",
          razorpayOrderId: "order_12345",
          razorpayPaymentId: "pay_67890",
          razorpaySignature: "signature_abc123",
          paymentResult: {
            id: "pay_67890",
            status: "captured",
            update_time: "2025-08-29T10:30:00Z",
            email_address: "john.doe@example.com",
            method: "card",
            bank: "HDFC Bank",
            card_id: "card_xyz789",
          },
          itemsPrice: 224.97,
          taxPrice: 18.0,
          shippingPrice: 15.0,
          couponCode: "SAVE10",
          couponDiscount: 22.5,
          totalPrice: 235.47,
          status: "processing",
          isPaid: true,
          paidAt: "2025-08-29T10:30:00Z",
          isDelivered: false,
          deliveredAt: null,
          trackingNumber: "TRK123456789",
          notes: "Customer requested express delivery",
          createdAt: "2025-08-29T09:15:00Z",
          updatedAt: "2025-08-29T10:30:00Z",
        };

        setOrderData(mockOrderData);
        setNewStatus(mockOrderData.status);
        setNotes(mockOrderData.notes || "");
        setTrackingNumber(mockOrderData.trackingNumber || "");
      } catch (error) {
        console.error("Error loading order:", error);
        alert("Error loading order data");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      loadOrderData();
    }
  }, [orderId]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "processing":
        return <Package className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleStatusUpdate = async () => {
    try {
      // API call to update status
      // await updateOrderStatus(orderId, newStatus);

      setOrderData((prev) => ({
        ...prev,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      }));

      console.log("🚀 Order Status Update:", {
        orderId,
        oldStatus: orderData.status,
        newStatus,
        updatedAt: new Date().toISOString(),
      });

      setIsEditingStatus(false);
      alert("Order status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating order status");
    }
  };

  const handleNotesUpdate = async () => {
    try {
      // API call to update notes
      // await updateOrderNotes(orderId, notes, trackingNumber);

      setOrderData((prev) => ({
        ...prev,
        notes,
        trackingNumber,
        updatedAt: new Date().toISOString(),
      }));

      console.log("🚀 Order Notes Update:", {
        orderId,
        notes,
        trackingNumber,
        updatedAt: new Date().toISOString(),
      });

      setIsEditingNotes(false);
      alert("Order notes updated successfully!");
    } catch (error) {
      console.error("Error updating notes:", error);
      alert("Error updating order notes");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading order...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The requested order could not be found.
          </p>
          <Button onClick={() => router.push("/admin/orders")}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Order #{orderData._id}</h1>
            <p className="text-muted-foreground mt-2">
              Placed on {new Date(orderData.createdAt).toLocaleDateString()} at{" "}
              {new Date(orderData.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className={`flex items-center gap-2 ${getStatusColor(
                orderData.status
              )}`}
            >
              {getStatusIcon(orderData.status)}
              {orderData.status.charAt(0).toUpperCase() +
                orderData.status.slice(1)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderData.orderItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <img
                      src={item.image || "/placeholder.jpg"}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Product ID: {item.product._id || item.product}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm">Qty: {item.quantity}</span>
                        <span className="text-sm">Price: ₹{item.price}</span>
                        <span className="font-medium">
                          Total: ₹{(item.quantity * item.price).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>{orderData.shippingAddress.street}</p>
                <p>
                  {orderData.shippingAddress.city},{" "}
                  {orderData.shippingAddress.state}{" "}
                  {orderData.shippingAddress.zipCode}
                </p>
                <p>{orderData.shippingAddress.country}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Payment Method</Label>
                  <p className="font-medium capitalize">
                    {orderData.paymentMethod.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <Label>Payment Status</Label>
                  <div className="flex items-center gap-2">
                    {orderData.isPaid ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span
                      className={
                        orderData.isPaid ? "text-green-600" : "text-red-600"
                      }
                    >
                      {orderData.isPaid ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                </div>
              </div>

              {orderData.razorpayPaymentId && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Razorpay Order ID</Label>
                    <p className="text-sm font-mono">
                      {orderData.razorpayOrderId}
                    </p>
                  </div>
                  <div>
                    <Label>Payment ID</Label>
                    <p className="text-sm font-mono">
                      {orderData.razorpayPaymentId}
                    </p>
                  </div>
                </div>
              )}

              {orderData.paymentResult && (
                <div className="grid grid-cols-2 gap-4">
                  {orderData.paymentResult.method && (
                    <div>
                      <Label>Payment Method</Label>
                      <p className="capitalize">
                        {orderData.paymentResult.method}
                      </p>
                    </div>
                  )}
                  {orderData.paymentResult.bank && (
                    <div>
                      <Label>Bank</Label>
                      <p>{orderData.paymentResult.bank}</p>
                    </div>
                  )}
                </div>
              )}

              {orderData.paidAt && (
                <div>
                  <Label>Paid At</Label>
                  <p>{new Date(orderData.paidAt).toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{orderData.user.name}</p>
              <p className="text-sm text-muted-foreground">
                {orderData.user.email}
              </p>
              <p className="text-sm text-muted-foreground">
                ID: {orderData.user._id}
              </p>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Items Price:</span>
                <span>₹{orderData.itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>₹{orderData.taxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>₹{orderData.shippingPrice.toFixed(2)}</span>
              </div>
              {orderData.couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({orderData.couponCode}):</span>
                  <span>-₹{orderData.couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>₹{orderData.totalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditingStatus ? (
                <div className="space-y-3">
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleStatusUpdate}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsEditingStatus(false);
                        setNewStatus(orderData.status);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <Badge
                    className={`flex items-center gap-2 ${getStatusColor(
                      orderData.status
                    )}`}
                  >
                    {getStatusIcon(orderData.status)}
                    {orderData.status.charAt(0).toUpperCase() +
                      orderData.status.slice(1)}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingStatus(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {orderData.deliveredAt && (
                <div>
                  <Label>Delivered At</Label>
                  <p className="text-sm">
                    {new Date(orderData.deliveredAt).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tracking & Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Tracking & Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditingNotes ? (
                <div className="space-y-3">
                  <div>
                    <Label>Tracking Number</Label>
                    <Input
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Enter tracking number"
                    />
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about this order"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleNotesUpdate}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsEditingNotes(false);
                        setNotes(orderData.notes || "");
                        setTrackingNumber(orderData.trackingNumber || "");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {orderData.trackingNumber && (
                    <div>
                      <Label>Tracking Number</Label>
                      <p className="font-mono text-sm">
                        {orderData.trackingNumber}
                      </p>
                    </div>
                  )}
                  {orderData.notes && (
                    <div>
                      <Label>Notes</Label>
                      <p className="text-sm">{orderData.notes}</p>
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingNotes(true)}
                    className="w-full"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {orderData.trackingNumber || orderData.notes
                      ? "Edit"
                      : "Add"}{" "}
                    Tracking & Notes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Order Created</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(orderData.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {orderData.paidAt && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Payment Received</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(orderData.paidAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {orderData.deliveredAt && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Order Delivered</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(orderData.deliveredAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(orderData.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
