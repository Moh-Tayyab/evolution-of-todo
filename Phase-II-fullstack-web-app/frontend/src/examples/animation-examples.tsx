/**
 * @spec: Example usage patterns for the animation system
 * This file demonstrates how to use various animation components and utilities
 */

'use client';

import React from 'react';
import {
  FadeIn,
  FadeInUp,
  FadeInStagger,
  FadeInWithGSAP,
  AnimatedContainer,
} from '@/components/animations/fade-in';
import {
  StaggerChildren,
  StaggerList,
  StaggerGrid,
} from '@/components/animations/stagger-children';
import {
  PageTransition,
  PageSlideRight,
  PageFade,
  withRouteTransition,
} from '@/components/animations/page-transition';
import { useGSAPAnimation, useScrollFadeIn, useTypingAnimation } from '@/lib/animations/hooks';
import { animationPresets } from '@/lib/animations';

// Example 1: Basic FadeIn usage
export function BasicFadeInExample() {
  return (
    <div className="space-y-4">
      <FadeIn>
        <h1 className="text-3xl font-bold">Basic Fade In</h1>
        <p>This element fades in with default settings</p>
      </FadeIn>

      <FadeIn duration={0.8} distance={30}>
        <div className="bg-blue-100 p-4 rounded">
          <p>Custom duration and distance</p>
        </div>
      </FadeIn>

      <FadeIn delay={0.3} className="text-green-600">
        <p>Custom delay and className</p>
      </FadeIn>
    </div>
  );
}

// Example 2: Stagger list animation
export function StaggerListExample() {
  const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];

  return (
    <StaggerList
      items={items}
      renderItem={(item, index) => (
        <div
          key={index}
          className="bg-gray-100 p-4 rounded mb-2 transform transition-all duration-300"
        >
          <h3 className="font-semibold">{item}</h3>
          <p className="text-sm text-gray-600">This item has animation</p>
        </div>
      )}
      staggerDelay={0.15}
      duration={0.5}
      type="slide"
    />
  );
}

// Example 3: Page transition with HOC
const UserProfilePage = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-4">User Profile</h1>
    <p>This page has a fade transition applied</p>
  </div>
);

export const UserProfileWithTransition = withRouteTransition(UserProfilePage, {
  type: 'fade',
  duration: 0.5,
});

// Example 4: GSAP animation hook
export function GSAPAnimationExample() {
  const ref = useGSAPAnimation((gsap, element) => {
    // GSAP animation code
    gsap.to(element, {
      rotation: 360,
      duration: 2,
      repeat: -1,
      ease: 'linear',
    });
  });

  return (
    <div ref={ref} className="w-20 h-20 bg-purple-500 rounded-lg mx-auto" />
  );
}

// Example 5: Scroll-triggered animation
export function ScrollAnimationExample() {
  const heroRef = useScrollFadeIn({
    duration: 1,
    distance: 50,
    delay: 0.2,
  });

  const cardRefs = useScrollFadeIn({
    duration: 0.6,
    distance: 30,
    threshold: 0.1,
  });

  return (
    <div className="space-y-16">
      <section ref={heroRef} className="text-center py-20">
        <h1 className="text-5xl font-bold mb-4">Scroll to See Magic</h1>
        <p className="text-xl text-gray-600">This content animates when it comes into view</p>
      </section>

      <section ref={cardRefs} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Card {i}</h3>
            <p className="text-gray-600">This card animates when scrolled into view</p>
          </div>
        ))}
      </section>
    </div>
  );
}

// Example 6: Complex animation preset usage
export function AnimationPresetExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <motion.div
        className="bg-gradient-to-br from-blue-400 to-blue-600 p-8 rounded-lg text-white cursor-pointer"
        variants={animationPresets.modal.content}
        initial="initial"
        animate="animate"
        whileHover={animationPresets.button.hover}
        whileTap={animationPresets.button.tap}
      >
        <h3 className="text-2xl font-bold mb-4">Interactive Card</h3>
        <p>Hover and tap to see animations</p>
      </motion.div>

      <motion.div
        className="bg-gradient-to-br from-green-400 to-green-600 p-8 rounded-lg text-white"
        variants={animationPresets.loading.spinner}
        animate="animate"
      >
        <h3 className="text-2xl font-bold mb-4">Loading Spinner</h3>
        <p>Auto-rotating animation</p>
      </motion.div>
    </div>
  );
}

// Example 7: Grid layout with stagger
export function StaggerGridExample() {
  const products = Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    price: `$${(Math.random() * 100).toFixed(2)}`,
    description: `This is product ${i + 1} description`,
  }));

  return (
    <StaggerGrid
      items={products}
      renderItem={(product) => (
        <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-4xl">📦</span>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{product.description}</p>
            <p className="text-blue-600 font-bold">{product.price}</p>
          </div>
        </div>
      )}
      columns={3}
      staggerDelay={0.08}
    />
  );
}

// Example 8: Mixed animation types
export function MixedAnimationExample() {
  const tabs = ['Home', 'About', 'Services', 'Contact'];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tab navigation with stagger */}
      <StaggerChildren
        type="slide"
        direction="right"
        staggerDelay={0.1}
        className="mb-8"
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            className="px-6 py-3 mr-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            {tab}
          </button>
        ))}
      </StaggerChildren>

      {/* Content with fade in */}
      <FadeInStagger>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Content Area</h2>
          <p className="text-gray-600">
            This content fades in with staggered animation for each section.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
          <h3 className="text-xl font-semibold mb-2">Another Section</h3>
          <p className="text-gray-600">
            Each section animates sequentially for a polished user experience.
          </p>
        </div>
      </FadeInStagger>
    </div>
  );
}

// Example 9: Page-specific transitions
export function PageTransitionExample() {
  return (
    <div className="space-y-8">
      <PageSlideRight>
        <div className="bg-blue-50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Slide Right Section</h2>
          <p>This content slides in from the right.</p>
        </div>
      </PageSlideRight>

      <PageFade>
        <div className="bg-green-50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Fade In Section</h2>
          <p>This content fades in smoothly.</p>
        </div>
      </PageFade>

      <PageTransition type="scale" duration={0.8}>
        <div className="bg-purple-50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Scale Section</h2>
          <p>This content scales in with a smooth transition.</p>
        </div>
      </PageTransition>
    </div>
  );
}

// Example 10: Complete page with all animations
export function CompleteAnimationExample() {
  const heroRef = useScrollFadeIn({ duration: 1, distance: 40 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero section */}
      <section ref={heroRef} className="text-center py-20">
        <FadeIn>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Complete Animation Demo
          </h1>
        </FadeIn>

        <FadeIn delay={0.2} distance={30}>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            This page demonstrates all the animation utilities working together
          </p>
        </FadeIn>
      </section>

      {/* Feature grid */}
      <section className="max-w-6xl mx-auto px-8 py-16">
        <StaggerGrid
          items={Array.from({ length: 6 }, (_, i) => ({
            id: i + 1,
            title: `Feature ${i + 1}`,
            description: `This is feature ${i + 1} with animated reveal`,
          }))}
          renderItem={(item) => (
            <FadeInUp duration={0.6}>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </FadeInUp>
          )}
          columns={3}
        />
      </section>

      {/* CTA section */}
      <section className="text-center py-16 bg-blue-600 text-white">
        <FadeInUp>
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8">Join thousands of users today</p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Sign Up Now
          </button>
        </FadeInUp>
      </section>
    </div>
  );
}