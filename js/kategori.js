import { getJSON, postJSON } from "https://cdn.jsdelivr.net/gh/jscroot/api@0.0.7/croot.js";
import { putJSON, deleteJSON } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.3/api.js";

// Array untuk menyimpan data kategori
let categories = [];
let currentEditIndex = null; // Untuk menyimpan index kategori yang sedang diedit
let currentDeleteIndex = null; // Untuk menyimpan index kategori yang akan dihapus

// Ambil token dari cookie dengan nama 'login'
const token = getCookie('login');
if (!token) {
    alert('Token tidak ditemukan, harap login terlebih dahulu!');
    throw new Error("Token tidak ditemukan. Harap login ulang.");
}

// Panggil getJSON untuk mengambil data kategori
getJSON('https://asia-southeast2-awangga.cloudfunctions.net/logiccoffee/data/category', "Login", token, (response) => {
    if (response.status === 200) {
        categories = response.data.data || []; // Menyimpan data kategori yang ada
        displayCategories(response);
    } else {
        console.error(`Error: ${response.status}`);
        alert("Gagal memuat data kategori. Silakan coba lagi.");
    }
});

// Fungsi untuk menampilkan data kategori di dalam tabel
function displayCategories(response) {
    // Validasi apakah response.data.data ada
    if (!response || !response.data || !response.data.data) {
        console.error("Data kategori tidak ditemukan di respons API.");
        alert("Data kategori tidak valid. Silakan hubungi administrator.");
        return;
    }

    const categoryData = response.data.data; // Ambil data kategori dari respons
    const container = document.getElementById('category-list');

    // Pastikan elemen container ditemukan
    if (!container) {
        console.error("Elemen dengan id 'category-list' tidak ditemukan.");
        return;
    }
    // Tampilkan data di dalam tabel
    container.innerHTML = ''; // Hapus data lama jika ada

    categoryData.forEach((item, index) => {
        // Membuat baris untuk setiap kategori
        const row = document.createElement('tr');

        // Kolom Nama Kategori
        const nameCell = document.createElement('td');
        nameCell.textContent = item.name;

        // Kolom Gambar
        const imageCell = document.createElement('td');
        const imageElement = document.createElement('img');

        // Jika gambar adalah string (misalnya base64), tampilkan dengan format data URL
        if (item.image && item.image.startsWith("data:image")) {
            imageElement.src = item.image; // Gambar dalam format base64
        } else {
            imageElement.src = 'path/to/default-image.jpg'; // Gambar default jika tidak ada gambar
        }

        imageElement.alt = item.name;
        imageElement.style.width = '50px'; // Atur ukuran gambar sesuai kebutuhan
        imageCell.appendChild(imageElement);

        // Kolom Aksi
        const actionCell = document.createElement('td');
        actionCell.classList.add('text-center');

        // Tombol Ubah
        const editButton = document.createElement('button');
        editButton.className = 'btn btn-warning me-2';
        editButton.innerHTML = '<i class="fas fa-pen"></i> Ubah';
        // Event listener untuk tombol Ubah
        editButton.addEventListener('click', () => {
            console.log(`Edit kategori dengan index: ${index}`);
            // Menyimpan index kategori yang sedang diedit
            currentEditIndex = index;

            // Menampilkan modal edit kategori
            const modal = new bootstrap.Modal(document.getElementById('editCategoryModal'));
            modal.show();

            // Mengisi input form dengan nama kategori yang dipilih
            document.getElementById('edit-category-name').value = categories[index].name;
        });

        // Tombol Hapus
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger';
        deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i> Hapus';
        // Event listener untuk tombol Hapus
        deleteButton.addEventListener('click', () => {
            console.log(`Hapus kategori dengan index: ${index}`);
            // Setel currentDeleteIndex ke index kategori yang ingin dihapus
            currentDeleteIndex = index;

            // Menampilkan modal konfirmasi hapus
            const deleteCategoryModal = new bootstrap.Modal(document.getElementById('deleteCategoryModal'));
            deleteCategoryModal.show();
        });

        // Tambahkan tombol ke kolom aksi
        actionCell.appendChild(editButton);
        actionCell.appendChild(deleteButton);


        // Tambahkan kolom ke dalam baris
        row.appendChild(nameCell);
        row.appendChild(imageCell);  // Menambahkan kolom gambar
        row.appendChild(actionCell);

        // Tambahkan baris ke dalam container
        container.appendChild(row);
    });
}

