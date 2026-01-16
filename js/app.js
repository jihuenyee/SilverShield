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
        keywords: [
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
// Scam Type Definitions with Explanations
// ==========================================

const SCAM_TYPES = {
    phishing: {
        name: 'Phishing Scam',
        emoji: '🎣',
        keywords: [
            'verify account', 'confirm identity', 'update profile', 'validate', 
            'authenticate', 'security alert', 'unusual activity', 'click link', 
            'download attachment', 'verify password', 'confirm account'
        ],
        explanation: 'A phishing scam tricks you into revealing sensitive information like passwords, credit card numbers, or personal details by pretending to be a trustworthy company. Scammers create fake websites or emails that look legitimate to steal your information.',
        redFlags: [
            'Requests to verify or update personal information',
            'Suspicious links in emails or messages',
            'Pressure to click a link or download something',
            'Generic greetings like "Dear User" instead of your name'
        ]
    },
    
    impersonation: {
        name: 'Impersonation Scam',
        emoji: '🎭',
        keywords: [
            'amazon', 'apple', 'paypal', 'microsoft', 'bank', 'irs', 'federal',
            'account suspended', 'unauthorized access', 'unusual activity', 
            'confirm details', 'verify account', 'action required'
        ],
        explanation: 'Scammers pretend to be a company or organization you trust (like a bank, tech company, or government agency) to trick you into sending money or revealing personal information. They copy official emails and websites to look authentic.',
        redFlags: [
            'Urgent messages claiming account issues',
            'Requests to verify account information',
            'Links that look like official companies but have slight URL differences',
            'Poor spelling or grammar from "official" sources'
        ]
    },
    
    lottery: {
        name: 'Lottery/Prize Scam',
        emoji: '🎰',
        keywords: [
            'congratulations', 'won', 'claim prize', 'lottery', 'winnings',
            'claim reward', 'inheritance', 'legal settlement', 'refund due',
            'unclaimed', 'bonus', 'select winner', 'prize'
        ],
        explanation: 'You receive a message saying you\'ve won a prize, lottery, or inheritance—but you never entered! To claim the "prize," you must pay fees or provide personal information. In reality, you\'ll never receive anything, and you\'ve just been robbed.',
        redFlags: [
            'You never entered any contest or lottery',
            'Request for payment to claim your "prize"',
            'Requests for personal or bank information',
            'Too-good-to-be-true prize amounts'
        ]
    },
    
    family: {
        name: 'Family Emergency Scam',
        emoji: '👨‍👩‍👧‍👦',
        keywords: [
            'mom', 'dad', 'son', 'daughter', 'grandma', 'grandpa',
            'aunt', 'uncle', 'cousin',
            'it’s me', 'new number', 'can’t talk',
            'emergency', 'hospital', 'accident',
            'need money', 'urgent help', 'please don’t tell'
        ],
        explanation: 'A scammer pretends to be a family member who claims to be in trouble. They often say they are using a new phone number and ask for money urgently due to an emergency such as an accident or hospital bill. The message pressures you to act quickly before you can verify the situation.',
        redFlags: [
            'Message claims to be from a family member using a new number',
            'Urgent requests for money or gift cards',
            'Pressure to act quickly or keep it a secret',
            'Refusal to make a phone or video call',
            'Vague details about the emergency'
        ]
    },
    
    payment: {
        name: 'Payment/Financial Scam',
        emoji: '💳',
        keywords: [
            'payment', 'bank account', 'card details', 'credit card',
            'wire transfer', 'apple itunes', 'amazon gift card', 'bitcoin',
            'transaction failed', 'update payment', 'billing information',
            'purchase', 'payment method', 'refund'
        ],
        explanation: 'Scammers request money through various methods (gift cards, wire transfers, cryptocurrency) for fake purchases, deposits, or to "unlock" money. Once you pay, the scammer disappears and you cannot recover your money.',
        redFlags: [
            'Requests for payment via untraceable methods (gift cards, wire transfer)',
            'Claiming you owe money or must pay for something you don\'t recognize',
            'Requests for unusual payment methods',
            'Guarantees of money back or profit'
        ]
    },
    
    tech_support: {
        name: 'Tech Support Scam',
        emoji: '🔧',
        keywords: [
            'your computer', 'virus', 'infected', 'malware', 'update',
            'system error', 'security warning', 'technical support',
            'call now', 'click here', 'download', 'fix'
        ],
        explanation: 'You see a pop-up warning your device is infected or has a problem. It tells you to call a number or click a link to fix it. Scammers then charge you for fake repairs or steal your information when you give them remote access to your device.',
        redFlags: [
            'Unexpected security warnings while browsing',
            'Pop-ups demanding immediate action',
            'Phone numbers in messages asking you to call for tech support',
            'Requests for remote access to your computer'
        ]
    },
    
    employment: {
        name: 'Employment/Job Scam',
        emoji: '💼',
        keywords: [
            'job offer', 'work from home', 'make money', 'hiring', 'employment',
            'salary', 'position', 'hire you', 'interview', 'application',
            'deposit', 'start working', 'no experience needed'
        ],
        explanation: 'A fake job offer seems perfect—high pay, work from home, no experience needed. Once you apply, you\'re asked to pay for training, equipment, or deposit a check. The job doesn\'t exist, and the check may bounce after you\'ve already spent your money.',
        redFlags: [
            'High pay for minimal work or no experience required',
            'Requests for money before you start working',
            'Checks mailed to you that you\'re asked to deposit',
            'No formal interview process or background check'
        ]
    },
    
    business: {
        name: 'Business/Investment Scam',
        emoji: '📈',
        keywords: [
            'investment', 'business opportunity', 'make money', 'forex',
            'trading', 'crypto', 'bitcoin', 'stock', 'profit',
            'guaranteed return', 'limited time', 'exclusive'
        ],
        explanation: 'Someone offers a "guaranteed" business opportunity or investment promising quick, easy profits. After you invest money, it disappears, or they ask for more money. The promised returns never materialize.',
        redFlags: [
            'Guaranteed returns (no investment is guaranteed)',
            'Pressure to act quickly before "offer expires"',
            'High returns with low risk (unrealistic)',
            'Requests for upfront investment fees'
        ]
    },
    
    delivery: {
        name: 'Delivery/Package Scam',
        emoji: '📦',
        keywords: [
            'package', 'delivery', 'shipment', 'courier', 'tracking',
            'failed delivery', 'confirm address', 'update payment',
            'customs', 'fee', 'parcel'
        ],
        explanation: 'You receive a message about a package that couldn\'t be delivered or needs payment. The link in the message is fake and leads to a phishing site that steals your information, or you\'re asked to pay a "delivery fee."',
        redFlags: [
            'You\'re not expecting a package',
            'Suspicious links to "track" your package',
            'Requests for payment for delivery',
            'Messages from unknown delivery companies'
        ]
    },

    government: {
        name: 'Government/Tax Scam',
        emoji: '🏛️',
        keywords: [
            'irs', 'tax', 'federal', 'government', 'tax return', 'penalty',
            'refund', 'wage', 'audit', 'illegal activity', 'warrant',
            'legal action', 'arrest'
        ],
        explanation: 'Scammers pretend to be from the IRS or tax authority, threatening legal action or arrest if you don\'t pay immediately. They create urgency and fear to make you pay taxes you don\'t owe, often requesting unusual payment methods.',
        redFlags: [
            'Threats of arrest or legal action',
            'Requests for payment via gift cards or wire transfer',
            'Insistence on immediate payment',
            'Threatening tone or language'
        ]
    }
};

// ==========================================
// DOM Elements
// ==========================================

const scamCheckerForm = document.getElementById('scamCheckerForm');
const messageInput = document.getElementById('messageInput');
const sourceSelect = document.getElementById('sourceSelect');
const resultsContainer = document.getElementById('resultsContainer');
const contactForm = document.getElementById('contactForm');
// Focus message input when 'Start Checking Now' is clicked (ensure DOM is ready)
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.cta-button').forEach(btn => {
        btn.addEventListener('click', function(e) {
            setTimeout(() => {
                const input = document.getElementById('messageInput');
                if (input) input.focus();
            }, 300);
        });
    });
});

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
 * Identify the type of scam based on message content
 * Returns the detected scam type with explanation and red flags
 */
