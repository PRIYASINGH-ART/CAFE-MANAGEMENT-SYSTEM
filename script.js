 


/*=====================2. account management(login&register)=============*/
function register() 
    {
        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const role = document.getElementById("role").value;
        if (!username || !email || !password || !role) 
            {
                alert("Please fill all fields!");
                return;
            }
        let users = JSON.parse(localStorage.getItem("users")) || [];
        if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) 
            {
                alert("Username already exists!");
                return;
            }
    users.push({ username, email, password, role });
    localStorage.setItem("users", JSON.stringify(users));
    alert("Account Created Successfully!");
    window.location.href = "login.html";
}


function login() {
    // Select the first text input for username and password specifically
    const usernameInput = document.querySelector(".login-box input[type='text']").value.trim().toLowerCase();
    const passwordInput = document.getElementById("password").value.trim();

    let users = JSON.parse(localStorage.getItem("users")) || [];
    let validUser = users.find(u => u.username.toLowerCase() === usernameInput && u.password === passwordInput);

    if (validUser) {
        localStorage.setItem("activeUser", validUser.username);
        localStorage.setItem("activeRole", validUser.role);
        
        if (validUser.role === "staff") {
            window.location.href = "index.html";
        } else {
            alert("Customer login successful. POS is for staff only.");
        }
    } else {
        alert("Invalid Username or Password.");
    }
}

// LOGOUT 

function logout() {
    localStorage.removeItem("activeUser");
    localStorage.removeItem("activeRole");
    window.location.href = "login.html";
}

// PASSWORD TOGGLE 

function togglePassword() {
    const passwordInput = document.getElementById("password");
    const toggleIcon = document.querySelector(".toggle-password");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleIcon.textContent = "🙈";
    } else {
        passwordInput.type = "password";
        toggleIcon.textContent = "👁";
    }
}

/* ================= 3. POS CORE LOGIC (Index.html) ================= */

let cart = {};
let total = 0;

// Initialize UI for Index Page
if (document.getElementById("staff-name")) {
    const activeUser = localStorage.getItem("activeUser");
    document.getElementById("staff-name").innerText = activeUser;
    document.getElementById("user-initial").innerText = activeUser.charAt(0).toUpperCase();
    calculateTodaySales();
}

// ADD ITEM 

function addItem(name, price) 
{
    if (cart[name])
        {
            cart[name].qty++;
        } 
    else
        {
            cart[name] = { price: price, qty: 1 };
        }

    renderBill();
}
// REMOVE ITEM 

function removeItem(name) 
{
    if (cart[name]) 
        {
            cart[name].qty--;
            if (cart[name].qty <= 0) 
                {
                    delete cart[name];
                }
        }
    renderBill();
}

// RENDER BILL 

function renderBill() 
{
    const billContainer = document.getElementById("bill-items");
    if(!billContainer)
        return;
    billContainer.innerHTML = "";
    total = 0;
    for (let item in cart) 
        {
            let subtotal = cart[item].price * cart[item].qty;
            total += subtotal;
            billContainer.innerHTML += `
        <div class="bill-row">
            <span>
                <button class="btn-remove" onclick="removeItem('${item}')">×</button>
                ${item} x${cart[item].qty}</span>
            <span>rupees${subtotal.toFixed(2)}</span>
        </div>`;
    }

    document.getElementById("total-val").innerText = total.toFixed(2);
    calcChange();
}

// CALCULATE CHANGE 

