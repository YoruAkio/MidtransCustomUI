import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationCircle, FaTimes, FaMoneyBill } from 'react-icons/fa';

export default function PaymentNotification({ 
  show, 
  onClose, 
  onCompletePayment,
  pendingOrder 
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
  
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed bottom-4 right-4 z-50 w-80"
        >
          <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-xl border border-yellow-200 overflow-hidden">
            <div className="bg-yellow-500/10 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2 font-medium text-yellow-700">
                <FaExclamationCircle />
                <span>Pending Payment</span>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-4">
              <p className="text-gray-600 text-sm mb-3">
                You have a pending payment for: 
                <span className="font-medium block mt-1">{getServiceName(pendingOrder?.serviceType)}</span>
              </p>
              
              <motion.button
                onClick={onCompletePayment}
                className="w-full py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors flex items-center justify-center gap-1.5"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaMoneyBill className="text-xs" />
                <span>Complete Payment</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}