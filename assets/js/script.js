/**
 * BENTLEY STUDIO - MAIN SCRIPT
 * تحسين كامل مع جميع الوظائف
 */

// ============================================
// تهيئة المتغيرات العامة
// ============================================
let audioContext = null;
let currentDownload = null;
let wishlistItems = JSON.parse(localStorage.getItem('wishlist')) || [];

// ============================================
// Custom Cursor
// ============================================
class Cursor {
    constructor() {
        this.cursor = document.querySelector('.cursor');
        this.follower = document.querySelector('.cursor-follower');
        this.links = document.querySelectorAll('a, button, .game-card, .download-card, .tag');
        
        if (!this.cursor || !this.follower) return;
        
        this.init();
    }
    
    init() {
        // Mouse move
        document.addEventListener('mousemove', (e) => {
            this.moveCursor(e);
        });
        
        // Mouse down/up effects
        document.addEventListener('mousedown', () => {
            this.cursor.style.transform = `translate(${this.lastX}px, ${this.lastY}px) scale(0.8)`;
            this.follower.style.transform = `translate(${this.lastX - 20}px, ${this.lastY - 20}px) scale(1.5)`;
        });
        
        document.addEventListener('mouseup', () => {
            this.cursor.style.transform = `translate(${this.lastX}px, ${this.lastY}px) scale(1)`;
            this.follower.style.transform = `translate(${this.lastX - 20}px, ${this.lastY - 20}px) scale(1)`;
        });
        
        // Mouse leave/enter window
        document.addEventListener('mouseleave', () => {
            this.cursor.style.opacity = '0';
            this.follower.style.opacity = '0';
        });
        
        document.addEventListener('mouseenter', () => {
            this.cursor.style.opacity = '1';
            this.follower.style.opacity = '1';
        });
        
        // Hover effects for interactive elements
        this.links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                this.cursor.style.transform = `translate(${this.lastX}px, ${this.lastY}px) scale(1.5)`;
                this.follower.style.transform = `translate(${this.lastX - 20}px, ${this.lastY - 20}px) scale(1.2)`;
                this.follower.style.borderColor = 'rgba(59, 130, 246, 0.5)';
            });
            
            link.addEventListener('mouseleave', () => {
                this.cursor.style.transform = `translate(${this.lastX}px, ${this.lastY}px) scale(1)`;
                this.follower.style.transform = `translate(${this.lastX - 20}px, ${this.lastY - 20}px) scale(1)`;
                this.follower.style.borderColor = 'rgba(59, 130, 246, 0.3)';
            });
        });
    }
    
    moveCursor(e) {
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        
        this.cursor.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
        this.follower.style.transform = `translate(${e.clientX - 20}px, ${e.clientY - 20}px)`;
    }
}

// ============================================
// Sound System
// ============================================
class SoundSystem {
    constructor() {
        this.context = null;
        this.enabled = true;
        this.volume = 0.2;
        this.sounds = {};
        
        // تفعيل عند أول تفاعل
        document.addEventListener('click', () => this.init(), { once: true });
        document.addEventListener('keydown', () => this.init(), { once: true });
    }
    
