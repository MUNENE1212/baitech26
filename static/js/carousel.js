// Enhanced Image Carousel Functionality
class ImageCarousel {
    constructor(container) {
        this.container = container;
        this.images = [];
        this.currentIndex = 0;
        this.isAnimating = false;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 4000; // 4 seconds

        // New: Property to store product images for the lightbox
        this.productImages = [];

        this.init();
    }

    init() {
        // Get all images in this carousel
        const imageElements = this.container.querySelectorAll('.carousel-image');
        this.images = Array.from(imageElements);

        if (this.images.length <= 1) {
            this.container.setAttribute('data-count', '1');
            // Ensure single image is active even if no carousel navigation
            if (this.images.length === 1) {
                this.images[0].classList.add('active');
            }
            this.setupLightbox(); // Still allow lightbox for single image
            return;
        }

        this.container.setAttribute('data-count', this.images.length.toString());
        this.setupCarousel();
        this.setupNavigation();
        this.setupIndicators();
        this.setupAutoPlay();
        this.setupKeyboardNavigation();
        this.setupTouchNavigation();
        this.setupLightbox(); // Call new setup function after carousel is set up
    }

    setupCarousel() {
        // Wrap images in a container
        const carouselContainer = document.createElement('div');
        carouselContainer.className = 'carousel-container';

        // Store image sources for lightbox and move all images to the container
        this.images.forEach((img, index) => {
            this.productImages.push(img.src); // Store all image URLs for later lightbox use
            img.classList.remove('active', 'next', 'prev');
            if (index === 0) {
                img.classList.add('active'); // Set initial active image
            }
            carouselContainer.appendChild(img);
        });

        // If a carousel-container already exists, replace its content or append
        const existingCarouselContainer = this.container.querySelector('.carousel-container');
        if (existingCarouselContainer) {
            existingCarouselContainer.replaceWith(carouselContainer);
        } else {
            this.container.appendChild(carouselContainer);
        }
    }

