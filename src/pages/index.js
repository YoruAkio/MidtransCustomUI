import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Head from "next/head";
import { motion } from "framer-motion";
import {
  FaCode,
  FaLayerGroup,
  FaPaintBrush,
  FaLaptopCode,
  FaTelegramPlane,
  FaTwitter,
  FaEnvelope,
  FaArrowRight,
} from "react-icons/fa";
import UserInfoModal from "../components/modals/UserInfoModal";
import PaymentModal from "../components/modals/PaymentModal";
import PendingPaymentModal from "../components/modals/PendingPaymentModal";
import PaymentNotification from "../components/notifications/PaymentNotification";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [userInfoModalOpen, setUserInfoModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [pendingPaymentModalOpen, setPendingPaymentModalOpen] = useState(false);
  const [showPendingNotification, setShowPendingNotification] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [userData, setUserData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [paymentToken, setPaymentToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("pending");

  // Refs for scrolling to sections
  const servicesRef = useRef(null);
  const processRef = useRef(null);
  const contactRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load Midtrans Snap JS
  // useEffect(() => {
  //   const midtransScriptUrl = "https://app.sandbox.midtrans.com/snap/snap.js";
  //   const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

  //   let scriptTag = document.createElement("script");
  //   scriptTag.src = midtransScriptUrl;
  //   scriptTag.setAttribute("data-client-key", clientKey);

  //   document.body.appendChild(scriptTag);

  //   return () => {
  //     document.body.removeChild(scriptTag);
  //   };
  // }, []);

  // Check for pending order on load
  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserData(parsedUser);

      // Check for pending order
      checkPendingOrder(parsedUser);
    }
  }, []);

  // Check if user has pending order
  const checkPendingOrder = async (user) => {
    try {
      const response = await fetch("/api/payment/check-pending", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user._id }),
      });

      const data = await response.json();

      if (data.hasPendingOrder) {
        setOrderData(data.order);
        setShowPendingNotification(true);
        setPendingPayment(true);
      }
    } catch (error) {
      console.error("Error checking pending order:", error);
    }
  };

  // Scroll function
  const scrollToSection = (elementRef) => {
    window.scrollTo({
      top: elementRef.current.offsetTop - 80,
      behavior: "smooth",
    });
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const services = [
    {
      type: "portfolio",
      title: "Portfolio Website",
      icon: <FaLayerGroup className="text-[#FF7D6B]" />,
      description:
        "Professional and personalized portfolio websites to showcase your work and skills. Stand out from the crowd with a unique design.",
      price: "Starting from IDR 100K",
      basePrice: 100000,
      features: [
        "Responsive design",
        "Custom animations",
        "SEO optimization",
        "3 revisions included",
      ],
    },
    {
      type: "landing",
      title: "Landing Page",
      icon: <FaPaintBrush className="text-[#5E81F4]" />,
      description:
        "High-converting landing pages designed to captivate your audience and drive action. Perfect for product launches or campaigns.",
      price: "Starting from IDR 250K",
      basePrice: 250000,
      features: [
        "Call-to-action optimization",
        "Analytics integration",
        "A/B testing ready",
        "Fast load speeds",
      ],
    },
    {
      type: "custom",
      title: "Custom Web Creation",
      icon: <FaLaptopCode className="text-[#8C7AE6]" />,
      description:
        "Fully customized web applications tailored to your specific business needs with advanced functionalities and integrations.",
      price: "Starting from IDR 400K",
      basePrice: 400000,
      features: [
        "Full-stack development",
        "Custom features",
        "API integrations",
        "Comprehensive support",
      ],
    },
  ];

  // Handle purchase click
  const handlePurchase = (service) => {
    setSelectedService(service);

    // Check if we already have user data
    if (userData) {
      // Check if there's a pending order
      if (orderData && orderData.status === "pending") {
        setPendingPaymentModalOpen(true);
      } else {
        // Create new order
        createOrder(service.type);
      }
    } else {
      // Show user info modal
      setUserInfoModalOpen(true);
    }
  };

  // Handle user info submission
  const handleUserInfoSubmit = async (userInfo) => {
    setIsLoading(true);

    try {
      // Create or get user
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userInfo),
      });

      const data = await response.json();

      if (data.success) {
        setUserData(data.user);
        localStorage.setItem("userData", JSON.stringify(data.user));
        setUserInfoModalOpen(false);

        // Create order with the selected service
        createOrder(selectedService.type);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to submit user information. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Create order
  const createOrder = async (serviceType) => {
    if (!userData) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData._id,
          serviceType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setOrderData({
          ...data.order,
          price: data.order.price,
          qrCodeUrl: data.qrCodeUrl,
        });
        setPaymentModalOpen(true);
      } else if (data.pendingOrder) {
        setOrderData(data.pendingOrder);
        setPendingPaymentModalOpen(true);
      } else {
        alert(data.message || "Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Complete pending payment
  const handleCompletePayment = async () => {
    if (!orderData) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/payment/check-pending", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userData._id }),
      });

      const data = await response.json();

      if (response.ok && data.hasPendingOrder) {
        // Set orderId and update orderData with QR code URL
        setOrderData({
          ...data.order,
          price: data.order.price,
          qrCodeUrl: data.qrCodeUrl,
        });
        setPendingPaymentModalOpen(false);
        setShowPendingNotification(false);
        setPaymentModalOpen(true);
      } else {
        // No pending order or error
        setPendingPayment(false);
        setOrderData(null);
        alert("No pending payment found or payment expired");
      }
    } catch (error) {
      console.error("Error completing payment:", error);
      alert("Failed to complete payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel pending payment
  const handleCancelPayment = async () => {
    if (!userData || !orderData) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/payment/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData._id,
          orderId: orderData.orderId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOrderData(null);
        setPendingPaymentModalOpen(false);
        setShowPendingNotification(false);
        setPendingPayment(false);
        alert("Payment cancelled successfully");
      }
    } catch (error) {
      console.error("Error cancelling payment:", error);
      alert("Failed to cancel payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>YoruAkio | Web Development Services</title>
        <meta
          name="description"
          content="Professional web development services by YoruAkio. Creating stunning portfolio websites, landing pages, and custom web applications."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-[#F8F9FC] to-[#EEF1F8] text-[#333] font-sans">
        {/* Decorative elements */}
        <div className="fixed top-20 left-20 w-64 h-64 rounded-full bg-[#5E81F4]/10 filter blur-3xl hidden md:block" />
        <div className="fixed bottom-20 right-10 w-80 h-80 rounded-full bg-[#FF7D6B]/10 filter blur-3xl hidden md:block" />
        <div className="fixed top-40 right-10 w-40 h-40 rounded-full bg-[#8C7AE6]/10 filter blur-3xl hidden md:block" />

        {/* Header */}
        <motion.header
          className="sticky top-0 z-50 backdrop-blur-md bg-white/60 border-b border-white/20 px-6 py-4"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <FaCode className="text-[#5E81F4] text-2xl" />
              <span className="font-bold text-xl tracking-tight">YoruAkio</span>
            </motion.div>

            <nav className="hidden md:block">
              <ul className="flex gap-8 items-center">
                <motion.li
                  onClick={() => scrollToSection(servicesRef)}
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer font-medium hover:text-[#5E81F4]"
                >
                  Services
                </motion.li>
                <motion.li
                  onClick={() => scrollToSection(processRef)}
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer font-medium hover:text-[#5E81F4]"
                >
                  Process
                </motion.li>
                <motion.li
                  onClick={() => scrollToSection(contactRef)}
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer font-medium hover:text-[#5E81F4]"
                >
                  Contact
                </motion.li>
                <motion.li
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    onClick={() => scrollToSection(contactRef)}
                    className="px-5 py-2 bg-[#5E81F4] text-white rounded-full font-medium hover:shadow-lg transition duration-300"
                  >
                    Get Started
                  </button>
                </motion.li>
              </ul>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="p-2 rounded-lg bg-white/70 border border-white/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </motion.header>

        {/* Hero Section */}
        <section className="py-20 md:py-24 px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.span
                className="inline-block px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-white/20 shadow-sm text-[#5E81F4] font-medium mb-6"
                variants={fadeInUp}
              >
                Web Development Services
              </motion.span>

              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                variants={fadeInUp}
              >
                Transforming ideas into <br />
                <span className="text-[#5E81F4]">beautiful</span> digital
                experiences
              </motion.h1>

              <motion.p
                className="text-base md:text-lg text-[#666] max-w-2xl mx-auto mb-10"
                variants={fadeInUp}
              >
                Professional web development services focused on creating
                stunning, functional, and user-friendly websites that drive
                results.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                variants={fadeInUp}
              >
                <motion.button
                  onClick={() => scrollToSection(servicesRef)}
                  className="w-full sm:w-auto px-8 py-3 bg-[#5E81F4] text-white rounded-full font-medium flex items-center justify-center gap-2 hover:shadow-lg transition duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Services
                  <FaArrowRight />
                </motion.button>
                <motion.button
                  onClick={() => scrollToSection(contactRef)}
                  className="w-full sm:w-auto px-8 py-3 bg-white/50 backdrop-blur-md border border-white/20 rounded-full font-medium hover:bg-white/80 transition duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Contact Me
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Floating browser mockup */}
            <motion.div
              className="relative mx-auto max-w-4xl"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="rounded-xl overflow-hidden shadow-2xl border border-white/40 bg-white/40 backdrop-blur-lg">
                <div className="h-8 bg-white/80 border-b border-white/10 flex items-center gap-2 px-4">
                  <div className="w-3 h-3 rounded-full bg-[#FF7D6B]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#FFCB2F]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#5E81F4]"></div>
                </div>
                <div className="aspect-video relative">
                  <Image
                    src="https://images.unsplash.com/photo-1481487196290-c152efe083f5?q=80&w=1920&auto=format&fit=crop"
                    alt="Web design showcase"
                    layout="fill"
                    objectFit="cover"
                    className="opacity-90"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Services Section - Updated with onClick handlers */}
        <section
          ref={servicesRef}
          className="py-16 md:py-20 px-4 md:px-6"
          id="services"
        >
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-white/20 shadow-sm text-[#FF7D6B] font-medium mb-6">
                My Services
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What I Offer
              </h2>
              <p className="text-base md:text-lg text-[#666] max-w-2xl mx-auto">
                Choose from my range of web development services designed to
                help your business succeed online
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              initial="hidden"
              whileInView="visible"
              variants={staggerContainer}
              viewport={{ once: true }}
            >
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  className="bg-white/50 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                  variants={fadeInUp}
                  whileHover={{ y: -10 }}
                >
                  <div className="flex-grow">
                    <div className="w-14 h-14 rounded-xl bg-white/80 flex items-center justify-center mb-6">
                      <span className="text-2xl">{service.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                    <p className="text-[#666] mb-5">{service.description}</p>
                    <div className="text-lg font-bold text-[#5E81F4] mb-4">
                      {service.price}
                    </div>
                    <ul className="space-y-2 mb-8">
                      {service.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-sm text-[#666]"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5E81F4]"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <motion.button
                    onClick={() => handlePurchase(service)}
                    className="w-full py-3 bg-white/80 rounded-lg font-medium text-[#333] hover:bg-[#5E81F4] hover:text-white transition-all duration-300 mt-auto"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Purchase
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Process Section */}
        <section
          ref={processRef}
          className="py-16 md:py-20 px-4 md:px-6 relative"
          id="process"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[#5E81F4]/5"></div>
          <div className="max-w-6xl mx-auto relative">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-white/20 shadow-sm text-[#8C7AE6] font-medium mb-6">
                My Process
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How We Work Together
              </h2>
              <p className="text-base md:text-lg text-[#666] max-w-2xl mx-auto">
                A simple, efficient process to bring your vision to life
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[
                {
                  num: "01",
                  title: "Discovery",
                  desc: "Understanding your needs & goals",
                },
                {
                  num: "02",
                  title: "Design",
                  desc: "Creating the perfect visual experience",
                },
                {
                  num: "03",
                  title: "Development",
                  desc: "Building with clean, efficient code",
                },
                {
                  num: "04",
                  title: "Delivery",
                  desc: "Testing & launching your project",
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                >
                  <div className="text-5xl md:text-6xl font-bold text-[#5E81F4]/20 mb-4">
                    {step.num}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-[#666]">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section
          ref={contactRef}
          className="py-16 md:py-20 px-4 md:px-6"
          id="contact"
        >
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="bg-white/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 lg:p-12 border border-white/20 shadow-xl"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <div>
                  <span className="inline-block px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-white/20 shadow-sm text-[#FF7D6B] font-medium mb-6">
                    Let's Connect
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    Get in Touch
                  </h2>
                  <p className="text-base md:text-lg text-[#666] mb-8">
                    Ready to bring your web project to life? Reach out and let's
                    discuss how I can help transform your vision into reality.
                  </p>

                  <div className="space-y-4">
                    <motion.a
                      href="https://t.me/ethermite"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-md rounded-xl border border-white/20 hover:shadow-md transition-all"
                      whileHover={{ x: 5 }}
                    >
                      <div className="w-12 h-12 bg-[#0088cc]/10 rounded-full flex items-center justify-center text-[#0088cc]">
                        <FaTelegramPlane size={20} />
                      </div>
                      <div>
                        <div className="font-medium">Telegram</div>
                        <div className="text-[#666]">@ethermite</div>
                      </div>
                    </motion.a>

                    <motion.a
                      href="https://twitter.com/yoruakio"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-md rounded-xl border border-white/20 hover:shadow-md transition-all"
                      whileHover={{ x: 5 }}
                    >
                      <div className="w-12 h-12 bg-[#1DA1F2]/10 rounded-full flex items-center justify-center text-[#1DA1F2]">
                        <FaTwitter size={20} />
                      </div>
                      <div>
                        <div className="font-medium">Twitter</div>
                        <div className="text-[#666]">@yoruakio</div>
                      </div>
                    </motion.a>

                    <motion.a
                      href="mailto:yoruakio@proton.me"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-md rounded-xl border border-white/20 hover:shadow-md transition-all"
                      whileHover={{ x: 5 }}
                    >
                      <div className="w-12 h-12 bg-[#5E81F4]/10 rounded-full flex items-center justify-center text-[#5E81F4]">
                        <FaEnvelope size={20} />
                      </div>
                      <div>
                        <div className="font-medium">Email</div>
                        <div className="text-[#666]">yoruakio@proton.me</div>
                      </div>
                    </motion.a>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold mb-4">Send a Message</h3>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[#666]">
                        Name
                      </label>
                      <input
                        type="text"
                        className="w-full p-3 bg-white/70 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#5E81F4]/50"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[#666]">
                        Email
                      </label>
                      <input
                        type="email"
                        className="w-full p-3 bg-white/70 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#5E81F4]/50"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[#666]">
                        Project Details
                      </label>
                      <textarea
                        className="w-full p-3 bg-white/70 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#5E81F4]/50 min-h-[120px]"
                        placeholder="Tell me about your project..."
                      ></textarea>
                    </div>
                    <motion.button
                      type="submit"
                      className="w-full py-3 bg-[#5E81F4] text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Send Message
                    </motion.button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 md:py-10 px-4 md:px-6 border-t border-white/20">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <FaCode className="text-[#5E81F4] text-xl" />
              <span className="font-bold text-lg">YoruAkio</span>
            </div>

            <p className="text-[#666] text-center md:text-left text-sm md:text-base">
              &copy; {new Date().getFullYear()} YoruAkio. All rights reserved.
              <br className="md:hidden" /> Building beautiful web experiences
              with JavaScript.
            </p>

            <div className="flex gap-4 mt-4 md:mt-0">
              <motion.a
                href="https://t.me/ethermite"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center text-[#5E81F4] border border-white/20"
                whileHover={{ y: -5 }}
              >
                <FaTelegramPlane />
              </motion.a>
              <motion.a
                href="https://twitter.com/yoruakio"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center text-[#5E81F4] border border-white/20"
                whileHover={{ y: -5 }}
              >
                <FaTwitter />
              </motion.a>
              <motion.a
                href="mailto:yoruakio@proton.me"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center text-[#5E81F4] border border-white/20"
                whileHover={{ y: -5 }}
              >
                <FaEnvelope />
              </motion.a>
            </div>
          </div>
        </footer>
      </div>

      {/* User Info Modal */}
      <UserInfoModal
        isOpen={userInfoModalOpen}
        onClose={() => setUserInfoModalOpen(false)}
        onSubmit={handleUserInfoSubmit}
        isLoading={isLoading}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={(wasSuccessful) => {
          setPaymentModalOpen(false);
          if (wasSuccessful) {
            setOrderData(null);
            setPendingPayment(false);
            setShowPendingNotification(false);
            setPaymentStatus("idle");
          }
        }}
        order={orderData}
        onPaymentProcessing={() => setPaymentStatus("processing")}
        onPaymentSuccess={() => {
          setPaymentStatus("success");
        }}
        onPaymentError={(message) => {
          setPaymentStatus("error");
          console.error(message);
        }}
      />

      {/* Pending Payment Modal */}
      <PendingPaymentModal
        isOpen={pendingPaymentModalOpen}
        onClose={() => setPendingPaymentModalOpen(false)}
        onCompletePayment={handleCompletePayment}
        onCancelPayment={handleCancelPayment}
        pendingOrder={orderData}
        isLoading={isLoading}
      />

      {/* Pending Payment Notification */}
      <PaymentNotification
        show={showPendingNotification}
        onClose={() => setShowPendingNotification(false)}
        onCompletePayment={() => {
          setShowPendingNotification(false);
          handleCompletePayment();
        }}
        pendingOrder={orderData}
      />
    </>
  );
}
