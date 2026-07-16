/* ==========================================
   Green Autos
   Vendor Payments JS
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    const currentUser = getCurrentUser() || {};
    const vendorId = getCurrentVendorId();
    const userName = document.getElementById("userName");
    const paymentTable = document.getElementById("paymentTable");

    if (userName) {
        userName.innerText = currentUser.name || "Vendor";
    }

    function renderPayments() {
        // Get all cash collections
        let payments = getCashCollections();
        
        // Filter by vendor
        let allVehicles = getVehicles();
        let vendorVehicleIds = allVehicles
            .filter(v => String(v.vendorId) === String(vendorId))
            .map(v => v.id);
        
        let vendorPayments = payments.filter(p => 
            String(p.vendorId) === String(vendorId) || 
            vendorVehicleIds.includes(p.vehicleId) ||
            String(allVehicles.find(v => v.number === p.vehicle)?.vendorId || "") === String(vendorId)
        );

        const normalizedPayments = vendorPayments.map(payment => ({
            ...payment,
            status: payment.status || (String(payment.remarks || "").toLowerCase().includes("pending") ? "Pending" : "Paid")
        }));

        const totalEarnings = normalizedPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
        const paidCount = normalizedPayments.filter(payment => payment.status === "Paid").length;
        const pendingCount = normalizedPayments.filter(payment => payment.status !== "Paid").length;

        const earningTotal = document.getElementById("earningTotal");
        const paymentCount = document.getElementById("paymentCount");
        const pendingPayments = document.getElementById("pendingPayments");

        if (earningTotal) {
            earningTotal.innerText = `Rs ${totalEarnings}`;
        }

        if (paymentCount) {
            paymentCount.innerText = vendorPayments.length;
        }

        if (pendingPayments) {
            pendingPayments.innerText = pendingCount;
        }

        if (!paymentTable) {
            return;
        }

        paymentTable.innerHTML = "";

        if (normalizedPayments.length === 0) {
            paymentTable.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center vendor-empty">No payment records yet.</td>
                </tr>
            `;
            return;
        }

        normalizedPayments.forEach((payment, index) => {
            let vehicleDisplay = "-";
            const vehicle = allVehicles.find(v => v.number === payment.vehicle);
            if (vehicle) {
                vehicleDisplay = vehicle.name || vehicle.number || "-";
            }
            
            paymentTable.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${payment.date || "-"}</td>
                    <td>${vehicleDisplay}</td>
                    <td>Rs ${payment.amount || 0}</td>
                    <td><span class="badge bg-${payment.status === "Paid" ? "success" : payment.status === "Pending" ? "warning" : "secondary"}">${payment.status}</span></td>
                </tr>
            `;
        });
    }

    // Initial render
    renderPayments();

    // Listen for storage changes
    window.addEventListener('storageSync', function(e) {
        if (e.key === StorageKeys.CASH_COLLECTIONS) {
            renderPayments();
        }
    });
});
