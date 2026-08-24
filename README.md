# 🧩 Rubik's Cube Solver

A full-stack web application that solves a scrambled Rubik's Cube using images of all six faces. 

The application takes images of the Front, Back, Left, Right, Up, and Down faces of a physical Rubik's Cube, processes the images to identify the sticker colors, reconstructs the complete 54-sticker cube state, validates the configuration, and generates a step-by-step solution that can be followed on the physical cube.

## 🚀 Features
- 📸 **Upload images** of all six cube faces
- 🔍 **Detect the cube region** from each image
- 🧩 **Divide each face** into a 3 × 3 sticker grid
- 🎨 **Extract and classify sticker colors** using RGB/HSV-based image processing
- 🧠 **Reconstruct the complete 54-sticker cube state**
- ✅ **Validate the cube configuration** before solving
- 🧮 **Generate a solution** using a Rubik's Cube solving algorithm
- 📋 **Convert cube notation** into simple human-readable instructions
- 🌐 **Full-stack architecture** with HTML/CSS/JS frontend and Node.js backend

## 🏗️ How It Works

The application follows the pipeline below:

```text
Six Cube Images
      │
      ▼
Image Preprocessing
      │
      ▼
Cube Region Detection
      │
      ▼
3 × 3 Grid Detection
      │
      ▼
Sticker Color Sampling
      │
      ▼
RGB / HSV Color Classification
      │
      ▼
54-Sticker Cube Representation
      │
      ▼
Cube State Validation
      │
      ▼
Rubik's Cube Solver
      │
      ▼
Human-Readable Solution
```

### 📸 1. Upload Cube Images
The user provides one image for each face of the cube: **Front, Back, Left, Right, Up, Down**. The frontend explicitly associates each uploaded image with its corresponding face. This means the image-processing system does not need to determine whether an image is the Front, Back, Left, Right, Up, or Down face. It can focus on detecting the cube and identifying its sticker colors.

### 🔍 2. Image Processing
The backend processes the uploaded images using `Sharp`. Images are first resized to a smaller working resolution and converted into raw RGB pixel data. The system then searches for colorful connected regions in the image. 

For each pixel, colorfulness is estimated using its RGB values:
> `Maximum RGB value` - `Minimum RGB value` → `Color difference / saturation` → `Colorful pixel detection`

A connected-component traversal is then used to find groups of colorful pixels. The largest suitable region is selected as the detected cube region.
*Example Detected cube region:* `minX: 12, minY: 96, maxX: 163, maxY: 255, width: 152, height: 160`

### 🧩 3. Detecting the 9 Stickers
After detecting the cube region, it is divided into a 3 × 3 grid. For every cell, the center point is calculated. Instead of relying on a single pixel, a small region around the center is sampled and its RGB values are averaged. This makes the color detection less sensitive to individual noisy pixels or small variations within a sticker. 

Each face therefore produces **9 RGB values**, and all six faces produce **6 × 9 = 54 sticker colors**.

### 🎨 4. Color Classification
The six Rubik's Cube colors are represented using standard cube notation:
* **U** → Up (Yellow)
* **R** → Right (Orange)
* **F** → Front (Green)
* **D** → Down (White)
* **L** → Left (Red)
* **B** → Back (Blue)

The center sticker of every face is used to determine the color associated with that face. The remaining stickers are classified by comparing their detected color against the corresponding face-center colors.

### 🧠 5. Reconstructing the Cube State
Once all six faces have been processed, their stickers are arranged in the following order: `U R F D L B`. Each face contributes nine characters. Therefore, 9 × 6 = 54 characters. 

*Example:* `BRBLUDDLFURLURULLFFFRFFRBLFLDUDDURULRBRDLRDBDUBUBBFDFB`

### ✅ 6. Cube State Validation
Before sending the cube state to the solver, the generated configuration is checked. A standard 3 × 3 Rubik's Cube must contain exactly nine stickers of each color: `U = 9, R = 9, F = 9, D = 9, L = 9, B = 9`.
*Example output:* `COLOR COUNTS: { U: 9, R: 9, F: 9, D: 9, L: 9, B: 9 }`

