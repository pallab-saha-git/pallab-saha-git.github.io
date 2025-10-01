// Particle System for Background
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.init();
        this.animate();
        this.setupEventListeners();
    }

    init() {
        this.resizeCanvas();
        this.createParticles();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        const particleCount = Math.min(50, Math.floor((this.canvas.width * this.canvas.height) / 30000));
        this.particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                radius: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.4 + 0.1,
                color: Math.random() > 0.5 ? '#00f7ff' : '#0073ff'
            });
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.createParticles();
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach((particle, index) => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Mouse interaction
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.vx += dx * force * 0.001;
                particle.vy += dy * force * 0.001;
            }

            // Boundary check
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

            // Keep particles in bounds
            particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
            particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));

            // Draw particle
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();

            // Draw connections
            this.particles.slice(index + 1).forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 80) {
                    this.ctx.save();
                    this.ctx.globalAlpha = (80 - distance) / 80 * 0.15;
                    this.ctx.strokeStyle = '#00f7ff';
                    this.ctx.lineWidth = 0.3;
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    this.ctx.stroke();
                    this.ctx.restore();
                }
            });
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Typing Effect
class TypingEffect {
    constructor(element, text, speed = 100) {
        this.element = element;
        this.text = text;
        this.speed = speed;
        this.currentIndex = 0;
        this.start();
    }

    start() {
        this.type();
    }

    type() {
        if (this.currentIndex < this.text.length) {
            this.element.textContent = this.text.slice(0, this.currentIndex + 1);
            this.currentIndex++;
            setTimeout(() => this.type(), this.speed);
        }
    }
}

// Smooth Scrolling Handler
class SmoothScroll {
    constructor() {
        this.sections = document.querySelectorAll('.section');
        this.currentSection = 0;
        this.isScrolling = false;
        
        this.init();
    }

    init() {
        this.setupDotNavigation();
        this.setupScrollDetection();
        this.setupScrollButton();
        this.setupFadeIn();
    }

