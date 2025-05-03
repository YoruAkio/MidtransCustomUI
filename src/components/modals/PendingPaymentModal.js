import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaExclamationCircle, FaCreditCard, FaTimesCircle } from 'react-icons/fa';

export default function PendingPaymentModal({ 
  isOpen,
  onClose,
  onCompletePayment,
  onCancelPayment,
  pendingOrder,
  isLoading
}) {
  // Get service name based on type
  const getServiceName = (type) => {
    switch (type) {
      case 'portfolio': return 'Portfolio Website';
      case 'landing': return 'Landing Page';
      case 'custom': return 'Custom Web Creation';
      default: return 'Service';
    }
  };
  
  // Format price to IDR
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl border border-gray-200 shadow-xl p-6 md:p-8 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaExclamationCircle className="text-[#FFA000]" />
                <span>Pending Payment</span>
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="bg-[#FFF8E1] border-l-4 border-[#FFA000] p-4 rounded-r-lg mb-5">
              <p className="text-[#5D4037] font-medium">
                You have a pending payment that needs to be completed or cancelled before making a new purchase.
              </p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6 overflow-hidden">
              <div className="bg-[#5E81F4]/5 p-4 border-b border-gray-100">
                <h3 className="font-medium text-gray-700">Order Details</h3>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between mb-3 items-center">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-mono text-sm font-medium text-gray-800 bg-gray-100 px-3 py-1 rounded-full">{pendingOrder?.orderId}</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium text-gray-800">{getServiceName(pendingOrder?.serviceType)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-bold text-[#5E81F4]">{formatPrice(pendingOrder?.price)}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.button
                onClick={onCompletePayment}
                disabled={isLoading}
                className="py-3.5 bg-[#5E81F4] text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                <FaCreditCard className="text-white" />
                <span>Complete Payment</span>
              </motion.button>
              
              <motion.button
                onClick={onCancelPayment}
                disabled={isLoading}
                className="py-3.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <>
                    <FaTimesCircle className="text-gray-500" />
                    <span>Cancel Payment</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}