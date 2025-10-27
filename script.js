// API Configuration
const API_KEY = "AIzaSyC7D_n5PQ41TmyAtf3KAt1fKk3-CBYACHU";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

// DOM Elements
let fileInput, uploadArea, previewCard, progressContainer, progressBar, resultsSection, validationResult, status, volumeSlider, themeToggle;
let modalPreview, modalImage, modalFileName;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get DOM elements
  fileInput = document.getElementById('fileInput');
  uploadArea = document.getElementById('uploadArea');
  previewCard = document.getElementById('previewCard');
  progressContainer = document.getElementById('progressContainer');
  progressBar = document.getElementById('progressBar');
  resultsSection = document.getElementById('resultsSection');
  validationResult = document.getElementById('validationResult');
  status = document.getElementById('status');
  volumeSlider = document.getElementById('volumeSlider');
  themeToggle = document.getElementById('themeToggle');
  modalPreview = document.getElementById('modalPreview');
  modalImage = document.getElementById('modalImage');
  modalFileName = document.getElementById('modalFileName');
  
  // Initialize
  checkAPIStatus();
  setupEventListeners();
  loadThemePreference();
});

// API Status Check
async function checkAPIStatus() {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: "ping" }] }] })
    });
    
    if (res.ok) {
      status.innerHTML = "🟢 System Status: Online & Ready";
      status.style.color = "var(--success)";
    } else {
      status.innerHTML = "🔴 System Status: Offline";
      status.style.color = "var(--danger)";
    }
  } catch {
    status.innerHTML = "🔴 System Status: Connection Error";
    status.style.color = "var(--danger)";
  }
}

// Event Listeners
function setupEventListeners() {
  // Upload area click
  uploadArea.addEventListener('click', () => {
    fileInput.click();
  });
  
  // File input change
  fileInput.addEventListener('change', handleFileSelect);
  
  // Drag and drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--accent)';
    uploadArea.style.background = 'rgba(37, 99, 235, 0.1)';
  });
  
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = 'var(--primary)';
    uploadArea.style.background = 'rgba(37, 99, 235, 0.05)';
  });
  
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--primary)';
    uploadArea.style.background = 'rgba(37, 99, 235, 0.05)';
    
    if (e.dataTransfer.files.length) {
      fileInput.files = e.dataTransfer.files;
      handleFileSelect();
    }
  });
  
  // Preview card flip
  previewCard.addEventListener('click', () => {
    previewCard.classList.toggle('flipped');
  });
  
  // Volume control
  volumeSlider.addEventListener('input', (e) => {
    const volume = parseFloat(e.target.value);
    console.log("Volume set to:", volume);
  });
  
  // Theme toggle
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  // Close modal when clicking outside of it
  window.addEventListener('click', (event) => {
    if (event.target === modalPreview) {
      closeModal();
    }
  });
  
  // Close modal with Escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modalPreview.style.display === 'block') {
      closeModal();
    }
  });
}

// Theme functions
function loadThemePreference() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  if (themeToggle) {
    const icon = themeToggle.querySelector('i');
    if (icon) {
      icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }
}

