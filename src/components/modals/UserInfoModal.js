import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaUser, FaEnvelope, FaShieldAlt } from 'react-icons/fa';

export default function UserInfoModal({ isOpen, onClose, onSubmit, isLoading }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) newErrors.name = 'Name is required';
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({ name, email });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl border border-gray-100 shadow-2xl p-6 md:p-8 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-7 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#5E81F4]/20 to-[#5E81F4]/5 flex items-center justify-center shadow-sm">
                  <FaShieldAlt className="text-[#5E81F4] text-lg" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Your Details</h2>
                  <p className="text-sm text-gray-500">For order confirmation and updates</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2.5 rounded-full transition-colors duration-200"
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaUser className="text-[#5E81F4]" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full py-3.5 pl-11 pr-4 bg-white text-gray-800 rounded-lg border ${
                      errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#5E81F4]/50'
                    } focus:outline-none focus:ring-2 focus:ring-[#5E81F4]/30 shadow-sm transition-all duration-200`}
                    placeholder="Your full name"
                  />
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span>
                    {errors.name}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaEnvelope className="text-[#5E81F4]" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full py-3.5 pl-11 pr-4 bg-white text-gray-800 rounded-lg border ${
                      errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#5E81F4]/50'
                    } focus:outline-none focus:ring-2 focus:ring-[#5E81F4]/30 shadow-sm transition-all duration-200`}
                    placeholder="your@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span>
                    {errors.email}
                  </p>
                )}
              </div>
              
              <div className="pt-4">
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-[#5E81F4] to-[#4F68C4] text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    'Continue to Payment'
                  )}
                </motion.button>
              </div>
              
              <p className="text-xs text-gray-500 text-center pt-3">
                Your information is secure and will only be used for this transaction.
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}