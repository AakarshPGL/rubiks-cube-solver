import sharp from "sharp";

function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;

    if (d !== 0) {
        if (max === r) h = 60 * (((g - b) / d) % 6);
        else if (max === g) h = 60 * ((b - r) / d + 2);
        else h = 60 * ((r - g) / d + 4);
    }

    if (h < 0) h += 360;
    const s = max === 0 ? 0 : d / max;
    return { h, s, v: max };
}

function colorDistance(a, b) {
    const ah = rgbToHsv(a.r, a.g, a.b);
    const bh = rgbToHsv(b.r, b.g, b.b);

    let dh = Math.abs(ah.h - bh.h);
    if (dh > 180) dh = 360 - dh;

    const ds = Math.abs(ah.s - bh.s);
    const dv = Math.abs(ah.v - bh.v);

    return dh * 2.5 + ds * 80 + dv * 20;
}

function getAverageColor(data, width, height, channels, cx, cy, radius = 6) {
    let r = 0, g = 0, b = 0, count = 0;

    for (let y = cy - radius; y <= cy + radius; y++) {
        for (let x = cx - radius; x <= cx + radius; x++) {
            if (x < 0 || x >= width || y < 0 || y >= height) continue;

            const i = (y * width + x) * channels;
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
        }
    }

    return {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count)
    };
}

function findCubeBox(data, width, height, channels) {
    const visited = new Uint8Array(width * height);

    function colorful(x, y) {
        const i = (y * width + x) * channels;
        const { h, s, v } = rgbToHsv(data[i], data[i + 1], data[i + 2]);

        // White is not colorful, so allow bright low-saturation pixels too.
        const colored = s > 0.25 && v > 0.25;
        const white = s < 0.18 && v > 0.55;

        return colored || white;
    }

    let best = null;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const start = y * width + x;
            if (visited[start] || !colorful(x, y)) continue;

            const queue = [[x, y]];
            visited[start] = 1;

            let area = 0;
            let minX = x, maxX = x, minY = y, maxY = y;

            while (queue.length) {
                const [cx, cy] = queue.pop();
                area++;

                minX = Math.min(minX, cx);
                maxX = Math.max(maxX, cx);
                minY = Math.min(minY, cy);
                maxY = Math.max(maxY, cy);

                const neighbours = [
                    [cx + 1, cy], [cx - 1, cy],
                    [cx, cy + 1], [cx, cy - 1]
                ];

                for (const [nx, ny] of neighbours) {
                    if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;

                    const ni = ny * width + nx;

                    if (!visited[ni] && colorful(nx, ny)) {
                        visited[ni] = 1;
                        queue.push([nx, ny]);
                    }
                }
            }

            const w = maxX - minX + 1;
            const h = maxY - minY + 1;

            if (!best || area > best.area) {
                best = { minX, minY, maxX, maxY, width: w, height: h, area };
            }
        }
    }

    return best;
}

function sampleNine(data, width, height, channels, box) {
    const colors = [];
    const cellW = box.width / 3;
    const cellH = box.height / 3;

    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const cx = Math.round(box.minX + (col + 0.5) * cellW);
            const cy = Math.round(box.minY + (row + 0.5) * cellH);

            colors.push(
                getAverageColor(
                    data,
                    width,
                    height,
                    channels,
                    cx,
                    cy,
                    7
                )
            );
        }
    }

    return colors;
}

async function inspectFace(file) {
    const { data, info } = await sharp(file.buffer)
        .resize({
            width: 300,
            height: 300,
            fit: "inside"
        })
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const box = findCubeBox(
        data,
        info.width,
        info.height,
        info.channels
    );

    if (!box) {
        throw new Error(`Could not detect cube in ${file.originalname}`);
    }

    const colors = sampleNine(
        data,
        info.width,
        info.height,
        info.channels,
        box
    );

    return colors;
}

function classifyByCenters(colors, centers) {
    return colors.map(color => {
        let bestName = null;
        let bestDistance = Infinity;

        for (const [name, center] of Object.entries(centers)) {
            const d = colorDistance(color, center);

            if (d < bestDistance) {
                bestDistance = d;
                bestName = name;
            }
        }

        return bestName;
    });
}

