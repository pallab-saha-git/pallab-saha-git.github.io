// Three.js background animation setup
document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('bg-canvas');
  
  // Check if Three.js is loaded and device capabilities before initializing
  if (typeof THREE === 'undefined') {
    console.warn('Three.js not loaded, skipping 3D background');
    return;
  }
  
  // Skip 3D background on low-performance devices
  const isLowPerformanceDevice = () => {
    return (
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      navigator.hardwareConcurrency < 4 ||
      window.innerWidth < 768
    );
  };
  
  if (isLowPerformanceDevice()) {
    console.log('Low performance device detected, skipping 3D background');
    canvas.style.display = 'none';
    return;
  }
  
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ 
    canvas, 
    alpha: true, 
    antialias: false, // Disable for performance
    powerPreference: "low-power" // Prefer integrated GPU
  });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Cap pixel ratio for performance
  
  // Create particles with reduced count for better performance
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = window.innerWidth < 768 ? 300 : 800; // Fewer particles on mobile
  
  const posArray = new Float32Array(particlesCount * 3);
  for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 15;
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.02,
    color: 0x00f7ff,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });
  
  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh);
  
  camera.position.z = 5;
  
  // Animation loop with performance optimization
  let animationId;
  function animate() {
    animationId = requestAnimationFrame(animate);
    
    particlesMesh.rotation.y += 0.0005;
    particlesMesh.rotation.x -= 0.0002;
    
    renderer.render(scene, camera);
  }
  
  // Only start animation if page is visible
  if (!document.hidden) {
    animate();
  }
  
  // Pause animation when tab is not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    } else {
      animate();
    }
  });
  
  // Optimized resize handler with debouncing
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, 100);
  });

  // Scroll handling code
  const scrollContainer = document.querySelector('.scroll-container');
  const dots = document.querySelectorAll('.dot-nav ul li a.dot');
  const sections = document.querySelectorAll('.section');
  
  // Cache section positions to avoid repeated DOM reads
  let sectionPositions = [];
  
  function updateSectionPositions() {
    sectionPositions = Array.from(sections).map(section => ({
      element: section,
      top: section.offsetTop,
      height: section.offsetHeight
    }));
  }
  
  // Initial calculation
  updateSectionPositions();
  
  // Update positions on resize
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateSectionPositions();
    }, 100);
  });
  
  // Add section observers for animations
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        entry.target.classList.add('appear');
        
        // Update dot navigation when section comes into view
        const sectionId = entry.target.id;
        const activeDotIndex = Array.from(dots).findIndex(dot => dot.getAttribute('href') === '#' + sectionId);
        if (activeDotIndex !== -1) {
          setActiveDot(activeDotIndex);
        }
      } else {
        entry.target.classList.remove('in-view');
      }
    });
  }, { threshold: 0.3 });
  
  sections.forEach(section => {
    sectionObserver.observe(section);
  });

  function setActiveDot(index) {
    dots.forEach(dot => dot.classList.remove('active'));
    if (dots[index]) dots[index].classList.add('active');
  }

  // Optimized scroll handling with throttling
  let isScrolling = false;
  let scrollTimeout;
  
  function handleWheel(e) {
    if (isScrolling) return;
    e.preventDefault();

    const delta = e.deltaY;
    const currentScroll = scrollContainer.scrollTop;
    const viewportHeight = window.innerHeight;

    // Find current section index using cached positions
    let currentIndex = sectionPositions.findIndex((section, idx) => {
      return currentScroll >= section.top - viewportHeight / 2 && currentScroll < section.top + viewportHeight / 2;
    });

    if (delta > 0 && currentIndex < sectionPositions.length - 1) {
      currentIndex++;
    } else if (delta < 0 && currentIndex > 0) {
      currentIndex--;
    }

    if (currentIndex >= 0 && currentIndex < sectionPositions.length) {
      isScrolling = true;
      scrollContainer.scrollTo({
        top: sectionPositions[currentIndex].top,
        behavior: 'smooth',
      });

      setActiveDot(currentIndex);

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 700);
    }
  }
  
  scrollContainer.addEventListener('wheel', handleWheel, { passive: false });

  // Dot navigation click
  dots.forEach((dot, idx) => {
    dot.addEventListener('click', e => {
      e.preventDefault();
      scrollContainer.scrollTo({
        top: sections[idx].offsetTop,
        behavior: 'smooth'
      });
      setActiveDot(idx);
    });
  });

  // Set active dot on scroll (optimized with cached positions)
  let scrollThrottleTimeout;
  scrollContainer.addEventListener('scroll', () => {
    if (isScrolling) return; // Don't interfere with programmatic scrolling
    
    // Throttle scroll events for better performance
    if (scrollThrottleTimeout) return;
    scrollThrottleTimeout = setTimeout(() => {
      scrollThrottleTimeout = null;
      
      const scrollPos = scrollContainer.scrollTop;
      const viewportHeight = window.innerHeight;
      
      // Find the section that's most visible using cached positions
      let maxVisibleSection = 0;
      let maxVisibleAmount = 0;
      
      sectionPositions.forEach((section, idx) => {
        // Calculate how much of the section is visible
        const visibleTop = Math.max(scrollPos, section.top);
        const visibleBottom = Math.min(scrollPos + viewportHeight, section.top + section.height);
        const visibleAmount = Math.max(0, visibleBottom - visibleTop);
        
        if (visibleAmount > maxVisibleAmount) {
          maxVisibleAmount = visibleAmount;
          maxVisibleSection = idx;
        }
      });
      
      setActiveDot(maxVisibleSection);
    }, 16); // ~60fps throttling
  });
  
  // Optimized mouse move parallax effect with RAF
  let mouseMoveRAF;
  let mouseData = { x: 0, y: 0 };
  
  document.addEventListener('mousemove', (e) => {
    mouseData.x = e.clientX / window.innerWidth - 0.5;
    mouseData.y = e.clientY / window.innerHeight - 0.5;
    
    if (mouseMoveRAF) return;
    
    mouseMoveRAF = requestAnimationFrame(() => {
      mouseMoveRAF = null;
      
      const homeSection = document.getElementById('home');
      if(!homeSection || !homeSection.classList.contains('in-view')) return;
      
      const profileImg = document.querySelector('.profile-img-container');
      const nameDisplay = document.querySelector('.name-display');
      const logos = document.querySelector('.logos');
      
      // Use transform3d for better performance
      if(profileImg) profileImg.style.transform = `translate3d(${mouseData.x * 20}px, ${mouseData.y * 20}px, 0)`;
      if(nameDisplay) nameDisplay.style.transform = `translate3d(${mouseData.x * -15}px, ${mouseData.y * -15}px, 0)`;
      if(logos) logos.style.transform = `translate3d(${mouseData.x * 10}px, ${mouseData.y * 10}px, 0)`;
    });
  });
  
  // Optimized tilt effect for cards with cached rects
  const cards = document.querySelectorAll('.glass-card');
  const cardRects = new Map();
  
  // Cache card rectangles initially and on resize
  function updateCardRects() {
    cards.forEach(card => {
      cardRects.set(card, card.getBoundingClientRect());
    });
  }
  
  updateCardRects();
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateCardRects, 100);
  });
  
  cards.forEach(card => {
    let cardMoveRAF;
    
    card.addEventListener('mousemove', (e) => {
      if (cardMoveRAF) return;
      
      cardMoveRAF = requestAnimationFrame(() => {
        cardMoveRAF = null;
        
        const rect = cardRects.get(card);
        if (!rect) return;
        
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const percentX = (x - centerX) / centerX;
        const percentY = (y - centerY) / centerY;
        
        // Reduced rotation values for a more subtle, upright effect
        // Changed from *2 and *-2 to much smaller values to prevent "laid back" appearance
        card.style.transform = `perspective(1000px) rotateY(${percentX * 0.5}deg) rotateX(${percentY * -0.3}deg) translateZ(5px)`;
      });
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0)';
    });
  });

  // Tab functionality
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons and contents
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked button and corresponding content
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
  
  // Initialize active dot
  setActiveDot(0);
  
  // Typed.js initialization for the typing animation
  if (document.querySelector('.typed')) {
    let typed_strings = document.querySelector('.typed').getAttribute('data-typed-items');
    typed_strings = typed_strings.split(',');
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000,
      showCursor: true,
      cursorChar: '|',
      autoInsertCss: true,
    });
  }
  
  // Name glitch effect
  const nameElement = document.querySelector('.name-display h1');
  const nameGlitch = document.querySelector('.name-glitch');
  
  if(nameElement && nameGlitch) {
    nameGlitch.setAttribute('data-text', nameElement.textContent);
    
    setInterval(() => {
      nameElement.style.animation = 'glitch 500ms linear';
      
      setTimeout(() => {
        nameElement.style.animation = 'none';
      }, 500);
    }, 5000);
  }
  
  // Smooth scroll functionality for social menu contact button
  const contactScrollBtn = document.querySelector('.s-intro__scroll-down a');
  if (contactScrollBtn) {
    contactScrollBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        const contactIndex = Array.from(sections).indexOf(contactSection);
        
        // Force scroll to contact section
        isScrolling = true;
        scrollContainer.scrollTo({
          top: contactSection.offsetTop,
          behavior: 'smooth'
        });
        setActiveDot(contactIndex);
        
        // Reset scrolling flag after animation
        setTimeout(() => {
          isScrolling = false;
        }, 700);
      }
    });
  }

  // Add hover effects to social menu items
  const socialLinks = document.querySelectorAll('.s-intro__social a');
  socialLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      link.style.transform = 'scale(1.15) translateY(-2px)';
    });
    
    link.addEventListener('mouseleave', () => {
      link.style.transform = 'scale(1) translateY(0)';
    });
  });
});

