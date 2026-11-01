
document.addEventListener("DOMContentLoaded", function () {

    const customerList = document.getElementById("customer-list");
    const reservationList = document.getElementById("reservation-list");
    const adminMessage = document.getElementById("admin-message");

    // Get today's local date
    function getToday() {
        const today = new Date();

        return today.getFullYear() + "-" +
            String(today.getMonth() + 1).padStart(2, "0") + "-" +
            String(today.getDate()).padStart(2, "0");
    }

    // Format currency
    function formatMoney(value) {
        const amount = Number(value);

        if (!Number.isFinite(amount)) {
            return "N/A";
        }

        return "S$" + amount.toFixed(2);
    }

    // Create table cell safely
    function addCell(row, value) {
        const cell = document.createElement("td");
        cell.textContent = value ?? "-";
        row.appendChild(cell);
        return cell;
    }

    // Display messages
    function showMessage(text) {
        adminMessage.textContent = text;
        adminMessage.style.color = "green";
    }

    // Display registered customers
    function displayCustomers() {

        customerList.replaceChildren();

        customers.forEach(function (customer) {

            const row = document.createElement("tr");

            addCell(row, customer.id);
            addCell(row, customer.name);
            addCell(row, customer.email);
            addCell(row, customer.phone);

            customerList.appendChild(row);
        });
    }

    // Display all reservations
    function displayReservations() {

        reservationList.replaceChildren();

        if (reservations.length === 0) {
            const row = document.createElement("tr");
            const cell = addCell(row, "No reservations found.");
            cell.colSpan = 11;
            reservationList.appendChild(row);
            return;
        }

        reservations.forEach(function (reservation) {

            const row = document.createElement("tr");

            // Find matching customer
            const customer = customers.find(function (c) {
                return (
                    (reservation.customerId &&
                        c.id === reservation.customerId) ||
                    (reservation.customerEmail &&
                        c.email.toLowerCase() ===
                        reservation.customerEmail.toLowerCase())
                );
            });

            const rentalCost =
                reservation.total ?? reservation.rentalCost;

            const status = reservation.status || "Confirmed";

            addCell(row, reservation.id);
            addCell(row, reservation.car);
            addCell(row, reservation.pickupDate);
            addCell(row, reservation.returnDate);
            addCell(row, formatMoney(rentalCost));
            addCell(row, formatMoney(reservation.damageCost || 0));

            addCell(
                row,
                reservation.finalTotal == null
                    ? "Pending"
                    : formatMoney(reservation.finalTotal)
            );

            
// Create editable reservation status cell
const statusCell = document.createElement("td");

const statusSelect = document.createElement("select");

// Available reservation statuses
const statuses = [
    "Confirmed",
    "Awaiting Inspection",
    "Completed"
];

// Keep compatibility with older reservation statuses
if (!statuses.includes(status)) {
    statuses.unshift(status);
}

// Create dropdown options
statuses.forEach(function (option) {

    const statusOption = document.createElement("option");
    statusOption.value = option;
    statusOption.textContent = option;

    if (option === status) {
        statusOption.selected = true;
    }

    statusSelect.appendChild(statusOption);
});

// Create Save button
const saveButton = document.createElement("button");
saveButton.type = "button";
saveButton.textContent = "Save";
saveButton.className = "admin-btn";

// Handle status changes
saveButton.addEventListener("click", function () {

    const newStatus = statusSelect.value;

    if (newStatus === status) return;

    // Do not reopen completed reservations
    if (status === "Completed") {
        alert("Completed reservations cannot be reopened here.");
        statusSelect.value = status;
        return;
    }

    // Prevent reverting a returned vehicle to Confirmed
    if (
        newStatus === "Confirmed" &&
        reservation.returnedAt
    ) {
        alert("This vehicle has already been returned.");
        statusSelect.value = status;
        return;
    }

    // Record physical return before inspection
    if (newStatus === "Awaiting Inspection") {

        if (
            !reservation.returnDate ||
            reservation.returnDate > getToday()
        ) {
            alert("The scheduled return date has not arrived.");
            statusSelect.value = status;
            return;
        }

        if (!confirm("Confirm that the vehicle has been returned?")) {
            statusSelect.value = status;
            return;
        }

        reservation.returnedAt =
            reservation.returnedAt || new Date().toISOString();
    }

    // Completed must follow inspection and demo payment
    if (newStatus === "Completed") {

        if (
            reservation.finalTotal == null ||
            !reservation.inspectedAt ||
            reservation.paymentStatus !== "Paid"
        ) {
            alert(
                "Complete vehicle inspection and record " +
                "the payment before marking as Completed."
            );
            statusSelect.value = status;
            return;
        }
    }

    // Update reservation status
    reservation.status = newStatus;

    // Save changes to LocalStorage
    saveDatabase();

    alert("Reservation status updated successfully!");

    // Refresh reservation table
    displayReservations();

});

// Add dropdown and button to table
statusCell.appendChild(statusSelect);
statusCell.appendChild(saveButton);
row.appendChild(statusCell);



            addCell(row, reservation.paymentStatus || "Unpaid");

            const actionCell = document.createElement("td");

            // STEP 1: Mark vehicle as returned
            if (status === "Confirmed" || status === "Pending") {

                const returnButton = document.createElement("button");
                returnButton.type = "button";
                returnButton.textContent = "Mark Returned";
                returnButton.className = "admin-btn";

                // Only available on or after scheduled return date
                const canReturn =
                    /^\d{4}-\d{2}-\d{2}$/.test(reservation.returnDate || "") &&
                    reservation.returnDate <= getToday();

                returnButton.disabled = !canReturn;

                if (!canReturn) {
                    returnButton.title =
                        "Available on or after the return date";
                }

                returnButton.addEventListener("click", function () {

                    if (reservation.returnDate > getToday()) {
                        return;
                    }

                    reservation.status = "Awaiting Inspection";
                    reservation.returnedAt = new Date().toISOString();

                    saveDatabase();
                    showMessage("Vehicle marked as returned.");
                    displayReservations();
                });

                actionCell.appendChild(returnButton);
            }

            // STEP 2: Complete vehicle inspection
            else if (
                status === "Awaiting Inspection" ||
                status === "Returned - Awaiting Inspection"
            ) {

                const form = document.createElement("form");
                form.className = "inspection-actions";

                const damageInput = document.createElement("input");
                damageInput.type = "number";
                damageInput.min = "0";
                damageInput.step = "0.01";
                damageInput.value = "0";
                damageInput.placeholder = "Damage Cost";
                damageInput.required = true;

                const notesInput = document.createElement("textarea");
                notesInput.placeholder = "Inspection notes";
                notesInput.rows = 2;

                const completeButton = document.createElement("button");
                completeButton.type = "submit";
                completeButton.className = "admin-btn";
                completeButton.textContent = "Complete Inspection";

                form.appendChild(damageInput);
                form.appendChild(notesInput);
                form.appendChild(completeButton);

                form.addEventListener("submit", function (event) {
                    event.preventDefault();

                    const damageCost = Number(damageInput.value);
                    const notes = notesInput.value.trim();
                    const rental = Number(rentalCost);

                    // Validate charges
                    if (
                        damageInput.value.trim() === "" ||
                        !Number.isFinite(damageCost) ||
                        damageCost < 0 ||
                        !Number.isFinite(rental) ||
                        rental < 0
                    ) {
                        alert("Please enter valid rental and damage costs.");
                        return;
                    }

                    if (damageCost > 0 && notes === "") {
                        alert("Please describe the damages found.");
                        return;
                    }

                    const finalTotal = Number(
                        (rental + damageCost).toFixed(2)
                    );

                    const confirmed = confirm(
                        "Final Bill: " + formatMoney(finalTotal) +
                        "\nComplete inspection and make charges to credit card?"
                    );

                    if (!confirmed) return;

                    // Update reservation
                    reservation.damageCost = damageCost;
                    reservation.inspectionNotes =
                        notes || "No damage found";

                    reservation.inspectionStatus =
                        damageCost > 0 ? "Damage Found" : "No Damage";

                    reservation.inspectedAt = new Date().toISOString();
                    reservation.finalTotal = finalTotal;

                    // Demo payment only
                    reservation.paymentStatus = "Paid";
                    reservation.paymentMethod = "Card";
                    reservation.paymentRecordedAt =
                        new Date().toISOString();

                    reservation.status = "Completed";

                    saveDatabase();

                    showMessage(
                        "Inspection completed. Payment recorded."
                    );

                    displayReservations();
                });

                actionCell.appendChild(form);
            }

            // Completed bookings
            else if (status === "Completed") {
                actionCell.textContent = "Completed";
            }

            // Other statuses
            else {
                actionCell.textContent = "No action available";
            }

            row.appendChild(actionCell);
            reservationList.appendChild(row);

        });
    }

    // Load dashboard information
    displayCustomers();
    displayReservations();

});