    setupNavigation() {
        // Create navigation buttons
        const prevBtn = document.createElement('button');
        prevBtn.className = 'carousel-nav prev';
        prevBtn.innerHTML = '‹';
        prevBtn.setAttribute('aria-label', 'Previous image');
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.prevImage();
        });

        const nextBtn = document.createElement('button');
        nextBtn.className = 'carousel-nav next';
        nextBtn.innerHTML = '›';
        nextBtn.setAttribute('aria-label', 'Next image');
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.nextImage();
        });

        // Append buttons to the main carousel container
        this.container.appendChild(prevBtn);
        this.container.appendChild(nextBtn);
    }

    setupIndicators() {
        if (this.images.length <= 1) return;

        const indicatorsContainer = document.createElement('div');
        indicatorsContainer.className = 'carousel-indicators';

        this.images.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
            indicator.setAttribute('aria-label', `Go to image ${index + 1}`);
            indicator.addEventListener('click', (e) => {
                e.stopPropagation();
                this.goToImage(index);
            });
            indicatorsContainer.appendChild(indicator);
        });

        this.container.appendChild(indicatorsContainer);
    }

    setupAutoPlay() {
        if (this.images.length <= 1) return; // Only autoplay if there's more than one image

        // Auto-play when not hovering
        this.container.addEventListener('mouseenter', () => {
            this.stopAutoPlay();
        });

        this.container.addEventListener('mouseleave', () => {
            this.startAutoPlay();
        });

        // Start auto-play initially
        this.startAutoPlay();
    }

    setupKeyboardNavigation() {
        this.container.addEventListener('keydown', (e) => {
            // Do not navigate carousel if a lightbox is active
            if (!this.container.matches(':hover') || document.querySelector('.lightbox-overlay.active')) return;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prevImage();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextImage();
                    break;
                case ' ':
                case 'Enter':
                    e.preventDefault();
                    this.toggleAutoPlay();
                    break;
            }
        });

        // Make container focusable for keyboard events
        this.container.setAttribute('tabindex', '0');
    }

    setupTouchNavigation() {
        let startX = 0;
        let startY = 0;
        let distX = 0;
        let distY = 0;
        const threshold = 50; // minimum distance for swipe

        this.container.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        }, { passive: true });

        this.container.addEventListener('touchmove', (e) => {
            if (!startX || !startY) return;

            const touch = e.touches[0];
            distX = touch.clientX - startX;
            distY = touch.clientY - startY;
        }, { passive: true });

        this.container.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;

            // Check if horizontal swipe is more significant than vertical
            if (Math.abs(distX) > Math.abs(distY)) {
                if (Math.abs(distX) > threshold) {
                    if (distX > 0) {
                        this.prevImage();
                    } else {
                        this.nextImage();
                    }
                }
            }

            // Reset values
            startX = 0;
            startY = 0;
            distX = 0;
            distY = 0;
        }, { passive: true });
    }

    nextImage() {
        if (this.isAnimating) return;

        const nextIndex = (this.currentIndex + 1) % this.images.length;
        this.goToImage(nextIndex);
    }

    prevImage() {
        if (this.isAnimating) return;

        const prevIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.goToImage(prevIndex);
    }

    goToImage(index) {
        if (this.isAnimating || index === this.currentIndex) return;

        this.isAnimating = true;

        // Update images visibility
        this.images[this.currentIndex].classList.remove('active');
        this.images[index].classList.add('active');

        // Update indicators
        const indicators = this.container.querySelectorAll('.carousel-indicator');
        if (indicators.length > 0) {
            indicators[this.currentIndex].classList.remove('active');
            indicators[index].classList.add('active');
        }

        this.currentIndex = index;

        // Reset animation flag after transition
        // The timeout should match the CSS transition duration for opacity
        setTimeout(() => {
            this.isAnimating = false;
        }, 400); // Matches opacity transition duration

        // Restart auto-play timer
        this.restartAutoPlay();
    }

    startAutoPlay() {
        if (this.images.length <= 1) return;

        this.stopAutoPlay();
        this.autoPlayInterval = setInterval(() => {
            this.nextImage();
        }, this.autoPlayDelay);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    restartAutoPlay() {
        this.stopAutoPlay();
        this.startAutoPlay();
    }

    toggleAutoPlay() {
        if (this.autoPlayInterval) {
            this.stopAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }

    // New function to set up lightbox functionality
    setupLightbox() {
        this.images.forEach((img, index) => {
            img.style.cursor = 'zoom-in'; // Indicate it's clickable
            img.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent carousel navigation if clicked directly on image
                this.openLightbox(index);
            });
        });
    }

    // New functions for lightbox control
    openLightbox(startIndex) {
        if (this.productImages.length === 0) return;

        const overlay = document.createElement('div');
        overlay.className = 'lightbox-overlay';
        overlay.innerHTML = `
            <button class="lightbox-close" aria-label="Close image viewer">&times;</button>
            <button class="lightbox-nav prev" aria-label="Previous image">‹</button>
            <div class="lightbox-content">
                <img src="${this.productImages[startIndex]}" alt="Product image" class="lightbox-image">
            </div>
            <button class="lightbox-nav next" aria-label="Next image">›</button>
        `;
        document.body.appendChild(overlay);

        // Make the overlay visible after it's added to the DOM
        setTimeout(() => overlay.classList.add('active'), 10);

        const closeBtn = overlay.querySelector('.lightbox-close');
        const prevBtn = overlay.querySelector('.lightbox-nav.prev');
        const nextBtn = overlay.querySelector('.lightbox-nav.next');
        const lightboxImage = overlay.querySelector('.lightbox-image');

        let currentLightboxIndex = startIndex;

        const updateLightboxImage = () => {
            lightboxImage.src = this.productImages[currentLightboxIndex];
        };

        closeBtn.addEventListener('click', () => {
            this.closeLightbox(overlay);
        });

        // Show/hide navigation buttons if there's only one image in the lightbox
        if (this.productImages.length <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        }

        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentLightboxIndex = (currentLightboxIndex - 1 + this.productImages.length) % this.productImages.length;
            updateLightboxImage();
        });

        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentLightboxIndex = (currentLightboxIndex + 1) % this.productImages.length;
            updateLightboxImage();
        });

        // Close lightbox on overlay click (but not on content click)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeLightbox(overlay);
            }
        });

        // Keyboard navigation for lightbox
        document.addEventListener('keydown', this.handleLightboxKeydown = (e) => {
            if (overlay.classList.contains('active')) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    if (this.productImages.length > 1) { // Only navigate if multiple images
                       currentLightboxIndex = (currentLightboxIndex - 1 + this.productImages.length) % this.productImages.length;
                       updateLightboxImage();
                    }
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    if (this.productImages.length > 1) { // Only navigate if multiple images
                       currentLightboxIndex = (currentLightboxIndex + 1) % this.productImages.length;
                       updateLightboxImage();
                    }
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    this.closeLightbox(overlay);
                }
            }
        });

        // Stop auto-play when lightbox is open
        this.stopAutoPlay();
    }

    closeLightbox(overlay) {
        overlay.classList.remove('active');
        overlay.addEventListener('transitionend', () => {
            overlay.remove();
        }, { once: true });
        document.removeEventListener('keydown', this.handleLightboxKeydown); // Remove keydown listener
        this.startAutoPlay(); // Restart auto-play when lightbox is closed
    }
}

