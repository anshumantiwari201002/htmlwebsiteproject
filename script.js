// BOOKNEST LIBRARY MANAGEMENT SYSTEM

const sampleBooks = [
 {id:"BK101",title:"Introduction to C Programming",author:"E. Balagurusamy",category:"Programming",total:5,available:4},
 {id:"BK102",title:"Let Us C",author:"Yashavant Kanetkar",category:"Programming",total:4,available:4},
 {id:"BK103",title:"Engineering Mathematics",author:"B. S. Grewal",category:"Mathematics",total:6,available:5},
 {id:"BK104",title:"Concepts of Physics",author:"H. C. Verma",category:"Physics",total:5,available:5},
 {id:"BK105",title:"The Alchemist",author:"Paulo Coelho",category:"Literature",total:3,available:3}
];

const sampleMembers = [
 {id:"ST101",name:"Aarav Sharma",course:"B.Tech CSIT"},
 {id:"ST102",name:"Priya Verma",course:"B.Tech CSE"},
 {id:"ST103",name:"Rahul Singh",course:"B.Tech CSIT"},
 {id:"ST104",name:"Ananya Gupta",course:"B.Tech IT"}
];

const sampleIssues = [
 {id:1,bookId:"BK101",studentId:"ST101",date:"2026-11-10",returned:false},
 {id:2,bookId:"BK103",studentId:"ST102",date:"2026-11-11",returned:false}
];

function loadData(key,defaults) {
  try {
    const saved=localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaults;
  } catch(error) {
    return defaults;
  }
}

let books=loadData("booknest_books",sampleBooks);
let members=loadData("booknest_members",sampleMembers);
let issues=loadData("booknest_issues",sampleIssues);

function saveData() {
  localStorage.setItem("booknest_books",JSON.stringify(books));
  localStorage.setItem("booknest_members",JSON.stringify(members));
  localStorage.setItem("booknest_issues",JSON.stringify(issues));
}

function notify(message) {
  const toast=document.getElementById("toast");
  toast.textContent=message;
  toast.style.display="block";
  setTimeout(()=>toast.style.display="none",2600);
}

function today() {
  return new Date().toISOString().slice(0,10);
}

document.getElementById("today").textContent =
  new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"});

document.getElementById("issueDate").value=today();
document.getElementById("returnDate").value=today();

function toggleMenu() {
  document.getElementById("sidebar").classList.toggle("open");
}

function navigate(page) {
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById(page).classList.add("active");

  document.querySelectorAll(".nav-link").forEach(b=> {
    b.classList.toggle("active",b.dataset.page===page);
  });

  document.getElementById("sidebar").classList.remove("open");
  refresh();
  window.scrollTo(0,0);
}

document.querySelectorAll(".nav-link").forEach(button=>{
  button.addEventListener("click",()=>navigate(button.dataset.page));
});

function getBook(id) {
  return books.find(b=>b.id===id);
}

function getMember(id) {
  return members.find(m=>m.id===id);
}

function activeIssues() {
  return issues.filter(i=>!i.returned);
}

function refresh() {
  saveData();
  renderDashboard();
  renderBooks();
  renderMembers();
  renderOptions();
  renderIssues();
}

function renderDashboard() {
  const total=books.reduce((sum,b)=>sum+b.total,0);
  const available=books.reduce((sum,b)=>sum+b.available,0);
  const issued=total-available;

  document.getElementById("totalBooks").textContent=total;
  document.getElementById("availableBooks").textContent=available;
  document.getElementById("issuedBooks").textContent=issued;
  document.getElementById("totalMembers").textContent=members.length;

  document.getElementById("availabilityText").textContent=
    total ? Math.round(available/total*100)+"% available" : "0% available";

  document.getElementById("availabilityBar").style.width=
    (total ? available/total*100 : 0)+"%";

  const recent=activeIssues().slice().reverse().slice(0,5);

  document.getElementById("recentIssues").innerHTML=recent.length
    ? recent.map(i=>{
      const b=getBook(i.bookId),m=getMember(i.studentId);
      return `<tr>
        <td>${b?.title||"Unknown"}</td>
        <td>${m?.name||"Unknown"}</td>
        <td>${i.date}</td>
        <td><span class="status issued">Issued</span></td>
      </tr>`;
    }).join("")
    : `<tr><td colspan="4" class="empty">No recent issues.</td></tr>`;
}

