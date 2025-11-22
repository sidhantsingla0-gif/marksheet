/* FINAL SMART RESULT GENERATOR JS
   ✔ SGPA
   ✔ CGPA
   ✔ Dynamic Subjects
   ✔ Real QR (Full Result)
   ✔ PDF Download
   ✔ Print
   ✔ Theme Toggle
*/

// ---------- GRADE POINTS ----------
const GRADE_POINTS = { "A+":10,"A":9,"B+":8,"B":7,"C":6,"D":5,"F":0 };

// ------- DOM ELEMENTS -------
const subjectsEl = document.getElementById('subjects');
const prevSgpasEl = document.getElementById('prevSgpas');
const resultCard = document.getElementById('resultCard');
const resultBody = document.getElementById('resultBody');

const qrCanvas = document.getElementById('qrCanvas');
const generateBtn = document.getElementById('generate');
const pdfBtn = document.getElementById('pdfBtn');
const printBtn = document.getElementById('printBtn');


// --------- CREATE SUBJECT ROW ----------
function createSubjectRow() {
    const row = document.createElement("div");
    row.className = "subject-row";

    row.innerHTML = `
        <input class="sub-code" placeholder="CSE101">
        <input class="sub-name" placeholder="Subject Name">
        <input class="sub-credit" type="number" value="4">
        <select class="sub-grade">
            <option>A+</option><option>A</option><option>B+</option>
            <option>B</option><option>C</option><option>D</option><option>F</option>
        </select>
        <button type="button" class="remove">✕</button>
    `;

    row.querySelector(".remove").onclick = () => row.remove();
    return row;
}

// -------- Default 3 Subjects --------
subjectsEl.appendChild(createSubjectRow());
subjectsEl.appendChild(createSubjectRow());
subjectsEl.appendChild(createSubjectRow());

// --------- ADD NEW SUBJECT ----------
document.getElementById("addSubject").addEventListener("click", () => {
    subjectsEl.appendChild(createSubjectRow());
});

// --------- ADD PREVIOUS SGPA ----------
document.getElementById("addPrev").addEventListener("click", () => {
    const row = document.createElement("div");
    row.className = "prev-row";
    row.innerHTML = `
        <input type="number" step="0.01" placeholder="SGPA">
        <button type="button" class="remove">✕</button>
    `;
    row.querySelector(".remove").onclick = () => row.remove();
    prevSgpasEl.appendChild(row);
});

// ---------- CALCULATE CGPA ----------
function calculateCGPA(currentSGPA) {
    const prev = [...document.querySelectorAll(".prev-row input")]
        .map(i => Number(i.value))
        .filter(v => v > 0);

    if (prev.length === 0) return currentSGPA;

    const avg = (prev.reduce((a, b) => a + b, 0) + currentSGPA) / (prev.length + 1);
    return avg.toFixed(2);
}

// ---------- GENERATE RESULT ----------
generateBtn.addEventListener("click", () => {
    let name = document.getElementById("stuName").value.trim() || "-";
    let roll = document.getElementById("rollNo").value.trim() || "-";
    let program = document.getElementById("program").value.trim() || "-";
    let semester = document.getElementById("semester").value;

    let rows = document.querySelectorAll(".subject-row");
    if (rows.length === 0) return alert("Add at least 1 subject!");

    let totalCredits = 0, weighted = 0;
    let qrText = "";

    resultBody.innerHTML = "";

    rows.forEach(r => {
        let code = r.querySelector(".sub-code").value || "-";
        let sname = r.querySelector(".sub-name").value || "-";
        let credit = Number(r.querySelector(".sub-credit").value) || 0;
        let grade = r.querySelector(".sub-grade").value;
        let gp = GRADE_POINTS[grade];

        totalCredits += credit;
        weighted += credit * gp;

        // Add in table
        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${code}</td>
            <td>${sname}</td>
            <td>${credit}</td>
            <td>${grade}</td>
            <td>${gp}</td>
        `;
        resultBody.appendChild(tr);

        // Add in QR
        qrText += `${code} | ${sname} | Cr:${credit} | Grade:${grade}\n`;
    });

    if (totalCredits === 0) return alert("Credits cannot be zero!");

    let SGPA = (weighted / totalCredits).toFixed(2);
    let CGPA = calculateCGPA(Number(SGPA));

    // Put in card
    document.getElementById("outName").innerText = name;
    document.getElementById("outRoll").innerText = roll;
    document.getElementById("outProgram").innerText = program;
    document.getElementById("outSemester").innerText = semester;
    document.getElementById("totalCredits").innerText = totalCredits;
    document.getElementById("sgpaOut").innerText = SGPA;
    document.getElementById("cgpaOut").innerText = CGPA;
    document.getElementById("genTime").innerText = new Date().toLocaleString();

    // FINAL QR CONTENT
    let finalQR = 
`----- RESULT -----
Name: ${name}
Roll No: ${roll}
Program: ${program}
Semester: ${semester}

--- Subjects ---
${qrText}
-----------------
TOTAL CREDITS: ${totalCredits}
SGPA: ${SGPA}
CGPA: ${CGPA}
Generated: ${new Date().toLocaleString()}
-----------------`;

    // Generate QR (REAL)
    new QRious({
        element: qrCanvas,
        value: finalQR,
        size: 180
    });

    resultCard.classList.remove("hidden");
    resultCard.scrollIntoView({ behavior: "smooth" });
});

// ---------- PRINT ----------
printBtn.addEventListener("click", () => window.print());

// ---------- PDF ----------
pdfBtn.addEventListener("click", async () => {
    if (!window.html2canvas || !window.jspdf) {
        alert("PDF library missing!");
        return;
    }

    const { jsPDF } = window.jspdf;
    const card = document.getElementById("resultCard");

    const canvas = await html2canvas(card, { scale: 2 });
    const img = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth() - 20;
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(img, "PNG", 10, 10, width, height);
    pdf.save("Result.pdf");
});