// File selection handler
function handleFileSelect() {
  if (!fileInput.files[0]) return;
  
  const file = fileInput.files[0];
  
  // Show preview
  showPreview(file);
  
  // Enable validate button
  const validateBtn = document.querySelector('.btn-primary');
  if (validateBtn) {
    validateBtn.disabled = false;
  }
  
  // Show notification
  showNotification("File uploaded successfully", "success");
  
  // Automatically flip the preview card to show the uploaded file
  setTimeout(() => {
    if (previewCard) {
      previewCard.classList.add("flipped");
      
      // Ensure the complete image is visible
      document.querySelector('.preview-section').scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, 1000);
}

// Show file preview
function showPreview(file) {
  const fileURL = URL.createObjectURL(file);
  const previewFront = document.querySelector('.preview-card-front');
  
  if (!previewFront) return;
  
  if (file.type.startsWith("image/")) {
    previewFront.innerHTML = `<img src="${fileURL}" class="preview-img" alt="Preview" />`;
  } else if (file.type === "application/pdf") {
    previewFront.innerHTML = `
      <div class="preview-placeholder">
        <i class="fas fa-file-pdf"></i>
      </div>
      <p>PDF Document</p>
      <p class="file-size">${formatFileSize(file.size)}</p>
    `;
  } else if (file.type.includes("word") || file.name.endsWith(".docx")) {
    previewFront.innerHTML = `
      <div class="preview-placeholder">
        <i class="fas fa-file-word"></i>
      </div>
      <p>Word Document</p>
      <p class="file-size">${formatFileSize(file.size)}</p>
    `;
  } else if (file.type === "text/plain") {
    previewFront.innerHTML = `
      <div class="preview-placeholder">
        <i class="fas fa-file-alt"></i>
      </div>
      <p>Text Document</p>
      <p class="file-size">${formatFileSize(file.size)}</p>
    `;
  } else {
    previewFront.innerHTML = `
      <div class="preview-placeholder">
        <i class="fas fa-file"></i>
      </div>
      <p>Document</p>
      <p class="file-size">${formatFileSize(file.size)}</p>
    `;
  }
}

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Process file with Gemini API
async function processFile() {
  if (!fileInput.files[0]) {
    showNotification("Please upload a file first", "warning");
    return;
  }
  
  const file = fileInput.files[0];
  
  // Show progress
  if (progressContainer) {
    progressContainer.style.display = "block";
    progressBar.style.width = "30%";
  }
  
  // Disable buttons during processing
  const validateBtn = document.querySelector('.btn-primary');
  const clearBtn = document.querySelector('.btn-secondary');
  if (validateBtn) validateBtn.disabled = true;
  if (clearBtn) clearBtn.disabled = true;
  
  try {
    // Convert file to base64
    const base64Data = await toBase64(file);
    if (progressBar) progressBar.style.width = "60%";
    
    // Send to Gemini API with EXTREMELY STRICT validation
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: file.type,
                  data: base64Data.split(",")[1],
                },
              },
              {
                text: `
CRITICAL: You are an AI Validator Bot that ONLY accepts AUTOMOBILE EXPENSES. REJECT EVERYTHING ELSE.

ONLY VALID IF IT'S CLEARLY AND SPECIFICALLY AN AUTOMOBILE EXPENSE:

STRICTLY VALID AUTOMOBILE EXPENSE CATEGORIES:
- Car maintenance / servicing (oil changes, engine tuning, brake checks)
- Vehicle insurance payments
- Car repairs (engine, transmission, body work)
- Tyre replacement / rotation
- Car battery replacement
- Fuel purchases (petrol, diesel, CNG)
- Engine oil, lubricants, fluids
- Car washing, detailing, waxing
- Parking fees for vehicles
- Highway toll charges
- Car accessories (seat covers, GPS, dash cams)
- Vehicle registration fees, road tax
- Car loan / EMI payments
- Emission tests, pollution certificates

AUTOMATIC REJECTION - THESE ARE NEVER VALID:
- Grocery bills, food receipts, restaurant bills
- Medical bills, pharmacy receipts, healthcare
- Rent receipts, utility bills (electricity, water, gas)
- Clothing, fashion, shopping receipts
- Electronics, gadgets, appliances
- Home maintenance, furniture, repairs
- Education fees, books, stationery
- Movie tickets, entertainment, events
- Flight tickets, train tickets, bus tickets
- Hotel bookings, travel expenses
- Phone bills, internet bills
- Personal care, cosmetics, salon
- Gifts, donations, charity
- Sports equipment, hobbies
- Pet expenses, veterinary bills
- Office supplies, business expenses
- Insurance (other than vehicle insurance)
- Any ticket (movie, concert, flight, train, bus, event)
- Any non-automobile document

RESPONSE FORMAT:
If the document is 100% clearly an AUTOMOBILE expense, respond with:
VALID: [Specific Category]
REASON: [Brief explanation confirming it's automobile-related]
DETAILS: [Extracted relevant information]

If the document is NOT an automobile expense, respond with:
INVALID: [Detected actual category]
REASON: [Clear explanation why it's not automobile-related]
DETAILS: [Extracted relevant information]

BE EXTREMELY STRICT - REJECT ANYTHING THAT IS NOT PURELY AUTOMOBILE-RELATED.
Look for specific automobile keywords: car, vehicle, auto, motor, fuel, insurance, maintenance, repair, service, tire, battery, etc.
If you see keywords like: food, medical, rent, ticket, flight, movie, shopping, grocery - AUTOMATIC REJECTION.
`
              }
            ]
          }
        ]
      })
    });
    
    if (progressBar) progressBar.style.width = "90%";
    
    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No response from API";
    
    if (progressBar) progressBar.style.width = "100%";
    
    // Process the response
    processValidationResult(reply);
    
  } catch (error) {
    showNotification("Error processing document", "error");
    if (progressContainer) progressContainer.style.display = "none";
  } finally {
    // Re-enable buttons
    if (validateBtn) validateBtn.disabled = false;
    if (clearBtn) clearBtn.disabled = false;
  }
}

