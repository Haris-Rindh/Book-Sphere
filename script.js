// Fetch books from books.json
async function fetchBooks() {
    const response = await fetch('books.json');
    const data = await response.json();
    return data;
}

// Display books on page load
document.addEventListener('DOMContentLoaded', async () => {
    const books = await fetchBooks();
    const bestsellers = books.slice(0, 20); // Example: Use the first 20 books as bestsellers
    displayBooks(books, 'featured-books');
    displayBooks(bestsellers, 'bestseller-books');
    updateCategories();
    setupSearch();
    setupMenuToggle();
});

// Display books in a section
function displayBooks(bookList, sectionId) {
    const booksElement = document.getElementById(sectionId);
    booksElement.innerHTML = '';

    bookList.forEach(book => {
        const bookCard = createBookCard(book);
        booksElement.appendChild(bookCard);
    });
}

// Create a book card element
function createBookCard(book) {
    const bookCard = document.createElement('div');
    bookCard.className = 'book-card';

    bookCard.innerHTML = `
        <div class="book-cover">
            <div class="download-cover-btn" title="Download Cover" onclick="downloadCover('${book.cover}', '${book.title}')">
                ⬇️
            </div>
            <div class="book-cover-image" style="background-image: url('${book.cover}')"></div>
        </div>
        <div class="book-info">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author">by ${book.author}</p>
            <div class="button-container">
                <button class="download-btn" onclick="window.open('download.html?bookId=${book.id}', '_blank')">Download</button>
                <button class="share-btn " onclick="shareBook(${book.id})">➥</button>
                <button class="read-online-btn" onclick="window.open('read.html?bookId=${book.id}', '_blank')">Read online</button>
            </div>
        </div>
    `;

    return bookCard;
}

// Redirect to the download page
function redirectToDownloadPage(bookId) {
    window.location.href = `download.html?bookId=${bookId}`;
}

function redirectToReadingPage(bookId) {
    window.location.href = `read.html?bookId=${bookId}`;
}

// Share the download page link
function shareBook(bookId) {
    const previewPageLink = `${window.location.origin}/previews/book-${bookId}.html`;

    if (navigator.share) {
        navigator.share({
            title: 'Check out this book!',
            url: previewPageLink,
        })
        .then(() => console.log('Shared successfully'))
        .catch((error) => console.error('Error sharing:', error));
    } else {
        navigator.clipboard.writeText(previewPageLink)
            .then(() => alert('Link copied to clipboard!'))
            .catch(() => alert('Failed to copy link.'));
    }
}


// Copy link (optional, if needed elsewhere)
function copyLink(link) {
    navigator.clipboard.writeText(link)
        .then(() => alert('Link copied to clipboard!'))
        .catch(() => alert('Failed to copy link.'));
}