function calcChange() 
{
    let cash = parseFloat(document.getElementById("cash").value) || 0;
    let change = cash - total;
    document.getElementById("change-val").innerText =change >= 0 ? change.toFixed(2) : "00";
}
//CLEAR CART
function clearCart(){
    cart = {};
    renderBill();
}
/*============== 4.sales& receipts================*/
function completeSale()
    {
        if (total === 0) 
            {
                alert("Cart is empty!");
                return;
            }

    //  ORDER ID GENERATION 
    let counter = localStorage.getItem("orderCounter");
    if (counter === null) 
        {
            counter = 1000;
        }
    counter = Number(counter) + 1;
    localStorage.setItem("orderCounter", counter);
    let orderId = "BB-" + counter;

    //prepare receipt modal
    let receiptList = document.getElementById("receipt-list");
    receiptList.innerHTML = `<p><b>Order ID:</b> ${orderId}</p>` + receiptList.innerHTML;
    let itemsArray = [];
    for (let item in cart)
        {
            let subtotal = cart[item].price * cart[item].qty;
            receiptList.innerHTML += `<p>${item} x${cart[item].qty} - rupees${subtotal.toFixed(2)}</p>`;
            itemsArray.push
            ({
                name: item,
                qty: cart[item].qty,
                price: cart[item].price
            });
        }
    document.getElementById("receipt-total").innerHTML ="Total: rupees " + total.toFixed(2);
    document.getElementById("receiptmodal").style.display = "flex";

    // ✅ SAVE ORDER TO LOCALSTORAGE
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.push
    ({
        id:orderId,
        date:newDate().toLocaleString(),
        staff:localStorage.getItem("activeUser"),
        items:itemsArray,
        total:total
    });
    localStorage.setItem("orders", JSON.stringify(orders));

    // Reset cart
    clearCart();
    document.getElementById("cash").value = "";
    calculateTodaySales();
}
    //calculateTodaySale
function calculateTodaySales() {

    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    let today = new Date().toLocaleDateString();
    let totalSales = order.reduce((sum,order)=>
        {
            let orderDate=newDate(order.date).toLocalDateString();
            return orderDate  === today ? sum + order.total:sum;
        } ,0);
    let el = document.getElementById("today-sales");
    if(el)
        {
            el.innerText = totalSales.toFixed(2);
        }
}

/* ================= 5. ORDER HISTORY (Order.html) ================= */

if (document.getElementById("order-list"))
    {
        let container = document.getElementById("order-list");
        if(container)
            {
                let orders = JSON.parse(localStorage.getItem("orders")) || [];
                orders.reverse().forEach(order => {
                let itemsHTML = "";
                order.items.forEach(item => {
                itemsHTML += `<p>${item.name} x${item.qty}</p>`;
            });
        container.innerHTML += `
        <div class="order">
            <p><b>Order ID:</b> ${order.id}</p>
            <p><b>Date:</b> ${order.date}</p>
            <p><b>Staff:</b> ${order.staff}</p>
            ${itemsHTML}
            <p><b>Total:</b> rupees${order.total.toFixed(2)}</p>
        </div>`;
    });
}


/* ================= CLOSE RECEIPT ================= */

function closeReceipt() {
    document.getElementById("receiptmodal").style.display = "none";
}


/* ================= SEARCH FILTER ================= */

function filterMenu() {
    let input = document.getElementById("menuSearch").value.toLowerCase();
    let cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        let text = card.innerText.toLowerCase();
        card.style.display = text.includes(input) ? "block" : "none";
    });
}

}

/* ================= 6. UTILITIES ================= */

function filterMenu()
    {
        let input = document.getElementById("menuSearch").value.toLowerCase();
        document.querySelectorAll(".card").forEach(card => 
            {
                card.style.display = card.innerText.toLowerCase().includes(input) ? "block" : "none";
            });
    }

function closeReceipt()
    {
        document.getElementById("receiptmodal").style.display = "none";
    }
function printReceipt()
    { 
        window.print();
    }

/*=======================7.order=====================*/
let container = document.getElementById("order-list");

if(container){
    let orders = JSON.parse(localStorage.getItem("orders")) || [];

    orders.reverse().forEach(order => {

        let itemsHTML = "";

        order.items.forEach(item => {
            itemsHTML += `<p>${item.name} x${item.qty}</p>`;
        });

        container.innerHTML += `
        <div class="order">
            <p><b>Order ID:</b> ${order.id}</p>
            <p><b>Date:</b> ${order.date}</p>
            <p><b>Staff:</b> ${order.staff}</p>
            ${itemsHTML}
            <p><b>Total:</b> $${order.total.toFixed(2)}</p>
        </div>`;
    });
}


 //CLOSE RECEIPT 

function closeReceipt() {
    document.getElementById("receiptmodal").style.display = "none";
}


// SEARCH FILTER 

function filterMenu() {
    let input = document.getElementById("menuSearch").value.toLowerCase();
    let cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        let text = card.innerText.toLowerCase();
        card.style.display = text.includes(input) ? "block" : "none";
    });
}