function renderBooks() {
  const search=(document.getElementById("bookSearch")?.value||"").toLowerCase();
  const category=document.getElementById("categoryFilter")?.value||"";

  const filtered=books.filter(b=>
    (b.title+" "+b.author+" "+b.id).toLowerCase().includes(search) &&
    (!category||b.category===category)
  );

  document.getElementById("bookGrid").innerHTML=filtered.length
    ? filtered.map(b=>`
      <div class="book-card">
        <div class="book-cover">📖</div>
        <h3>${escapeHTML(b.title)}</h3>
        <p>By ${escapeHTML(b.author)}</p>
        <p>Book ID: ${escapeHTML(b.id)}</p>
        <p>Category: ${escapeHTML(b.category)}</p>
        <p>Copies: ${b.available} available / ${b.total} total</p>
        <span class="status ${b.available>0?"available":"issued"}">
          ${b.available>0?"Available":"Out of Stock"}
        </span>
      </div>
    `).join("")
    : `<div class="empty">No books found.</div>`;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g,char=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[char]);
}

function renderMembers() {
  document.getElementById("memberTable").innerHTML=members.length
    ? members.map(m=>{
      const count=activeIssues().filter(i=>i.studentId===m.id).length;
      return `<tr>
        <td>${escapeHTML(m.id)}</td>
        <td>${escapeHTML(m.name)}</td>
        <td>${escapeHTML(m.course)}</td>
        <td>${count}</td>
      </tr>`;
    }).join("")
    : `<tr><td colspan="4" class="empty">No members registered.</td></tr>`;
}

function renderOptions() {
  const student=document.getElementById("issueStudent");
  const book=document.getElementById("issueBook");
  const returned=document.getElementById("returnIssue");

  student.innerHTML='<option value="">Select student</option>'+
    members.map(m=>`<option value="${escapeHTML(m.id)}">${escapeHTML(m.id)} - ${escapeHTML(m.name)}</option>`).join("");

  book.innerHTML='<option value="">Select book</option>'+
    books.filter(b=>b.available>0).map(b=>
      `<option value="${escapeHTML(b.id)}">${escapeHTML(b.title)} (${b.available} available)</option>`
    ).join("");

  const active=activeIssues();
  returned.innerHTML='<option value="">Select issued book</option>'+
    active.map(i=>{
      const b=getBook(i.bookId),m=getMember(i.studentId);
      return `<option value="${i.id}">${escapeHTML(b?.title||"Unknown")} - ${escapeHTML(m?.name||"Unknown")}</option>`;
    }).join("");
}

function renderIssues() {
  const active=activeIssues();
  document.getElementById("activeIssues").innerHTML=active.length
    ? active.map(i=>{
      const b=getBook(i.bookId),m=getMember(i.studentId);
      return `<tr>
        <td>${escapeHTML(b?.title||"Unknown")}</td>
        <td>${escapeHTML(m?.name||"Unknown")}</td>
        <td>${i.date}</td>
        <td><span class="status issued">Issued</span></td>
      </tr>`;
    }).join("")
    : `<tr><td colspan="4" class="empty">No active issued books.</td></tr>`;
}

// ADD BOOK
document.getElementById("addForm").addEventListener("submit",e=>{
  e.preventDefault();

  const id=document.getElementById("bookId").value.trim().toUpperCase();
  const title=document.getElementById("bookTitle").value.trim();
  const author=document.getElementById("bookAuthor").value.trim();
  const category=document.getElementById("bookCategory").value;
  const quantity=Number(document.getElementById("bookQuantity").value);

  if(books.some(b=>b.id.toLowerCase()===id.toLowerCase())) {
    notify("This Book ID already exists.");
    return;
  }

  if(quantity<1 || !Number.isInteger(quantity)) {
    notify("Enter a valid number of copies.");
    return;
  }

  books.push({id,title,author,category,total:quantity,available:quantity});
  e.target.reset();
  document.getElementById("bookQuantity").value=1;
  refresh();
  notify("Book added successfully!");
});

// ISSUE BOOK
document.getElementById("issueForm").addEventListener("submit",e=>{
  e.preventDefault();

  const studentId=document.getElementById("issueStudent").value;
  const bookId=document.getElementById("issueBook").value;
  const date=document.getElementById("issueDate").value;
  const book=getBook(bookId);

  if(!studentId||!bookId||!date) {
    notify("Please complete all fields.");
    return;
  }

  if(!book||book.available<1) {
    notify("No copies are available.");
    return;
  }

  book.available--;
  issues.push({
    id:Date.now(),
    bookId,
    studentId,
    date,
    returned:false
  });

  e.target.reset();
  document.getElementById("issueDate").value=today();
  refresh();
  notify("Book issued successfully!");
});

// RETURN BOOK
document.getElementById("returnForm").addEventListener("submit",e=>{
  e.preventDefault();

  const issueId=Number(document.getElementById("returnIssue").value);
  const issue=issues.find(i=>i.id===issueId&&!i.returned);
  const date=document.getElementById("returnDate").value;

  if(!issue||!date) {
    notify("Please select an active issued book.");
    return;
  }

  issue.returned=true;
  issue.returnDate=date;

  const book=getBook(issue.bookId);
  if(book) book.available++;

  e.target.reset();
  document.getElementById("returnDate").value=today();
  refresh();
  notify("Book returned successfully!");
});

refresh();