    setupDotNavigation() {
        const dotLinks = document.querySelectorAll('.dot-nav a[href^="#"]');
        const ids = Array.from(this.sections).map(s => `#${s.id}`);
        dotLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                const idx = ids.indexOf(href);
                if (idx >= 0) {
                    e.preventDefault();
                    this.scrollToSection(idx);
                }
            });
        });
    }

    setupFadeIn() {
        const fadeElements = document.querySelectorAll('.fade-in');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('appear');
                }
            });
        }, { threshold: 0.1 });

        fadeElements.forEach(el => observer.observe(el));
    }

    setupScrollDetection() {
        // Use a more aggressive threshold for better detection
        const observerOptions = { 
            root: null, 
            threshold: [0, 0.25, 0.5, 0.75, 1],
            rootMargin: '-10% 0px -10% 0px' 
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.25) {
                    const sectionIndex = Array.from(this.sections).indexOf(entry.target);
                    if (sectionIndex !== -1) {
                        this.updateActiveNav(sectionIndex);
                        this.currentSection = sectionIndex;
                    }
                }
            });
        }, observerOptions);

        // Ensure sections exist before observing
        if (this.sections.length > 0) {
            this.sections.forEach(section => observer.observe(section));
        }

        // Set initial active state for home section
        requestAnimationFrame(() => {
            this.updateActiveNav(0);
            this.currentSection = 0;
        });

        // Enhanced fallback on window scroll with immediate execution
        const scrollHandler = () => {
            if (this.isScrolling) return; // Don't interfere with programmatic scrolling
            
            let activeIndex = 0;
            let maxVisibility = 0;
            const viewportHeight = window.innerHeight;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            this.sections.forEach((section, index) => {
                const rect = section.getBoundingClientRect();
                const sectionTop = rect.top + scrollTop;
                const sectionHeight = section.offsetHeight;
                
                // Calculate how much of the section is visible
                const visibleTop = Math.max(0, Math.min(viewportHeight, rect.bottom));
                const visibleBottom = Math.max(0, Math.min(viewportHeight, viewportHeight - rect.top));
                const visibleHeight = Math.max(0, visibleTop - (viewportHeight - visibleBottom));
                const visibilityRatio = visibleHeight / Math.min(sectionHeight, viewportHeight);
                
                // Also consider if we're past the middle of the section
                const sectionMiddle = sectionTop + (sectionHeight / 2);
                const pastMiddle = scrollTop + (viewportHeight / 2) >= sectionMiddle;
                
                if (visibilityRatio > maxVisibility || (visibilityRatio > 0.3 && pastMiddle)) {
                    maxVisibility = visibilityRatio;
                    activeIndex = index;
                }
            });
            
            if (maxVisibility > 0.1) {
                this.updateActiveNav(activeIndex);
                this.currentSection = activeIndex;
            }
        };
        
        // Use both throttled and immediate scroll handlers
        window.addEventListener('scroll', throttle(scrollHandler, 50));
        window.addEventListener('scroll', scrollHandler, { passive: true });
        
        // Initial call to set correct active state
        setTimeout(scrollHandler, 100);
    }

    setupScrollButton() {
        const scrollBtn = document.querySelector('.scroll-down-indicator a');
        if (!scrollBtn) return;
        scrollBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const next = this.sections[1] || this.sections[0];
            next && next.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    scrollToSection(index) {
        if (this.isScrolling) return;
        
        this.isScrolling = true;
        const targetSection = this.sections[index];
        
        targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

        setTimeout(() => {
            this.isScrolling = false;
        }, 1000);
    }

    updateActiveNav(activeIndex) {
        // Update dot navigation with better error handling
        const dotLinks = document.querySelectorAll('.dot-nav a[href^="#"]');
        if (dotLinks.length === 0) return;
        
        const ids = Array.from(this.sections).map(s => `#${s.id}`);
        
        dotLinks.forEach((link, index) => {
            const href = link.getAttribute('href');
            const sectionIndex = ids.indexOf(href);
            const isActive = (sectionIndex === activeIndex) || (index === activeIndex);
            
            if (isActive) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Also update any other navigation elements that might exist
        const navItems = document.querySelectorAll(`[data-section="${activeIndex}"]`);
        const allNavItems = document.querySelectorAll('[data-section]');
        
        allNavItems.forEach(item => item.classList.remove('active'));
        navItems.forEach(item => item.classList.add('active'));
    }
}

// Tab System
class TabSystem {
    constructor() {
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabPanels = document.querySelectorAll('.tab-panel');
        this.init();
    }

    init() {
        this.tabButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                this.switchTab(index);
            });
        });
    }

    switchTab(activeIndex) {
        // Update buttons
        this.tabButtons.forEach((button, index) => {
            button.classList.toggle('active', index === activeIndex);
        });

        // Update panels
        this.tabPanels.forEach((panel, index) => {
            panel.classList.toggle('active', index === activeIndex);
        });
    }
}