// Process validation result from API
function processValidationResult(reply) {
  // Hide progress bar
  setTimeout(() => {
    if (progressContainer) {
      progressContainer.style.display = "none";
      if (progressBar) progressBar.style.width = "0%";
    }
  }, 1000);
  
  // Show results section
  if (resultsSection) {
    resultsSection.style.display = "block";
  }
  
  let resultHTML = "";
  
  if (reply.includes("VALID:")) {
    const category = reply.split("VALID:")[1].split("\n")[0].trim();
    const reason = reply.split("REASON:")[1]?.split("\n")[0]?.trim() || "Document is a valid automobile expense";
    const details = reply.split("DETAILS:")[1]?.trim() || "No additional details extracted";
    
    resultHTML = `
      <div class="validation-result validation-valid" id="validationResultElement">
        <div class="result-icon"><i class="fas fa-check-circle"></i></div>
        <div class="result-title">Valid Automobile Expense</div>
        <div class="result-category">Category: ${category}</div>
        <div class="result-reason">${reason}</div>
        <div class="result-details">
          <div class="details-title">Extracted Details</div>
          <div>${formatDetails(details)}</div>
        </div>
      </div>
    `;
    
    // Play success horror sound and animation
    playSuccessHorrorSound();
    showNotification("Valid automobile expense detected!", "success");
    
  } else if (reply.includes("INVALID:")) {
    const category = reply.split("INVALID:")[1].split("\n")[0].trim();
    const reason = reply.split("REASON:")[1]?.split("\n")[0]?.trim() || "Document is not an automobile expense";
    const details = reply.split("DETAILS:")[1]?.trim() || "No additional details extracted";
    
    resultHTML = `
      <div class="validation-result validation-invalid" id="validationResultElement">
        <div class="result-icon"><i class="fas fa-times-circle"></i></div>
        <div class="result-title">Not a Valid Automobile Expense</div>
        <div class="result-category">Detected: ${category || "Non-Automobile Document"}</div>
        <div class="result-reason">${reason}</div>
        <div class="result-details">
          <div class="details-title">Extracted Details</div>
          <div>${formatDetails(details)}</div>
        </div>
      </div>
    `;
    
    // Play horror danger sound and animation
    playHorrorDangerSound();
    showNotification("Not a valid automobile expense", "error");
    
  } else {
    // Default to INVALID for any unclear response
    resultHTML = `
      <div class="validation-result validation-invalid" id="validationResultElement">
        <div class="result-icon"><i class="fas fa-times-circle"></i></div>
        <div class="result-title">Not a Valid Automobile Expense</div>
        <div class="result-reason">Unable to confirm this as an automobile expense. Only automobile bills are accepted.</div>
        <div class="result-details">
          <div class="details-title">System Response</div>
          <div>${reply}</div>
        </div>
      </div>
    `;
    
    playHorrorDangerSound();
    showNotification("Not a valid automobile expense", "error");
  }
  
  if (validationResult) {
    validationResult.innerHTML = resultHTML;
  }
  
  // Scroll to results
  if (resultsSection) {
    resultsSection.scrollIntoView({ behavior: 'smooth' });
  }
}

