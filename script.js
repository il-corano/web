let articlesData = [];
let currentCategory = 'all';
let currentArticle = null;
let currentZoom = 1;
let isDragging = false;
let startX, startY;
let translateX = 0, translateY = 0;
let currentImageIndex = 0;
let currentImageArray = [];

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

function openImageModal(images, startIndex = 0) {
    console.log('openImageModal chiamata con:', images, 'index:', startIndex);
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    
    if (!modal || !modalImg) {
        console.error('Modal o immagine modal non trovati nel DOM');
        return;
    }
    
    currentImageArray = Array.isArray(images) ? images : [images];
    currentImageIndex = startIndex;
    
    modal.classList.add('active');
    modalImg.src = currentImageArray[currentImageIndex];
    currentZoom = 1;
    translateX = 0;
    translateY = 0;
    updateImageTransform();
    updateNavigationButtons();
    document.body.style.overflow = 'hidden';
}

function updateNavigationButtons() {
    const prevBtn = document.querySelector('.nav-btn.prev');
    const nextBtn = document.querySelector('.nav-btn.next');
    const counter = document.querySelector('.image-counter');
    
    if (currentImageArray.length > 1) {
        if (prevBtn) prevBtn.style.display = 'flex';
        if (nextBtn) nextBtn.style.display = 'flex';
        if (counter) {
            counter.style.display = 'block';
            counter.textContent = `${currentImageIndex + 1} / ${currentImageArray.length}`;
        }
    } else {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        if (counter) counter.style.display = 'none';
    }
}

function navigateImage(direction) {
    if (direction === 'prev') {
        currentImageIndex = (currentImageIndex - 1 + currentImageArray.length) % currentImageArray.length;
    } else {
        currentImageIndex = (currentImageIndex + 1) % currentImageArray.length;
    }
    
    const modalImg = document.getElementById('modalImage');
    modalImg.src = currentImageArray[currentImageIndex];
    currentZoom = 1;
    translateX = 0;
    translateY = 0;
    updateImageTransform();
    updateNavigationButtons();
}

function closeImageModal(event) {
    if (event && (event.target.classList.contains('image-modal') || 
        event.target.classList.contains('image-modal-close'))) {
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
    if (modalImg) {
        modalImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;
    }
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
            // Gestione src come array o stringa singola
            const images = Array.isArray(block.src) ? block.src : [block.src];
            
            // Crea la galleria di miniature
            const thumbnailsHtml = images.map((imgSrc, index) => `
                <img src="${imgSrc}" 
                     alt="Image ${index + 1}" 
                     class="gallery-thumbnail" 
                     data-images='${JSON.stringify(images).replace(/'/g, "&apos;")}' 
                     data-index="${index}"
                     style="cursor: pointer;">
            `).join('');
            
            contentHtml += `
                <div class="article-image-container">
                    <div class="translation-box">
                        <div class="image-gallery">
                            ${thumbnailsHtml}
                        </div>
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
            <span>Pubblicazione: ${article.date}</span>
            <span>•</span>
            <span>Autore: ${article.author}</span>
            <span>•</span>
            <span>Categoria: ${article.category}</span>
        </div>
        
        <div class="article-content">
            ${contentHtml}
        </div>
    `;
    
    // aggiungi event listener alle immagini DOPO che sono state aggiunte al DOM
    view.querySelectorAll('.gallery-thumbnail').forEach(img => {
        img.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const images = JSON.parse(this.dataset.images);
            const index = parseInt(this.dataset.index);
            console.log('Immagine cliccata:', images, 'index:', index);
            openImageModal(images, index);
        });
    });
    
    // Mantieni il supporto per le vecchie immagini singole
    view.querySelectorAll('.article-image').forEach(img => {
        img.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Immagine cliccata:', this.src);
            openImageModal(this.src);
        });
    });
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
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            renderArticles(currentCategory, e.target.value);
        });
    }

    // Image modal interactions
    const modalImage = document.getElementById('modalImage');
    
    if (modalImage) {
        modalImage.addEventListener('mousedown', function(e) {
            if (currentZoom > 1) {
                isDragging = true;
                startX = e.clientX - translateX;
                startY = e.clientY - translateY;
                modalImage.style.cursor = 'grabbing';
            }
        });

        modalImage.addEventListener('touchstart', function(e) {
            if (currentZoom > 1 && e.touches.length === 1) {
                isDragging = true;
                startX = e.touches[0].clientX - translateX;
                startY = e.touches[0].clientY - translateY;
            }
        });

        modalImage.addEventListener('wheel', function(e) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            currentZoom = Math.max(0.5, Math.min(5, currentZoom + delta));
            updateImageTransform();
        }, { passive: false });
    }

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

    // Close modal on Escape key
    document.addEventListener('keydown', function(event) {
        const modal = document.getElementById('imageModal');
        if (modal && modal.classList.contains('active')) {
            if (event.key === 'Escape') {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            } else if (event.key === 'ArrowLeft') {
                navigateImage('prev');
            } else if (event.key === 'ArrowRight') {
                navigateImage('next');
            }
        }
    });
});