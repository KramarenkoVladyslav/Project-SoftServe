// Оголошення змінних
let products = [];
let productContainer = document.querySelector('.product-element');
let editModal = document.getElementById('editProductModal');
let productNameElement = document.getElementById('editNameInput');
let productPriceElement = document.getElementById('editPriceInput');
let productImageElement = document.getElementById('editImagePreview');
let activeProduct = null;
let deleteAllButton = document.getElementById('deleteAllButton');

// Підрахунок загальної ціни
function calculateTotalPrice() {
	let totalPrice = products.reduce(function (total, product) {
		return total + parseInt(product.price);
	}, 0);
	document.getElementById('totalPrice').textContent =
		'Total Price: $' + totalPrice;
}

// Завантаження товарів з localStorage при запуску
function loadProducts() {
	let savedProducts = localStorage.getItem('products');
	if (savedProducts) {
		products = JSON.parse(savedProducts);
		renderProducts();
		calculateTotalPrice();
	}
}

// Збереження товарів у localStorage
function saveProducts() {
	localStorage.setItem('products', JSON.stringify(products));
}

// Відображення товарів на сторінці
function renderProducts() {
	productContainer.innerHTML = '';

	products.forEach(function (product) {
		let productElement = document.createElement('div');
		productElement.id = product.id;
		productElement.className = 'col-lg-4 col-md-6 product-item';
		productElement.innerHTML = `
            <div class="product-card">
                <img class="product-image" alt="Product" src="${product.imageUrl}">
                <div class="card-body">
                    <h5 class="product-name text-light">${product.name}</h5>
                    <p class="product-price text-light">${product.price}$</p>
                    <div class="product-buttons">
                        <button type="button" class="btn btn-primary btn-edit">Edit</button>
                        <button type="button" class="btn btn-danger btn-delete">Delete</button>
                    </div>
                </div>
            </div>
        `;
		productContainer.appendChild(productElement);

		let editButton = productElement.querySelector('.btn-edit');
		let deleteButton = productElement.querySelector('.btn-delete');

		editButton.addEventListener('click', function () {
			openEditModal(productElement);
		});

		deleteButton.addEventListener('click', function () {
			deleteProduct(productElement);
		});
	});

	if (products.length >= 2) {
		deleteAllButton.classList.remove('d-none');
	} else {
		deleteAllButton.classList.add('d-none');
	}
}

// Додавання нового товару
function addProduct(product) {
	let imageFile = document.getElementById('imageInput').files[0];

	if (!product.name || !product.price || !imageFile) {
		alert('Please fill in all fields and select an image.');
		return;
	}

	let reader = new FileReader();
	reader.onloadend = function () {
		let base64Image = reader.result;
		product.imageUrl = base64Image;
		products.push(product);
		saveProducts();
		renderProducts();
		calculateTotalPrice();
	};

	reader.readAsDataURL(imageFile);
}

// Видалення товару
function deleteProduct(productElement) {
	let productId = productElement.id;

	products = products.filter(function (product) {
		return product.id !== productId;
	});

	productElement.remove();

	if (activeProduct === productElement) {
		activeProduct = null;
	}

	saveProducts();
	calculateTotalPrice();

	if (products.length < 2) {
		deleteAllButton.classList.add('d-none');
	}
}

// Видалення всіх товарів
function deleteAllProducts() {
	if (confirm('Are you sure you want to delete all products?')) {
		products = [];
		productContainer.innerHTML = '';
		saveProducts();
		calculateTotalPrice();
		deleteAllButton.classList.add('d-none');
	}
}

// Обробник події додавання товару
document
	.getElementById('creationForm')
	.addEventListener('submit', function (event) {
		event.preventDefault();

		let name = document.getElementById('nameInput').value;
		let price = document.getElementById('priceInput').value;
		let imageFile = document.getElementById('imageInput').files[0];

		if (!name || !price || !imageFile) {
			alert('Please fill in all fields and select an image.');
			return;
		}

		let imageUrl = URL.createObjectURL(imageFile);

		let product = {
			id: 'product-' + Date.now(),
			name: name,
			price: price,
			imageUrl: imageUrl,
		};

		addProduct(product);

		document.getElementById('nameInput').value = '';
		document.getElementById('priceInput').value = '';
		document.getElementById('imageInput').value = '';
	});

