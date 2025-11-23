// Animation utility functions for scroll-triggered animations

export interface AnimationOptions {
  threshold?: number;
  rootMargin?: string;
  delay?: number;
  duration?: number;
}

/**
 * Initialize scroll animations using Intersection Observer
 */
export const initScrollAnimations = (options: AnimationOptions = {}): void => {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    delay = 0
  } = options;

  // Check if Intersection Observer is supported
  if (!('IntersectionObserver' in window)) {
    // Fallback: Add animations immediately
    const elements = document.querySelectorAll('.animate-on-scroll, .scroll-animate');
    elements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add('animated', 'visible');
      }, delay + (index * 100));
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('animated', 'visible');
          }, delay + (index * 100));
        }
      });
    },
    {
      threshold,
      rootMargin
    }
  );

  // Observe elements
  const elements = document.querySelectorAll('.animate-on-scroll, .scroll-animate');
  elements.forEach(element => {
    observer.observe(element);
  });
};

/**
 * Initialize stagger animations for lists and grids
 */
export const initStaggerAnimations = (containerSelector: string, itemSelector: string): void => {
  const containers = document.querySelectorAll(containerSelector);
  
  containers.forEach(container => {
    const items = container.querySelectorAll(itemSelector);
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            items.forEach((item, index) => {
              setTimeout(() => {
                item.classList.add('stagger-item');
                item.style.animationDelay = `${index * 100}ms`;
              }, 100);
            });
            observer.unobserve(container);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );
    
    observer.observe(container);
  });
};

/**
 * Initialize parallax effects
 */
export const initParallaxEffects = (): void => {
  const parallaxElements = document.querySelectorAll('.parallax-slow, .parallax-medium, .parallax-fast');
  
  if (parallaxElements.length === 0) return;
  
  const handleScroll = () => {
    const scrolled = window.pageYOffset;
    
    parallaxElements.forEach(element => {
      const speed = element.classList.contains('parallax-slow') ? 0.5 :
                   element.classList.contains('parallax-medium') ? 0.7 :
                   element.classList.contains('parallax-fast') ? 0.9 : 0.5;
      
      const yPos = -(scrolled * speed);
      (element as HTMLElement).style.transform = `translateY(${yPos}px)`;
    });
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
};

/**
 * Add smooth scroll behavior
 */
export const initSmoothScroll = (): void => {
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
};

/**
 * Initialize all animations
 */
export const initAnimations = (): void => {
  // Initialize scroll animations
  initScrollAnimations();
  
  // Initialize stagger animations
  initStaggerAnimations('.features-grid', '.feature-item');
  initStaggerAnimations('.testimonials-grid', '.testimonial-item');
  initStaggerAnimations('.benefits-grid', '.benefit-item');
  
  // Initialize parallax effects
  initParallaxEffects();
  
  // Initialize smooth scroll
  initSmoothScroll();
  
  // Add initial animations to hero section
  const heroElements = document.querySelectorAll('.hero-animate');
  heroElements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.add('fade-in', 'visible');
    }, index * 200);
  });
};

/**
 * Utility function to add animation classes
 */
export const addAnimation = (
  element: HTMLElement,
  animationClass: string,
  delay: number = 0
): void => {
  setTimeout(() => {
    element.classList.add(animationClass);
  }, delay);
};

/**
 * Utility function to remove animation classes
 */
export const removeAnimation = (element: HTMLElement, animationClass: string): void => {
  element.classList.remove(animationClass);
};

/**
 * Check if animations are enabled (respects reduced motion preference)
 */
export const areAnimationsEnabled = (): boolean => {
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Create a custom intersection observer
 */
export const createObserver = (
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    ...options
  };
  
  return new IntersectionObserver(callback, defaultOptions);
};

// Auto-initialize animations when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimations);
  } else {
    // DOM is already loaded
    initAnimations();
  }
}