// Project Modal System
class ProjectModal {
    constructor() {
        this.modal = document.getElementById('project-modal');
        this.modalBody = document.getElementById('modal-body');
        this.closeBtn = document.querySelector('.modal-close');
        this.viewDetailsBtns = document.querySelectorAll('.view-details');
        
        this.projectData = {
            slam: {
                title: '3D Localization and Mapping of Ground Vehicle',
                description: 'M.Tech project focused on developing a novel MLP-based algorithm for 3D localization and mapping of ground vehicles, advancing accuracy for Advanced Driver-Assistance Systems (ADAS) applications.',
                features: [
                    'Integrated SELU and Mish activation functions to boost performance, achieving a 2–3% improvement in accuracy, completeness, and depth',
                    'Leveraged High-Performance Computing (HPC) with PyTorch and CUDA to optimize the Co-SLAM model and reduce processing delays',
                    'Improved real-time object detection and navigation capabilities through precise depth map reconstruction and faster convergence',
                    'Developed comprehensive testing framework for SLAM algorithm validation',
                    'Implemented advanced computer vision techniques for enhanced mapping accuracy'
                ],
                technologies: ['PyTorch', 'CUDA', 'Computer Vision', 'SLAM', 'MLP', 'Python', 'OpenCV', 'ROS'],
                challenges: 'Optimizing real-time performance while maintaining high accuracy in 3D reconstruction and localization for autonomous vehicle applications.',
                outcome: 'Achieved 2-3% improvement in accuracy, completeness, and depth metrics compared to existing Co-SLAM implementations.'
            },
            chatbot: {
                title: 'LLM-Integrated Chatbot System',
                description: 'Built and maintained an enterprise-grade LLM-integrated chatbot system using Python, OpenAI APIs, and SQL, optimizing business logic and automating decision-making pipelines.',
                features: [
                    'Designed a flexible adaptive JSON-based interaction layer for multi-intent handling and workflow automation',
                    'Implemented manual approval workflow to curate enterprise knowledge base content',
                    'Developed robust backend systems for conversation logging and feedback analysis',
                    'Optimized prompt engineering techniques to achieve more reliable and consistent AI responses',
                    'Created custom analytics dashboards to track usage patterns and identify improvement areas',
                    'Integrated with existing enterprise systems for seamless workflow automation'
                ],
                technologies: ['Python', 'OpenAI API', 'SQL', 'Azure', 'Power BI', 'JSON', 'REST APIs', 'Enterprise Integration'],
                challenges: 'Ensuring consistent and accurate responses while handling complex multi-intent conversations and maintaining enterprise-level security and governance.',
                outcome: 'Successfully deployed system handling enterprise-level conversations with improved response accuracy and automated decision-making capabilities.'
            },
            'book-automation': {
                title: 'AI-Powered Book Publication Automation Platform',
                description: 'End-to-end publication engine that ingests web content, applies Gemini-assisted enrichment, and exports press-ready assets with operational telemetry.',
                features: [
                    'Automates ingest-to-publish workflows in Flask, generating TXT, DOCX, PDF, and HTML formats with scheduled reports',
                    'Integrates Google Gemini for configurable content enhancement, restructuring, and reviewer feedback loops',
                    'Stores semantic embeddings in ChromaDB to unlock vector search and context-aware retrieval across large manuscripts',
                    'Provides modular REST endpoints for orchestrating multi-step pipelines with live status dashboards and analytics',
                    'Uses Playwright-driven scraping with screenshot auditing, retry guards, and deduplication for dynamic sources'
                ],
                technologies: ['Flask', 'Google Gemini', 'ChromaDB', 'Playwright', 'REST API', 'Docker'],
                challenges: 'Coordinating resilient scraping, AI enrichment, and export services while keeping human approvals and observability in sync.',
                outcome: 'Delivered a configurable automation suite that reduces publication turnaround time and improves content quality via AI-assisted reviews.'
            },
            powerbiz: {
                title: 'PowerBiz Developer Analytics – AI Engineering Intelligence',
                description: 'Multi-agent analytics platform that fuses repository signals and collaboration data to narrate engineering health in Slack.',
                features: [
                    'Builds LangChain/LangGraph agents for harvesting GitHub data, DORA metrics, and Slack interactions into a unified model',
                    'Implements diff analysis, churn scoring, and narrative generation to spotlight shipping risks and high-impact reviewers',
                    'Runs deterministic async pipelines for daily and weekly engineering briefings with drill-down insights',
                    'Publishes interactive visualizations via Matplotlib and Plotly to surface productivity and quality trends',
                    'Ships Slack slash commands and notifications backed by SQLite/PostgreSQL persistence and Docker Compose packaging'
                ],
                technologies: ['LangChain', 'LangGraph', 'GitHub API', 'Slack API', 'SQLite', 'PostgreSQL', 'Matplotlib', 'Plotly', 'Docker Compose'],
                challenges: 'Synchronizing multi-agent orchestration with reproducible metrics reporting across asynchronous data sources.',
                outcome: 'Enabled proactive engineering intelligence with automated Slack storytelling and deploy-anywhere observability scripts.'
            },
            'n8n-automation': {
                title: 'Email Workflow Automation with n8n',
                description: 'No-code orchestration that personalizes Gmail outreach from Google Sheets while safeguarding OAuth and delivery edge cases.',
                features: [
                    'Uses n8n SplitInBatches and Schedule Trigger nodes to send controlled email batches from dynamic Google Sheets data',
                    'Configures Gmail SMTP with templated personalization and fallback handling for transient delivery errors',
                    'Runs locally with Docker and ngrok for stable OAuth callbacks and webhook reliability during development',
                    'Implements guardrails for duplicates, retries, and audit logging across the entire email journey',
                    'Validates workflows end-to-end covering authentication, scheduling, and message personalization scenarios'
                ],
                technologies: ['n8n', 'Google Sheets', 'Gmail SMTP', 'Docker', 'ngrok', 'OAuth2'],
                challenges: 'Ensuring OAuth, scheduling, and batching remain robust when scaling personalized automations without manual intervention.',
                outcome: 'Delivered a resilient automation that keeps outbound campaigns consistent while remaining fully configurable and testable locally.'
            },
            knowledge: {
                title: 'Enterprise Knowledge Base System',
                description: 'Created a curated knowledge base system with approval pipelines to ensure governance and response accuracy for enterprise-level AI applications with semantic search capabilities.',
                features: [
                    'Built a content approval workflow for FAQs and policy documents',
                    'Integrated filtering mechanisms to ensure consistent responses',
                    'Developed Power BI dashboards for performance analytics and user insights',
                    'Implemented semantic search capabilities to improve content discovery',
                    'Created content validation tools to maintain data quality and accuracy',
                    'Designed scalable architecture for enterprise-level content management'
                ],
                technologies: ['Python', 'NLP', 'Power BI', 'Azure', 'Semantic Search', 'Content Management', 'Analytics'],
                challenges: 'Implementing effective content governance while maintaining fast search capabilities and ensuring content accuracy across diverse enterprise domains.',
                outcome: 'Delivered comprehensive knowledge management system with improved content discovery and maintained high accuracy standards through automated validation.'
            },
            ecommerce: {
                title: 'E-Commerce Platform',
                description: 'A comprehensive full-stack e-commerce solution built with modern web technologies. Features include user authentication, shopping cart, payment processing, order management, and an admin dashboard for inventory management.',
                features: [
                    'User registration and authentication system',
                    'Product catalog with search and filtering',
                    'Shopping cart and wishlist functionality',
                    'Secure payment integration with Stripe',
                    'Order tracking and history',
                    'Admin dashboard for product and order management',
                    'Responsive design for all devices',
                    'Real-time inventory updates'
                ],
                technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Stripe API', 'JWT', 'SCSS', 'Redux'],
                challenges: 'Implementing secure payment processing and real-time inventory management across multiple user sessions.',
                outcome: 'Successfully deployed platform handling 1000+ concurrent users with 99.9% uptime.'
            },
            taskapp: {
                title: 'Task Management App',
                description: 'A collaborative task management application designed for teams to organize, track, and complete projects efficiently. Features real-time updates, drag-and-drop functionality, and comprehensive team collaboration tools.',
                features: [
                    'Real-time collaborative editing',
                    'Drag-and-drop task organization',
                    'Team member assignment and notifications',
                    'Project timeline and milestone tracking',
                    'File attachments and comments',
                    'Custom task categories and labels',
                    'Progress analytics and reporting',
                    'Integration with calendar applications'
                ],
                technologies: ['React', 'WebSocket', 'Node.js', 'Express', 'PostgreSQL', 'Socket.io', 'Chart.js', 'Material-UI'],
                challenges: 'Implementing real-time synchronization across multiple users while maintaining data consistency and performance.',
                outcome: 'Improved team productivity by 35% and reduced project completion time by 20%.'
            },
            weather: {
                title: 'Weather Dashboard',
                description: 'An interactive weather dashboard providing comprehensive weather information with beautiful visualizations. Features location-based forecasts, weather maps, and historical data analysis.',
                features: [
                    'Current weather conditions for any location',
                    'Extended 7-day weather forecast',
                    'Interactive weather maps and radar',
                    'Historical weather data and trends',
                    'Weather alerts and notifications',
                    'Favorite locations management',
                    'Weather data visualization with charts',
                    'Progressive Web App capabilities'
                ],
                technologies: ['Vue.js', 'Chart.js', 'OpenWeather API', 'Mapbox', 'Service Workers', 'IndexedDB', 'CSS Grid', 'PWA'],
                challenges: 'Optimizing API calls and implementing efficient caching strategies for offline functionality.',
                outcome: 'Achieved 90+ PageSpeed score and offline capability with 24-hour weather data caching.'
            }
        };
        
        this.init();
    }