// Play success horror sound
function playSuccessHorrorSound() {
  const volume = parseFloat(volumeSlider.value);
  
  // Create audio context
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Success horror sound - ghostly whisper with chime
  oscillator.type = 'sine';
  
  // Create a ghostly whisper effect
  oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.5);
  oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 1);
  
  gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(volume, audioContext.currentTime + 0.3);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 1.5);
  
  console.log("Playing SUCCESS horror sound at volume:", volume);
  
  // Add visual alarm effect
  const resultElement = document.getElementById('validationResultElement');
  if (resultElement) {
    resultElement.classList.add('alarm-active');
    setTimeout(() => {
      resultElement.classList.remove('alarm-active');
    }, 3000);
  }
}

// Play horror danger sound
function playHorrorDangerSound() {
  const volume = parseFloat(volumeSlider.value);
  
  // Create audio context
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Horror danger sound - intense scream-like sound
  oscillator.type = 'sawtooth';
  
  // Create a horror movie scream effect
  oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.2);
  oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.4);
  oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.6);
  
  gainNode.gain.setValueAtTime(volume * 0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(volume, audioContext.currentTime + 0.1);
  gainNode.gain.setValueAtTime(volume * 0.8, audioContext.currentTime + 0.3);
  gainNode.gain.exponentialRampToValueAtTime(volume, audioContext.currentTime + 0.5);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 1);
  
  console.log("Playing HORROR DANGER sound at volume:", volume);
  
  // Add visual horror effect
  const resultElement = document.getElementById('validationResultElement');
  if (resultElement) {
    resultElement.classList.add('danger-active');
    setTimeout(() => {
      resultElement.classList.remove('danger-active');
    }, 3000);
  }
}

// Format details text
function formatDetails(details) {
  // Split by lines and create list items
  const lines = details.split('\n').filter(line => line.trim() !== '');
  if (lines.length === 0) return "No specific details extracted.";
  
  return lines.map(line => {
    if (line.includes(':')) {
      const [label, value] = line.split(':');
      return `<div class="detail-item"><span class="detail-label">${label.trim()}:</span> <span class="detail-value">${value.trim()}</span></div>`;
    }
    return `<div>${line}</div>`;
  }).join('');
}

// Clear all inputs and results
function clearAll() {
  fileInput.value = "";
  previewCard.classList.remove("flipped");
  document.querySelector('.preview-card-front').innerHTML = `
    <div class="preview-placeholder">
      <i class="fas fa-file-invoice"></i>
    </div>
    <p>Upload a file to preview</p>
  `;
  progressContainer.style.display = "none";
  progressBar.style.width = "0%";
  resultsSection.style.display = "none";
  validationResult.innerHTML = "";
  document.querySelector('.btn-primary').disabled = true;
  
  showNotification("All inputs cleared", "success");
}

// Preview bill function
function previewBill() {
  if (!fileInput.files[0]) {
    showNotification("Please upload a file first", "warning");
    return;
  }
  
  const file = fileInput.files[0];
  
  // Show modal preview for image files
  if (file.type.startsWith("image/")) {
    const fileURL = URL.createObjectURL(file);
    modalImage.src = fileURL;
    modalFileName.textContent = file.name;
    modalPreview.style.display = "block";
    
    // Prevent body scrolling when modal is open
    document.body.style.overflow = "hidden";
  } else {
    // For non-image files, flip the preview card
    if (previewCard) {
      previewCard.classList.add("flipped");
      
      // Ensure the complete preview is visible
      document.querySelector('.preview-section').scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }
  }
  
  showNotification("Bill preview ready", "success");
}

// Close modal function
function closeModal() {
  modalPreview.style.display = "none";
  document.body.style.overflow = "auto";
}

// Convert file to base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

// Show notification
function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}