    init() {
        if (this.context) return;
        
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.setupSounds();
            console.log('✅ Sound system initialized');
        } catch (e) {
            console.warn('❌ Web Audio API not supported');
            this.enabled = false;
        }
    }
    
    setupSounds() {
        // Click sound
        this.sounds.click = (freq = 600, dur = 0.1) => {
            if (!this.enabled || !this.context) return;
            
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.value = this.volume;
            
            osc.connect(gain);
            gain.connect(this.context.destination);
            
            osc.start();
            osc.stop(this.context.currentTime + dur);
        };
        
        // Hover sound
        this.sounds.hover = () => {
            if (!this.enabled || !this.context) return;
            
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = 400;
            gain.gain.value = this.volume * 0.5;
            
            osc.connect(gain);
            gain.connect(this.context.destination);
            
            osc.start();
            osc.stop(this.context.currentTime + 0.05);
        };
        
        // Success sound
        this.sounds.success = () => {
            if (!this.enabled || !this.context) return;
            
            const now = this.context.currentTime;
            [600, 800, 1000].forEach((freq, i) => {
                const osc = this.context.createOscillator();
                const gain = this.context.createGain();
                
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.value = this.volume;
                
                osc.connect(gain);
                gain.connect(this.context.destination);
                
                osc.start(now + i * 0.1);
                osc.stop(now + i * 0.1 + 0.2);
            });
        };
        
        // Download sound
        this.sounds.download = () => {
            if (!this.enabled || !this.context) return;
            
            const now = this.context.currentTime;
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValue(400, 0.3);
            gain.gain.value = this.volume;
            
            osc.connect(gain);
            gain.connect(this.context.destination);
            
            osc.start();
            osc.stop(now + 0.3);
        };
        
        // Add to wishlist sound
        this.sounds.wishlist = () => {
            if (!this.enabled || !this.context) return;
            
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            osc.type = 'triangle';
            osc.frequency.value = 800;
            gain.gain.value = this.volume;
            
            osc.connect(gain);
            gain.connect(this.context.destination);
            
            osc.start();
            osc.stop(this.context.currentTime + 0.15);
        };
    }
    
    play(type, ...args) {
        if (!this.enabled || !this.context) return;
        
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
        
        if (this.sounds[type]) {
            this.sounds[type](...args);
        }
    }
    
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

// ============================================
// Navigation
// ============================================
class Navigation {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.navToggle = document.querySelector('.nav-toggle');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-item');
        
        this.init();
    }
    
    init() {
        // Scroll effect
        window.addEventListener('scroll', () => this.handleScroll());
        
        // Mobile menu toggle
        if (this.navToggle) {
            this.navToggle.addEventListener('click', () => this.toggleMobileMenu());
        }
        
        // Active link based on current page
        this.setActiveLink();
        
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => this.smoothScroll(e));
        });
    }
    
    handleScroll() {
        if (window.scrollY > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }
    
    toggleMobileMenu() {
        this.navToggle.classList.toggle('active');
        this.navMenu.classList.toggle('active');
        
        // Animate toggle button
        const spans = this.navToggle.querySelectorAll('span');
        if (this.navToggle.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.transform = 'none';
        }
    }
    
    setActiveLink() {
        const currentPath = window.location.pathname;
        
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            if (currentPath.includes('games') && href.includes('Games')) {
                link.classList.add('active');
            } else if (currentPath.endsWith('/') && href === '#work') {
                link.classList.add('active');
            }
        });
    }
    
    smoothScroll(e) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Close mobile menu if open
            if (this.navMenu.classList.contains('active')) {
                this.toggleMobileMenu();
            }
        }
    }
}

// ============================================
// Loading Animation
// ============================================
class Loader {
    constructor() {
        this.loader = document.getElementById('loader');
        if (!this.loader) return;
        
        this.init();
    }
    
    init() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.loader.classList.add('fade-out');
                setTimeout(() => {
                    this.loader.style.display = 'none';
                }, 500);
            }, 1000);
        });
    }
}

// ============================================
// Download Manager
// ============================================
class DownloadManager {
    constructor() {
        this.buttons = document.querySelectorAll('.download-btn, .download-btn-card');
        this.progressBar = document.getElementById('downloadProgress');
        this.progressFill = document.getElementById('progressFill');
        this.progressPercent = document.getElementById('progressPercent');
        this.progressSpeed = document.getElementById('progressSpeed');
        
        this.init();
    }
    
