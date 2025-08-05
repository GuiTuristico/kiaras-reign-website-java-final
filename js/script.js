document.addEventListener('DOMContentLoaded', function() {

    // --- LÓGICA GLOBAL  ---
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // --- LÓGICA ESPECÍFICA homepage (index.html) ---

    // Animación de elementos flotantes
    const floatingItems = document.querySelectorAll('.floating-item');
    if (floatingItems.length > 0) { 
        floatingItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.5}s`;
        });
    }

    // --- Noticias (index.html) ---
    const newsContainer = document.getElementById('news-container');
    if (newsContainer) { 
        fetch('js/news.json') 
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar notícias: ' + response.statusText);
                }
                return response.json();
            })
            .then(news => {
                news.forEach(article => {
                    const newsCard = `
                        <div class="news-card">
                            <img src="${article.image}" alt="${article.title}" class="news-image">
                            <div class="news-content">
                                <h3 class="news-title">${article.title}</h3>
                                <p class="news-date">${new Date(article.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <p class="news-summary">${article.summary}</p>
                                <a href="${article.link}" class="btn btn-secondary news-link">Leer Más</a>
                            </div>
                        </div>
                    `;
                    newsContainer.innerHTML += newsCard;
                });
            })
            .catch(error => {
                console.error('Error:', error);
                newsContainer.innerHTML = '<p>No ha sido posible cargar las noticias en este momento. Inténtalo más tarde.</p>';
            });
    }

    // --- LÓGICA ESPECÍFICA productos (productos.html) ---

    // Sistema de filtrado 
    const productsCatalog = document.getElementById('products-catalog');
    if (productsCatalog) { 
        const categoryCards = document.querySelectorAll('.category-card');
        const productCards = document.querySelectorAll('.product-card');
        const productCount = document.getElementById('product-count');
        const sortSelect = document.querySelector('.sort-select');

        // Filtrado por categoria
        if (categoryCards.length > 0) {
            categoryCards.forEach(card => {
                card.addEventListener('click', function() {
                    const category = this.dataset.category;
                    categoryCards.forEach(c => c.classList.remove('active'));
                    this.classList.add('active');

                    let visibleCount = 0;
                    productCards.forEach(product => {
                        if (category === 'all' || product.dataset.category === category) {
                            product.style.display = 'block';
                            visibleCount++;
                        } else {
                            product.style.display = 'none';
                        }
                    });
                    if (productCount) productCount.textContent = visibleCount;
                });
            });
        }

        // Ordenación de productos
        if (sortSelect) {
            sortSelect.addEventListener('change', function() {
                const sortBy = this.value;
                const products = Array.from(productCards);

                products.sort((a, b) => {
                    const priceA = parseFloat(a.querySelector('.product-price').textContent.replace('€', ''));
                    const priceB = parseFloat(b.querySelector('.product-price').textContent.replace('€', ''));
                    const nameA = a.querySelector('.product-title').textContent;
                    const nameB = b.querySelector('.product-title').textContent;

                    switch(sortBy) {
                        case 'price-low': return priceA - priceB;
                        case 'price-high': return priceB - priceA;
                        case 'name': return nameA.localeCompare(nameB);
                        default: return 0;
                    }
                });

                products.forEach(product => productsCatalog.appendChild(product));
            });
        }
    }

    // --- LÓGICA ESPECÍFICA presupuesto (presupuesto.html) ---

    const budgetForm = document.getElementById('budgetForm');
    if (budgetForm) { 
        console.log('Formulario de presupuesto encontrado');
        
        // Elementos del formulario
        const nombreInput = document.getElementById("nombre");
        const apellidosInput = document.getElementById("apellidos");
        const telefonoInput = document.getElementById("telefono");
        const emailInput = document.getElementById("email");
        const edadBebeSelect = document.getElementById("edad-bebe");
        const productoSelect = document.getElementById("producto");
        const plazoInput = document.getElementById("plazo");
        const extrasCheckboxes = document.querySelectorAll("input[name='extras']");
        const presupuestoFinalDisplay = document.getElementById("presupuesto-final");
        const privacidadCheckbox = document.getElementById("privacidad");
        const comentarios = document.getElementById('comentarios');
        const charCount = document.getElementById('char-count');
        const submitBtn = document.getElementById('submit-btn');
        const resetBtn = document.getElementById("reset-btn");

        // Elementos de error
        const nombreError = document.getElementById("nombre-error");
        const apellidosError = document.getElementById("apellidos-error");
        const telefonoError = document.getElementById("telefono-error");
        const emailError = document.getElementById("email-error");
        const edadBebeError = document.getElementById("edad-bebe-error");
        const privacidadError = document.getElementById("privacidad-error");

        // Contador de caracteres para comentarios
        if (comentarios && charCount) {
            comentarios.addEventListener('input', function() {
                charCount.textContent = this.value.length;
            });
        }

        // Funciones de utilidad para mostrar/ocultar errores
        function showInputError(inputElement, errorElement, message) {
            if (inputElement) inputElement.classList.add("invalid");
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.style.display = "block";
            }
        }

        function hideInputError(inputElement, errorElement) {
            if (inputElement) inputElement.classList.remove("invalid");
            if (errorElement) {
                errorElement.textContent = "";
                errorElement.style.display = "none";
            }
        }

        // Funciones de validación individual
        function validateNombre() {
            if (!nombreInput) return true;
            const value = nombreInput.value.trim();
            if (value === "") {
                showInputError(nombreInput, nombreError, "El nombre es obligatorio.");
                return false;
            } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
                showInputError(nombreInput, nombreError, "El nombre solo puede contener letras.");
                return false;
            } else if (value.length > 50) {
                showInputError(nombreInput, nombreError, "El nombre no puede exceder los 50 caracteres.");
                return false;
            }
            hideInputError(nombreInput, nombreError);
            return true;
        }

        function validateApellidos() {
            if (!apellidosInput) return true;
            const value = apellidosInput.value.trim();
            if (value === "") {
                showInputError(apellidosInput, apellidosError, "Los apellidos son obligatorios.");
                return false;
            } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
                showInputError(apellidosInput, apellidosError, "Los apellidos solo pueden contener letras.");
                return false;
            } else if (value.length > 100) {
                showInputError(apellidosInput, apellidosError, "Los apellidos no pueden exceder los 100 caracteres.");
                return false;
            }
            hideInputError(apellidosInput, apellidosError);
            return true;
        }

        function validateTelefono() {
            if (!telefonoInput) return true;
            const value = telefonoInput.value.trim();
            if (value === "") {
                showInputError(telefonoInput, telefonoError, "El teléfono es obligatorio.");
                return false;
            } else if (!/^[0-9+\-\s\(\)]+$/.test(value)) {
                showInputError(telefonoInput, telefonoError, "El teléfono contiene caracteres no válidos.");
                return false;
            } else if (value.replace(/[^0-9]/g, '').length < 9) {
                showInputError(telefonoInput, telefonoError, "El teléfono debe tener al menos 9 dígitos.");
                return false;
            }
            hideInputError(telefonoInput, telefonoError);
            return true;
        }

        function validateEmail() {
            if (!emailInput) return true;
            const value = emailInput.value.trim();
            if (value === "") {
                showInputError(emailInput, emailError, "El correo electrónico es obligatorio.");
                return false;
            } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
                showInputError(emailInput, emailError, "Introduce un correo electrónico válido.");
                return false;
            }
            hideInputError(emailInput, emailError);
            return true;
        }

        function validateEdadBebe() {
            if (!edadBebeSelect) return true;
            const value = edadBebeSelect.value;
            if (value === "") {
                showInputError(edadBebeSelect, edadBebeError, "Selecciona la edad del bebé.");
                return false;
            }
            hideInputError(edadBebeSelect, edadBebeError);
            return true;
        }

        function validatePrivacidad() {
            if (!privacidadCheckbox) return true;
            const isChecked = privacidadCheckbox.checked;
            if (!isChecked) {
                showInputError(privacidadCheckbox, privacidadError, "Debes aceptar las condiciones de privacidad.");
                return false;
            }
            hideInputError(privacidadCheckbox, privacidadError);
            return true;
        }

        // Función para calcular el presupuesto
        function calculateBudget() {
            console.log('Calculando presupuesto...');
            
            if (!productoSelect || !plazoInput || !presupuestoFinalDisplay) {
                console.log('Elementos necesarios para el cálculo no encontrados');
                return;
            }

            let basePrice = 0;
            const selectedOption = productoSelect.options[productoSelect.selectedIndex];
            if (selectedOption && selectedOption.value !== "") {
                basePrice = parseFloat(selectedOption.dataset.price || 0);
            }

            let totalExtras = 0;
            if (extrasCheckboxes.length > 0) {
                extrasCheckboxes.forEach(checkbox => {
                    if (checkbox.checked) {
                        totalExtras += parseFloat(checkbox.dataset.price || 0);
                    }
                });
            }

            let finalBudget = basePrice + totalExtras;

            // Descuento por plazos
            const plazo = parseInt(plazoInput.value) || 0;
            if (plazo > 0) {
                let discount = 0;
                if (plazo >= 30) {
                    discount = 0.10; // 10% de descuento para 30 días o más
                } else if (plazo >= 15) {
                    discount = 0.05; // 5% de descuento para 15 días o más
                }
                finalBudget -= finalBudget * discount;
            }

            presupuestoFinalDisplay.textContent = finalBudget.toFixed(2) + "€";
            console.log('Presupuesto calculado:', finalBudget.toFixed(2) + "€");
        }

        // Event listeners para validación en tiempo real
        if (nombreInput) nombreInput.addEventListener("blur", validateNombre);
        if (apellidosInput) apellidosInput.addEventListener("blur", validateApellidos);
        if (telefonoInput) telefonoInput.addEventListener("blur", validateTelefono);
        if (emailInput) emailInput.addEventListener("blur", validateEmail);
        if (edadBebeSelect) edadBebeSelect.addEventListener("change", validateEdadBebe);

        // Event listeners para cálculo de presupuesto en tiempo real
        if (productoSelect) productoSelect.addEventListener("change", calculateBudget);
        if (plazoInput) plazoInput.addEventListener("input", calculateBudget);
        if (extrasCheckboxes.length > 0) {
            extrasCheckboxes.forEach(checkbox => {
                checkbox.addEventListener("change", calculateBudget);
            });
        }

        // Calcular presupuesto inicial
        calculateBudget();

        // Validación y envío del formulario
        function validateBudgetForm() {
            const isNombreValid = validateNombre();
            const isApellidosValid = validateApellidos();
            const isTelefonoValid = validateTelefono();
            const isEmailValid = validateEmail();
            const isEdadBebeValid = validateEdadBebe();
            const isPrivacidadValid = validatePrivacidad();

            return isNombreValid && isApellidosValid && isTelefonoValid && isEmailValid && isEdadBebeValid && isPrivacidadValid;
        }

        function submitBudgetForm() {
            calculateBudget();
            const finalBudget = presupuestoFinalDisplay ? presupuestoFinalDisplay.textContent : '0.00€';
            alert(`¡Formulario enviado con éxito!\n\nPresupuesto Final: ${finalBudget}\n\nTe contactaremos pronto con más detalles.`);
            budgetForm.reset();
            calculateBudget();
            
            // Limpiar mensajes de error
            const errorElements = budgetForm.querySelectorAll(".form-error");
            errorElements.forEach(error => {
                error.style.display = "none";
                error.textContent = "";
            });
            
            // Quitar clases de errores de input
            const inputElements = budgetForm.querySelectorAll(".form-input, .form-select");
            inputElements.forEach(input => {
                input.classList.remove("invalid");
            });
        }

        // Event listener para envío del formulario
        budgetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Formulario enviado');
            if (validateBudgetForm()) {
                submitBudgetForm();
            } else {
                alert("Por favor, corrige los errores en el formulario antes de enviar.");
            }
        });

        // Reset Button
        if (resetBtn) {
            resetBtn.addEventListener("click", function() {
                budgetForm.reset();
                calculateBudget(); 
                
                // Limpiar mensajes de error
                const errorElements = budgetForm.querySelectorAll(".form-error");
                errorElements.forEach(error => {
                    error.style.display = "none";
                    error.textContent = "";
                });
                
                // Quitar clases de errores de input
                const inputElements = budgetForm.querySelectorAll(".form-input, .form-select");
                inputElements.forEach(input => {
                    input.classList.remove("invalid");
                });
            });
        }
    }

    // --- LÓGICA ESPECÍFICA contacto (contacto.html) ---

    const contactForm = document.getElementById('contactForm');
    if (contactForm) { 
        const mensaje = document.getElementById('mensaje');
        const charCount = document.getElementById('char-count');

        if (mensaje && charCount) {
            mensaje.addEventListener('input', function() {
                charCount.textContent = this.value.length;
            });
        }

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateContactForm()) {
                submitContactForm();
            }
        });

        function validateContactForm() {
            const nombreInput = document.getElementById("nombre");
            const emailInput = document.getElementById("email");
            const asuntoSelect = document.getElementById("asunto");
            const mensajeTextarea = document.getElementById("mensaje");
            const privacidadCheckbox = document.getElementById("privacidad");

            let isValid = true;

            // Validar nombre
            if (nombreInput) {
                const nombre = nombreInput.value.trim();
                if (nombre === "" || nombre.length < 2) {
                    isValid = false;
                }
            }

            // Validar email
            if (emailInput) {
                const email = emailInput.value.trim();
                if (email === "" || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
                    isValid = false;
                }
            }

            // Validar asunto
            if (asuntoSelect && asuntoSelect.value === "") {
                isValid = false;
            }

            // Validar mensaje
            if (mensajeTextarea) {
                const mensaje = mensajeTextarea.value.trim();
                if (mensaje === "" || mensaje.length < 10) {
                    isValid = false;
                }
            }

            // Validar privacidad
            if (privacidadCheckbox && !privacidadCheckbox.checked) {
                isValid = false;
            }

            return isValid;
        }

        function submitContactForm() {
            alert('¡Mensaje enviado con éxito! Te responderemos pronto.');
            contactForm.reset();
        }
    }

    // --- LÓGICA ESPECÍFICA galería (galeria.html) ---

    // Funcionalidad de filtrado de galería
    const galleryFilters = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (galleryFilters.length > 0 && galleryItems.length > 0) {
        galleryFilters.forEach(filter => {
            filter.addEventListener('click', function() {
                const category = this.dataset.filter;
                
                // Actualizar botones activos
                galleryFilters.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Filtrar elementos
                galleryItems.forEach(item => {
                    if (category === 'all' || item.dataset.category === category) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    // Funcionalidad de lightbox para galería
    const galleryImages = document.querySelectorAll('.gallery-item img');
    if (galleryImages.length > 0) {
        galleryImages.forEach(img => {
            img.addEventListener('click', function() {
                // Crear lightbox
                const lightbox = document.createElement('div');
                lightbox.className = 'lightbox';
                lightbox.innerHTML = `
                    <div class="lightbox-content">
                        <img src="${this.src}" alt="${this.alt}">
                        <span class="lightbox-close">&times;</span>
                    </div>
                `;
                
                document.body.appendChild(lightbox);
                
                // Cerrar lightbox
                lightbox.addEventListener('click', function(e) {
                    if (e.target === lightbox || e.target.className === 'lightbox-close') {
                        document.body.removeChild(lightbox);
                    }
                });
            });
        });
    }

    console.log('Script cargado correctamente');

        // --- LÓGICA ESPECÍFICA galería (galeria.html) ---
const galleryGrid = document.getElementById("gallery-grid");
const mainGalleryImage = document.getElementById("main-gallery-image");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const filterButtons = document.querySelectorAll(".filter-btn");

let allImages = [];
let filteredImages = [];
let currentImageIndex = 0;

// Solo ejecutar si estamos en la página de la galería
if (galleryGrid && mainGalleryImage) {
    fetch("../js/gallery.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al cargar las imágenes de la galería: " + response.statusText);
            }
            return response.json();
        })
        .then(images => {
            allImages = images;
            filteredImages = allImages; // Inicialmente mostramos todas
            loadGallery(filteredImages);
            if (filteredImages.length > 0) {
                displayMainImage(0);
            }
        })
        .catch(error => {
            console.error("Error:", error);
            if (galleryGrid) {
                galleryGrid.innerHTML = "<p>No ha sido posible cargar las imágenes de la galería en este momento. Inténtalo más tarde.</p>";
            }
        });

    function loadGallery(imagesToLoad) {
        galleryGrid.innerHTML = "";
        imagesToLoad.forEach((image, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.dataset.originalIndex = allImages.findIndex(img => img.id === image.id);
            
            const imgElement = document.createElement('img');
            imgElement.src = image.src;
            imgElement.alt = image.alt;
            
            galleryItem.appendChild(imgElement);
            galleryGrid.appendChild(galleryItem);

            galleryItem.addEventListener("click", function() {
                currentImageIndex = index;
                displayMainImage(currentImageIndex);
            });
        });
        updateActiveThumbnail();
    }

    function displayMainImage(index) {
        if (filteredImages.length > 0 && index >= 0 && index < filteredImages.length) {
            mainGalleryImage.src = filteredImages[index].src;
            mainGalleryImage.alt = filteredImages[index].alt;
            updateActiveThumbnail();
        }
    }
    
    function updateActiveThumbnail() {
        const thumbnails = document.querySelectorAll('.gallery-item');
        thumbnails.forEach((thumb, index) => {
            if (index === currentImageIndex) {
                thumb.classList.add('active');
                // Asegurarse de que la miniatura activa esté visible
                thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                thumb.classList.remove('active');
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            if (filteredImages.length > 0) {
                currentImageIndex = (currentImageIndex - 1 + filteredImages.length) % filteredImages.length;
                displayMainImage(currentImageIndex);
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            if (filteredImages.length > 0) {
                currentImageIndex = (currentImageIndex + 1) % filteredImages.length;
                displayMainImage(currentImageIndex);
            }
        });
    }

    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener("click", function() {
                const category = this.dataset.category;
                
                // Actualizar botón activo
                filterButtons.forEach(btn => btn.classList.remove("active"));
                this.classList.add("active");

                // Filtrar imágenes
                if (category === "all") {
                    filteredImages = allImages;
                } else {
                    filteredImages = allImages.filter(img => img.category === category);
                }
                
                currentImageIndex = 0; // Resetear índice
                loadGallery(filteredImages);
                if (filteredImages.length > 0) {
                    displayMainImage(currentImageIndex);
                } else {
                    // Opcional: mostrar una imagen por defecto si no hay resultados
                    mainGalleryImage.src = '../images/placeholder.jpg'; // Cambia a una imagen tuya
                    mainGalleryImage.alt = 'No hay imágenes en esta categoría';
                }
            });
        });
    }
}

});

