const solveBtn = document.getElementById("solveBtn");
const solutionList= document.getElementById("solution");
const errorMsg=document.getElementById("error-msg");
const faces = ["Front", "Back", "Left", "Right", "Up", "Down"];

faces.forEach(face => {
  const input = document.getElementById(face);
  const status = document.getElementById(`${face}-status`);

  input.addEventListener("change", () => {
    if (input.files.length > 0) {
      status.textContent = "✔ Uploaded";
      status.classList.add("uploaded");
    }
    else{
        status.textContent="";
        status.classList.remove("uploaded");
    }
    const statuses = document.querySelectorAll(".status");
    let allUploaded = true;
  
    statuses.forEach(status => {
      if (!status.classList.contains("uploaded")) {
        allUploaded = false;
      }
    });
    if(allUploaded){errorMsg.textContent="";}
  });
});



solveBtn.addEventListener("click",async()=>{
    const statuses = document.querySelectorAll(".status");
    let allUploaded = true;
  
    statuses.forEach(status => {
      if (!status.classList.contains("uploaded")) {
        allUploaded = false;
      }
    });
  
    if (!allUploaded) {
      errorMsg.textContent = "Please upload all 6 cube faces before solving.";
      return;
    }
    
     errorMsg.textContent = "";

    const formData = new FormData();
    faces.forEach(face => {
        const fileInput = document.getElementById(face);
        const file = fileInput.files[0];
      
        formData.append(face, file);
      });
      
      const response = await fetch("http://localhost:5001/api/solve", {
        method: "POST",
        body: formData
      });

    const data=await response.json();
    if(data.error){errorMsg.textContent=data.error; return;}
    solutionList.innerHTML="";
    data.solution.forEach(step => {
        const li=document.createElement("li");
        li.textContent=step;
        solutionList.appendChild(li);
    });
});