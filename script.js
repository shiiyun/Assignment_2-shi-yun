// car class filter
document.addEventListener("DOMContentLoaded", function () {
    const filter = document.getElementById("car-class-filter");
    const cars = document.querySelectorAll(".cars-boxes");

    if (filter) {
        filter.addEventListener("change", function () {
            const selectedClass = filter.value;

            cars.forEach(function (car) {
                if (
                    selectedClass === "all" ||
                    car.dataset.class === selectedClass
                ) {
                    car.style.display = "";
                } else {
                    car.style.display = "none";
                }
            });
        });
    }
});

// Rent page - cannot select dates before today

document.addEventListener("DOMContentLoaded", function () {

    const today = new Date();

    const todayString =
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const pickupDate = document.getElementById("pickup-date");
    const returnDate = document.getElementById("return-date");

    // Only run if both date inputs exist
    if (pickupDate && returnDate) {

        // Prevent selecting dates before today
        pickupDate.min = todayString;
        returnDate.min = todayString;

        // Return date cannot be earlier than pickup date
        pickupDate.addEventListener("change", function () {

            returnDate.min = pickupDate.value || todayString;

            if (returnDate.value && returnDate.value < pickupDate.value) {
                returnDate.value = "";
            }

        });
    }

});


// caculate total amount
document.addEventListener("DOMContentLoaded", function () {

    const carChoice = document.getElementById("car-choice");
    const pickupDate = document.getElementById("pickup-date");
    const returnDate = document.getElementById("return-date");

    const pricePerDay = document.getElementById("price-per-day");
    const rentalDays = document.getElementById("rental-days");
    const rentalTotal = document.getElementById("rental-total");

    // Only run calculator if all required elements exist
    if (
        !carChoice ||
        !pickupDate ||
        !returnDate ||
        !pricePerDay ||
        !rentalDays ||
        !rentalTotal
    ) {
        return;
    }

    function calculateTotal() {

        const price = Number(carChoice.value);

        // Check whether all details are selected
        if (!carChoice.value || !pickupDate.value || !returnDate.value) {
            pricePerDay.textContent = "$0";
            rentalDays.textContent = "0 days";
            rentalTotal.textContent = "$0";
            return;
        }

        // Convert selected dates into Date objects
        const pickup = new Date(pickupDate.value + "T00:00:00");
        const returnDay = new Date(returnDate.value + "T00:00:00");

        // Calculate rental duration in calendar days
        const days = Math.round(
            (Date.UTC(
                returnDay.getFullYear(),
                returnDay.getMonth(),
                returnDay.getDate()
            ) - Date.UTC(
                pickup.getFullYear(),
                pickup.getMonth(),
                pickup.getDate()
            )) / (1000 * 60 * 60 * 24)
        );

        // Check for invalid dates
        if (days <= 0) {
            pricePerDay.textContent = "$" + price;
            rentalDays.textContent = "Invalid dates";
            rentalTotal.textContent = "$0";
            return;
        }

        // Calculate total rental price
        const total = price * days;

        // Display results
        pricePerDay.textContent = "$" + price;
        rentalDays.textContent = days + " days";
        rentalTotal.textContent = "$" + total.toLocaleString("en-SG");

        return {
            days: days,
            total: total
};
        
    }

    // Recalculate when customer changes selections
    carChoice.addEventListener("change", calculateTotal);
    pickupDate.addEventListener("change", calculateTotal);
    returnDate.addEventListener("change", calculateTotal);

    // Calculate on initial page load
    calculateTotal();
});


/* ===== CUSTOMER REGISTRATION ===== */

