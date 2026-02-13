/* ========================================
   DIGITAL LIBRARY PRO - CORE APPLICATION
   Real‑time Stats · Downloads · Views · Live Feed
   ======================================== */

class DigitalLibraryPro {
    constructor() {
        this.books = [];
        this.uploadedBooks = [];
        this.selectedBooks = new Set();
        this.downloadsToday = 0;
        this.activeReaders = 8750; // base, increments on interactions
        this.totalDownloads = 0;
        this.todayDate = new Date().toDateString();
        
        this.init();
    }

    async init() {
        console.log('📚 Digital Library Pro initializing...');
        this.loadBooks();
        this.loadUploadedBooks();
        this.loadDailyStats();
        this.initializeDOMElements();
        this.renderBooks();
        this.renderTop3();
        this.updateStats();
        this.startLiveFeed();
        this.setupEventListeners();
        this.updateHeroBook();
        this.setCurrentYear();
        this.removePreloader();
    }

    loadBooks() {
        // Base collection with download & view counts
        this.books = [
            { id: 1, title: "The Future of Artificial Intelligence", category: "Technology", summary: "Complete guide to AI, ML, Neural Networks.", author: "Dr. Alan Turing", pages: 345, size: "4.2 MB", downloads: 15234, views: 28451, pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", icon: "fas fa-robot" },
            { id: 2, title: "Python Programming Mastery", category: "Programming", summary: "Learn Python from beginner to advanced.", author: "Guido van Rossum", pages: 892, size: "8.7 MB", downloads: 28451, views: 42109, pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", icon: "fas fa-code" },
            { id: 3, title: "Modern Web Development", category: "Technology", summary: "HTML5, CSS3, JavaScript, React, Node.js.", author: "Michael Chen", pages: 678, size: "12.5 MB", downloads: 21367, views: 35678, pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", icon: "fas fa-globe" },
            { id: 4, title: "Data Science Handbook", category: "Science", summary: "Python, R, SQL, Statistics, ML.", author: "Dr. Emma Wilson", pages: 523, size: "15.3 MB", downloads: 18453, views: 27543, pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", icon: "fas fa-chart-bar" },
            { id: 5, title: "Blockchain Revolution", category: "Technology", summary: "Bitcoin, Ethereum, Smart Contracts.", author: "Satoshi Nakamoto", pages: 412, size: "6.8 MB", downloads: 12456, views: 19876, pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", icon: "fas fa-link" },
            { id: 6, title: "Business Strategy 2024", category: "Business", summary: "Digital transformation, market analysis.", author: "Sarah Johnson", pages: 289, size: "3.9 MB", downloads: 9876, views: 15432, pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", icon: "fas fa-chart-line" },
            { id: 7, title: "Cybersecurity Essentials", category: "Technology", summary: "Network security, ethical hacking.", author: "Kevin Mitnick", pages: 567, size: "9.4 MB", downloads: 15678, views: 23456, pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", icon: "fas fa-shield-alt" },
            { id: 8, title: "Cloud Computing AWS", category: "Technology", summary: "AWS, Azure, GCP.", author: "Jeff Bezos", pages: 734, size: "18.2 MB", downloads: 11345, views: 18976, pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", icon: "fas fa-cloud" }
        ];
        this.totalDownloads = this.books.reduce((sum, b) => sum + b.downloads, 0);
    }

    loadUploadedBooks() {
        const saved = localStorage.getItem('digitalLibrary_uploadedBooks');
        if (saved) {
            try {
                this.uploadedBooks = JSON.parse(saved);
                this.books = [...this.books, ...this.uploadedBooks];
            } catch(e) {}
        }
    }

    loadDailyStats() {
        const savedToday = localStorage.getItem('digitalLibrary_todayDownloads');
        const savedDate = localStorage.getItem('digitalLibrary_todayDate');
        if (savedDate === this.todayDate && savedToday) {
            this.downloadsToday = parseInt(savedToday);
        } else {
            this.downloadsToday = Math.floor(Math.random() * 300) + 150;
            localStorage.setItem('digitalLibrary_todayDate', this.todayDate);
            localStorage.setItem('digitalLibrary_todayDownloads', this.downloadsToday);
        }
    }

    initializeDOMElements() {
        this.booksGrid = document.getElementById('booksGrid');
        this.top3Grid = document.getElementById('top3Grid');
        this.liveDownloads = document.getElementById('liveDownloads');
        this.updatesList = document.getElementById('updatesList');
        // ... other DOM refs (modals, etc.)
    }

    // ----- RENDERING -----
    renderBooks(filter = 'all') {
        if (!this.booksGrid) return;
        let filtered = this.books;
        if (filter !== 'all') {
            filtered = this.books.filter(b => b.category === filter);
        }
        this.booksGrid.innerHTML = filtered.map(book => this.createBookCard(book)).join('');
        this.attachBookEventListeners();
    }

    createBookCard(book) {
        return `
            <div class="book-card" data-id="${book.id}">
                <div class="book-pdf-badge"><i class="fas fa-file-pdf"></i> PDF</div>
                <div class="book-cover">
                    <i class="${book.icon} book-icon"></i>
                    <div class="book-download-badge">
                        <i class="fas fa-download"></i> ${this.formatNumber(book.downloads)} • <i class="fas fa-eye"></i> ${this.formatNumber(book.views)}
                    </div>
                </div>
                <div class="book-content">
                    <h3 class="book-title">${book.title}</h3>
                    <span class="book-category">${book.category}</span>
                    <div class="book-meta">
                        <span><i class="fas fa-user"></i> ${book.author}</span>
                        <span><i class="fas fa-file-alt"></i> ${book.pages} p</span>
                        <span><i class="fas fa-database"></i> ${book.size}</span>
                    </div>
                    <p class="book-summary">${book.summary.substring(0,80)}...</p>
                    <div class="book-actions">
                        <button class="btn btn-outline btn-sm preview-btn" data-id="${book.id}"><i class="fas fa-eye"></i> Preview</button>
                        <button class="btn btn-primary btn-sm download-btn" data-id="${book.id}"><i class="fas fa-download"></i> PDF</button>
                        <div class="book-checkbox">
                            <input type="checkbox" id="cb-${book.id}" onchange="library.toggleSelect(${book.id}, this.checked)">
                            <label for="cb-${book.id}">Select</label>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    attachBookEventListeners() {
        document.querySelectorAll('.preview-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.incrementView(id);
                this.previewPDF(id);
            });
        });
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.downloadPDF(id);
            });
        });
    }

    renderTop3() {
        if (!this.top3Grid) return;
        const sorted = [...this.books].sort((a,b) => b.downloads - a.downloads).slice(0,3);
        this.top3Grid.innerHTML = sorted.map((book, idx) => `
            <div class="download-card">
                <div class="download-rank">#${idx+1}</div>
                <div class="download-icon"><i class="${book.icon}"></i></div>
                <div class="download-info">
                    <h4>${book.title}</h4>
                    <p>${book.author}</p>
                    <div class="download-stats">
                        <span><i class="fas fa-download"></i> ${this.formatNumber(book.downloads)}</span>
                        <span><i class="fas fa-eye"></i> ${this.formatNumber(book.views)}</span>
                    </div>
                    <button class="btn btn-sm btn-primary" onclick="library.downloadPDF(${book.id})">
                        <i class="fas fa-download"></i> Download PDF
                    </button>
                </div>
            </div>
        `).join('');
    }

    // ----- STATS & COUNTERS -----
    updateStats() {
        const totalBooks = this.books.length;
        const totalDownloads = this.books.reduce((sum, b) => sum + b.downloads, 0);
        // Active readers: base + random increment per session
        this.activeReaders = 8750 + Math.floor(Math.random() * 100);
        
        this.animateCounter('statTotalBooks', totalBooks);
        this.animateCounter('statTotalDownloads', totalDownloads);
        this.animateCounter('statActiveReaders', this.activeReaders);
        this.animateCounter('statTodayDownloads', this.downloadsToday);
        
        // Update hero badges
        document.getElementById('totalBooksStat').innerText = this.formatNumber(totalBooks);
        document.getElementById('totalDownloadsStat').innerText = this.formatNumber(totalDownloads);
        document.getElementById('activeReadersStat').innerText = this.formatNumber(this.activeReaders);
        document.getElementById('todayDownloadsStat').innerText = this.formatNumber(this.downloadsToday);
        document.getElementById('footerPdfCount').innerText = `${totalBooks} PDFs available`;
    }

    animateCounter(elementId, target) {
        const el = document.getElementById(elementId);
        if (!el) return;
        let current = parseInt(el.innerText.replace(/\D/g,'')) || 0;
        const step = Math.ceil((target - current) / 20);
        if (step === 0) { el.innerText = this.formatNumber(target); return; }
        let count = current;
        const timer = setInterval(() => {
            count += step;
            if ((step > 0 && count >= target) || (step < 0 && count <= target)) {
                count = target;
                clearInterval(timer);
            }
            el.innerText = this.formatNumber(count);
        }, 30);
    }

    formatNumber(num) {
        if (num >= 1e6) return (num/1e6).toFixed(1) + 'M';
        if (num >= 1e3) return (num/1e3).toFixed(1) + 'K';
        return num.toString();
    }

    // ----- DOWNLOAD & VIEW ACTIONS -----
    async downloadPDF(bookId) {
        const book = this.findBookById(bookId);
        if (!book) return;
        
        // Increment download count
        book.downloads += 1;
        this.totalDownloads += 1;
        this.downloadsToday += 1;
        localStorage.setItem('digitalLibrary_todayDownloads', this.downloadsToday);
        
        // Save updated books to localStorage (if uploaded)
        this.saveBooks();
        
        // Trigger download (dummy PDF)
        const link = document.createElement('a');
        link.href = book.pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
        link.download = `${book.title.replace(/\s+/g,'_')}.pdf`;
        link.target = '_blank';
        link.click();
        
        // Update UI
        this.updateStats();
        this.renderTop3();
        this.addLiveDownload(book.title);
        this.showToast(`✅ Downloaded: ${book.title}`, 'success');
    }

    incrementView(bookId) {
        const book = this.findBookById(bookId);
        if (book) {
            book.views += 1;
            this.saveBooks();
            this.renderTop3(); // views might affect top3
        }
    }

    previewPDF(bookId) {
        const book = this.findBookById(bookId);
        if (!book) return;
        this.incrementView(bookId);
        // Open modal with PDF preview (simplified)
        alert(`PDF Preview for: ${book.title}\n(Full PDF.js preview would be here)`);
    }

    toggleSelect(bookId, checked) {
        if (checked) this.selectedBooks.add(bookId);
        else this.selectedBooks.delete(bookId);
        document.getElementById('selectedCount').innerText = this.selectedBooks.size;
    }

    // ----- LIVE FEED -----
    startLiveFeed() {
        setInterval(() => {
            const randomBook = this.books[Math.floor(Math.random() * this.books.length)];
            this.addLiveDownload(randomBook.title);
        }, 30000);
    }

    addLiveDownload(bookTitle) {
        if (!this.liveDownloads) return;
        const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const location = this.getRandomLocation();
        const item = document.createElement('div');
        item.className = 'live-download-item';
        item.innerHTML = `
            <i class="fas fa-download download-icon"></i>
            <div class="download-details">
                <span class="download-book">${bookTitle}</span>
                <span class="download-time">${time}</span>
            </div>
            <span class="download-location"><i class="fas fa-map-marker-alt"></i> ${location}</span>
        `;
        this.liveDownloads.prepend(item);
        if (this.liveDownloads.children.length > 5) {
            this.liveDownloads.removeChild(this.liveDownloads.lastChild);
        }
    }

    getRandomLocation() {
        const locs = ['Pakistan', 'India', 'USA', 'UK', 'Canada', 'Australia', 'Germany'];
        return locs[Math.floor(Math.random() * locs.length)];
    }

    // ----- UPDATES / PDF REQUESTS -----
    addUpdate(title, text) {
        if (!title.trim() || !text.trim()) return this.showToast('Please fill both fields', 'warning');
        const list = document.getElementById('updatesList');
        if (!list) return;
        const now = new Date();
        const timeAgo = this.timeAgo(now);
        const item = document.createElement('div');
        item.className = 'update-item';
        item.innerHTML = `
            <div class="update-header">
                <h4 class="update-title">${title}</h4>
                <span class="update-date">${timeAgo}</span>
            </div>
            <p class="update-text">${text}</p>
            <div class="update-footer">
                <span>Request #${Math.floor(Math.random()*10000)}</span>
                <span class="update-status">Pending</span>
            </div>
        `;
        list.prepend(item);
        document.getElementById('updateTitle').value = '';
        document.getElementById('updateText').value = '';
        this.showToast('PDF request posted!', 'success');
    }

    timeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 60) return `${seconds} seconds ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minutes ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hours ago`;
        return `${Math.floor(hours / 24)} days ago`;
    }

    // ----- WHATSAPP ENHANCED -----
    handleWhatsApp(e) {
        e.preventDefault();
        const name = document.getElementById('waName').value;
        const email = document.getElementById('waEmail').value;
        const queryType = document.getElementById('waQueryType').value;
        const message = document.getElementById('waMessage').value;
        
        // Get response time based on query type
        let responseTime = '';
        switch(queryType) {
            case 'Book Request': responseTime = '5 minutes'; break;
            case 'Technical Support': responseTime = '30 minutes'; break;
            case 'Membership Query': responseTime = '1 hour'; break;
            case 'Feedback': responseTime = '24 hours'; break;
            case 'Partnership': responseTime = '48 hours'; break;
        }
        
        // Get membership info if logged in
        let memberInfo = 'Guest';
        if (window.membership && window.membership.currentMember) {
            memberInfo = window.membership.currentMember.membershipNumber;
        }
        
        const formattedMessage = `
📚 DIGITAL LIBRARY PRO - ${queryType}

👤 Name: ${name}
📧 Email: ${email}
🆔 Membership: ${memberInfo}

📖 ${queryType} Details:
${message}

---
Request Time: ${new Date().toLocaleString()}
⏱ Expected Response: within ${responseTime}
        `.trim();
        
        const encoded = encodeURIComponent(formattedMessage);
        const phone = "923168465697";
        window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
        this.showToast(`WhatsApp opened – response within ${responseTime}`, 'success');
        e.target.reset();
    }

    // ----- UTILITIES -----
    findBookById(id) {
        return this.books.find(b => b.id === id) || this.uploadedBooks.find(b => b.id === id);
    }

    saveBooks() {
        // Only save uploaded books; base books are static
        localStorage.setItem('digitalLibrary_uploadedBooks', JSON.stringify(this.uploadedBooks));
    }

    showToast(msg, type = 'success') {
        const toast = document.getElementById('successToast');
        const toastMsg = document.getElementById('toastMessage');
        if (!toast) return;
        toastMsg.innerText = msg;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 4000);
    }

    updateHeroBook() {
        // Show most downloaded book in hero preview
        const top = this.books.sort((a,b) => b.downloads - a.downloads)[0];
        if (top) {
            document.getElementById('heroBookTitle').innerText = top.title;
            document.getElementById('heroBookDownloads').innerText = this.formatNumber(top.downloads);
            document.getElementById('heroPreviewBtn').onclick = () => this.previewPDF(top.id);
        }
    }

    setCurrentYear() {
        document.getElementById('currentYear').innerText = new Date().getFullYear();
    }

    removePreloader() {
        setTimeout(() => {
            const pre = document.getElementById('preloader');
            if (pre) {
                pre.classList.add('fade-out');
                setTimeout(() => pre.style.display = 'none', 500);
            }
        }, 1000);
    }

    // ----- EVENT LISTENERS -----
setupEventListeners() {
    // ---------- FILTER BUTTONS ----------
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            this.renderBooks(e.target.dataset.filter);
        });
    });

    // ---------- BATCH DOWNLOAD ----------
    document.getElementById('batchDownloadBtn')?.addEventListener('click', () => {
        if (this.selectedBooks.size === 0) return this.showToast('Select at least one PDF', 'warning');
        this.showToast(`Downloading ${this.selectedBooks.size} PDFs...`, 'info');
        this.selectedBooks.forEach(id => this.downloadPDF(id));
        this.selectedBooks.clear();
        document.getElementById('selectedCount').innerText = '0';
    });

    // ---------- UPLOAD FORM ----------
    document.getElementById('uploadForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const newBook = {
            id: Date.now(),
            title: document.getElementById('bookTitle').value,
            author: document.getElementById('bookAuthor').value || 'Unknown',
            category: document.getElementById('bookCategory').value,
            summary: 'User submitted PDF',
            pages: Math.floor(Math.random() * 300) + 200,
            size: `${(Math.random() * 10 + 2).toFixed(1)} MB`,
            downloads: 0,
            views: 0,
            pdfUrl: document.getElementById('pdfUrl').value || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            icon: 'fas fa-book',
            uploaded: true
        };
        this.uploadedBooks.push(newBook);
        this.books.push(newBook);
        this.saveBooks();
        this.renderBooks();
        this.updateStats();
        this.showToast('PDF uploaded/requested!', 'success');
        document.getElementById('closeUploadModal').click();
        e.target.reset();
    });

    // ---------- WHATSAPP FORM ----------
    document.getElementById('whatsappForm')?.addEventListener('submit', (e) => this.handleWhatsApp(e));

    // ---------- ADD UPDATE ----------
    document.getElementById('addUpdate')?.addEventListener('click', () => {
        const title = document.getElementById('updateTitle').value;
        const text = document.getElementById('updateText').value;
        this.addUpdate(title, text);
    });

    // ---------- MODAL TRIGGERS ----------
    document.getElementById('openUpload')?.addEventListener('click', () => {
        document.getElementById('uploadModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // ---------- CLOSE MODALS ----------
    ['closeModal', 'closeUploadModal', 'closeMemberModal'].forEach(id => {
        document.getElementById(id)?.addEventListener('click', function() {
            this.closest('.modal-overlay').classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // ---------- CLOSE MODAL ON OUTSIDE CLICK ----------
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    });

    // ---------- DARK MODE TOGGLE ----------
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        // Load saved theme
        const savedTheme = localStorage.getItem('digitalLibrary_theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }

        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const icon = themeToggle.querySelector('i');
            if (document.body.classList.contains('dark-theme')) {
                icon.className = 'fas fa-sun';
                localStorage.setItem('digitalLibrary_theme', 'dark');
            } else {
                icon.className = 'fas fa-moon';
                localStorage.setItem('digitalLibrary_theme', 'light');
            }
        });
    }

    // ---------- SEARCH OVERLAY----------
    const searchToggle = document.getElementById('searchToggle');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchClose = document.getElementById('searchClose');
    const globalSearch = document.getElementById('globalSearch');

    if (searchToggle && searchOverlay) {
        // Open search
        searchToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            searchOverlay.classList.add('active');
            setTimeout(() => globalSearch?.focus(), 100);
            document.body.style.overflow = 'hidden';
        });

        // Close with close button
        if (searchClose) {
            searchClose.addEventListener('click', () => {
                searchOverlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        }

        // Close when clicking outside
        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) {
                searchOverlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });

        // Close with ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
                searchOverlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }

    // ---------- QUERY TYPE RESPONSE TIME ----------
    document.getElementById('waQueryType')?.addEventListener('change', (e) => {
        const val = e.target.value;
        let time = '';
        if (val === 'Book Request') time = '5 minutes';
        else if (val === 'Technical Support') time = '30 minutes';
        else if (val === 'Membership Query') time = '1 hour';
        else if (val === 'Feedback') time = '24 hours';
        else if (val === 'Partnership') time = '48 hours';
        document.getElementById('responseTimeText').innerText = `Expected response: within ${time}`;
    });

    // ---------- BACK TO TOP ----------
    window.addEventListener('scroll', () => {
        const btt = document.getElementById('backToTop');
        if (window.scrollY > 300) btt.classList.add('show');
        else btt.classList.remove('show');
    });
    document.getElementById('backToTop')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // ---------- PROGRESS BAR ----------
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        document.getElementById('progressBar').style.width = scrolled + '%';
    });
}
}

// Initialize
const library = new DigitalLibraryPro();
window.library = library; // expose for inline onclick