    init() {
        this.viewDetailsBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const projectKey = e.target.closest('.view-details').dataset.project;
                this.openModal(projectKey);
            });
        });

        this.closeBtn.addEventListener('click', () => {
            this.closeModal();
        });

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    openModal(projectKey) {
        const project = this.projectData[projectKey];
        if (!project) return;

        this.modalBody.innerHTML = this.generateModalContent(project);
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    generateModalContent(project) {
        return `
            <div class="modal-project">
                <h3 class="modal-title">${project.title}</h3>
                <p class="modal-description">${project.description}</p>
                
                <div class="modal-section">
                    <h4>Key Features</h4>
                    <ul class="modal-list">
                        ${project.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="modal-section">
                    <h4>Technologies Used</h4>
                    <div class="modal-tech">
                        ${project.technologies.map(tech => `<span class="modal-tech-tag">${tech}</span>`).join('')}
                    </div>
                </div>
                
                <div class="modal-section">
                    <h4>Challenges & Solutions</h4>
                    <p>${project.challenges}</p>
                </div>
                
                <div class="modal-section">
                    <h4>Results & Impact</h4>
                    <p>${project.outcome}</p>
                </div>
            </div>
        `;
    }
}

// Floating Animation for Logos
class FloatingAnimation {
    constructor() {
        this.logoGroups = document.querySelectorAll('.floating-logos');
        this.init();
    }

