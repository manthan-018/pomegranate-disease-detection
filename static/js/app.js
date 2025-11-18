const canvas = document.getElementById("orbital-bg");
const ctx = canvas ? canvas.getContext("2d") : null;
const particles = canvas ? Array.from({ length: 80 }, () => createParticle()) : [];

function createParticle() {
  return {
    angle: Math.random() * Math.PI * 2,
    radius: 120 + Math.random() * 320,
    speed: 0.0008 + Math.random() * 0.0015,
    size: Math.random() * 2 + 0.5,
  };
}

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

if (canvas) {
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
}

function draw() {
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(canvas.width / 2, canvas.height / 2);
  particles.forEach((p) => {
    p.angle += p.speed;
    ctx.beginPath();
    // Use green colors for farmer theme
    ctx.fillStyle = "rgba(76,175,80,0.25)";
    ctx.arc(
      Math.cos(p.angle) * p.radius,
      Math.sin(p.angle) * p.radius,
      p.size,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  requestAnimationFrame(draw);
}

if (canvas && ctx) {
  draw();
}

const form = document.getElementById("upload-form");
const input = document.getElementById("image-input");
const dropzone = document.getElementById("dropzone");
const preview = document.getElementById("preview");
const predictionEl = document.getElementById("prediction");
const confidenceEl = document.getElementById("confidence");
const statusEl = document.getElementById("status-text");
const scoreList = document.getElementById("score-list");
const logoutForm = document.getElementById("logout-form");
const diseaseInfo = document.getElementById("disease-info");
const diseaseInfoContent = document.getElementById("disease-info-content");

function setStatus(text, state = "idle") {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.dataset.state = state;
}

function handleFiles(file) {
  if (!file || !preview || !dropzone) return;
  const reader = new FileReader();
  reader.onload = () => {
    preview.src = reader.result;
    preview.hidden = false;
    dropzone.classList.add("has-preview");
  };
  reader.readAsDataURL(file);
}

if (dropzone && input) {
  dropzone.addEventListener("click", () => input.click());
  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    input.files = e.dataTransfer.files;
    handleFiles(file);
  });
}

if (input) {
  input.addEventListener("change", () => handleFiles(input.files[0]));
}

function renderScores(scores = []) {
  if (!scoreList) return;
  scoreList.innerHTML = "";
  scores.forEach(({ label, confidence }) => {
    const li = document.createElement("li");
    li.className = "score-item";
    li.innerHTML = `
      <span>
        <strong>${label}</strong>
        <span>${(confidence * 100).toFixed(1)}%</span>
      </span>
      <div class="bar">
        <div class="bar-fill" style="width:${confidence * 100}%"></div>
      </div>
    `;
    scoreList.appendChild(li);
  });
}

function getDiseaseInfo(diseaseName) {
  const info = {
    Alternaria: `
      <h4>Alternaria Rot in Pomegranate Fruit</h4>
      <p><strong>Alternaria rot</strong> is a fungal disease that affects pomegranate fruits, causing significant post-harvest losses. This disease is caused by various species of Alternaria fungi, most commonly Alternaria alternata.</p>
      
      <h4>Symptoms on Pomegranate Fruit</h4>
      <p>The disease typically manifests as dark brown to black circular or irregular spots on the fruit surface. These lesions start small but can expand rapidly, especially under humid conditions. The affected areas become sunken and may develop a velvety texture due to fungal growth.</p>
      
      <h4>Fruit Development Stage</h4>
      <p>Alternaria rot can occur at any stage of fruit development, but it's most problematic during storage and transportation. The disease often enters through wounds, cracks, or natural openings in the fruit's skin. Pomegranates with thin or damaged rinds are particularly susceptible.</p>
      
      <h4>Environmental Conditions</h4>
      <p>High humidity levels above 85% and temperatures between 20-30°C create ideal conditions for Alternaria infection. The fungus thrives in warm, moist environments and can spread quickly in storage facilities with poor ventilation.</p>
      
      <h4>Impact on Fruit Quality</h4>
      <p>Infected pomegranates show internal decay, with the arils (seed sacs) becoming discolored, soft, and developing an off-flavor. The disease can cause complete fruit rot, making the pomegranate unmarketable. In severe cases, the entire fruit becomes a soft, mushy mass.</p>
      
      <h4>Prevention and Management</h4>
      <ul>
        <li>Harvest fruits at optimal maturity to minimize skin damage</li>
        <li>Maintain proper storage conditions with temperature control (5-8°C) and low humidity</li>
        <li>Implement good sanitation practices in packing and storage areas</li>
        <li>Use fungicide treatments approved for post-harvest use</li>
        <li>Avoid mechanical injuries during harvesting and handling</li>
        <li>Sort and remove damaged fruits before storage</li>
      </ul>
      
      <h4>Economic Impact</h4>
      <p>Alternaria rot can cause significant economic losses, especially in commercial pomegranate production where fruits are stored for extended periods. Early detection and proper management are crucial to minimize losses and maintain fruit quality for market.</p>
    `,
    Anthracnose: `
      <h4>Anthracnose Disease in Pomegranate Fruit</h4>
      <p><strong>Anthracnose</strong> is a serious fungal disease affecting pomegranate fruits, caused primarily by Colletotrichum gloeosporioides. This disease can cause substantial damage to both developing and mature fruits.</p>
      
      <h4>Symptoms on Pomegranate Fruit</h4>
      <p>Anthracnose appears as small, circular, sunken spots that are initially light brown but darken to black as the disease progresses. These lesions often have a characteristic concentric ring pattern. The affected areas may crack, allowing secondary infections to develop.</p>
      
      <h4>Fruit Development and Infection</h4>
      <p>The disease can infect fruits at any stage, from young developing fruits to fully mature ones. Infection typically occurs through wounds, natural openings, or direct penetration of the fruit skin. The fungus can remain dormant until conditions become favorable for disease development.</p>
      
      <h4>Environmental Factors</h4>
      <p>Anthracnose thrives in warm, humid conditions with temperatures between 24-32°C and high relative humidity. Rainy weather and overhead irrigation can promote disease spread by splashing fungal spores onto fruits.</p>
      
      <h4>Fruit Quality Impact</h4>
      <p>Infected pomegranates develop internal rot, with the arils becoming discolored and developing a bitter taste. The disease can cause premature fruit drop and significant post-harvest losses. Severely affected fruits become completely unmarketable.</p>
      
      <h4>Disease Cycle</h4>
      <p>The fungus overwinters in infected plant debris and can survive on fallen fruits. During favorable conditions, spores are produced and spread by wind, water, or insects. The disease can spread rapidly in orchards with poor air circulation.</p>
      
      <h4>Management Strategies</h4>
      <ul>
        <li>Remove and destroy infected fruits and plant debris</li>
        <li>Apply preventive fungicides during fruit development</li>
        <li>Improve orchard ventilation through proper pruning</li>
        <li>Use drip irrigation instead of overhead watering</li>
        <li>Harvest fruits carefully to avoid mechanical damage</li>
        <li>Store fruits in cool, dry conditions with good air circulation</li>
      </ul>
      
      <h4>Resistance and Tolerance</h4>
      <p>Some pomegranate varieties show varying levels of resistance to anthracnose. Selecting resistant cultivars can be an effective long-term management strategy. However, even resistant varieties may require preventive measures under severe disease pressure.</p>
    `,
    Bacterial_Blight: `
      <h4>Bacterial Blight in Pomegranate Fruit</h4>
      <p><strong>Bacterial blight</strong> is a destructive disease caused by Xanthomonas axonopodis pv. punicae, specifically affecting pomegranate fruits. This disease can cause severe economic losses in pomegranate cultivation.</p>
      
      <h4>Symptoms on Pomegranate Fruit</h4>
      <p>The disease manifests as water-soaked, dark brown to black spots on the fruit surface. These lesions are typically angular and may have a greasy appearance. As the disease progresses, the spots enlarge and become sunken, often with a characteristic oily sheen.</p>
      
      <h4>Fruit Infection Process</h4>
      <p>Bacterial blight enters fruits through natural openings like stomata, lenticels, or wounds caused by insects, mechanical damage, or growth cracks. The bacteria multiply rapidly within the fruit tissues, causing extensive damage to both the rind and internal arils.</p>
      
      <h4>Environmental Conditions</h4>
      <p>Warm temperatures (25-35°C) combined with high humidity and frequent rainfall create ideal conditions for bacterial blight. The disease spreads rapidly during the monsoon season or in areas with high humidity and frequent irrigation.</p>
      
      <h4>Impact on Fruit Quality</h4>
      <p>Infected pomegranates show internal discoloration of arils, which become brown, soft, and develop an unpleasant taste. The disease can cause fruit cracking, premature fruit drop, and complete fruit rot. Affected fruits are unsuitable for fresh consumption or processing.</p>
      
      <h4>Disease Transmission</h4>
      <p>Bacteria are spread through water splashes, wind-driven rain, contaminated tools, and infected plant material. The pathogen can survive in infected plant debris and soil, making it difficult to eradicate once established in an orchard.</p>
      
      <h4>Prevention and Control</h4>
      <ul>
        <li>Use disease-free planting material from certified sources</li>
        <li>Implement strict sanitation practices in orchards</li>
        <li>Apply copper-based bactericides as preventive measures</li>
        <li>Avoid overhead irrigation that can spread bacteria</li>
        <li>Remove and destroy infected fruits immediately</li>
        <li>Practice crop rotation and avoid planting in previously infected areas</li>
        <li>Maintain proper spacing between plants for better air circulation</li>
      </ul>
      
      <h4>Economic Significance</h4>
      <p>Bacterial blight can cause yield losses of 30-80% in severe cases, making it one of the most economically significant diseases in pomegranate cultivation. Early detection and integrated management approaches are essential for effective control.</p>
    `,
    Cercospora: `
      <h4>Cercospora Fruit Spot in Pomegranate</h4>
      <p><strong>Cercospora fruit spot</strong> is a fungal disease caused by Cercospora punicae, which specifically targets pomegranate fruits. This disease can significantly affect fruit quality and marketability.</p>
      
      <h4>Symptoms on Pomegranate Fruit</h4>
      <p>The disease appears as small, circular to irregular brown or black spots on the fruit surface. These spots gradually enlarge and may coalesce, forming larger lesions. The center of older spots may become lighter in color, creating a characteristic "frog-eye" appearance.</p>
      
      <h4>Fruit Development Stage</h4>
      <p>Cercospora can infect fruits throughout their development, from young fruits to mature ones. The disease is more severe on fruits that are exposed to direct sunlight and those with thin rinds. Infection often starts near the calyx end or on areas with natural openings.</p>
      
      <h4>Environmental Conditions</h4>
      <p>The fungus thrives in warm, humid conditions with temperatures between 22-28°C and relative humidity above 70%. Extended periods of leaf wetness from dew, rain, or irrigation favor disease development and spread.</p>
      
      <h4>Fruit Quality Impact</h4>
      <p>Infected pomegranates develop blemishes that reduce their aesthetic appeal and market value. While the disease primarily affects the fruit surface, severe infections can lead to rind cracking, allowing secondary pathogens to enter. The internal arils may remain unaffected in mild cases but can become discolored in severe infections.</p>
      
      <h4>Disease Cycle and Spread</h4>
      <p>The fungus overwinters in infected plant debris and can survive on fallen fruits. Spores are produced in abundance during favorable conditions and are dispersed by wind, water splashes, and insects. The disease can spread rapidly in dense orchards with poor air circulation.</p>
      
      <h4>Management Practices</h4>
      <ul>
        <li>Remove and destroy infected fruits and fallen debris regularly</li>
        <li>Apply fungicides preventively during fruit development</li>
        <li>Improve air circulation through proper pruning and spacing</li>
        <li>Avoid overhead irrigation, especially during fruit development</li>
        <li>Use protective coverings or shade nets to reduce direct sun exposure</li>
        <li>Maintain orchard hygiene by removing weeds and plant debris</li>
      </ul>
      
      <h4>Post-Harvest Considerations</h4>
      <p>Fruits with Cercospora spots should be sorted and graded carefully. While mild spotting may not affect internal quality, heavily spotted fruits should be separated to prevent potential post-harvest issues. Proper storage conditions can help prevent further disease development.</p>
      
      <h4>Varietal Resistance</h4>
      <p>Some pomegranate varieties show natural resistance or tolerance to Cercospora infection. Selecting appropriate varieties for specific growing regions can be an important component of integrated disease management strategies.</p>
    `,
    Healthy: `
      <h4>Healthy Pomegranate Fruit Characteristics</h4>
      <p>A <strong>healthy pomegranate fruit</strong> exhibits several key characteristics that indicate optimal growth, development, and quality. Understanding these traits helps in maintaining fruit health and preventing disease.</p>
      
      <h4>External Appearance</h4>
      <p>Healthy pomegranates have a smooth, unblemished rind with a uniform color ranging from yellow-red to deep red, depending on the variety. The fruit should be firm to the touch with no soft spots, cracks, or discolorations. The calyx (crown) at the top should be intact and show no signs of decay or fungal growth.</p>
      
      <h4>Size and Shape</h4>
      <p>A healthy pomegranate typically has a round to slightly angular shape, characteristic of the variety. The fruit should feel heavy for its size, indicating good internal aril development and juice content. The size should be consistent with the variety's expected dimensions.</p>
      
      <h4>Internal Quality</h4>
      <p>When cut open, healthy pomegranates reveal plump, juicy arils (seed sacs) with vibrant colors ranging from white to deep red. The arils should be tightly packed, with no signs of discoloration, shriveling, or decay. The internal membranes should be intact and show no browning or fungal growth.</p>
      
      <h4>Nutritional Value</h4>
      <p>Healthy pomegranates are rich in antioxidants, vitamins (especially vitamin C and K), and minerals. They contain beneficial compounds like punicalagins and ellagic acid, which contribute to their health-promoting properties. The fruit's nutritional content is at its peak when harvested at optimal maturity.</p>
      
      <h4>Optimal Growing Conditions</h4>
      <p>Healthy fruits develop under optimal conditions including adequate sunlight, proper irrigation, balanced nutrition, and good air circulation. The plant should be free from stress factors such as waterlogging, drought, nutrient deficiencies, or pest damage that could compromise fruit quality.</p>
      
      <h4>Harvest Indicators</h4>
      <p>Signs of a ready-to-harvest healthy pomegranate include a deep, rich color, a metallic sound when tapped, and a slight flattening of the sides. The fruit should separate easily from the tree with a clean break at the stem. Harvesting at the right time ensures optimal flavor, sweetness, and storage potential.</p>
      
      <h4>Storage and Handling</h4>
      <p>Healthy pomegranates can be stored for extended periods (2-3 months) under proper conditions: temperatures of 5-10°C with relative humidity of 85-90%. The fruits should be handled carefully to avoid bruising or damage to the rind, which could provide entry points for pathogens.</p>
      
      <h4>Maintaining Fruit Health</h4>
      <ul>
        <li>Implement integrated pest and disease management practices</li>
        <li>Provide balanced nutrition through proper fertilization</li>
        <li>Maintain adequate irrigation without waterlogging</li>
        <li>Practice good orchard hygiene and sanitation</li>
        <li>Monitor for early signs of stress or disease</li>
        <li>Use appropriate cultural practices like pruning and thinning</li>
      </ul>
      
      <h4>Quality Standards</h4>
      <p>Market-quality healthy pomegranates should meet specific standards including minimum size requirements, absence of defects, proper color development, and good internal quality. Regular monitoring and quality assessment help ensure that fruits meet consumer expectations and market standards.</p>
    `
  };
  
  return info[diseaseName] || "";
}

function displayDiseaseInfo(diseaseName) {
  if (!diseaseInfo || !diseaseInfoContent) return;
  
  const info = getDiseaseInfo(diseaseName);
  if (info) {
    diseaseInfoContent.innerHTML = info;
    diseaseInfo.hidden = false;
    // Smooth scroll to disease info
    setTimeout(() => {
      diseaseInfo.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  } else {
    diseaseInfo.hidden = true;
  }
}

async function submitForm(event) {
  event.preventDefault();
  if (!input?.files?.length) {
    alert("Please select an image first.");
    return;
  }

  setStatus("Analyzing sample...", "busy");
  predictionEl.textContent = "Processing…";
  confidenceEl.textContent = "Confidence —";
  renderScores();
  if (diseaseInfo) diseaseInfo.hidden = true;

  const button = form.querySelector("button");
  button.disabled = true;

  const formData = new FormData();
  formData.append("image", input.files[0]);

  try {
    const response = await fetch("/predict", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Prediction failed");

    predictionEl.textContent = data.label;
    confidenceEl.textContent = `Confidence ${(data.confidence * 100).toFixed(2)}%`;
    setStatus("Scan complete");
    renderScores(data.scores);
    displayDiseaseInfo(data.label);
  } catch (error) {
    predictionEl.textContent = "Error";
    confidenceEl.textContent = error.message;
    setStatus("Something went wrong", "error");
  } finally {
    button.disabled = false;
  }
}

if (form) {
  form.addEventListener("submit", submitForm);
}

if (logoutForm) {
  logoutForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await fetch("/logout", {
        method: "POST",
        headers: { Accept: "application/json" },
      });
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      window.location.href = "/login";
    }
  });
}