document.addEventListener("DOMContentLoaded", function () {

    const registerForm = document.getElementById("register-form");
    const registerMessage = document.getElementById("register-message");

    // Only run on registration page
    if (!registerForm || !registerMessage) {
        return;
    }

    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        console.log("Registration form submitted");

        // Get customer details
        const name = document.getElementById("fullname").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        // Check for empty fields
        if (!name || !email || !phone || !password || !confirmPassword) {
            registerMessage.textContent = "Please fill in all fields.";
            registerMessage.style.color = "red";
            return;
        }

        // Check password confirmation
        if (password !== confirmPassword) {
            registerMessage.textContent = "Passwords do not match!";
            registerMessage.style.color = "red";
            return;
        }

        // Check password length
        if (password.length < 8) {
            registerMessage.textContent =
                "Password must contain at least 8 characters.";
            registerMessage.style.color = "red";
            return;
        }

        try {

            // Register customer using db.js
            const result = registerCustomer(name, email, phone, password);

            console.log("Registration result:", result.success);

            if (result.success) {

                registerMessage.textContent = "Account successfully created!";
                registerMessage.style.color = "green";

                // Clear registration form
                registerForm.reset();

                // Redirect to login page
                setTimeout(function () {
                    window.location.href = "login.html";
                }, 1500);

            } else {

                registerMessage.textContent = result.message;
                registerMessage.style.color = "red";

            }

        } catch (error) {

            console.error("Registration error:", error);

            registerMessage.textContent =
                "Unable to create account. Please try again.";
            registerMessage.style.color = "red";

        }

    });

});



/* ===== LOGIN PAGE ===== */
document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const togglePassword = document.getElementById("toggle-password");
    const loginMessage = document.getElementById("login-message");

    // Show or hide password
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", function () {

            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                togglePassword.innerHTML =
                    '<i class="fa-solid fa-eye-slash"></i>';
                togglePassword.setAttribute("aria-label", "Hide password");

            } else {
                passwordInput.type = "password";
                togglePassword.innerHTML =
                    '<i class="fa-solid fa-eye"></i>';
                togglePassword.setAttribute("aria-label", "Show password");
            }
        });
    }

    // Handle login form submission
    if (loginForm && emailInput && passwordInput && loginMessage) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            // Get customer input
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            // Check for empty fields
            if (email === "" || password === "") {
                loginMessage.textContent = "Please fill in all fields.";
                loginMessage.style.color = "red";
                return;
            }

            // Check customer credentials
            const loginResult = loginCustomer(email, password);

            // Supports Boolean or result object
            const loginSuccess =
                loginResult === true || loginResult?.success === true;

    
    if (loginSuccess) {
        // Retrieve customer database
        const customers = JSON.parse(
            localStorage.getItem("azoomCustomers")
        ) || [];

        // Find logged-in user
        const user = customers.find(
            customer =>
                customer.email.toLowerCase() === email.toLowerCase()
        );

        // Determine account role
        const role = user?.role === "admin"
            ? "admin"
            : "customer";

        // Save login session
        sessionStorage.setItem("azoomLoggedIn", "true");
        sessionStorage.setItem("azoomCustomerEmail", email);
        sessionStorage.setItem("azoomRole", role);

        loginMessage.textContent =
            "Login successful! Redirecting...";
        loginMessage.style.color = "green";

        // Remember previous navigation
        const returnPage =
            sessionStorage.getItem("azoomReturnPage");

        sessionStorage.removeItem("azoomReturnPage");

        setTimeout(function () {
            // Admin goes to admin dashboard
            if (role === "admin") {
                window.location.href = "admin.html";
            }

            // Customer who selected a car
            else if (sessionStorage.getItem("azoomSelectedCar")) {
                window.location.href = "rent.html";
            }

            // Customer returning to cars page
            else if (returnPage === "cars.html") {
                window.location.href = "cars.html";
            }

            // Normal customer login
            else {
                window.location.href = "profile.html";
            }

        }, 1000);

    } else {

        loginMessage.textContent =
            "Incorrect email or password.";

        loginMessage.style.color = "red";
    }

});
}

});

// auto fill customer details
document.addEventListener("DOMContentLoaded", function () {

    const customerName = document.getElementById("customer-name");
    const customerEmail = document.getElementById("customer-email");

    // Only run on reservation page
    if (!customerName || !customerEmail) {
        return;
    }

    // Get currently logged-in customer
    const loggedIn = sessionStorage.getItem("azoomLoggedIn");
    const email = sessionStorage.getItem("azoomCustomerEmail");

    if (loggedIn !== "true" || !email) {
        return;
    }

    // Retrieve registered customers
    const customers = JSON.parse(
        localStorage.getItem("azoomCustomers")
    ) || [];

    // Find the logged-in customer's details
    const customer = customers.find(
        customer => customer.email.toLowerCase() === email.toLowerCase()
    );

    // Automatically fill in the reservation form
    if (customer) {
        customerName.value = customer.name;
        customerEmail.value = customer.email;
    }

});