// Fungsi untuk mendapatkan nilai cookie berdasarkan nama
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null; // Jika cookie tidak ditemukan
}

// Fungsi untuk menambah kategori
function addCategory(event) {
    event.preventDefault(); // Mencegah form submit biasa agar bisa menggunakan JavaScript

    const categoryName = document.getElementById('category-name').value.trim();
    const categoryImage = document.getElementById('category-image').files[0]; // Ambil file gambar

    // Validasi input kategori
    if (categoryName === '') {
        alert('Nama kategori tidak boleh kosong!');
        return false;
    }

    if (!categoryImage) {
        alert('Gambar kategori tidak boleh kosong!');
        return false;
    }

    // Membaca gambar sebagai base64
    const reader = new FileReader();
    reader.onloadend = function () {
        const imageBase64 = reader.result; // Ini adalah base64 string gambar

        // Membuat objek kategori baru
        const categoryData = {
            name: categoryName,
            image: imageBase64,  // Mengirim gambar dalam format base64
        };

        // Ambil token dari cookie dengan nama 'login'
        const token = getCookie('login');
        if (!token) {
            alert('Token tidak ditemukan, harap login terlebih dahulu!');
            return;
        }

        // Log untuk memeriksa data yang akan dikirim
        console.log('Kategori yang akan ditambahkan:', categoryData);

        // Memanggil fungsi postJSON dari library untuk mengirimkan data kategori ke API
        postJSON('https://asia-southeast2-awangga.cloudfunctions.net/logiccoffee/data/category',        // URL API
            'login',       // Nama header untuk token
            token,         // Nilai token dari cookie
            categoryData,   // Data kategori dalam bentuk JSON
            function (response) {
                const { status, data } = response;

                if (status >= 200 && status < 300) {
                    console.log('Respons dari API:', data);
                    alert('Kategori berhasil ditambahkan!');

                    // Setelah mendapatkan data dari API
                    console.log("Kategori yang ditambahkan:", response.data);

                    // Update data kategori terbaru dan tampilkan
                    categories.push({ name: categoryName, image: imageBase64 });
                    displayCategories(response);

                    // Menutup modal setelah kategori ditambahkan
                    const modal = bootstrap.Modal.getInstance(document.getElementById('addCategoryModal'));
                    modal.hide(); // Menutup modal

                    // Mengosongkan input form
                    document.getElementById('category-name').value = '';
                    document.getElementById('category-image').value = ''; // Mengosongkan input file

                    // Setelah kategori berhasil ditambahkan, ambil data terbaru dari API
                    getJSON('https://asia-southeast2-awangga.cloudfunctions.net/logiccoffee/data/category', "Login", token, (response) => {
                        if (response.status === 200) {
                            categories = response.data.data || []; // Update data kategori
                            displayCategories(response); // Tampilkan kategori terbaru
                        } else {
                            console.error(`Error: ${response.status}`);
                            alert("Gagal memuat data kategori. Silakan coba lagi.");
                        }
                    });
                } else {
                    console.error('Gagal menambah kategori:', data);
                    alert('Gagal menambah kategori!');
                }
            }
        );

        // Mulai pembacaan gambar sebagai base64
        reader.readAsDataURL(categoryImage);
    }
}

// Menunggu hingga DOM selesai dimuat
document.addEventListener('DOMContentLoaded', function () {
    // Menambahkan event listener untuk form submit setelah DOM dimuat sepenuhnya
    document.getElementById('add-category-form').addEventListener('submit', addCategory);
});


