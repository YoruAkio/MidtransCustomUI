import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaCheckCircle, FaExclamationTriangle, FaQrcode, FaSpinner } from "react-icons/fa";

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  order, 
  onPaymentProcessing,
  onPaymentSuccess,
  onPaymentError 
}) {
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [status, setStatus] = useState("pending");
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(900); // 15 minutes in seconds
  const [qrImage, setQrImage] = useState(null);
  const checkIntervalRef = useRef(null);
  const imgRef = useRef(null); // Add a ref to track the image
  
  // Format price to IDR
  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Format countdown time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  
  // Load QR code image
  useEffect(() => {
    if (isOpen && order && order.qrCodeUrl) {
      // Pre-load the QR code image
      const img = new Image();
      imgRef.current = img; // Store reference to the image
      
      img.onload = () => {
        console.log("QR code image loaded successfully");
        setQrImage(order.qrCodeUrl);
      };
      
      img.onerror = () => {
        console.error("Failed to load QR code image");
        setErrorMessage("Failed to load QR code. Please try refreshing.");
      };
      
      img.src = order.qrCodeUrl;
    }
    
    return () => {
      // Clean up on unmount - use the ref instead of direct variable
      if (imgRef.current) {
        imgRef.current.onload = null;
        imgRef.current.onerror = null;
        imgRef.current = null;
      }
    };
  }, [isOpen, order]);

  // Check payment status periodically and handle countdown
  useEffect(() => {
    if (!isOpen || !order) return;
    
    // Start countdown
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000); // Update every second
    
    // Check payment status every 15 seconds
    checkIntervalRef.current = setInterval(() => {
      if (status !== "success" && status !== "failed") {
        checkPaymentStatus();
      }
    }, 15000);
    
    return () => {
      clearInterval(countdownInterval);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [isOpen, order, status]);
  
  // Check payment status with backend
  const checkPaymentStatus = async () => {
    if (!order || isCheckingStatus) return;
    
    setIsCheckingStatus(true);
    
    try {
      console.log("Checking payment status for order:", order.orderId);
      const response = await fetch("/api/payment/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.orderId }),
      });
      
      const data = await response.json();
      console.log("Payment check response:", data);
      
      if (data.success) {
        if (data.status === "success") {
          setStatus("success");
          // Clear any running interval
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
          }
          onPaymentSuccess && onPaymentSuccess();
        } else if (data.status === "failed" || data.status === "expired") {
          setStatus("failed");
          setErrorMessage(data.message || "Payment failed or expired");
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
          }
          onPaymentError && onPaymentError(data.message || "Payment failed or expired");
        }
      } else {
        console.error("Payment check returned unsuccessful:", data);
      }
    } catch (error) {
      console.error("Error checking payment:", error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => status !== "pending" && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl border border-gray-200 shadow-xl p-6 md:p-8 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {status === "success" ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaCheckCircle className="text-green-500 text-4xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Payment Successful!</h2>
                <p className="text-gray-600 mb-6">
                  Thank you for your purchase. We will contact you within 1x24 hours to discuss your project details.
                </p>
                <div className="bg-gray-50 rounded-lg p-5 mb-6 text-left border border-gray-100">
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-semibold text-gray-800">{order?.orderId}</span>
                  </div>
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-semibold text-gray-800">
                      {order?.serviceType === "portfolio" ? "Portfolio Website" : 
                       order?.serviceType === "landing" ? "Landing Page" : 
                       "Custom Web Creation"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold text-[#5E81F4]">{formatPrice(order?.price)}</span>
                  </div>
                </div>
                <motion.button
                  onClick={onClose}
                  className="w-full py-3.5 bg-[#5E81F4] text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Close
                </motion.button>
              </div>
            ) : status === "failed" ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaExclamationTriangle className="text-red-500 text-4xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Payment Failed</h2>
                <p className="text-gray-600 mb-6">
                  {errorMessage || "Something went wrong with your payment. Please try again."}
                </p>
                <motion.button
                  onClick={onClose}
                  className="w-full py-3.5 bg-[#5E81F4] text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Close
                </motion.button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-4">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FaQrcode className="text-[#5E81F4]" />
                    Scan QR Code to Pay
                  </h2>
                  <button onClick={onClose} className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                    <FaTimes />
                  </button>
                </div>
                
                <div className="bg-[#FFECB3] rounded-lg p-2.5 mb-6 flex items-center">
                  <div className="w-1.5 h-12 bg-[#FF9800] rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium text-[#E65100]">Payment will expire in:</p>
                    <p className="text-[#E65100] text-xl font-bold">{formatTime(countdown)}</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6 overflow-hidden">
                  <div className="bg-[#5E81F4]/5 p-4 border-b border-gray-100">
                    <h3 className="font-medium text-gray-700">Scan with your payment app</h3>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex flex-col items-center">
                      <div className="mb-5 p-4 border-2 border-[#5E81F4]/20 rounded-lg flex items-center justify-center min-h-[220px] w-full bg-white">
                        {qrImage ? (
                          <img 
                            src={qrImage} 
                            alt="Payment QR Code" 
                            className="w-full max-w-[200px] h-auto"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <FaSpinner className="animate-spin text-4xl mb-3 text-[#5E81F4]" />
                            <span className="text-gray-500">Loading QR Code...</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3 font-medium">Supported payment methods:</p>
                      <div className="flex gap-3 mb-4 flex-wrap justify-center">
                        <div className="px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700">GoPay</div>
                        <div className="px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700">ShopeePay</div>
                        <div className="px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700">OVO</div>
                        <div className="px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700">DANA</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 p-4 bg-gray-50">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-mono text-sm font-medium text-gray-800">{order?.orderId}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Service:</span>
                      <span className="font-medium text-gray-800">
                        {order?.serviceType === "portfolio" ? "Portfolio Website" : 
                         order?.serviceType === "landing" ? "Landing Page" : 
                         "Custom Web Creation"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-bold text-[#5E81F4]">{formatPrice(order?.price)}</span>
                    </div>
                  </div>
                </div>
                
                <motion.button
                  onClick={checkPaymentStatus}
                  disabled={isCheckingStatus}
                  className={`w-full py-3.5 ${isCheckingStatus ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#5E81F4] hover:bg-[#4a6bcd]'} text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm`}
                  whileHover={{ scale: isCheckingStatus ? 1 : 1.02 }}
                  whileTap={{ scale: isCheckingStatus ? 1 : 0.98 }}
                >
                  {isCheckingStatus ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      <span>Checking payment status...</span>
                    </>
                  ) : (
                    <span>I've completed the payment</span>
                  )}
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}