// @spec: Animation showcase page
// Demonstrates all animation utilities

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FadeIn, FadeInUp, FadeInStagger } from '@/components/animations/fade-in';
import { StaggerChildren, StaggerList, StaggerGrid } from '@/components/animations/stagger-children';
import { PageTransition, PageSlideRight, PageFade } from '@/components/animations/page-transition';
import { useScrollFadeIn } from '@/lib/animations/hooks';
import { animationPresets } from '@/lib/animations';

export default function AnimationShowcasePage() {
  // Sample data for demonstrations
  const sampleItems = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    title: `Item ${i + 1}`,
    description: `This is item ${i + 1} in the animated list`,
  }));

  const gridItems = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    title: `Card ${i + 1}`,
    content: `This is card ${i + 1} with some content to demonstrate the stagger grid animation.`,
  }));

  // Hook for scroll-triggered animation
  const { ref: heroRef, inView } = useScrollFadeIn({
    duration: 1,
    distance: 30,
  });

  return (
    <PageTransition key="animations-page" type="slide">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        {/* Hero Section */}
        <section ref={heroRef} className={`text-center py-20 ${inView ? 'animate' : 'hidden'}`}>
          <FadeIn>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Animation Showcase
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
              Explore the comprehensive animation system built with Framer Motion and GSAP
            </p>
          </FadeIn>
        </section>

        {/* FadeIn Components Section */}
        <section className="max-w-6xl mx-auto mb-20">
          <FadeInUp>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">FadeIn Components</h2>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FadeInUp delay={0.1} duration={0.6}>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-2">Card 1</h3>
                <p className="text-gray-600">This card fades in with a slight delay</p>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.2} duration={0.6}>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-2">Card 2</h3>
                <p className="text-gray-600">This card fades in with a medium delay</p>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.3} duration={0.6}>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-2">Card 3</h3>
                <p className="text-gray-600">This card fades in with a longer delay</p>
              </div>
            </FadeInUp>
          </div>
        </section>

        {/* StaggerList Section */}
        <section className="max-w-6xl mx-auto mb-20">
          <FadeInUp>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Stagger List</h2>
          </FadeInUp>

          <StaggerList
            items={sampleItems.slice(0, 6)}
            renderItem={(item) => (
              <div key={item.id} className="bg-white p-4 rounded-lg shadow mb-4">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            )}
            staggerDelay={0.1}
            duration={0.4}
          />
        </section>

        {/* StaggerGrid Section */}
        <section className="max-w-6xl mx-auto mb-20">
          <FadeInUp>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Stagger Grid</h2>
          </FadeInUp>

          <StaggerGrid
            items={gridItems}
            renderItem={(item) => (
              <div key={item.id} className="bg-white p-6 rounded-lg shadow-lg h-full">
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.content}</p>
              </div>
            )}
            columns={3}
            staggerDelay={0.05}
          />
        </section>

        {/* Page Transition Examples */}
        <section className="max-w-6xl mx-auto mb-20">
          <FadeInUp>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Page Transitions</h2>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PageSlideRight>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 rounded-lg text-white">
                <h3 className="text-2xl font-bold mb-4">Slide Right</h3>
                <p>This content slides in from the right when the page loads</p>
              </div>
            </PageSlideRight>

            <PageFade>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-8 rounded-lg text-white">
                <h3 className="text-2xl font-bold mb-4">Fade In</h3>
                <p>This content fades in smoothly when the page loads</p>
              </div>
            </PageFade>
          </div>
        </section>

        {/* Animation Presets Section */}
        <section className="max-w-6xl mx-auto mb-20">
          <FadeInUp>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Animation Presets</h2>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              className="bg-white p-6 rounded-lg shadow-lg cursor-pointer"
              whileHover={animationPresets.button.hover}
              whileTap={animationPresets.button.tap}
            >
              <h3 className="text-lg font-semibold mb-2">Hover & Tap</h3>
              <p className="text-gray-600">Hover or tap this card to see the effect</p>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-lg shadow-lg cursor-pointer"
              whileHover={animationPresets.card.hover}
              whileTap={animationPresets.card.tap}
            >
              <h3 className="text-lg font-semibold mb-2">Card Hover</h3>
              <p className="text-gray-600">Hover to see the elevation effect</p>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-lg shadow-lg"
              variants={animationPresets.loading.pulse}
              animate="animate"
            >
              <h3 className="text-lg font-semibold mb-2">Pulse</h3>
              <p className="text-gray-600">This card has a pulsing animation</p>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-lg shadow-lg flex items-center justify-center"
              variants={animationPresets.loading.spinner}
              animate="animate"
            >
              <h3 className="text-lg font-semibold mb-2">Rotating</h3>
              <div className="w-12 h-12 border-t-4 border-blue-500 rounded-full"></div>
            </motion.div>
          </div>
        </section>

        {/* Stagger Children with Different Types */}
        <section className="max-w-6xl mx-auto">
          <FadeInUp>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Animation Types</h2>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Slide Animation */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Slide Animation</h3>
              <StaggerChildren
                type="slide"
                direction="right"
                staggerDelay={0.1}
              >
                {sampleItems.slice(0, 4).map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-lg shadow mb-4">
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                ))}
              </StaggerChildren>
            </div>

            {/* Scale Animation */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Scale Animation</h3>
              <StaggerChildren
                type="scale"
                staggerDelay={0.1}
              >
                {sampleItems.slice(0, 4).map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-lg shadow mb-4">
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                ))}
              </StaggerChildren>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-12 text-gray-600">
          <FadeIn>
            <p>Animation System Built with Framer Motion & GSAP</p>
          </FadeIn>
        </footer>
      </div>
    </PageTransition>
  );
}