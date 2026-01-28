/**
 * AI Assistant - 臭臭
 * Gemini API integration for chat, image recognition, and image generation
 */

// 系统提示词 - 臭臭的人设
const SYSTEM_PROMPT = `你是"臭臭"，一个可爱又靠谱的青森旅行小助手。

你的特点：
- 说话简洁、亲切，偶尔有点俏皮
- 熟悉青森、八甲田、弘前等地的滑雪、美食、交通
- 擅长帮忙翻译日语、解答旅行问题
- 如果用户发图片（如菜单、路牌），帮忙识别和翻译

行程背景：
- 旅行者：丹丹（滑雪经验者）和金宝（初学者）
- 时间：2026年2月7日-13日
- 目的地：青森、八甲田、弘前、仙台
- 住宿：Dormy Inn 青森
- 主要活动：滑雪、看雪灯笼祭、温泉、美食

请用中文回复，保持简洁有用。`;

// DOM Elements
const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const btnSend = document.getElementById('btn-send');
const btnCamera = document.getElementById('btn-camera');
const btnUpload = document.getElementById('btn-upload');
const btnGenerate = document.getElementById('btn-generate');
const fileInput = document.getElementById('file-input');

// Chat history
let chatHistory = [];

// Add message to chat
function addMessage(content, type = 'ai', isImage = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;

    if (isImage) {
        messageDiv.classList.add('message-image');
        const img = document.createElement('img');
        img.src = content;
        messageDiv.appendChild(img);
    } else {
        messageDiv.innerHTML = content.replace(/\n/g, '<br>');
    }

    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    return messageDiv;
}

// Add loading indicator
function addLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message message-ai message-loading';
    loadingDiv.id = 'loading';
    loadingDiv.innerHTML = '<span></span><span></span><span></span>';
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Remove loading indicator
function removeLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.remove();
}

// Call Gemini API
async function callGemini(prompt, imageBase64 = null) {
    const apiKey = window.GEMINI_API_KEY;

    if (!apiKey) {
        return '⚠️ 请先配置Gemini API Key（在ai.html文件中）';
    }

    const model = imageBase64 ? 'gemini-1.5-flash' : 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    let parts = [];

    // Add system prompt if first message
    if (chatHistory.length === 0) {
        parts.push({ text: SYSTEM_PROMPT + '\n\n用户: ' + prompt });
    } else {
        parts.push({ text: prompt });
    }

    // Add image if provided
    if (imageBase64) {
        parts.unshift({
            inlineData: {
                mimeType: 'image/jpeg',
                data: imageBase64
            }
        });
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{ parts }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024
                }
            })
        });

        const data = await response.json();

        if (data.error) {
            return `⚠️ API错误: ${data.error.message}`;
        }

        return data.candidates?.[0]?.content?.parts?.[0]?.text || '抱歉，我没有理解你的意思';
    } catch (error) {
        console.error('Gemini API error:', error);
        return '⚠️ 网络错误，请稍后再试';
    }
}

// Call Imagen API for image generation
async function generateImage(prompt) {
    const apiKey = window.GEMINI_API_KEY;

    if (!apiKey) {
        return { error: '请先配置Gemini API Key' };
    }

    // Note: Imagen API requires specific endpoint and may have restrictions
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `Generate an image: ${prompt}` }]
                }],
                generationConfig: {
                    responseModalities: ["TEXT", "IMAGE"]
                }
            })
        });

        const data = await response.json();

        if (data.error) {
            return { error: data.error.message };
        }

        // Extract image from response
        const parts = data.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
            if (part.inlineData) {
                return {
                    imageData: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
                };
            }
        }

        return { error: '未能生成图片' };
    } catch (error) {
        console.error('Image generation error:', error);
        return { error: '网络错误' };
    }
}

// Handle send message
async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    // Add user message
    addMessage(text, 'user');
    chatHistory.push({ role: 'user', content: text });
    userInput.value = '';

    // Show loading
    addLoading();
    btnSend.disabled = true;

    // Get AI response
    const response = await callGemini(text);

    // Remove loading and add response
    removeLoading();
    addMessage(response, 'ai');
    chatHistory.push({ role: 'ai', content: response });
    btnSend.disabled = false;
}

// Handle image upload
async function handleImageUpload(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result.split(',')[1];
            resolve(base64);
        };
        reader.readAsDataURL(file);
    });
}

// Handle file selection
async function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Show image preview
    const reader = new FileReader();
    reader.onload = async (e) => {
        addMessage(e.target.result, 'user', true);
        addMessage('请帮我看看这张图片', 'user');

        addLoading();
        btnSend.disabled = true;

        const base64 = e.target.result.split(',')[1];
        const response = await callGemini('请帮我识别和解释这张图片，如果有日文请翻译成中文', base64);

        removeLoading();
        addMessage(response, 'ai');
        btnSend.disabled = false;
    };
    reader.readAsDataURL(file);

    // Reset file input
    fileInput.value = '';
}

// Handle image generation
async function handleGenerate() {
    const prompt = window.prompt('描述你想生成的图片：');
    if (!prompt) return;

    addMessage(`请生成：${prompt}`, 'user');
    addLoading();

    const result = await generateImage(prompt);
    removeLoading();

    if (result.error) {
        addMessage(`⚠️ ${result.error}`, 'ai');
    } else if (result.imageData) {
        addMessage(result.imageData, 'ai', true);
    }
}

// Event listeners
btnSend.addEventListener('click', handleSend);

userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
});

// Auto-resize textarea
userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
});

btnUpload.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
btnGenerate.addEventListener('click', handleGenerate);

// Camera button (uses file input with capture)
btnCamera.addEventListener('click', () => {
    fileInput.setAttribute('capture', 'environment');
    fileInput.click();
    fileInput.removeAttribute('capture');
});

// Clear welcome message on first interaction
function clearWelcome() {
    const welcome = document.querySelector('.chat-welcome');
    if (welcome) welcome.remove();
}

btnSend.addEventListener('click', clearWelcome, { once: true });
fileInput.addEventListener('change', clearWelcome, { once: true });