// Function to detect if glass cards are scrollable
function checkScrollableGlassCards() {
  const glassCards = document.querySelectorAll('.glass-card');
  
  glassCards.forEach(card => {
    // Check if content height exceeds container height
    if (card.scrollHeight > card.clientHeight) {
      card.classList.add('scrollable');
      
      // Add scroll indicators
      if (!card.querySelector('.scroll-indicator-top')) {
        const topIndicator = document.createElement('div');
        topIndicator.className = 'scroll-indicator-top';
        topIndicator.innerHTML = '<i class="fas fa-chevron-up"></i>';
        card.appendChild(topIndicator);
        
        const bottomIndicator = document.createElement('div');
        bottomIndicator.className = 'scroll-indicator-bottom';
        bottomIndicator.innerHTML = '<i class="fas fa-chevron-down"></i>';
        card.appendChild(bottomIndicator);
        
        // Update indicators based on scroll position
        const updateScrollIndicators = () => {
          const isAtTop = card.scrollTop <= 10;
          const isAtBottom = card.scrollTop >= (card.scrollHeight - card.clientHeight - 10);
          
          topIndicator.style.opacity = isAtTop ? '0' : '0.7';
          bottomIndicator.style.opacity = isAtBottom ? '0' : '0.7';
        };
        
        // Initial update
        updateScrollIndicators();
        
        // Update on scroll
        card.addEventListener('scroll', updateScrollIndicators);
      }
    } else {
      card.classList.remove('scrollable');
      // Remove scroll indicators if they exist
      const topIndicator = card.querySelector('.scroll-indicator-top');
      const bottomIndicator = card.querySelector('.scroll-indicator-bottom');
      if (topIndicator) topIndicator.remove();
      if (bottomIndicator) bottomIndicator.remove();
    }
  });
}

// Call the function when DOM is loaded and on window resize
document.addEventListener('DOMContentLoaded', checkScrollableGlassCards);
window.addEventListener('resize', checkScrollableGlassCards);

// Also check after any dynamic content changes
const resizeObserver = new ResizeObserver(() => {
  checkScrollableGlassCards();
});

// Observe all glass cards for size changes
document.querySelectorAll('.glass-card').forEach(card => {
  resizeObserver.observe(card);
});

// Project modal popup functionality
function openModal(modalId) {
  document.getElementById(modalId).style.display = 'block';
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
  document.body.style.overflow = ''; // Restore scrolling
}

// Close modal if clicking outside content
window.onclick = function(event) {
  const modals = document.getElementsByClassName('modal');
  for (let modal of modals) {
    if (event.target === modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }
}

// Close modal on escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    const modals = document.getElementsByClassName('modal');
    for (let modal of modals) {
      if (modal.style.display === 'block') {
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }
    }
  }
});