    init() {
        this.logoGroups.forEach((group, index) => {
            this.animateGroup(group, index);
        });
    }

    animateGroup(group, index) {
        const baseDelay = index * 3000;
        const amplitude = 5;
        const frequency = 0.001;
        
        setInterval(() => {
            const time = Date.now() + baseDelay;
            const x = Math.sin(time * frequency) * amplitude;
            const y = Math.cos(time * frequency * 0.7) * (amplitude * 0.6);
            
            group.style.transform = `translate3d(${x}px, ${y}px, 0px)`;
        }, 50);
    }
}
class AnimationObserver {
    constructor(){ this.init(); }
    init(){
        const observer = new IntersectionObserver((entries)=>{
            entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in-view'); }});
        },{threshold:.15});
        document.querySelectorAll('.card,.t-content,.card.project').forEach(el=>observer.observe(el));
    }
}

// Performance Monitor
class PerformanceMonitor {
    constructor() {
        this.fps = 0;
        this.lastTime = performance.now();
        this.frameCount = 0;
        
        this.monitor();
    }

    monitor() {
        const currentTime = performance.now();
        this.frameCount++;
        
        if (currentTime - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            // Adjust particle count based on performance
            if (this.fps < 30) {
                this.optimizePerformance();
            }
        }
        
        requestAnimationFrame(() => this.monitor());
    }

    optimizePerformance() {
        // Reduce visual effects if performance is poor
    const particles = document.getElementById('bg-canvas');
        if (particles && this.fps < 20) {
            particles.style.opacity = '0.5';
        }
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize particle system
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        new ParticleSystem(canvas);
    }

    // Initialize typing effect
    const typingElement = document.querySelector('.typing-text');
    if (typingElement) {
        new TypingEffect(typingElement, 'PALLAB SAHA', 150);
    }