// change login button to profile icon if logged in
document.addEventListener("DOMContentLoaded", function () {
    const loginBtn = document.getElementById("nav-login-btn");

    if (!loginBtn) {
        return;
    }

    // Check if customer is logged in
    const loggedIn = sessionStorage.getItem("azoomLoggedIn");
    const customerEmail = sessionStorage.getItem("azoomCustomerEmail");

    if (loggedIn === "true" && customerEmail) {
        loginBtn.innerHTML = '<i class="fa-solid fa-user"></i>';
        loginBtn.href = "profile.html";
        loginBtn.title = "My Profile";

    } else {
        loginBtn.textContent = "Login";
        loginBtn.href = "login.html";
        loginBtn.title = "Login";
    }
});


// Display customer profile
document.addEventListener("DOMContentLoaded", function () {

    const profileName = document.getElementById("profile-name");
    const profileEmail = document.getElementById("profile-email");
    const profilePhone = document.getElementById("profile-phone");
    const reservationList = document.getElementById("reservation-list");

    // Only run on profile.html
    if (!profileName || !profileEmail || !profilePhone || !reservationList) {
        return;
    }

    // Get logged-in customer
    const loggedIn = sessionStorage.getItem("azoomLoggedIn");
    const email = sessionStorage.getItem("azoomCustomerEmail");

    console.log("Profile page loaded");
    console.log("Login status:", loggedIn);
    console.log("Customer email:", email);

    if (loggedIn !== "true" || !email) {
        console.log("No valid login session found.");
        window.location.href = "login.html";
        return;
    }

    // Retrieve database information
    const customers = JSON.parse(
        localStorage.getItem("azoomCustomers")
    ) || [];

    const reservations = JSON.parse(
        localStorage.getItem("azoomReservations")
    ) || [];

    // Find logged-in customer
    const customer = customers.find(
        customer => customer.email.toLowerCase() === email.toLowerCase()
    );

    console.log("Customer found:", customer);

    if (!customer) {
        console.log("Customer not found in database.");
        window.location.href = "login.html";
        return;
    }

    // Display customer information
    profileName.textContent = customer.name;
    profileEmail.textContent = customer.email;
    profilePhone.textContent = customer.phone;

    // Find reservations belonging to this customer
    const customerReservations = reservations.filter(
        reservation =>
            reservation.customerEmail.toLowerCase() === email.toLowerCase()
    );

    // Display message if no reservations
    if (customerReservations.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 7;
        cell.textContent = "You have no reservations yet.";
        cell.style.textAlign = "center";

        row.appendChild(cell);
        reservationList.appendChild(row);
        return;
    }

    // Display reservations
    customerReservations.forEach(function (reservation) {

        const row = document.createElement("tr");
        const paymentStatus = reservation.paymentStatus || "Unpaid";

        const details = [
            reservation.id,
            reservation.car,
            reservation.pickupDate,
            reservation.returnDate,
            "$" + Number(reservation.total).toLocaleString("en-SG"),
            reservation.status || "Confirmed"
        ];

        details.forEach(function (detail) {
            const cell = document.createElement("td");
            cell.textContent = detail;
            row.appendChild(cell);
        });

        const paymentCell = document.createElement("td");
        const paymentBadge = document.createElement("span");
        paymentBadge.textContent = paymentStatus;

        if (paymentStatus === "Paid" ||
            paymentStatus === "Paid") {

            paymentBadge.className = "payment-paid";

        } else {
            paymentBadge.className = "payment-unpaid";
        }
        paymentCell.appendChild(paymentBadge);
        row.appendChild(paymentCell);

        reservationList.appendChild(row);

    });
});

// logout function
function logoutCustomer() {
    sessionStorage.removeItem("azoomLoggedIn");
    sessionStorage.removeItem("azoomCustomerEmail");
    sessionStorage.removeItem("azoomReturnPage");

    console.log("Customer logged out successfully");
    console.log("Login status:",
        sessionStorage.getItem("azoomLoggedIn"));

    window.location.replace("home.html");
}