function getFace(images, names) {
    for (const name of names) {
        if (images[name] && images[name][0]) {
            return images[name][0];
        }
    }

    return null;
}

export async function imageToCube(images) {

    /*
        Expected faces:

        Up
        Right
        Front
        Down
        Left
        Back

        We also support:
        U R F D L B
        up right front down left back
    */

    const faceFiles = {
        U: getFace(images, ["Up", "U", "up"]),
        R: getFace(images, ["Right", "R", "right"]),
        F: getFace(images, ["Front", "F", "front"]),
        D: getFace(images, ["Down", "D", "down"]),
        L: getFace(images, ["Left", "L", "left"]),
        B: getFace(images, ["Back", "B", "back"])
    };

    for (const [face, file] of Object.entries(faceFiles)) {
        if (!file) {
            throw new Error(`Missing ${face} face image`);
        }
    }

    console.log("Received faces:", Object.keys(images));

    const faceColors = {};

    for (const face of ["U", "R", "F", "D", "L", "B"]) {
        faceColors[face] = await inspectFace(faceFiles[face]);

        console.log(`\n${face} RGB:`);

        faceColors[face].forEach((c, i) => {
            console.log(
                `${i + 1}: R=${c.r} G=${c.g} B=${c.b}`
            );
        });
    }

    /*
        The CENTER sticker is always the color of that face.

        U center -> U color
        R center -> R color
        F center -> F color
        D center -> D color
        L center -> L color
        B center -> B color
    */

    const centers = {
        U: faceColors.U[4],
        R: faceColors.R[4],
        F: faceColors.F[4],
        D: faceColors.D[4],
        L: faceColors.L[4],
        B: faceColors.B[4]
    };

    console.log("\nCENTER COLORS:");

    for (const [face, c] of Object.entries(centers)) {
        const hsv = rgbToHsv(c.r, c.g, c.b);

        console.log(
            `${face}: RGB(${c.r}, ${c.g}, ${c.b}) ` +
            `HSV(${hsv.h.toFixed(1)}, ${hsv.s.toFixed(2)}, ${hsv.v.toFixed(2)})`
        );
    }

    /*
        IMPORTANT:

        We classify using the actual six center colors.

        So your lime/yellow face is compared against the
        actual yellow center AND actual green center.

        It is NOT simply checking:
            "G > R => green"

        This prevents yellow being treated as green.
    */

    const classified = {};

    for (const face of ["U", "R", "F", "D", "L", "B"]) {
        classified[face] = classifyByCenters(
            faceColors[face],
            centers
        );

        console.log(
            `${face}:`,
            classified[face].join(" ")
        );
    }

    /*
        Convert face-color names into solver letters.

        Example:
        If F center is green, every green sticker on
        the cube becomes F.

        This is much safer than assuming:
        green = F, yellow = U, etc.
    */

    const cube = [];

    for (const face of ["U", "R", "F", "D", "L", "B"]) {
        for (const color of classified[face]) {
            cube.push(color);
        }
    }

    const cubeString = cube.join("");

    console.log("\nRAW CUBE STRING:");
    console.log(cubeString);

    /*
        Validate that every face color occurs exactly 9 times.
    */

    const counts = {
        U: 0,
        R: 0,
        F: 0,
        D: 0,
        L: 0,
        B: 0
    };

    for (const c of cube) {
        if (!counts.hasOwnProperty(c)) {
            throw new Error(`Unknown cube color: ${c}`);
        }

        counts[c]++;
    }

    console.log("\nCOLOR COUNTS:");
    console.log(counts);

    for (const [color, count] of Object.entries(counts)) {
        if (count !== 9) {
            throw new Error(
                `Invalid color count: ${color} = ${count}. Expected 9.`
            );
        }
    }

    console.log("\nVALID 54 CHARACTER CUBE:");
    console.log(cubeString);

    return cubeString;
}
