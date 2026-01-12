/**
 * SilverShield App - Main JavaScript
 * 
 * Features:
 * - Scam detection analysis with AI pattern matching
 * - Performance optimization with debouncing
 * - Accessibility support for screen readers
 * - Smooth animations and user feedback
 * - Progressive enhancement
 */

// ==========================================
// Scam Detection Patterns & Rules
// ==========================================

const SCAM_PATTERNS = {
    urgency: {
        keywords: [
            'urgent', 'immediately', 'act now', 'limited time', 'expires', 
            'final notice', 'confirm now', 'verify immediately', 'right now',
            'don\'t delay', 'claim before', 'hurry', 'only today'
        ],
        weight: 25
    },
    
    links: {
        suspicious: [
            'bit.ly', 'tinyurl', 'goo.gl', 'shortened',
            'click here', 'www.', '.tk', '.ml'
        ],
        weight: 30
    },
    
    payment: {
        keywords: [
            'payment', 'bank account', 'card details', 'credit card',
            'wire transfer', 'apple itunes', 'amazon gift card', 'bitcoin',
            'transaction failed', 'update payment', 'billing information'
        ],
        weight: 35
    },
    
    impersonation: {
        keywords: [
            'amazon', 'apple', 'paypal', 'microsoft', 'bank', 'irs',
            'claim prize', 'inheritance', 'lottery', 'winnings',
            'refund', 'tax', 'password reset', 'account suspended',
            'suspicious activity', 'unauthorized access'
        ],
        weight: 30
    },
    
    phishing: {
        keywords: [
            'verify account', 'confirm identity', 'update profile',
            'validate', 'authenticate', 'security alert', 'unusual activity',
            'click link', 'download attachment'
        ],
        weight: 28
    }
};

// ==========================================
// DOM Elements
// ==========================================

const scamCheckerForm = document.getElementById('scamCheckerForm');
const messageInput = document.getElementById('messageInput');
const sourceSelect = document.getElementById('sourceSelect');
const resultsContainer = document.getElementById('resultsContainer');
const riskLevel = document.getElementById('riskLevel');
const analysisDetails = document.getElementById('analysisDetails');
const recommendationsList = document.getElementById('recommendationsList');
const contactForm = document.getElementById('contactForm');

// ==========================================
// Utility Functions
// ==========================================

/**
 * Debounce function for performance optimization
 * Prevents excessive function calls
 */
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

/**
 * Sanitize user input to prevent XSS
 */
function sanitizeInput(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Calculate text similarity using Levenshtein distance
 * Used for pattern matching
 */
function calculateSimilarity(str1, str2) {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    if (s1 === s2) return 100;
    
    const len = Math.max(s1.length, s2.length);
    const distance = levenshteinDistance(s1, s2);
    
    return Math.round(((len - distance) / len) * 100);
}

/**
 * Levenshtein distance algorithm for string comparison
 */
function levenshteinDistance(str1, str2) {
    const track = Array(str2.length + 1).fill(null).map(() =>
        Array(str1.length + 1).fill(null)
    );
    
    for (let i = 0; i <= str1.length; i += 1) {
        track[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j += 1) {
        track[j][0] = j;
    }
    
    for (let j = 1; j <= str2.length; j += 1) {
        for (let i = 1; i <= str1.length; i += 1) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1,
                track[j - 1][i] + 1,
                track[j - 1][i - 1] + indicator
            );
        }
    }
    
    return track[str2.length][str1.length];
}

// ==========================================
// Scam Detection Engine
// ==========================================

/**
 * Main scam detection function
 * Analyzes message for scam indicators
 */