// Обробник події пошуку
document
	.getElementById('searchForm')
	.addEventListener('submit', function (event) {
		event.preventDefault();

		let searchQuery = document
			.getElementById('searchInput')
			.value.toLowerCase();
		let productElements = document.querySelectorAll('.product-item');

		productElements.forEach(function (productElement) {
			let productNameElement =
				productElement.querySelector('.product-name');
			if (productNameElement) {
				let productName = productNameElement.textContent.toLowerCase();
				if (productName.includes(searchQuery)) {
					productElement.style.display = 'block';
				} else {
					productElement.style.display = 'none';
				}
			}
		});

		document.getElementById('searchInput').value = '';
	});

// Обробник події кнопки "Back"
document.getElementById('backButton').addEventListener('click', function () {
	restoreInitialProductList();
});

// Відновлення початкового списку товарів
function restoreInitialProductList() {
	let productElements = document.querySelectorAll('.product-item');
	productElements.forEach(function (productElement) {
		productElement.style.display = 'block';
	});
}

// Відкриття модального вікна редагування товару
function openEditModal(productElement) {
	let productId = productElement.id;
	let product = products.find(function (product) {
		return product.id === productId;
	});

	if (product) {
		productNameElement.value = product.name;
		productPriceElement.value = product.price;
		productImageElement.src = product.imageUrl;

		editModal.setAttribute('data-product-id', productId);
		let modal = new bootstrap.Modal(editModal);
		modal.show();
	} else {
		console.error('Error: Product not found.');
	}
}

// Обробник події редагування товару
document
	.getElementById('editForm')
	.addEventListener('submit', function (event) {
		event.preventDefault();

		let editedName = productNameElement.value;
		let editedPrice = productPriceElement.value;
		let editedImageFile =
			document.getElementById('editImageInput').files[0];

		if (!editedName) {
			alert('Please fill in the name field.');
			return;
		}

		let productId = editModal.getAttribute('data-product-id');
		let productElement = document.getElementById(productId);
		let product = products.find(function (product) {
			return product.id === productId;
		});

		if (product) {
			let oldPrice = parseInt(product.price);
			product.name = editedName;

			if (editedPrice) {
				product.price = editedPrice;
			}

			if (editedImageFile) {
				let editedImageUrl = URL.createObjectURL(editedImageFile);
				product.imageUrl = editedImageUrl;

				let productImageElement =
					productElement.querySelector('.product-image');
				if (productImageElement) {
					productImageElement.src = editedImageUrl;
				}
			}

			let productNameElement =
				productElement.querySelector('.product-name');
			if (productNameElement) {
				productNameElement.textContent = editedName;
			}

			let productPriceElement =
				productElement.querySelector('.product-price');
			if (productPriceElement) {
				productPriceElement.textContent = editedPrice + '$';
			}

			saveProducts();
			calculateTotalPrice();
		} else {
			console.error('Error: Product not found.');
		}

		let modal = bootstrap.Modal.getInstance(editModal);
		modal.hide();

		document.getElementById('editForm').reset();
	});

// Обробник події сортування за ціною (зростанням та спаданням)
document
	.getElementById('sortLowToHigh')
	.addEventListener('click', function (event) {
		event.preventDefault();
		sortProductsByPrice('lowToHigh');
	});

document
	.getElementById('sortHighToLow')
	.addEventListener('click', function (event) {
		event.preventDefault();
		sortProductsByPrice('highToLow');
	});

// Сортування товарів за ціною
function sortProductsByPrice(order) {
	products.sort(function (a, b) {
		if (order === 'lowToHigh') {
			return parseInt(a.price) - parseInt(b.price);
		} else if (order === 'highToLow') {
			return parseInt(b.price) - parseInt(a.price);
		} else {
			return 0;
		}
	});
	renderProducts();
}

// Обробник події кнопки видалення всіх товарів
deleteAllButton.addEventListener('click', function () {
	deleteAllProducts();
});

// Завантаження товарів з localStorage при запуску
loadProducts();
