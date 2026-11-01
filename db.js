
// AZoom Frontend Database

// Load saved data, or create empty arrays if no data exists
let customers = JSON.parse(localStorage.getItem("azoomCustomers")) || [];
let reservations = JSON.parse(localStorage.getItem("azoomReservations")) || [];

function saveDatabase() {
    localStorage.setItem("azoomCustomers", JSON.stringify(customers));
    localStorage.setItem("azoomReservations", JSON.stringify(reservations));
}

function registerCustomer(name, email, phone, password) {

    const existingCustomer = customers.find(
        customer => customer.email.toLowerCase() === email.toLowerCase()
    );

    if (existingCustomer) {
        return {
            success: false,
            message: "Email is already registered."
        };
    }

    const newCustomer = {
        id: "C" + Date.now(),
        name: name,
        email: email,
        phone: phone,
        password: password,
        role: "customer"
    };

    customers.push(newCustomer);
    saveDatabase();

    console.log("Customer registered:", newCustomer);
    console.log("All customers:", customers);

    return {
        success: true,
        message: "Successfully created!"
    };
}

// Log in an existing customer
function loginCustomer(email, password) {

    const customer = customers.find(
        customer =>
            customer.email.toLowerCase() === email.toLowerCase() &&
            customer.password === password
    );

    if (!customer) {
        return false;
    }

    // Remember which customer is currently logged in
    localStorage.setItem("azoomCurrentCustomer", customer.id);

    return true;
}

// Get the currently logged-in customer
function getCurrentCustomer() {

    const customerId = localStorage.getItem("azoomCurrentCustomer");

    return customers.find(customer => customer.id === customerId) || null;
}

// Log out customer
function logoutCustomer() {
    localStorage.removeItem("azoomCurrentCustomer");
    window.location.href = "login.html";
}


// Get reservations belonging to the logged-in customer
function getCustomerReservations() {
    const customer = getCurrentCustomer();
    if (!customer) {
        return [];
    }
    return reservations.filter(
        reservation => reservation.customerId === customer.id
    );
}