### 🧮 7. Solving the Cube
The validated 54-character cube state is passed to the cube-solving logic. The solver returns a sequence of standard Rubik's Cube moves.
*Example:* `R R' R2 U U' F F2 L D B`

### 📋 8. Human-Readable Instructions
Raw Rubik's Cube notation can be difficult for someone unfamiliar with cube notation. The application converts the solver output into simple instructions.
* **Step 1:** Turn Back face clockwise 
* **Step 2:** Turn Up face clockwise 
* **Step 3:** Turn Right face clockwise for twice 

---

## 🛠️ Tech Stack
* **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
* **Backend:** Node.js, Express.js, Sharp
* **Tools:** npm, Git, GitHub

## 📁 Project Structure
```text
Rubiks-Cube-Solverr/
│
├── frontend/
│   ├── index.html
│   ├── script.js
│   ├── style.css
│   └── ...
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── imageToCube.js
│   └── ...
│
└── README.md
```

## ⚙️ Getting Started

### 1. Prerequisites & Clone
Make sure you have **Node.js**, **npm**, and **Git** installed.
```bash
git clone https://github.com/AakarshPGL/Rubiks-Cube-Solverr.git
cd Rubiks-Cube-Solverr
```

### 2. Start the Backend
```bash
cd backend
npm install
node server.js
```
*The backend runs on: http://localhost:5001*

### 3. Open the Frontend
Open `frontend/index.html` in your web browser (or serve static files through your Express backend).

## 🎮 Usage
1. Open the application.
2. Upload an image for each cube face: **Front, Back, Left, Right, Up, Down**.
3. Submit the images. The backend processes each image and extracts the nine sticker colors.
4. The application constructs the 54-character cube representation and validates the color counts.
5. Click **Solve**.
6. Follow the generated step-by-step instructions to solve the physical cube.

## 📊 Example Processing Output
The backend provides useful debugging information while processing images:
```json
Received faces: [ 'Front', 'Back', 'Left', 'Right', 'Up', 'Down' ]
Detected cube region: { minX: 12, minY: 96, maxX: 163, maxY: 255, width: 152, height: 160 }
9 sticker RGB values: 
  1: { r: 11, g: 201, b: 105 } 
  2: { r: 8, g: 203, b: 105 } 
  ...
COLOR COUNTS: { U: 9, R: 9, F: 9, D: 9, L: 9, B: 9 }
```

## 📷 Image Quality Guidelines
The accuracy of color detection depends on the quality of the uploaded images. For better results:
- ✔️ Keep the entire cube face visible & reasonably centered
- ✔️ Use sufficient lighting
- ❌ Avoid strong reflections on stickers, excessive shadows, or heavily blurred images

## 🧠 Key Technical Concepts
* **Image Processing:** Working directly with image pixels and RGB values.
* **Color Analysis:** Using RGB and HSV characteristics to distinguish cube sticker colors.
* **Connected Components:** Finding connected colorful regions to locate the cube in an image.
* **Grid Sampling:** Dividing the detected cube into a 3 × 3 grid and sampling sticker centers.
* **Data Representation:** Converting 54 physical stickers into a compact string representation.
* **Validation & Algorithms:** Checking the cube's color distribution before sending it to a Rubik's Cube solver.

## 🚧 Limitations & 🔮 Future Improvements
* **Limitations:** Best results require clear images of a single face. Poor lighting, reflections, or distortion can affect accuracy.
* **Future Improvements:** Real-time camera scanning, perspective correction, improved color calibration, interactive 3D cube visualization.

## 🎯 Learning Outcomes
Through this project, I gained practical experience in **Full-stack web development (HTML/CSS/JS, Node.js/Express)**, **REST API communication**, **Image processing (RGB/HSV, Pixel manipulation)**, and **Algorithm integration**.

## 👨‍💻 Author
**Polisetty Gangalal Aakarsh**  
IIT (ISM) Dhanbad  