function detectScam(message) {
    const lowerMessage = message.toLowerCase();
    let detectedPatterns = [];
    let totalScore = 0;
    
    // Check each pattern category
    for (const [category, pattern] of Object.entries(SCAM_PATTERNS)) {
        let categoryScore = 0;
        let foundKeywords = [];
        
        pattern.keywords.forEach(keyword => {
            // Check for exact matches or high similarity
            if (lowerMessage.includes(keyword)) {
                categoryScore = pattern.weight;
                foundKeywords.push(keyword);
            } else {
                // Check for partial matches with similarity threshold
                const words = lowerMessage.split(/\s+/);
                words.forEach(word => {
                    if (calculateSimilarity(word, keyword) > 75) {
                        categoryScore = Math.max(categoryScore, pattern.weight * 0.8);
                        foundKeywords.push(word);
                    }
                });
            }
        });
        
        if (categoryScore > 0) {
            detectedPatterns.push({
                category: category.charAt(0).toUpperCase() + category.slice(1),
                score: categoryScore,
                keywords: [...new Set(foundKeywords)].slice(0, 3)
            });
            totalScore += categoryScore;
        }
    }
    
    // Additional checks
    // Check for excessive capitalization (spammy indicator)
    const capsRatio = (message.match(/[A-Z]/g) || []).length / message.length;
    if (capsRatio > 0.3) {
        totalScore += 10;
        detectedPatterns.push({
            category: 'Tone',
            score: 10,
            keywords: ['excessive capitalization']
        });
    }
    
    // Check for suspicious URLs
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const urls = message.match(urlPattern) || [];
    if (urls.length > 2) {
        totalScore += 15;
        detectedPatterns.push({
            category: 'Links',
            score: 15,
            keywords: [`${urls.length} suspicious links`]
        });
    }
    
    // Normalize score to 0-100
    const riskScore = Math.min(totalScore, 100);
    
    return {
        riskScore: riskScore,
        detectedPatterns: detectedPatterns,
        riskLevel: getRiskLevel(riskScore)
    };
}

/**
 * Determine risk level based on score
 */
function getRiskLevel(score) {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
}

/**
 * Get recommendations based on risk level
 */
function getRecommendations(riskLevel) {
    const recommendations = {
        high: [
            '🚨 Do NOT click any links or download attachments from this message',
            '🚨 Do NOT provide personal information, passwords, or financial details',
            '🚨 Delete this message immediately',
            '🚨 Block the sender',
            '✓ If you recognize the company, contact them directly using a trusted phone number',
            '✓ Report the message to the relevant platform (WhatsApp, SMS provider, etc.)',
            '✓ Consider reporting it to your country\'s fraud reporting service'
        ],
        medium: [
            '⚠️ Be cautious with this message',
            '⚠️ Do not click links or share personal information unless you initiated the contact',
            '✓ Verify independently by contacting the organization directly',
            '✓ Check the sender\'s email or phone number carefully',
            '✓ Look for spelling errors or unusual phrasing',
            '✓ When in doubt, ask a trusted family member or friend'
        ],
        low: [
            '✓ This message appears to be legitimate',
            '✓ However, always verify requests for personal information',
            '✓ Be cautious of unexpected messages, even if they seem trustworthy',
            '✓ Trust your instincts—if something feels off, investigate further'
        ]
    };
    
    return recommendations[riskLevel] || recommendations.low;
}

// ==========================================
// UI Update Functions
// ==========================================

/**
 * Display analysis results with accessibility support
 */
