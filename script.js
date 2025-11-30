let articlesData = [];
let currentCategory = 'all';
let currentArticle = null;
let currentZoom = 1;
let isDragging = false;
let startX, startY;
let translateX = 0, translateY = 0;

// carica i dati degli articoli
async function loadArticles() {
    try {
        const response = await fetch('articles.json');
        articlesData = await response.json();
        renderArticles();
    } catch (error) {
        console.error('Errore nel caricamento degli articoli:', error);
    }
}

function openImageModal(src) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    modal.classList.add('active');
    modalImg.src = src;
    currentZoom = 1;
    translateX = 0;
    translateY = 0;
    updateImageTransform();
    document.body.style.overflow = 'hidden';
}

function closeImageModal(event) {
    if (event.target.classList.contains('image-modal') || 
        event.target.classList.contains('image-modal-close')) {
        const modal = document.getElementById('imageModal');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        currentZoom = 1;
        translateX = 0;
        translateY = 0;
    }
}

function updateImageTransform() {
    const modalImg = document.getElementById('modalImage');
    modalImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;
}

function zoomIn(event) {
    event.stopPropagation();
    currentZoom = Math.min(currentZoom + 0.5, 5);
    updateImageTransform();
}

function zoomOut(event) {
    event.stopPropagation();
    currentZoom = Math.max(currentZoom - 0.5, 0.5);
    updateImageTransform();
}

function resetZoom(event) {
    event.stopPropagation();
    currentZoom = 1;
    translateX = 0;
    translateY = 0;
    updateImageTransform();
}

function renderArticles(category = 'all', searchTerm = '') {
    const grid = document.getElementById('articlesGrid');
    grid.innerHTML = '';
    
    let filtered = articlesData.filter(article => {
        const matchesCategory = category === 'all' || article.category === category;
        const matchesSearch = searchTerm === '' || 
            article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    filtered.forEach(article => {
        const card = document.createElement('div');
        card.className = 'article-card';
        card.onclick = () => showArticle(article.id);
        
        card.innerHTML = `
            <div class="article-header">
                <div>
                    <h2 class="article-title">${article.title}</h2>
                    <div class="article-meta">
                        <span>${article.date}</span>
                        <span>•</span>
                        <span>${article.author}</span>
                    </div>
                </div>
                <span class="article-category">${article.category}</span>
            </div>
            <p class="article-excerpt">${article.excerpt}</p>
        `;
        
        grid.appendChild(card);
    });
}

function showArticle(id) {
    const article = articlesData.find(a => a.id === id);
    if (!article) return;

    currentArticle = article;
    
    const grid = document.getElementById('articlesGrid');
    const view = document.getElementById('articleView');
    
    grid.classList.add('hidden');
    view.classList.remove('hidden');

    let contentHtml = '';
    article.content.forEach(block => {
        if (block.type === 'text') {
            contentHtml += block.content;
        } else if (block.type === 'image') {
            contentHtml += `
                <div class="article-image-container">
                    <div class="translation-box">
                        <img src="${block.src}" alt="Article image" class="article-image" onclick="openImageModal('${block.src}')" style="cursor: zoom-in;">
                        <div class="source-note">${block.sourceNote}</div>
                        <div class="translation-text">${block.translation}</div>
                        <div class="translation-warning">
                            <span>Questo testo è fornito a scopo informativo, è stato tradotto con deepl.com e potrebbe non essere accurato.</span>
                        </div>
                        <a href="${block.sourceUrl}" target="_blank" rel="noopener noreferrer" class="source-link">
                            Visualizza la fonte
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                        </a>
                    </div>
                </div>
            `;
        }
    });

    view.innerHTML = `
        <div class="breadcrumb">
            <a href="#" onclick="showHome(); return false;">Home</a>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
            <span>${article.category}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
            <span>${article.title}</span>
        </div>
        
        <h1 class="article-full-title">${article.title}</h1>
        
        <div class="article-full-meta">
            <span>Published: ${article.date}</span>
            <span>•</span>
            <span>Author: ${article.author}</span>
            <span>•</span>
            <span>Category: ${article.category}</span>
        </div>
        
        <div class="article-content">
            ${contentHtml}
        </div>
    `;
}

function showHome() {
    const grid = document.getElementById('articlesGrid');
    const view = document.getElementById('articleView');
    
    grid.classList.remove('hidden');
    view.classList.add('hidden');
    currentArticle = null;
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    loadArticles();

    // Category filtering
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            renderArticles(currentCategory, document.getElementById('searchInput').value);
        });
    });

    // Search functionality
    document.getElementById('searchInput').addEventListener('input', function(e) {
        renderArticles(currentCategory, e.target.value);
    });

    // Image modal interactions
    const modalImage = document.getElementById('modalImage');
    
    modalImage.addEventListener('mousedown', function(e) {
        if (currentZoom > 1) {
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            modalImage.style.cursor = 'grabbing';
        }
    });

    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            e.preventDefault();
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateImageTransform();
        }
    });

    document.addEventListener('mouseup', function() {
        isDragging = false;
        if (modalImage) {
            modalImage.style.cursor = 'move';
        }
    });

    modalImage.addEventListener('touchstart', function(e) {
        if (currentZoom > 1 && e.touches.length === 1) {
            isDragging = true;
            startX = e.touches[0].clientX - translateX;
            startY = e.touches[0].clientY - translateY;
        }
    });

    document.addEventListener('touchmove', function(e) {
        if (isDragging && e.touches.length === 1) {
            e.preventDefault();
            translateX = e.touches[0].clientX - startX;
            translateY = e.touches[0].clientY - startY;
            updateImageTransform();
        }
    }, { passive: false });

    document.addEventListener('touchend', function() {
        isDragging = false;
    });

    modalImage.addEventListener('wheel', function(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        currentZoom = Math.max(0.5, Math.min(5, currentZoom + delta));
        updateImageTransform();
    }, { passive: false });

    // Close modal on Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modal = document.getElementById('imageModal');
            if (modal.classList.contains('active')) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        }
    });
});