// Fungsi untuk menangani submit form saat mengubah kategori
document.getElementById('edit-category-form').addEventListener('submit', (event) => {
    event.preventDefault(); // Mencegah form submit default

    const updatedCategoryName = document.getElementById('edit-category-name').value.trim(); // Nama kategori baru
    if (updatedCategoryName === '') {
        alert('Nama kategori tidak boleh kosong!');
        return;
    }

    const targetUrl = `${'https://asia-southeast2-awangga.cloudfunctions.net/logiccoffee/data/category'}/${categories[currentEditIndex].id}`; // Endpoint API dengan ID kategori

    // Data yang akan diupdate
    const updatedCategoryData = { name: updatedCategoryName };

    // Ambil token dari cookie
    const token = getCookie('login');
    if (!token) {
        alert('Token tidak ditemukan, harap login terlebih dahulu!');
        return;
    }

    // Log untuk memeriksa data yang akan dikirim
    console.log('Kategori yang akan diubah:', updatedCategoryData);

    // Kirim data ke API untuk mengubah kategori menggunakan putJSON
    putJSON(targetUrl, 'Login', token, updatedCategoryData, function (response) {
        const { status, data } = response;

        if (status >= 200 && status < 300) {
            console.log('Kategori berhasil diubah:', data);

            // Perbarui data kategori di array setelah berhasil diubah
            categories[currentEditIndex].name = updatedCategoryName;

            // Render ulang daftar kategori
            displayCategories({ data: { data: categories } }); // Menampilkan data terbaru

            // Tampilkan notifikasi
            alert('Kategori berhasil diubah!');

            // Tutup modal edit
            const editCategoryModal = bootstrap.Modal.getInstance(document.getElementById('editCategoryModal'));
            editCategoryModal.hide();

            // Reset index edit
            currentEditIndex = null;
        } else {
            console.error('Gagal mengubah kategori:', data);
            alert('Gagal mengubah kategori!');
        }
    });
});

// Fungsi untuk menghapus kategori setelah konfirmasi
document.getElementById('confirm-delete-btn').addEventListener('click', () => {
    if (currentDeleteIndex !== null) {
        const targetUrl = `${'https://asia-southeast2-awangga.cloudfunctions.net/logiccoffee/data/category'}/${categories[currentDeleteIndex].id}`;  // Mendapatkan URL dengan ID kategori

        // Ambil token dari cookie
        const token = getCookie('login');
        if (!token) {
            alert('Token tidak ditemukan, harap login terlebih dahulu!');
            return;
        }

        // Panggil deleteJSON untuk menghapus kategori
        deleteJSON(targetUrl, 'Login', token, {}, (response) => {
            if (response.status === 200) {
                // Hapus kategori dari array lokal setelah berhasil dihapus
                categories.splice(currentDeleteIndex, 1);

                // Render ulang daftar kategori setelah penghapusan
                displayCategories({ data: { data: categories } });

                // Tampilkan SweetAlert2 setelah kategori berhasil dihapus
                Swal.fire({
                    title: 'Sukses!',
                    text: 'Kategori berhasil dihapus.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    // Tutup modal hapus
                    const deleteCategoryModal = bootstrap.Modal.getInstance(document.getElementById('deleteCategoryModal'));
                    deleteCategoryModal.hide();

                    // Reset index setelah penghapusan
                    currentDeleteIndex = null;
                });
            } else {
                // Tampilkan pesan error jika penghapusan gagal
                Swal.fire('Gagal', 'Terjadi kesalahan saat menghapus kategori', 'error');
            }
        });
    }
});

// Fungsi untuk membuka modal edit kategori
function openEditModal(index) {
    currentEditIndex = index; // Simpan index kategori yang sedang diedit
    const category = categories[index]; // Ambil data kategori berdasarkan index
    document.getElementById('edit-category-name').value = category.name; // Isi input dengan nama kategori saat ini

    // Tampilkan modal edit
    const editCategoryModal = new bootstrap.Modal(document.getElementById('editCategoryModal'));
    editCategoryModal.show();
}

// Fungsi untuk menghapus kategori
function openDeleteModal(index) {
    currentDeleteIndex = index; // Menyimpan index kategori yang akan dihapus
    const deleteCategoryModal = new bootstrap.Modal(document.getElementById('deleteCategoryModal'));
    deleteCategoryModal.show();
}

function validateCategory() {
    const categoryName = document.getElementById('category-name').value;
    if (categoryName === '') {
        alert('Nama kategori tidak boleh kosong');
        return false;
    }
    return true;
}


// Event listener untuk tombol Tambah Kategori
document.getElementById('add-category-btn').addEventListener('click', () => {
    const addCategoryModal = new bootstrap.Modal(document.getElementById('addCategoryModal'));
    addCategoryModal.show();
});