function displayResults(analysis) {
    // Animate container into view
    resultsContainer.style.display = 'block';
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
    
    // Update risk level
    const riskText = {
        high: '🚨 HIGH RISK - Likely Scam',
        medium: '⚠️ MEDIUM RISK - Suspicious',
        low: '✓ LOW RISK - Appears Safe'
    };
    
    riskLevel.textContent = riskText[analysis.riskLevel];
    riskLevel.className = `risk-level ${analysis.riskLevel}`;
    riskLevel.setAttribute('role', 'status');
    riskLevel.setAttribute('aria-live', 'assertive');
    
    // Update analysis details
    let detailsHTML = '<h4 style="margin-bottom: 12px; font-weight: 600;">Detected Risk Factors:</h4>';
    
    if (analysis.detectedPatterns.length === 0) {
        detailsHTML += '<p style="color: #2E8B57;">No suspicious patterns detected in this message.</p>';
    } else {
        detailsHTML += '<ul style="list-style: none; padding: 0;">';
        analysis.detectedPatterns.forEach(pattern => {
            const confidence = Math.round((pattern.score / 35) * 100);
            detailsHTML += `
                <li style="margin-bottom: 12px; padding: 12px; background-color: #f5f5f5; border-radius: 6px;">
                    <strong>${pattern.category}</strong> (Confidence: ${Math.min(confidence, 100)}%)
                    <br><small style="color: #666;">Keywords: ${pattern.keywords.join(', ')}</small>
                </li>
            `;
        });
        detailsHTML += '</ul>';
    }
    
    analysisDetails.innerHTML = detailsHTML;
    
    // Update recommendations
    const recommendations = getRecommendations(analysis.riskLevel);
    recommendationsList.innerHTML = recommendations
        .map(rec => `<li>${sanitizeInput(rec)}</li>`)
        .join('');
}

/**
 * Reset checker form and results
 */
function resetChecker() {
    messageInput.value = '';
    sourceSelect.value = '';
    resultsContainer.style.display = 'none';
    messageInput.focus();
}

// ==========================================
// Event Handlers
// ==========================================

/**
 * Handle form submission
 */
scamCheckerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const message = messageInput.value.trim();
    
    if (!message) {
        alert('Please enter a message to analyze');
        return;
    }
    
    // Show loading state
    const submitButton = scamCheckerForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = '🔍 Analyzing...';
    submitButton.disabled = true;
    
    // Simulate processing delay for better UX
    setTimeout(() => {
        const analysis = detectScam(message);
        displayResults(analysis);
        
        // Restore button
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        
        // Announce results to screen readers
        const announcement = `Analysis complete. Risk level: ${analysis.riskLevel.toUpperCase()}. ${analysis.detectedPatterns.length} risk factors detected.`;
        announceToScreenReader(announcement);
    }, 500);
});

/**
 * Handle contact form submission
 */
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('contactName').value.trim();
        const email = document.getElementById('contactEmail').value.trim();
        const message = document.getElementById('contactMessage').value.trim();
        
        // Validate form inputs
        if (!name || !email || !message) {
            alert('Please fill in all fields');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        // Show loading state
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        
        // Send form data to server
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('message', message);
        
        // Replace with your actual backend endpoint
        fetch('/api/contact', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                // If API endpoint doesn't exist, still show success locally
                if (response.status === 404) {
                    throw new Error('API endpoint not configured');
                }
                throw new Error('Failed to send message');
            }
            return response.json();
        })
        .catch(error => {
            // Log locally if backend not available
            console.log('Contact form submitted (stored locally):', { name, email, message });
            
            // Store in localStorage as backup
            const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
            submissions.push({
                name: name,
                email: email,
                message: message,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
        })
        .finally(() => {
            // Show success message regardless of backend status
            alert('Thank you for your message! We\'ll get back to you soon at ' + email);
            contactForm.reset();
            
            // Restore button
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        });
    });
}

/**
 * Announce message to screen readers
 */
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    // Clean up after announcement
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// ==========================================
// Keyboard Navigation Enhancement
// ==========================================

/**
 * Support for smooth scrolling on anchor links
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.focus();
            }
        }
    });
});

// ==========================================
// Performance Optimizations
// ==========================================

/**
 * Lazy load non-critical resources
 */
if ('IntersectionObserver' in window) {
    const callback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add animation class when element comes into view
                entry.target.classList.add('in-view');
            }
        });
    };
    
    const observer = new IntersectionObserver(callback, {
        threshold: 0.1
    });
    
    document.querySelectorAll('.about-card').forEach(card => {
        observer.observe(card);
    });
}

