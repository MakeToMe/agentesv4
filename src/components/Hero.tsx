import React, { useState } from 'react';
import useAuthModal from '../hooks/useAuthModal';
import ContactFormModal from './ContactFormModal';

const Hero = () => {
  const { openModal } = useAuthModal();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#111827] via-[#1F2937]/50 to-[#047857]/50 opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,0,0,0),rgba(0,0,0,0.5))]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* Text Content */}
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">Transforme seu Negócio com</span>
            <span className="text-emerald-500"> Inteligência Artificial</span>
          </h1>
          <p 
            className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto text-gray-300"
          >
            Soluções inovadoras que impulsionam a eficiência e o crescimento da sua empresa
          </p>

          {/* Video */}
          <div className="max-w-3xl mx-auto mb-8 rounded-xl overflow-hidden shadow-2xl">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full aspect-video object-cover"
            >
              <source src="https://newapi.conexcondo.com.br/site/Transforme%20sua%20gest%C3%A3o%20com%20ConexCondo.mp4" type="video/mp4" />
            </video>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => openModal('signup')}
              className="px-8 py-3 rounded-full transition-colors duration-200 text-lg font-semibold bg-emerald-500 text-white hover:bg-emerald-600"
            >
              Começar Agora
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-3 rounded-full transition-colors duration-200 text-lg font-semibold backdrop-blur-sm bg-gray-700 text-white hover:bg-gray-600"
            >
              Saiba Mais
            </button>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      <ContactFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </section>
  );
};

export default Hero;