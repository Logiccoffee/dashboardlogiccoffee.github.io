// Mengimpor modul eksternal
import { getCookie } from "https://cdn.jsdelivr.net/gh/jscroot/cookie@0.0.1/croot.js";
import { setInner } from "https://cdn.jsdelivr.net/gh/jscroot/element@0.1.5/croot.js";
import { getJSON } from "https://cdn.jsdelivr.net/gh/jscroot/api@0.0.7/croot.js";
import { redirect } from "https://cdn.jsdelivr.net/gh/jscroot/url@0.0.9/croot.js";

// Fungsi untuk mengecek status login
function checkLoginStatus() {
    const loginToken = getCookie("login");
    
    // Jika tidak ada cookie login, arahkan ke halaman login
    if (!loginToken) {
        window.location.href = "https://logiccoffee.id.biz.id/login"; // Ganti dengan URL halaman login
    } else {
        console.log("Pengguna sudah login");
        // Lanjutkan untuk menampilkan data pengguna jika diperlukan
    }
}

// Panggil fungsi checkLoginStatus() di awal
checkLoginStatus();

// Cek apakah cookie login ada, jika tidak arahkan ke halaman utama
if (getCookie("login") === "") {
    console.log("Cookie login tidak ditemukan. Mengarahkan ke halaman utama.");
    redirect("/");
}

// Ambil data pengguna menggunakan API
getJSON("https://asia-southeast2-awangga.cloudfunctions.net/logiccoffee/data/user", "login", getCookie("login"), responseFunction);

// Fungsi untuk menangani respons API
function responseFunction(result) {
    try {
        if (result.status === 404) {
            console.log("Pengguna tidak ditemukan. Mengarahkan ke halaman pendaftaran.");
            setInner("content", "Silahkan lakukan pendaftaran terlebih dahulu.");
            redirect("/register");
            return; // Menghentikan eksekusi setelah redirect
        }

        // Menampilkan nama pengguna dan peran pengguna di elemen yang telah disediakan
        const userNameElement = document.getElementById("user-name");
        const userRoleElement = document.getElementById("user-role");

        if (userNameElement && userRoleElement) {
            userNameElement.textContent = result.data.name || "Nama Tidak Diketahui";
            userRoleElement.textContent = result.data.role || "Peran Tidak Diketahui";
        }

        console.log("Data pengguna:", result.data);
    } catch (error) {
        console.error("Terjadi kesalahan saat memproses respons:", error.message);
        setInner("content", "Terjadi kesalahan saat memproses data.");
    }
}

// Fungsi logout
function logout(event) {
    event.preventDefault(); // Mencegah perilaku default link
  
    // Hapus cookie dengan nama "login"
    deleteCookie("login");
  
    // Cek apakah cookie berhasil dihapus
    if (document.cookie.indexOf("login=") === -1) {
        console.log("Cookie 'login' berhasil dihapus. Mengarahkan ke halaman utama.");
        redirect("/");
    } else {
        console.error("Cookie 'login' gagal dihapus.");
    }
  }
  
  // Menjalankan logout saat tombol diklik
  document.addEventListener("DOMContentLoaded", function () {
    const logoutButton = document.querySelector(".logout-btn");
    if (logoutButton) {
        logoutButton.addEventListener("click", logout);
    } else {
        console.error("Tombol logout tidak ditemukan.");
    }
  });