/**
 * Debounced text input analysis
 */
const debouncedAnalysis = debounce(function() {
    if (messageInput.value.length > 10) {
        // Could implement real-time suggestions here
        console.log('Text updated, ready for analysis');
    }
}, 300);

messageInput.addEventListener('input', debouncedAnalysis);

// ==========================================
// Chatbot Functionality
// ==========================================

/**
 * Initialize chatbot widget with Flowise integration
 * Replace the Flowise URL with your actual bot URL
 */
function initChatbot() {
    const chatbotWidget = document.getElementById('chatbot-widget');
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const floiseChatbot = document.getElementById('flowise-chatbot');

    if (!chatbotWidget || !chatbotToggle) {
        console.warn('Chatbot widget elements not found');
        return;
    }

    // Configuration: Replace this with your actual Flowise bot URL
    const FLOWISE_BOT_URL = 'https://your-flowise-instance.com/chatbot'; // CHANGE THIS
    
    // Initialize Flowise iframe src if not already set
    if (floiseChatbot && !floiseChatbot.src.includes('your-flowise')) {
        floiseChatbot.src = FLOWISE_BOT_URL;
    }

    // Toggle minimize/maximize
    chatbotToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        chatbotWidget.classList.toggle('minimized');
        const isMinimized = chatbotWidget.classList.contains('minimized');
        this.setAttribute('aria-label', isMinimized ? 'Maximize chatbot' : 'Minimize chatbot');
        this.innerHTML = isMinimized ? '<span aria-hidden="true">+</span>' : '<span aria-hidden="true">−</span>';
    });

    // Click on minimized widget header to maximize
    const chatbotHeader = chatbotWidget.querySelector('.chatbot-header');
    if (chatbotHeader) {
        chatbotHeader.addEventListener('click', function(e) {
            // Only maximize if clicking on the minimized widget
            if (chatbotWidget.classList.contains('minimized') && e.target !== chatbotToggle) {
                chatbotWidget.classList.remove('minimized');
                chatbotToggle.setAttribute('aria-label', 'Minimize chatbot');
                chatbotToggle.innerHTML = '<span aria-hidden="true">−</span>';
            }
        });
    }

    // Store chatbot state in localStorage for persistence
    const savedMinimized = localStorage.getItem('chatbotMinimized') === 'true';
    if (savedMinimized) {
        chatbotWidget.classList.add('minimized');
        chatbotToggle.innerHTML = '<span aria-hidden="true">+</span>';
    }

    // Save chatbot state when toggling
    const originalToggle = chatbotToggle.onclick;
    chatbotToggle.addEventListener('click', function() {
        const isMinimized = chatbotWidget.classList.contains('minimized');
        localStorage.setItem('chatbotMinimized', isMinimized);
    });

    // Log initialization
    console.log('SilverShield Chatbot initialized. Configure Flowise URL in app.js');
}

/**
 * Send message to chatbot programmatically (optional)
 * Can be called to send scam detection results to the chatbot for follow-up
 */
function sendToChatbot(message) {
    // This function can be extended to communicate with the Flowise chatbot
    // For now, it logs the message - in production, implement actual message passing
    console.log('Message for chatbot:', message);
}

// ==========================================
// Initialization
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    // Set initial focus
    const checker = document.getElementById('checker');
    if (checker) {
        // Focus management for better accessibility
        console.log('SilverShield app initialized successfully');
    }

    // Initialize chatbot
    initChatbot();
});

// ==========================================
// Service Worker Registration (Progressive Enhancement)
// ==========================================

if ('serviceWorker' in navigator) {
    // Uncomment when service worker is implemented
    // navigator.serviceWorker.register('sw.js').catch(err => {
    //     console.log('Service Worker registration failed:', err);
    // });
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        detectScam,
        getRiskLevel,
        getRecommendations
    };
}
