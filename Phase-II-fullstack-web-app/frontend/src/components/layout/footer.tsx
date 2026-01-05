"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckSquare,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * @spec: Landing Page Footer Component
 * @description: Footer with navigation links, newsletter signup, and social links
 * @feature: FR-003 - Task viewing functionality
 */

export interface FooterProps {
  className?: string;
}

/**
 * Footer - Landing page footer with navigation and social links
 *
 * Features:
 * - Multi-column layout
 * - Newsletter subscription
 * - Social media links
 * - Copyright notice
 * - Framer Motion animations
 */
export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "Roadmap", href: "#roadmap" },
        { label: "Changelog", href: "#changelog" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "#about" },
        { label: "Blog", href: "#blog" },
        { label: "Careers", href: "#careers" },
        { label: "Contact", href: "#contact" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "#docs" },
        { label: "Help Center", href: "#help" },
        { label: "Community", href: "#community" },
        { label: "Status", href: "#status" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy", href: "#privacy" },
        { label: "Terms", href: "#terms" },
        { label: "Security", href: "#security" },
        { label: "Cookies", href: "#cookies" },
      ],
    },
  ];

  const socialLinks = [
    {
      name: "GitHub",
      icon: Github,
      href: "https://github.com",
      color: "hover:bg-gray-900",
    },
    {
      name: "Twitter",
      icon: Twitter,
      href: "https://twitter.com",
      color: "hover:bg-sky-500",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: "https://linkedin.com",
      color: "hover:bg-blue-600",
    },
    {
      name: "Email",
      icon: Mail,
      href: "mailto:hello@todomodern.com",
      color: "hover:bg-coral-500",
    },
  ];

  return (
    <footer
      className={cn(
        "bg-gray-900 text-gray-300",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2 mb-4"
            >
              <motion.div
                whileHover={{ rotate: 5, scale: 1.05 }}
                className="w-10 h-10 bg-gradient-to-br from-coral-500 to-coral-600 rounded-lg flex items-center justify-center shadow-lg"
              >
                <CheckSquare className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-xl font-bold text-white">
                Todo Modern
              </span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              Organize your life, achieve your goals. The modern task management
              app for productive people.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center transition-colors",
                      social.color
                    )}
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Navigation Columns */}
          {footerSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-coral-400 transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 pt-8 mb-8"
        >
          <div className="max-w-md">
            <h3 className="text-lg font-semibold text-white mb-2">
              Stay updated
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Get the latest features and updates delivered to your inbox.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Handle newsletter signup
              }}
              className="flex gap-2"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                required
              />
              <Button
                type="submit"
                className="bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm flex items-center gap-1">
            © {currentYear} Todo Modern. Made with{" "}
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Heart className="w-4 h-4 text-coral-500 fill-current" />
            </motion.span>{" "}
            for productive people.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="#privacy" className="hover:text-coral-400 transition-colors">
              Privacy
            </Link>
            <Link href="#terms" className="hover:text-coral-400 transition-colors">
              Terms
            </Link>
            <Link href="#cookies" className="hover:text-coral-400 transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * Minimal footer for auth pages
 */
export function MinimalFooter({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "bg-white border-t border-gray-200 py-6",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          <p className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-coral-500" />
            © {currentYear} Todo Modern. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#privacy" className="hover:text-coral-600 transition-colors">
              Privacy
            </Link>
            <Link href="#terms" className="hover:text-coral-600 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
