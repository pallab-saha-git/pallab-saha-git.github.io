// Three.js background animation setup
document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('bg-canvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
  
  // Create particles
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 1000;
  
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
  
  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    
    particlesMesh.rotation.y += 0.0005;
    particlesMesh.rotation.x -= 0.0002;
    
    renderer.render(scene, camera);
  }
  
  animate();
  
  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Scroll handling code
  const scrollContainer = document.querySelector('.scroll-container');
  const dots = document.querySelectorAll('.dot-nav ul li a.dot');
  const sections = document.querySelectorAll('.section');
  
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

  // Scroll one section at a time on wheel event
  let isScrolling = false;
  scrollContainer.addEventListener('wheel', (e) => {
    if (isScrolling) return;
    e.preventDefault();

    const delta = e.deltaY;
    const currentScroll = scrollContainer.scrollTop;
    const viewportHeight = window.innerHeight;

    // Find current section index
    let currentIndex = Array.from(sections).findIndex((section, idx) => {
      const top = section.offsetTop;
      return currentScroll >= top - viewportHeight / 2 && currentScroll < top + viewportHeight / 2;
    });

    if (delta > 0 && currentIndex < sections.length - 1) {
      currentIndex++;
    } else if (delta < 0 && currentIndex > 0) {
      currentIndex--;
    }

    isScrolling = true;
    scrollContainer.scrollTo({
      top: sections[currentIndex].offsetTop,
      behavior: 'smooth',
    });

    setActiveDot(currentIndex);

    setTimeout(() => {
      isScrolling = false;
    }, 700);
  }, { passive: false });

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

  // Set active dot on scroll (in case user scrolls manually)
  scrollContainer.addEventListener('scroll', () => {
    if (isScrolling) return; // Don't interfere with programmatic scrolling
    
    const scrollPos = scrollContainer.scrollTop;
    const viewportHeight = window.innerHeight;
    
    // Find the section that's most visible in the viewport
    let maxVisibleSection = 0;
    let maxVisibleAmount = 0;
    
    sections.forEach((section, idx) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      
      // Calculate how much of the section is visible
      const visibleTop = Math.max(scrollPos, sectionTop);
      const visibleBottom = Math.min(scrollPos + viewportHeight, sectionTop + sectionHeight);
      const visibleAmount = Math.max(0, visibleBottom - visibleTop);
      
      if (visibleAmount > maxVisibleAmount) {
        maxVisibleAmount = visibleAmount;
        maxVisibleSection = idx;
      }
    });
    
    // Set the dot corresponding to the most visible section as active
    setActiveDot(maxVisibleSection);
  });
  
  // Mouse move parallax effect for home section
  document.addEventListener('mousemove', (e) => {
    const homeSection = document.getElementById('home');
    if(!homeSection.classList.contains('in-view')) return;
    
    const mouseX = e.clientX / window.innerWidth - 0.5;
    const mouseY = e.clientY / window.innerHeight - 0.5;
    
    const profileImg = document.querySelector('.profile-img-container');
    const nameDisplay = document.querySelector('.name-display');
    const logos = document.querySelector('.logos');
    
    if(profileImg) profileImg.style.transform = `translateX(${mouseX * 20}px) translateY(${mouseY * 20}px)`;
    if(nameDisplay) nameDisplay.style.transform = `translateX(${mouseX * -15}px) translateY(${mouseY * -15}px)`;
    if(logos) logos.style.transform = `translateX(${mouseX * 10}px) translateY(${mouseY * 10}px)`;
  });
  
  // Tilt effect for cards
  const cards = document.querySelectorAll('.glass-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const percentX = (x - centerX) / centerX;
      const percentY = (y - centerY) / centerY;
      
      card.style.transform = `perspective(1000px) rotateY(${percentX * 2}deg) rotateX(${percentY * -2}deg) translateZ(10px)`;
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