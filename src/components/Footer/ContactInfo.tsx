import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail } from 'lucide-react';

const contactInfo = [
  {
    icon: <MapPin size={20} />,
    text: 'Rua Rio Pardo, 100 cj 205 - Esteio - RS',
  },
  {
    icon: <Phone size={20} />,
    text: '51 98526-0606',
    href: 'tel:+5551985260606',
  },
  {
    icon: <Mail size={20} />,
    text: 'jonas@conexi9.com.br',
    href: 'mailto:jonas@conexi9.com.br',
  },
];

const ContactInfo = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="flex flex-wrap gap-8 justify-center items-center text-gray-300"
    >
      {contactInfo.map((info, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2"
        >
          {info.href ? (
            <a
              href={info.href}
              className="flex items-center gap-2 hover:text-emerald-400 transition-colors duration-200"
            >
              {info.icon}
              <span>{info.text}</span>
            </a>
          ) : (
            <>
              {info.icon}
              <span>{info.text}</span>
            </>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ContactInfo;