function identifyScamType(message) {
    const lowerMessage = message.toLowerCase();
    let scamTypeScores = {};
    
    // Score each scam type based on keyword matches
    for (const [scamType, scamInfo] of Object.entries(SCAM_TYPES)) {
        let score = 0;
        const matchedKeywords = [];
        
        scamInfo.keywords.forEach(keyword => {
            if (lowerMessage.includes(keyword.toLowerCase())) {
                score += 10;
                matchedKeywords.push(keyword);
            }
        });
        
        if (score > 0) {
            scamTypeScores[scamType] = {
                score: score,
                matchedKeywords: [...new Set(matchedKeywords)].slice(0, 5)
            };
        }
    }
    
    // Find the highest scoring scam type
    let detectedScamType = null;
    let maxScore = 0;
    
    for (const [scamType, data] of Object.entries(scamTypeScores)) {
        if (data.score > maxScore) {
            maxScore = data.score;
            detectedScamType = scamType;
        }
    }
    
    if (detectedScamType) {
        return {
            type: detectedScamType,
            info: SCAM_TYPES[detectedScamType],
            matchedKeywords: scamTypeScores[detectedScamType].matchedKeywords,
            confidence: Math.min(Math.round((maxScore / 100) * 100), 100)
        };
    }
    
    return null;
}

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
    
    // Identify scam type
    const scamType = identifyScamType(message);
    
    return {
        riskScore: riskScore,
        detectedPatterns: detectedPatterns,
        riskLevel: getRiskLevel(riskScore),
        scamType: scamType
    };
}

/**
 * Determine risk level based on score
 */




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


    // Show results container immediately for instant feedback
    const resultsContainer = document.getElementById('resultsContainer');
    if (resultsContainer) {
        resultsContainer.style.display = 'block';
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // Show loading in Flowise panel
    const flowisePanel = document.getElementById('flowiseAnalysis');
    if (flowisePanel) flowisePanel.textContent = 'Loading...';

    // Flowise API call only
    fetch('https://cloud.flowiseai.com/api/v1/prediction/d2272e95-7b4c-4cd6-8dfd-5a3e817ba27c', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question: message })
    })
    .then(response => response.json())
    .then(data => {
        if (flowisePanel) {
            let answer = data?.text || data?.answer || JSON.stringify(data);
            flowisePanel.textContent = answer;
        }
        // Restore button
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        announceToScreenReader('Flowise analysis complete.');
    })
    .catch(err => {
        if (flowisePanel) flowisePanel.textContent = 'Flowise analysis unavailable.';
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    });
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
// Navigation & Smooth Scrolling
// ==========================================

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Check if it's an internal anchor link
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    // Get the navbar height to offset the scroll
                    const navbar = document.querySelector('.navbar');
                    const navbarHeight = navbar ? navbar.offsetHeight : 0;
                    
                    // Calculate the position accounting for fixed navbar
                    const targetPosition = targetElement.offsetTop - navbarHeight;
                    
                    // Smooth scroll to the target
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
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

    // Initialize navigation
    setupNavigation();

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
        identifyScamType
    };
}
