// DOM Elements
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const preview = document.getElementById('preview');
const analyzeBtn = document.getElementById('analyze-btn');
const apiKeyInput = document.getElementById('api-key');
const resultSection = document.getElementById('result-section');
const resultContent = document.getElementById('result-content');
const loading = document.getElementById('loading');
const themeToggle = document.getElementById('theme-toggle');

let selectedFile = null;
let imageBase64 = null;

// Load saved API key
const savedApiKey = localStorage.getItem('gemini-api-key');
if (savedApiKey) {
    apiKeyInput.value = savedApiKey;
}

// File upload handlers
uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        handleFile(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

function handleFile(file) {
    selectedFile = file;
    const reader = new FileReader();

    reader.onload = (e) => {
        preview.src = e.target.result;
        uploadArea.classList.add('has-image');
        imageBase64 = e.target.result.split(',')[1];
        updateAnalyzeButton();
    };

    reader.readAsDataURL(file);
}

// API key handler
apiKeyInput.addEventListener('input', () => {
    localStorage.setItem('gemini-api-key', apiKeyInput.value);
    updateAnalyzeButton();
});

function updateAnalyzeButton() {
    analyzeBtn.disabled = !imageBase64 || !apiKeyInput.value.trim();
}

// Analyze button handler
analyzeBtn.addEventListener('click', analyzeImage);

async function analyzeImage() {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey || !imageBase64) return;

    showLoading(true);
    hideResult();

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        {
                            text: `이 음식 사진을 분석해서 칼로리 정보를 알려주세요.

다음 형식으로 JSON 응답해주세요:
{
    "foods": [
        {
            "name": "음식 이름",
            "portion": "예상 양 (예: 1인분, 200g 등)",
            "calories": 예상 칼로리(숫자만),
            "nutrients": "주요 영양소 간단 설명"
        }
    ],
    "totalCalories": 총 칼로리(숫자만),
    "advice": "식단에 대한 간단한 조언"
}

음식이 아닌 경우:
{
    "error": "음식을 인식할 수 없습니다. 음식 사진을 올려주세요."
}

JSON만 응답하고 다른 텍스트는 포함하지 마세요.`
                        },
                        {
                            inline_data: {
                                mime_type: selectedFile.type,
                                data: imageBase64
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.4,
                    topK: 32,
                    topP: 1,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API 오류: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('응답을 받지 못했습니다.');
        }

        // Parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('응답 형식 오류');
        }

        const result = JSON.parse(jsonMatch[0]);
        displayResult(result);
    } catch (error) {
        console.error('Error:', error);
        displayError(error.message);
    } finally {
        showLoading(false);
    }
}

function displayResult(result) {
    if (result.error) {
        displayError(result.error);
        return;
    }

    let html = '';

    if (result.foods && result.foods.length > 0) {
        for (const food of result.foods) {
            html += `
                <div class="food-item">
                    <div class="food-name">${food.name}</div>
                    <div class="food-details">
                        <div>양: ${food.portion}</div>
                        <div>칼로리: ${food.calories} kcal</div>
                        <div>영양소: ${food.nutrients}</div>
                    </div>
                </div>
            `;
        }
    }

    if (result.totalCalories) {
        html += `<div class="total-calories">총 칼로리: ${result.totalCalories} kcal</div>`;
    }

    if (result.advice) {
        html += `<p style="margin-top: 1rem; opacity: 0.8;">💡 ${result.advice}</p>`;
    }

    resultContent.innerHTML = html;
    resultSection.classList.add('visible');
}

function displayError(message) {
    resultContent.innerHTML = `<div class="error-message">⚠️ ${message}</div>`;
    resultSection.classList.add('visible');
}

function showLoading(show) {
    loading.classList.toggle('visible', show);
    analyzeBtn.disabled = show;
}

function hideResult() {
    resultSection.classList.remove('visible');
}

// Theme toggle functionality
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');

    if (currentTheme === 'light') {
        body.removeAttribute('data-theme');
        themeToggle.textContent = '🌙';
        localStorage.setItem('theme', 'dark');
    } else {
        body.setAttribute('data-theme', 'light');
        themeToggle.textContent = '☀️';
        localStorage.setItem('theme', 'light');
    }
}

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.setAttribute('data-theme', 'light');
        themeToggle.textContent = '☀️';
    }
}

themeToggle.addEventListener('click', toggleTheme);

// Initial setup
loadTheme();