// Initialize carousels when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeCarousels();
});

// Also initialize when content is dynamically loaded
function initializeCarousels() {
    const carousels = document.querySelectorAll('.image-carousel');
    carousels.forEach(carousel => {
        // Skip if already initialized
        if (carousel.dataset.initialized) return;

        // Mark as initialized
        carousel.dataset.initialized = 'true';

        // Initialize carousel
        new ImageCarousel(carousel);
    });
}

// Utility function to reinitialize carousels (useful for dynamic content)
window.reinitializeCarousels = function() {
    // Remove initialization markers
    document.querySelectorAll('.image-carousel').forEach(carousel => {
        delete carousel.dataset.initialized;
        // Also remove dynamically added carousel parts to re-create them cleanly
        const existingContainer = carousel.querySelector('.carousel-container');
        if (existingContainer) existingContainer.remove();
        const existingNavs = carousel.querySelectorAll('.carousel-nav');
        existingNavs.forEach(nav => nav.remove());
        const existingIndicators = carousel.querySelector('.carousel-indicators');
        if (existingIndicators) existingIndicators.remove();

        // Reset image classes, as they might retain 'active' from previous init
        carousel.querySelectorAll('.carousel-image').forEach((img, idx) => {
            img.classList.remove('active');
            if (idx === 0) img.classList.add('active');
        });
    });

    // Reinitialize
    initializeCarousels();
};

// Enhanced image loading with error handling
function enhanceImageLoading() {
    const images = document.querySelectorAll('.carousel-image');

    images.forEach(img => {
        // Check if image is already loaded or has a source
        if (img.complete || img.src) { // Check img.src as well for previously set images
            // Remove loading state if it exists
            const existingLoadingDiv = img.parentNode.querySelector('.carousel-image-loading');
            if (existingLoadingDiv) {
                existingLoadingDiv.remove();
            }
            img.style.opacity = '1';
            return;
        }

        // Add loading state
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'carousel-image-loading';
        img.parentNode.appendChild(loadingDiv);

        // Handle image load
        img.addEventListener('load', () => {
            loadingDiv.remove();
            img.style.opacity = '1';
        }, { once: true }); // Use once: true to prevent multiple listeners

        // Handle image error
        img.addEventListener('error', () => {
            loadingDiv.remove();
            img.style.opacity = '0.5';
            img.alt = 'Image not available';
        }, { once: true }); // Use once: true
    });
}

// Initialize enhanced image loading
document.addEventListener('DOMContentLoaded', enhanceImageLoading);

// Intersection Observer for performance optimization (lazy loading)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                // Only load if it has data-src attribute and hasn't loaded yet
                if (img.dataset.src && !img.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img); // Stop observing once loaded
            }
        });
    }, {
        rootMargin: '0px 0px 50px 0px', // Load images when they are 50px away from viewport bottom
        threshold: 0.1 // Trigger when 10% of image is visible
    });

    // Observe images with data-src attribute (lazy loading)
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.carousel-image[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    });
}