function downloadCover(coverUrl, title) {
    fetch(coverUrl)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title}.jpg`;
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(() => alert('Failed to download cover.'));
}

// Handle category filtering
function updateCategories() {
    const categories = document.querySelectorAll('.category');

    categories.forEach(category => {
        category.addEventListener('click', async () => {
            // Remove active class from all categories
            categories.forEach(cat => cat.classList.remove('active'));

            // Add active class to clicked category
            category.classList.add('active');

            const selectedCategory = category.textContent;
            const books = await fetchBooks();
            filterBooksByCategory(selectedCategory, books);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const categories = document.getElementById('categories');
    const categoriesContainer = document.createElement('div');
    categoriesContainer.className = 'categories';

    while (categories.firstChild) {
        categoriesContainer.appendChild(categories.firstChild);
    }

    categories.appendChild(categoriesContainer);

    categoriesContainer.innerHTML += categoriesContainer.innerHTML;
});

                                    // Filter books by category
function filterBooksByCategory(category, books) {
    const filteredBooks = category === 'All Books'
        ? books
        : books.filter(book => book.categories.includes(category));

    const filteredBestsellers = category === 'All Books'
        ? books.slice(0, 20)
        : books.filter(book => book.categories.includes(category)).slice(0, 20);

    displayBooks(filteredBooks, 'featured-books');
    displayBooks(filteredBestsellers, 'bestseller-books');
}

                                    // Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchMessage = document.getElementById('search-message');

    const performSearch = async () => {
        const query = searchInput.value.trim().toLowerCase();
        const books = await fetchBooks();

        if (query) {
            const filteredBooks = books.filter(book =>
                book.title.toLowerCase().includes(query) ||
                book.author.toLowerCase().includes(query) ||
                book.id.toString().includes(query)
            );

            const filteredBestsellers = books.filter(book =>
                book.title.toLowerCase().includes(query) ||
                book.author.toLowerCase().includes(query) ||
                book.id.toString().includes(query)
            ).slice(0, 20);

            displayBooks(filteredBooks, 'featured-books');
            displayBooks(filteredBestsellers, 'bestseller-books');

            // Show a message if no results are found
            if (filteredBooks.length === 0) {
                searchMessage.textContent = 'No books found matching your search.';
            } else {
                searchMessage.textContent = `Found ${filteredBooks.length} book(s) matching your search.`;
            }
        } else {
            displayBooks(books, 'featured-books');
            displayBooks(books.slice(0, 20), 'bestseller-books');
            searchMessage.textContent = ''; // Clear the message
        }
    };

    // Search on button click
    searchButton.addEventListener('click', performSearch);

    // Search on Enter key press
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
}

// Setup mobile menu toggle
function setupMenuToggle() {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Pagination

let currentPage = 1;
const booksPerPage = 30;
const maxVisiblePages = 4; // Number of visible page buttons

async function displayBooksWithPagination() {
    const books = await fetchBooks();
    const totalPages = Math.ceil(books.length / booksPerPage);

    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const booksToDisplay = books.slice(startIndex, endIndex);

    displayBooks(booksToDisplay, 'featured-books');
    updatePaginationButtons(totalPages);
}

function updatePaginationButtons(totalPages) {
    const pageNumbers = document.getElementById('page-numbers');
    pageNumbers.innerHTML = '';

    // Calculate the range of visible page numbers
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust startPage if endPage is at the limit
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add "Previous" button
    const prevButton = document.getElementById('prev-page');
    prevButton.disabled = currentPage === 1;

    // Add page numbers
    if (startPage > 1) {
        const firstPageButton = createPageButton(1);
        pageNumbers.appendChild(firstPageButton);

        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            pageNumbers.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = createPageButton(i);
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        pageNumbers.appendChild(pageButton);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            pageNumbers.appendChild(ellipsis);
        }

        const lastPageButton = createPageButton(totalPages);
        pageNumbers.appendChild(lastPageButton);
    }

    // Add "Next" button
    const nextButton = document.getElementById('next-page');
    nextButton.disabled = currentPage === totalPages;
}

function createPageButton(pageNumber) {
    const button = document.createElement('button');
    button.textContent = pageNumber;
    button.addEventListener('click', () => {
        currentPage = pageNumber;
        displayBooksWithPagination();
    });
    return button;
}

// Event listeners for "Previous" and "Next" buttons
document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayBooksWithPagination();
    }
});

document.getElementById('next-page').addEventListener('click', async () => {
    const books = await fetchBooks();
    const totalPages = Math.ceil(books.length / booksPerPage);

    if (currentPage < totalPages) {
        currentPage++;
        displayBooksWithPagination();
    }
});

// Initialize pagination on page load
document.addEventListener('DOMContentLoaded', () => {
    displayBooksWithPagination();
});

// Setup contact form
function setupContactForm() {
    const contactForm = document.getElementById('contact-form');

    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        const mailtoLink = `mailto:books.era786@gmail.com?subject=Contact%20Form%20Submission&body=Name:%20${encodeURIComponent(name)}%0AEmail:%20${encodeURIComponent(email)}%0AMessage:%20${encodeURIComponent(message)}`;
        window.location.href = mailtoLink;
    });
}

// Call the function on page load
document.addEventListener('DOMContentLoaded', () => {
    setupContactForm();
});

// Function to toggle between light and dark themes
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Check user's preferred theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.classList.add(savedTheme);
        updateThemeIcon(savedTheme);
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        const isDarkTheme = body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDarkTheme ? 'dark-theme' : 'light-theme');
        updateThemeIcon(isDarkTheme ? 'dark-theme' : 'light-theme');
    });
}

// Function to update the theme icon
function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.textContent = theme === 'dark-theme' ? '☀️' : '🌙';
}

// Call the function on page load
document.addEventListener('DOMContentLoaded', () => {
    setupThemeToggle();
});

//slider

// Fetch books from books.json
async function fetchBooks() {
    const response = await fetch('books.json');
    const data = await response.json();
    return data;
}

// Display featured books in the slider
async function displayFeaturedBooksInSlider() {
    const books = await fetchBooks();
    const featuredBooks = books.filter(book => book.featured); // Filter featured books
    const slider = document.getElementById('book-slider');

    // Clear existing slides
    slider.innerHTML = '';

    // Add featured books to the slider
    featuredBooks.forEach(book => {
        const slide = document.createElement('div');
        slide.className = 'slide';
        slide.innerHTML = `
            <img src="${book.cover}" alt="${book.title}" data-book-id="${book.id}">
        `;
        slider.appendChild(slide);
    });

    // Clone the first slide and append it to the end
    const firstSlideClone = slider.firstElementChild.cloneNode(true);
    slider.appendChild(firstSlideClone);

    // Clone the last slide and prepend it to the beginning
    const lastSlideClone = slider.lastElementChild.cloneNode(true);
    slider.insertBefore(lastSlideClone, slider.firstElementChild);

    // Add click event listeners to slides
    const slides = document.querySelectorAll('.slide img');
    slides.forEach(slide => {
        slide.addEventListener('click', () => {
            const bookId = slide.getAttribute('data-book-id');
            redirectToDownloadPage(bookId);
        });
    });

    // Initialize auto-scrolling
    autoScrollSlider();
}

// Auto-scroll the slider with seamless infinite loop
function autoScrollSlider() {
    const slider = document.querySelector('.slider');
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    const slideWidth = slides[0].offsetWidth;
    let currentIndex = 1; // Start at 1 because the first slide is a clone

    // Set initial position to the first real slide
    slider.style.transform = `translateX(${-slideWidth}px)`;

    setInterval(() => {
        currentIndex = (currentIndex + 1) % totalSlides;
        const offset = -currentIndex * slideWidth;

        // Smooth transition
        slider.style.transition = 'transform 0.5s ease-in-out';
        slider.style.transform = `translateX(${offset}px)`;

        // Reset to the first real slide without animation
        if (currentIndex === totalSlides - 1) {
            setTimeout(() => {
                slider.style.transition = 'none';
                slider.style.transform = `translateX(${-slideWidth}px)`;
                currentIndex = 1; // Reset to the first real slide
            }, 500); // Wait for the transition to complete
        }
    }, 2000); // Change slide every 2 seconds
}

// Redirect to the download page
function redirectToDownloadPage(bookId) {
    window.location.href = `download.html?bookId=${bookId}`;
}

// Initialize the slider on page load
document.addEventListener('DOMContentLoaded', () => {
    displayFeaturedBooksInSlider();
});

// ====== Scroll Management ====== //
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function setupScrollButtons() {
    const backToTop = document.getElementById('back-to-top');
    const backToBottom = document.getElementById('back-to-bottom');

    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.style.display = window.scrollY > 300 ? 'block' : 'none';
        });
        backToTop.addEventListener('click', scrollToTop);
    }

    if (backToBottom) {
        window.addEventListener('scroll', () => {
            const scrolledToBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100;
            backToBottom.style.display = scrolledToBottom ? 'none' : 'block';
        });
        backToBottom.addEventListener('click', () => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupScrollButtons(); // <- Add this!
});