    init() {
        this.buttons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleDownload(e));
        });
    }
    
    handleDownload(e) {
        const btn = e.currentTarget;
        const gameName = this.getGameName(btn);
        const fileSize = this.getFileSize(btn);
        
        // Play sound
        if (window.soundSystem) {
            window.soundSystem.play('download');
        }
        
        // Show download message
        this.showDownloadMessage(gameName);
        
        // Show progress bar
        this.showProgress(gameName, fileSize);
        
        // Simulate download (for demo)
        this.simulateDownload();
    }
    
    getGameName(btn) {
        // Try to get from parent card
        const card = btn.closest('.download-card, .game-card');
        if (card) {
            const title = card.querySelector('.card-title, .game-title h3');
            if (title) return title.textContent;
        }
        
        // Try to get from button text
        if (btn.classList.contains('download-btn-card')) {
            const info = btn.querySelector('.btn-info .version');
            if (info) return info.textContent.replace('v', 'Game ');
        }
        
        return 'Game';
    }
    
    getFileSize(btn) {
        const sizeElem = btn.querySelector('.size, .btn-info .size');
        if (sizeElem) return sizeElem.textContent;
        return '245 MB';
    }
    
    showDownloadMessage(gameName) {
        const message = document.createElement('div');
        message.className = 'download-message';
        message.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Downloading ${gameName}...</span>
        `;
        document.body.appendChild(message);
        
        setTimeout(() => message.classList.add('show'), 100);
        
        setTimeout(() => {
            message.classList.remove('show');
            setTimeout(() => message.remove(), 300);
            
            // Show success message after "download" completes
            setTimeout(() => {
                const successMsg = document.createElement('div');
                successMsg.className = 'download-message';
                successMsg.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <span>${gameName} downloaded successfully!</span>
                `;
                document.body.appendChild(successMsg);
                
                setTimeout(() => successMsg.classList.add('show'), 100);
                setTimeout(() => {
                    successMsg.classList.remove('show');
                    setTimeout(() => successMsg.remove(), 300);
                }, 3000);
                
                if (window.soundSystem) {
                    window.soundSystem.play('success');
                }
            }, 3000);
        }, 2000);
    }
    
    showProgress(gameName, fileSize) {
        if (!this.progressBar) return;
        
        this.progressBar.classList.add('show');
        
        const header = this.progressBar.querySelector('.progress-header span');
        if (header) {
            header.textContent = `Downloading ${gameName}`;
        }
    }
    
    simulateDownload() {
        if (!this.progressFill || !this.progressPercent || !this.progressSpeed) return;
        
        let progress = 0;
        const speed = 5; // MB/s
        const interval = setInterval(() => {
            progress += 2;
            
            if (progress <= 100) {
                this.progressFill.style.width = progress + '%';
                this.progressPercent.textContent = progress + '%';
                this.progressSpeed.textContent = speed + ' MB/s';
            } else {
                clearInterval(interval);
                
                setTimeout(() => {
                    this.progressBar.classList.remove('show');
                    this.progressFill.style.width = '0%';
                    this.progressPercent.textContent = '0%';
                }, 1000);
            }
        }, 100);
    }
}

// ============================================
// Wishlist Manager
// ============================================
class WishlistManager {
    constructor() {
        this.buttons = document.querySelectorAll('.wishlist-btn');
        this.wishlist = wishlistItems;
        
        this.init();
    }
    
    init() {
        this.buttons.forEach(btn => {
            const gameId = this.getGameId(btn);
            
            // Check if already in wishlist
            if (this.wishlist.includes(gameId)) {
                this.setWishlisted(btn);
            }
            
            btn.addEventListener('click', (e) => this.toggleWishlist(e));
        });
    }
    
    getGameId(btn) {
        const card = btn.closest('.game-card, .download-card, .game-detail-card');
        if (card) {
            return card.dataset.game || Math.random().toString(36).substr(2, 9);
        }
        return 'game-' + Date.now();
    }
    
    getGameName(btn) {
        const card = btn.closest('.game-card, .download-card, .game-detail-card');
        if (card) {
            const title = card.querySelector('.card-title, .game-title h3');
            if (title) return title.textContent;
        }
        return 'Game';
    }
    