    // Initialize Typed.js for subtitle with retry to ensure library is loaded
    (function initTypedWithRetry(){
        const el = document.querySelector('.typed');
        if (!el) return; // nothing to do
        if (typeof window.__typedInstance !== 'undefined') return; // guard double init
        if (typeof Typed === 'undefined') {
            // try again shortly; CDN might not be ready yet
            return setTimeout(initTypedWithRetry, 150);
        }
        const itemsAttr = el.getAttribute('data-typed-items') || '';
        const strings = itemsAttr.split(',').map(s=>s.trim()).filter(Boolean);
        if (!strings.length) return;
        window.__typedInstance = new Typed('.typed', {
            strings,
            typeSpeed: 100,
            backSpeed: 50,
            backDelay: 2000,
            loop: true,
            showCursor: true,
            cursorChar: '|',
            autoInsertCss: true,
            startDelay: 300
        });
    })();

    // Header mobile nav (removed since header is removed)

    // Initialize everything with proper timing
    setTimeout(() => {
        // Smooth anchor scrolling and active section tracking
        new SmoothScroll();

        // Initialize tab system
        new TabSystem();

        // Initialize project modal
        new ProjectModal();

        // Initialize animation observer
        new AnimationObserver();

        // Initialize floating animation
        new FloatingAnimation();
    }, 100);

    // Also add a backup initialization in case of timing issues
    window.addEventListener('load', () => {
        setTimeout(() => {
            // Re-initialize SmoothScroll if sections aren't working
            const existingSmoothScroll = document.querySelector('.dot-nav .active');
            if (!existingSmoothScroll) {
                new SmoothScroll();
            }
        }, 200);
    });

    // Initialize performance monitor
    new PerformanceMonitor();

    // Add CSS for modal content
    const modalStyles = `
        <style>
        .modal-project { color: var(--text); }
        
        .modal-title {
            font-family: 'Orbitron', monospace;
            font-size: 2rem;
            color: var(--primary-cyan);
            margin-bottom: 1rem;
            background: var(--gradient);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .modal-description {
            font-size: 1.1rem;
            line-height: 1.6;
            color: var(--muted);
            margin-bottom: 2rem;
        }
        
        .modal-section {
            margin-bottom: 2rem;
        }
        
        .modal-section h4 {
            font-family: 'Orbitron', monospace;
            font-size: 1.3rem;
            color: var(--primary-cyan);
            margin-bottom: 1rem;
        }
        
        .modal-list {
            list-style: none;
            padding: 0;
        }
        
        .modal-list li {
            position: relative;
            padding-left: 1.5rem;
            margin-bottom: 0.75rem;
            color: var(--muted);
            line-height: 1.6;
        }
        
        .modal-list li::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0.6rem;
            width: 6px;
            height: 6px;
            background: var(--primary-cyan);
            border-radius: 50%;
            box-shadow: 0 0 5px var(--primary-cyan);
        }
        
        .modal-tech {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .modal-tech-tag {
            padding: 0.5rem 1rem;
            background: rgba(0, 247, 255, 0.1);
            border: 1px solid var(--glass-stroke);
            border-radius: 20px;
            font-size: 0.9rem;
            color: var(--primary-cyan);
        }
        
        .modal-section p {
            color: var(--muted);
            line-height: 1.6;
        }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', modalStyles);

    // Smooth anchor links
    document.querySelectorAll('a[href^="#"]').forEach(a=>{
        // Skip dot nav links (handled by SmoothScroll)
        if (a.closest('.dot-nav')) return;
        a.addEventListener('click', (e)=>{
            const id = a.getAttribute('href');
            if (id && id.length>1){
                const el = document.querySelector(id);
                if (el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth', block:'start'}); }
            }
        })
    });

    // Fade-in on load
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.4s ease-in-out';
    requestAnimationFrame(()=>{ document.body.style.opacity = '1'; });
});

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ParticleSystem,
        TypingEffect,
        SmoothScroll,
        TabSystem,
        ProjectModal
    };
}