    toggleWishlist(e) {
        const btn = e.currentTarget;
        const icon = btn.querySelector('i');
        const gameId = this.getGameId(btn);
        const gameName = this.getGameName(btn);
        
        if (this.wishlist.includes(gameId)) {
            // Remove from wishlist
            this.wishlist = this.wishlist.filter(id => id !== gameId);
            icon.classList.remove('fas');
            icon.classList.add('far');
            
            this.showMessage('Removed from wishlist', gameName);
        } else {
            // Add to wishlist
            this.wishlist.push(gameId);
            icon.classList.remove('far');
            icon.classList.add('fas');
            icon.style.color = '#ef4444';
            
            this.showMessage('Added to wishlist', gameName);
            
            if (window.soundSystem) {
                window.soundSystem.play('wishlist');
            }
        }
        
        // Save to localStorage
        localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
    }
    
    setWishlisted(btn) {
        const icon = btn.querySelector('i');
        icon.classList.remove('far');
        icon.classList.add('fas');
        icon.style.color = '#ef4444';
    }
    
    showMessage(action, gameName) {
        const message = document.createElement('div');
        message.className = 'download-message';
        message.innerHTML = `
            <i class="fas ${action.includes('Added') ? 'fa-heart' : 'fa-heart-broken'}"></i>
            <span>${action}: ${gameName}</span>
        `;
        document.body.appendChild(message);
        
        setTimeout(() => message.classList.add('show'), 100);
        setTimeout(() => {
            message.classList.remove('show');
            setTimeout(() => message.remove(), 300);
        }, 2000);
    }
}

// ============================================
// Gallery
// ============================================
class Gallery {
    constructor() {
        this.items = document.querySelectorAll('.gallery-item');
        this.init();
    }
    
    init() {
        this.items.forEach(item => {
            item.addEventListener('click', () => this.openLightbox(item));
        });
    }
    
    openLightbox(item) {
        const img = item.querySelector('img');
        if (!img) return;
        
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <img src="${img.src}" alt="${img.alt}">
                <button class="lightbox-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(lightbox);
        document.body.style.overflow = 'hidden';
        
        // Play sound
        if (window.soundSystem) {
            window.soundSystem.play('click');
        }
        
        // Close handlers
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
                this.closeLightbox(lightbox);
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeLightbox(lightbox);
            }
        });
    }
    
    closeLightbox(lightbox) {
        lightbox.remove();
        document.body.style.overflow = '';
    }
}

// ============================================
// GSAP Animations
// ============================================
class Animations {
    constructor() {
        if (typeof gsap === 'undefined') return;
        
        this.init();
    }
    
    init() {
        // Register ScrollTrigger
        gsap.registerPlugin(ScrollTrigger);
        
        // Hero animations
        this.animateHero();
        
        // Cards animation on scroll
        this.animateCards();
        
        // Stats animation
        this.animateStats();
        
        // Floating shapes
        this.animateShapes();
    }
    
    animateHero() {
        gsap.from('.hero-title .title-line', {
            duration: 1,
            y: 100,
            opacity: 0,
            stagger: 0.2,
            ease: 'power4.out'
        });
        
        gsap.from('.hero-description', {
            duration: 1,
            y: 30,
            opacity: 0,
            delay: 0.8,
            ease: 'power2.out'
        });
        
        gsap.from('.hero-cta .btn', {
            duration: 0.8,
            y: 30,
            opacity: 0,
            stagger: 0.2,
            delay: 1,
            ease: 'back.out(1.7)'
        });
    }
    
    animateCards() {
        // Game cards
        gsap.utils.toArray('.game-card').forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                },
                duration: 0.8,
                opacity: 0,
                y: 50,
                rotation: 2,
                delay: i * 0.1,
                ease: 'back.out(1.7)'
            });
        });
        
        // Download cards
        gsap.utils.toArray('.download-card').forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%'
                },
                duration: 0.8,
                opacity: 0,
                scale: 0.9,
                delay: i * 0.15,
                ease: 'elastic.out(1, 0.5)'
            });
        });
    }
    
    animateStats() {
        const stats = document.querySelectorAll('.stat-number');
        
        stats.forEach(stat => {
            const target = parseInt(stat.textContent.replace(/[^0-9]/g, ''));
            let current = 0;
            
            gsap.to({}, {
                scrollTrigger: {
                    trigger: stat,
                    start: 'top 80%'
                },
                duration: 2,
                onUpdate: function() {
                    current = Math.floor(this.progress() * target);
                    stat.textContent = current + (stat.textContent.includes('k') ? 'k' : '') + 
                                       (stat.textContent.includes('+') ? '+' : '');
                }
            });
        });
    }
    
    animateShapes() {
        gsap.to('.floating-shape', {
            duration: 20,
            x: 'random(-50, 50)',
            y: 'random(-50, 50)',
            rotation: 'random(0, 360)',
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }
}

// ============================================
// Interactive Elements
// ============================================
class Interactive {
    constructor() {
        this.tags = document.querySelectorAll('.tag');
        this.quickItems = document.querySelectorAll('.quick-item');
        
        this.init();
    }
    
    init() {
        // Tag hover effects
        this.tags.forEach(tag => {
            tag.addEventListener('mouseenter', () => {
                if (window.soundSystem) {
                    window.soundSystem.play('hover');
                }
            });
        });
        
        // Quick items hover
        this.quickItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                if (window.soundSystem) {
                    window.soundSystem.play('hover');
                }
            });
        });
        
        // Copy email to clipboard
        const emailLink = document.querySelector('.contact-email');
        if (emailLink) {
            emailLink.addEventListener('click', (e) => {
                e.preventDefault();
                
                const email = 'hello@bentley.studio';
                navigator.clipboard.writeText(email).then(() => {
                    this.showTooltip('Email copied to clipboard!');
                    
                    if (window.soundSystem) {
                        window.soundSystem.play('success');
                    }
                });
            });
        }
    }
    
    showTooltip(message) {
        const tooltip = document.createElement('div');
        tooltip.className = 'download-message';
        tooltip.style.background = 'var(--gradient-1)';
        tooltip.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(tooltip);
        
        setTimeout(() => tooltip.classList.add('show'), 100);
        setTimeout(() => {
            tooltip.classList.remove('show');
            setTimeout(() => tooltip.remove(), 300);
        }, 2000);
    }
}

// ============================================
// Initialize Everything
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Bentley Studio - Initializing...');
    
    // Initialize all classes
    window.soundSystem = new SoundSystem();
    window.cursor = new Cursor();
    window.navigation = new Navigation();
    window.loader = new Loader();
    window.downloadManager = new DownloadManager();
    window.wishlistManager = new WishlistManager();
    window.gallery = new Gallery();
    window.animations = new Animations();
    window.interactive = new Interactive();
    
    console.log('✅ All systems initialized');
});

// ============================================
// Utility Functions
// ============================================

// Debounce function for performance
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

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Handle window resize
window.addEventListener('resize', debounce(() => {
    // Recalculate any necessary dimensions
    if (window.cursor) {
        // Cursor will handle itself
    }
}, 250));

// Handle page visibility
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause any ongoing animations if needed
    } else {
        // Resume animations
    }
});

// Add smooth scrolling for all internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// Add Lightbox Styles (if not in CSS)
// ============================================
const style = document.createElement('style');
style.textContent = `
    .lightbox {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        animation: lightboxFadeIn 0.3s forwards;
    }
    
    @keyframes lightboxFadeIn {
        to { opacity: 1; }
    }
    
    .lightbox-content {
        position: relative;
        max-width: 90%;
        max-height: 90%;
    }
    
    .lightbox-content img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        border-radius: 0.5rem;
    }
    
    .lightbox-close {
        position: absolute;
        top: -40px;
        right: -40px;
        width: 40px;
        height: 40px;
        background: var(--accent);
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: var(--transition);
    }
    
    .lightbox-close:hover {
        transform: rotate(90deg);
        background: var(--accent-dark);
    }
    
    @media (max-width: 768px) {
        .lightbox-close {
            top: 10px;
            right: 10px;
        }
    }
`;

document.head.appendChild(style);